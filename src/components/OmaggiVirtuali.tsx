import { useEffect, useState, useSyncExternalStore } from 'react';
import { Flame, Flower, Flower2, Loader2 } from 'lucide-react';
import { Field, inputCls, Modal, ModalHeader, useToast } from '../lib';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

// Omaggi virtuali gratuiti: fiore bianco, rosa, candela. Nessun dato personale
// obbligatorio. Si passa solo dalle funzioni deponi_omaggio / omaggi_conteggi
// (supabase/proposals/20261107_omaggi_virtuali.sql).

export type TipoOmaggio = 'fiore' | 'rosa' | 'candela';

const OMAGGI: { tipo: TipoOmaggio; nome: string; icona: React.ReactNode }[] = [
  { tipo: 'fiore', nome: 'Fiore bianco', icona: <Flower2 size={22} /> },
  { tipo: 'rosa', nome: 'Rosa', icona: <Flower size={22} /> },
  { tipo: 'candela', nome: 'Candela', icona: <Flame size={22} /> },
];

type Conteggi = Record<string, number>; // manifesto_id -> totale

// ---- conteggi condivisi da tutte le card (una sola chiamata) ----
let conteggi: Conteggi = {};
let caricato = false;
const ascoltatori = new Set<() => void>();
const emetti = () => ascoltatori.forEach((f) => f());

async function caricaConteggi() {
  if (!isSupabaseConfigured()) return;
  const { data, error } = await supabase.rpc('omaggi_conteggi');
  if (error || !Array.isArray(data)) return; // funzione non ancora creata: nessun conteggio
  const nuovo: Conteggi = {};
  for (const r of data as { manifesto_id: string; totale: number | string }[]) {
    nuovo[r.manifesto_id] = (nuovo[r.manifesto_id] ?? 0) + Number(r.totale);
  }
  conteggi = nuovo;
  emetti();
}

function useConteggio(id: string) {
  const snapshot = useSyncExternalStore(
    (cb) => {
      ascoltatori.add(cb);
      return () => ascoltatori.delete(cb);
    },
    () => conteggi,
  );
  useEffect(() => {
    if (!caricato) {
      caricato = true;
      void caricaConteggi();
    }
  }, []);
  return snapshot[id] ?? 0;
}

// ---- codice casuale del dispositivo (serve solo ai limiti anti-abuso) ----
function codiceDispositivo(): string {
  const chiave = 'vicini_dispositivo';
  try {
    const salvato = localStorage.getItem(chiave);
    if (salvato && salvato.length >= 16) return salvato;
  } catch {
    /* browser senza storage: si usa un codice per sessione */
  }
  const nuovo =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 10)).join('');
  try {
    localStorage.setItem(chiave, nuovo);
  } catch {
    /* ignora */
  }
  return nuovo;
}

function messaggioErrore(msg: string): string {
  if (/gi[aà] deposto|Troppi omaggi/i.test(msg)) return msg;
  return 'Non è stato possibile deporre l’omaggio. Riprova tra poco.';
}

export function OmaggiVirtuali({ id, nome }: { id: string; nome: string }) {
  const toast = useToast();
  const totale = useConteggio(id);
  const [aperto, setAperto] = useState(false);
  const [scelta, setScelta] = useState<TipoOmaggio>('fiore');
  const [firma, setFirma] = useState('');
  const [invio, setInvio] = useState(false);

  const deponi = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvio(true);
    if (isSupabaseConfigured()) {
      const { error } = await supabase.rpc('deponi_omaggio', {
        p_manifesto: id,
        p_tipo: scelta,
        p_dispositivo: codiceDispositivo(),
        p_nome: firma.trim() || null,
      });
      if (error) {
        setInvio(false);
        toast(messaggioErrore(error.message));
        return;
      }
      void caricaConteggi();
    } else {
      conteggi = { ...conteggi, [id]: (conteggi[id] ?? 0) + 1 };
      emetti();
    }
    setInvio(false);
    setAperto(false);
    setFirma('');
    toast(`Il tuo omaggio è stato deposto per ${nome}.`);
  };

  return (
    <>
      <button
        onClick={() => setAperto(true)}
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-bronze-500 px-3 py-2.5 text-sm font-bold text-night-950 shadow-sm transition hover:bg-bronze-400 active:scale-[0.98]"
      >
        <Flower2 size={16} /> Deponi un fiore
      </button>
      {totale > 0 && (
        <p className="mt-1.5 text-center text-[12px] text-ink-soft">
          {totale === 1 ? 'Una persona ha deposto un omaggio' : `${totale} persone hanno deposto un omaggio`}
        </p>
      )}

      <Modal open={aperto} onClose={() => setAperto(false)} labelledBy="omaggio-title">
        <ModalHeader
          id="omaggio-title"
          onClose={() => setAperto(false)}
          title={<span className="flex items-center gap-2"><Flower2 size={20} className="text-bronze-600" /> Deponi un omaggio</span>}
          sub={`In memoria di ${nome}`}
        />
        <form onSubmit={deponi} className="space-y-4 px-6 py-5">
          <div role="radiogroup" aria-label="Tipo di omaggio" className="grid grid-cols-3 gap-2">
            {OMAGGI.map((o) => (
              <button
                key={o.tipo}
                type="button"
                role="radio"
                aria-checked={scelta === o.tipo}
                onClick={() => setScelta(o.tipo)}
                className={`flex min-h-[78px] flex-col items-center justify-center gap-1.5 rounded-md border px-2 py-3 text-[12.5px] font-semibold transition ${
                  scelta === o.tipo
                    ? 'border-bronze-500 bg-bronze-300/20 text-bronze-700'
                    : 'border-line bg-paper text-ink-soft hover:border-bronze-500/60'
                }`}
              >
                {o.icona}
                {o.nome}
              </button>
            ))}
          </div>
          <Field label="Il tuo nome" hint="facoltativo, non viene mostrato">
            <input
              value={firma}
              onChange={(e) => setFirma(e.target.value)}
              maxLength={60}
              className={inputCls()}
              placeholder="Puoi lasciarlo vuoto"
            />
          </Field>
          <p className="text-[12px] leading-relaxed text-ink-soft">
            È un omaggio simbolico e gratuito: non viene consegnato nessun fiore vero. La famiglia vede quante persone
            hanno partecipato. Per fiori veri rivolgiti all’agenzia che cura il funerale.
          </p>
          <button
            type="submit"
            disabled={invio}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-night-800 px-4 py-3 text-sm font-semibold text-paper transition hover:bg-night-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {invio ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Un momento...
              </>
            ) : (
              'Deponi l’omaggio'
            )}
          </button>
        </form>
      </Modal>
    </>
  );
}
