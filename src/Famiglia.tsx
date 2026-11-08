import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { PageMast, useToast } from './lib';
import { supabase } from './lib/supabase';
import { ListaModerazione, type PensieroDaModerare } from './components/ModerazionePensieri';

// Pagina privata per la famiglia: si apre con il link consegnato dall'agenzia,
// senza account. Il link vale solo per un manifesto.
export function Famiglia() {
  const { token } = useParams();
  const toast = useToast();
  const [items, setItems] = useState<PensieroDaModerare[] | null>(null);
  const [errore, setErrore] = useState(false);
  const [occupato, setOccupato] = useState<string | null>(null);
  const [solo, setSolo] = useState<'attesa' | 'tutti'>('attesa');

  const carica = useCallback(async () => {
    const { data, error } = await supabase.rpc('famiglia_pensieri', { p_token: token ?? '' });
    if (error) {
      setErrore(true);
      return;
    }
    setItems((data ?? []) as PensieroDaModerare[]);
  }, [token]);

  useEffect(() => {
    void carica();
  }, [carica]);

  const modera = async (id: string, azione: 'approva' | 'elimina') => {
    if (azione === 'elimina' && !window.confirm('Eliminare definitivamente questo pensiero?')) return;
    setOccupato(id);
    const { error } = await supabase.rpc('famiglia_modera', { p_token: token ?? '', p_pensiero: id, p_azione: azione });
    setOccupato(null);
    if (error) {
      toast('Operazione non riuscita. Riprova.');
      return;
    }
    toast(azione === 'approva' ? 'Pensiero pubblicato sul manifesto.' : 'Pensiero eliminato.');
    void carica();
  };

  const nome = items?.[0]?.nome_defunto;
  const inAttesa = items?.filter((i) => !i.approvato).length ?? 0;
  const visibili = (items ?? []).filter((i) => solo === 'tutti' || !i.approvato);

  return (
    <div>
      <Helmet>
        <title>Pensieri per la famiglia · Vicini</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <PageMast
        kicker="Area riservata alla famiglia"
        title={<>I pensieri <em className="italic text-bronze-300">ricevuti</em></>}
        sub="Un pensiero compare sul manifesto solo se lo approvi tu. Puoi eliminare quelli che non vuoi."
      />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {errore ? (
          <p className="rounded-lg border border-line bg-card p-6 text-center text-[14px] text-ink-soft">
            Questo link non è valido o è stato sostituito. Chiedi all’agenzia di darti il link aggiornato.
          </p>
        ) : items === null ? (
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" /> Un momento…
          </div>
        ) : (
          <>
            {nome && <p className="mb-1 text-[13px] text-ink-faint">In memoria di</p>}
            {nome && <h2 className="font-display text-3xl font-semibold text-ink">{nome}</h2>}
            <p className="mt-2 text-[13px] text-ink-soft">
              {inAttesa > 0 ? `${inAttesa} ${inAttesa === 1 ? 'pensiero in attesa' : 'pensieri in attesa'} di approvazione.` : 'Nessun pensiero in attesa.'}
            </p>
            <div className="my-4 flex gap-1 self-start rounded-md border border-line bg-card p-1 text-[12.5px] font-semibold sm:w-fit">
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
            <ListaModerazione
              items={visibili}
              occupato={occupato}
              onApprova={(id) => void modera(id, 'approva')}
              onElimina={(id) => void modera(id, 'elimina')}
            />
          </>
        )}
      </div>
    </div>
  );
}
