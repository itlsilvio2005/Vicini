import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Copy, Link2, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib';

export interface PensieroDaModerare {
  pensiero_id: string;
  nome_defunto: string;
  nome: string;
  relazione: string | null;
  testo: string;
  approvato: boolean;
  creato_il: string;
}

const dataBreve = (iso: string) =>
  new Date(iso).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Elenco con Approva / Elimina: usato da agenzia, amministratore e famiglia. */
export function ListaModerazione({
  items,
  occupato,
  onApprova,
  onElimina,
}: {
  items: PensieroDaModerare[];
  occupato: string | null;
  onApprova: (id: string) => void;
  onElimina: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="rounded-lg border border-dashed border-line bg-card p-6 text-center text-[13px] italic text-ink-faint">Nessun pensiero.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((p) => (
        <li key={p.pensiero_id} className="rounded-lg border border-line bg-card p-4">
          <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-ink-faint">
            <span
              className={`rounded-full px-2 py-0.5 font-bold ${
                p.approvato ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}
            >
              {p.approvato ? 'Pubblicato' : 'In attesa'}
            </span>
            <span>per {p.nome_defunto}</span>
            <span>· {dataBreve(p.creato_il)}</span>
          </div>
          <p className="mt-2 text-[14px] italic leading-relaxed text-ink-soft">«{p.testo}»</p>
          <p className="mt-1 text-[12.5px] text-ink-faint">
            — {p.nome}
            {p.relazione ? `, ${p.relazione}` : ''}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!p.approvato && (
              <button
                onClick={() => onApprova(p.pensiero_id)}
                disabled={occupato === p.pensiero_id}
                className="flex min-h-[40px] items-center gap-1.5 rounded-md bg-emerald-700 px-3.5 py-2 text-[13px] font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                <Check size={15} /> Approva
              </button>
            )}
            <button
              onClick={() => onElimina(p.pensiero_id)}
              disabled={occupato === p.pensiero_id}
              className="flex min-h-[40px] items-center gap-1.5 rounded-md border border-red-300 px-3.5 py-2 text-[13px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={15} /> Elimina
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Moderazione per agenzia (solo i propri manifesti) e amministratore (tutti). */
export function ModerazionePensieri() {
  const toast = useToast();
  const [items, setItems] = useState<(PensieroDaModerare & { manifesto_id: string })[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [occupato, setOccupato] = useState<string | null>(null);
  const [solo, setSolo] = useState<'attesa' | 'tutti'>('attesa');

  const carica = useCallback(async () => {
    const { data, error } = await supabase.rpc('agenzia_pensieri');
    if (error) {
      toast('Non riesco a caricare i pensieri. Riprova.');
    } else {
      setItems((data ?? []) as (PensieroDaModerare & { manifesto_id: string })[]);
    }
    setCaricamento(false);
  }, [toast]);

  useEffect(() => {
    void carica();
  }, [carica]);

  const modera = async (id: string, azione: 'approva' | 'elimina') => {
    if (azione === 'elimina' && !window.confirm('Eliminare definitivamente questo pensiero?')) return;
    setOccupato(id);
    const { error } = await supabase.rpc('agenzia_modera_pensiero', { p_pensiero: id, p_azione: azione });
    setOccupato(null);
    if (error) {
      toast('Operazione non riuscita. Riprova.');
      return;
    }
    toast(azione === 'approva' ? 'Pensiero pubblicato sul manifesto.' : 'Pensiero eliminato.');
    void carica();
  };

  const copiaLink = async (manifestoId: string) => {
    const { data, error } = await supabase.rpc('agenzia_link_famiglia', { p_manifesto: manifestoId });
    if (error || typeof data !== 'string') {
      toast('Non riesco a creare il link. Riprova.');
      return;
    }
    const url = `${window.location.origin}/famiglia/${data}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link per la famiglia copiato. Consegnalo solo a un familiare.');
    } catch {
      window.prompt('Copia il link per la famiglia:', url);
    }
  };

  const inAttesa = items.filter((i) => !i.approvato).length;
  const visibili = solo === 'attesa' ? items.filter((i) => !i.approvato) : items;
  const manifesti = useMemo(() => {
    const m = new Map<string, string>();
    items.forEach((i) => m.set(i.manifesto_id, i.nome_defunto));
    return [...m.entries()];
  }, [items]);

  if (caricamento) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-ink-soft">
        <Loader2 className="h-4 w-4 animate-spin" /> Carico i pensieri…
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Pensieri da approvare</h2>
          <p className="text-[13px] text-ink-soft">
            Un pensiero compare sul manifesto solo dopo l’approvazione. {inAttesa > 0 ? `In attesa: ${inAttesa}.` : 'Nessun pensiero in attesa.'}
          </p>
        </div>
        <div className="flex gap-1 rounded-md border border-line bg-card p-1 text-[12.5px] font-semibold">
          {(['attesa', 'tutti'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setSolo(v)}
              className={`min-h-[36px] rounded px-3 py-1.5 ${solo === v ? 'bg-night-800 text-paper' : 'text-ink-soft'}`}
            >
              {v === 'attesa' ? 'In attesa' : 'Tutti'}
            </button>
          ))}
        </div>
      </div>

      <ListaModerazione
        items={visibili}
        occupato={occupato}
        onApprova={(id) => void modera(id, 'approva')}
        onElimina={(id) => void modera(id, 'elimina')}
      />

      {manifesti.length > 0 && (
        <div className="mt-8 rounded-lg border border-line bg-card p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
            <Link2 size={15} /> Link privato per la famiglia
          </h3>
          <p className="mt-1 text-[12.5px] text-ink-soft">
            Consegna il link a un familiare: potrà approvare o eliminare i pensieri di quel manifesto senza account. Chi ha il link
            può moderare: non condividerlo in pubblico.
          </p>
          <ul className="mt-3 space-y-2">
            {manifesti.map(([id, nome]) => (
              <li key={id} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="truncate text-ink">{nome}</span>
                <button
                  onClick={() => void copiaLink(id)}
                  className="flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-md border border-line px-3 py-1.5 font-semibold text-ink-soft hover:border-bronze-500"
                >
                  <Copy size={14} /> Copia link
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
