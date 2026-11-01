import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Loader2, FileText, Flower2, MessageCircle, TrendingUp, AlertCircle, RefreshCw, Building2 } from 'lucide-react';

type Periodo = 1 | 7 | 30;
const PERIODI: { giorni: Periodo; etichetta: string; testo: string }[] = [
  { giorni: 1, etichetta: 'Oggi', testo: 'oggi' },
  { giorni: 7, etichetta: '7 giorni', testo: 'ultimi 7 giorni' },
  { giorni: 30, etichetta: '30 giorni', testo: 'ultimi 30 giorni' },
];

interface Props {
  agenziaId: string;
}

interface StatisticheAgenzia {
  agenzia_id: string;
  nome: string;
  email: string;
  iscritta_il: string;
  manifesti_periodo: number;
  manifesti_totali: number;
  pensieri_periodo: number;
  ordini_periodo: number;
  importo_ordini_periodo: number;
  ultimo_manifesto: string | null;
}

const euro = (n: number) =>
  Number(n || 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const data = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export function BackofficeAgenzia({ agenziaId }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>(30);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [dati, setDati] = useState<StatisticheAgenzia | null>(null);

  const caricaStatistiche = useCallback(async () => {
    setCaricamento(true);
    setErrore(null);

    if (!isSupabaseConfigured()) {
      setCaricamento(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('agenzia_mio_andamento', { p_giorni: periodo });

      if (error) {
        console.error('Errore caricamento andamento agenzia:', error);
        throw error;
      }

      // La funzione restituisce una tabella (array); prendiamo il primo record
      const record = Array.isArray(data) ? data[0] : data;
      setDati(record || null);
    } catch (err) {
      console.error('Errore caricamento statistiche agenzia:', err);
      setErrore('Impossibile caricare le statistiche. Assicurati di aver eseguito lo script SQL agenzia_mio_andamento su Supabase.');
    } finally {
      setCaricamento(false);
    }
  }, [periodo, agenziaId]);

  useEffect(() => {
    caricaStatistiche();
  }, [caricaStatistiche]);

  const testoPeriodo = PERIODI.find((p) => p.giorni === periodo)!.testo;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Andamento <span className="text-bronze-600">agenzia</span></h2>
          <p className="text-sm text-ink-soft">Statistiche e contatori aggiornati in tempo reale per la tua attività.</p>
        </div>
        <button
          onClick={caricaStatistiche}
          className="flex items-center gap-2 rounded-md border border-line bg-card px-3 py-2 text-sm font-semibold text-ink-soft hover:border-bronze-500"
        >
          <RefreshCw className={`h-4 w-4 ${caricamento ? 'animate-spin' : ''}`} /> Aggiorna
        </button>
      </div>

      {/* Selettore Periodo */}
      <div role="tablist" className="mb-6 inline-flex rounded-xl border border-line bg-card p-1 shadow-sm">
        {PERIODI.map((p) => (
          <button
            key={p.giorni}
            role="tab"
            aria-selected={periodo === p.giorni}
            onClick={() => setPeriodo(p.giorni)}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              periodo === p.giorni ? 'bg-night-800 text-bronze-300' : 'text-ink-faint hover:text-ink'
            }`}
          >
            {p.etichetta}
          </button>
        ))}
      </div>

      {errore && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0" /> <span>{errore}</span>
        </div>
      )}

      {caricamento && !dati ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-bronze-600" /></div>
      ) : !dati ? (
        <div className="rounded-xl border border-line bg-card p-8 text-center text-ink-soft">
          Numero o profilo agenzia non trovato nel sistema.
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-line bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                <FileText className="h-4 w-4 text-blue-600" /> Manifesti ({PERIODI.find((p) => p.giorni === periodo)!.etichetta})
              </div>
              <p className="mt-2 font-display text-3xl font-semibold text-ink">{dati.manifesti_periodo}</p>
              <p className="mt-1 text-xs text-ink-faint">Totale complessivo: {dati.manifesti_totali}</p>
            </div>

            <div className="rounded-xl border border-line bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                <MessageCircle className="h-4 w-4 text-green-600" /> Pensieri ricevuti
              </div>
              <p className="mt-2 font-display text-3xl font-semibold text-ink">{dati.pensieri_periodo}</p>
              <p className="mt-1 text-xs text-ink-faint">Nei manifesti del periodo</p>
            </div>

            <div className="rounded-xl border border-line bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                <Flower2 className="h-4 w-4 text-purple-600" /> Ordini fiori
              </div>
              <p className="mt-2 font-display text-3xl font-semibold text-ink">{dati.ordini_periodo}</p>
              <p className="mt-1 text-xs text-ink-faint">Richieste floreali collegate</p>
            </div>

            <div className="rounded-xl border border-line bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                <TrendingUp className="h-4 w-4 text-bronze-600" /> Importo ordini
              </div>
              <p className="mt-2 font-display text-3xl font-semibold text-ink">{euro(dati.importo_ordini_periodo)}</p>
              <p className="mt-1 text-xs text-ink-faint">Valore totale nel periodo</p>
            </div>
          </div>

          {/* Scheda Dettaglio Agenzia */}
          <div className="rounded-xl border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-bronze-100 text-bronze-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">{dati.nome}</h3>
                  <p className="text-sm text-ink-soft">{dati.email}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-ink-faint">Iscritta dal {data(dati.iscritta_il)}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-1">Ultimo manifesto pubblicato</p>
                <p className="font-semibold text-ink">{data(dati.ultimo_manifesto)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-1">Finestra temporale analizzata</p>
                <p className="font-semibold text-ink capitalize">{testoPeriodo}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Info GDPR / RLS */}
      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 shadow-sm">
        <p>
          <strong>Conformità e Sicurezza:</strong> I dati mostrati si riferiscono unicamente alla tua agenzia tramite isolamento sicuro basato su token di sessione autenticato. Nessun dato di altre imprese o dati sensibili dei cittadini viene condiviso.
        </p>
      </div>
    </div>
  );
}

