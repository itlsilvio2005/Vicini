import { ModerazionePensieri } from './ModerazionePensieri';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { Navigate } from 'react-router-dom';
import {
  Loader2,
  AlertCircle,
  ScrollText,
  MessageCircle,
  Flower2,
  Building2,
  Check,
  RefreshCw,
  Plus,
  Eye,
  Users,
  FileCheck2,
  Activity,
} from 'lucide-react';
import { FormManifesto, BachecaManifestiAgenzia } from './BachecaManifestiAgenzia';

type Periodo = 1 | 7 | 30;
const PERIODI: { giorni: Periodo; etichetta: string; testo: string }[] = [
  { giorni: 1, etichetta: 'Oggi', testo: 'oggi' },
  { giorni: 7, etichetta: '7 giorni', testo: 'ultimi 7 giorni' },
  { giorni: 30, etichetta: '30 giorni', testo: 'ultimi 30 giorni' },
];

interface RigaAgenzia {
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

interface Richiesta {
  utente_id: string;
  email: string;
  nome_completo: string | null;
  richiesta_il: string;
}

interface StatisticheSito {
  visite_sito: number;
  aperture_manifesti: number;
  ricerche_mappa: number;
  click_fiori: number;
  domande_bot: number;
  membri_nucleo_totali: number;
  volonta_registrate: number;
}

const STAT_VUOTE: StatisticheSito = {
  visite_sito: 0,
  aperture_manifesti: 0,
  ricerche_mappa: 0,
  click_fiori: 0,
  domande_bot: 0,
  membri_nucleo_totali: 0,
  volonta_registrate: 0,
};

const euro = (n: number) =>
  Number(n).toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const data = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function Kpi({ icona, titolo, valore, sub }: { icona: React.ReactNode; titolo: string; valore: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
        {icona}
        {titolo}
      </div>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{valore}</p>
      {sub && <p className="mt-1 text-xs text-ink-faint">{sub}</p>}
    </div>
  );
}

export function AdminDashboard() {
  const { utente, caricamento: caricamentoAuth } = useAuth();
  const [periodo, setPeriodo] = useState<Periodo>(30);
  const [righe, setRighe] = useState<RigaAgenzia[]>([]);
  const [richieste, setRichieste] = useState<Richiesta[]>([]);
  const [statSito, setStatSito] = useState<StatisticheSito>(STAT_VUOTE);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  const [inApprovazione, setInApprovazione] = useState<string | null>(null);
  const [mostraFormManifesto, setMostraFormManifesto] = useState(false);
  const [agenziaPerManifesto, setAgenziaPerManifesto] = useState<string>('');
  const [agenziaGestioneManifesti, setAgenziaGestioneManifesti] = useState<string | null>(null);

  const carica = useCallback(async () => {
    setCaricamento(true);
    setErrore('');
    const [a, r, s] = await Promise.all([
      supabase.rpc('admin_andamento_agenzie', { p_giorni: periodo }),
      supabase.rpc('admin_richieste_agenzia'),
      supabase.rpc('admin_statistiche_sito', { p_giorni: periodo }),
    ]);

    if (a.error || r.error) {
      setErrore('Non riesco a caricare i dati agenzie. Controlla di aver eseguito lo script SQL su Supabase.');
    } else {
      const lista = (a.data ?? []) as RigaAgenzia[];
      setRighe(lista);
      setRichieste((r.data ?? []) as Richiesta[]);
      if (lista.length > 0 && !agenziaPerManifesto) {
        setAgenziaPerManifesto(lista[0].agenzia_id);
      }
    }

    if (!s.error && s.data) {
      setStatSito(s.data as StatisticheSito);
    }

    setCaricamento(false);
  }, [periodo, agenziaPerManifesto]);

  useEffect(() => {
    if (utente?.ruolo === 'admin') carica();
  }, [utente, carica]);

  if (caricamentoAuth) return null;
  if (!utente) return <Navigate to="/login" replace />;
  if (utente.ruolo !== 'admin') return <Navigate to="/bacheca" replace />;

  const approva = async (id: string) => {
    setInApprovazione(id);
    const { error } = await supabase.rpc('admin_approva_agenzia', { p_utente: id });
    setInApprovazione(null);
    if (error) setErrore('Approvazione non riuscita. Riprova.');
    else carica();
  };

  const somma = (k: keyof RigaAgenzia) => righe.reduce((t, r) => t + Number(r[k] ?? 0), 0);
  const testoPeriodo = PERIODI.find((p) => p.giorni === periodo)!.testo;
  const etichettaPeriodo = PERIODI.find((p) => p.giorni === periodo)!.etichetta;

  const interazioniTotali =
    statSito.aperture_manifesti +
    somma('pensieri_periodo') +
    somma('ordini_periodo') +
    statSito.ricerche_mappa +
    statSito.domande_bot;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Pannello <span className="text-bronze-600">Amministratore</span>
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {righe.length > 0 && (
            <button
              onClick={() => {
                setAgenziaPerManifesto(righe[0].agenzia_id);
                setMostraFormManifesto(true);
              }}
              className="flex items-center gap-2 rounded-md bg-bronze-500 px-3.5 py-2 text-sm font-bold text-night-950 shadow-sm hover:bg-bronze-400"
            >
              <Plus className="h-4 w-4" /> Nuovo Manifesto
            </button>
          )}
          <button
            onClick={carica}
            className="flex items-center gap-2 rounded-md border border-line bg-card px-3 py-2 text-sm font-semibold text-ink-soft hover:border-bronze-500"
          >
            <RefreshCw className={`h-4 w-4 ${caricamento ? 'animate-spin' : ''}`} /> Aggiorna
          </button>
        </div>
      </div>

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
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" /> <span>{errore}</span>
        </div>
      )}

      {/* SEZIONE 1: VISUALIZZAZIONI E INTERAZIONI DEL SITO */}
      <section className="mb-8 rounded-xl border border-night-700 bg-night-900 p-5 text-paper shadow-md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-bronze-300">
              Statistiche portale GDPR-safe
            </p>
            <h2 className="font-display text-2xl font-semibold text-paper">
              Visualizzazioni e Interazioni — {testoPeriodo}
            </h2>
          </div>
          <span className="rounded-full border border-bronze-500/40 bg-night-800 px-3 py-1 text-xs font-semibold text-bronze-300">
             Conteggio anonimo senza cookie
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-lg border border-night-700 bg-night-800 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-mist">
              <Eye className="h-4 w-4 text-bronze-400" /> Visite al sito ({etichettaPeriodo})
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-paper">{statSito.visite_sito}</p>
            <p className="mt-1 text-xs text-mist">Aperture pagine del portale</p>
          </div>

          <div className="rounded-lg border border-night-700 bg-night-800 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-mist">
              <Activity className="h-4 w-4 text-bronze-400" /> Interazioni ({etichettaPeriodo})
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-paper">{interazioniTotali}</p>
            <p className="mt-1 text-xs text-mist">
              {statSito.aperture_manifesti} letture manifesti · {somma('pensieri_periodo')} pensieri
            </p>
          </div>

          <div className="rounded-lg border border-night-700 bg-night-800 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-mist">
              <Users className="h-4 w-4 text-bronze-400" /> Persone nel Nucleo
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-paper">{statSito.membri_nucleo_totali}</p>
            <p className="mt-1 text-xs text-mist">Cari monitorati dagli utenti</p>
          </div>

          <div className="rounded-lg border border-night-700 bg-night-800 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-mist">
              <FileCheck2 className="h-4 w-4 text-bronze-400" /> Volontà depositate
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-paper">{statSito.volonta_registrate}</p>
            <p className="mt-1 text-xs text-mist">Moduli B2C attivi</p>
          </div>
        </div>
      </section>

      {/* SEZIONE 2: RICHIESTE AGENZIA IN ATTESA */}
      {richieste.length > 0 && (
        <section className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4" aria-label="Richieste in attesa">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-amber-900">
            Richieste agenzia in attesa ({richieste.length})
          </h2>
          <ul className="space-y-2">
            {richieste.map((r) => (
              <li key={r.utente_id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{r.nome_completo || 'Senza nome'}</p>
                  <p className="truncate text-sm text-ink-soft">{r.email}</p>
                  <p className="text-xs text-ink-faint">Richiesta del {data(r.richiesta_il)}</p>
                </div>
                <button
                  onClick={() => approva(r.utente_id)}
                  disabled={inApprovazione === r.utente_id}
                  className="flex items-center gap-2 rounded-md bg-bronze-500 px-4 py-2 text-sm font-bold text-night-950 hover:bg-bronze-400 disabled:opacity-50"
                >
                  {inApprovazione === r.utente_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Approva
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-amber-900">
            Verifica che sia davvero un'agenzia del territorio prima di approvare.
          </p>
        </section>
      )}

      {/* SEZIONE 3: RIEPILOGO AGENZIE E MANIFESTI */}
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-faint">
        Riepilogo attività agenzie — {testoPeriodo}
      </h2>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icona={<Building2 className="h-4 w-4" />} titolo="Agenzie attive" valore={String(righe.length)} />
        <Kpi icona={<ScrollText className="h-4 w-4" />} titolo={`Manifesti (${etichettaPeriodo})`} valore={String(somma('manifesti_periodo'))} />
        <Kpi icona={<MessageCircle className="h-4 w-4" />} titolo="Pensieri lasciati" valore={String(somma('pensieri_periodo'))} />
        <Kpi icona={<Flower2 className="h-4 w-4" />} titolo="Ordini fiori" valore={`${somma('ordini_periodo')} · ${euro(somma('importo_ordini_periodo'))}`} />
      </div>

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-faint">
        Dettaglio per agenzia — {testoPeriodo}
      </h2>

      {caricamento && righe.length === 0 ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-bronze-600" /></div>
      ) : righe.length === 0 ? (
        <p className="rounded-xl border border-line bg-card p-6 text-center text-ink-soft">Nessuna agenzia registrata.</p>
      ) : (
        <ul className="space-y-3">
          {righe.map((r) => (
            <li key={r.agenzia_id} className="rounded-xl border border-line bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="font-display text-xl font-semibold text-ink">{r.nome}</h3>
                <span className="text-xs text-ink-faint">Iscritta dal {data(r.iscritta_il)}</span>
              </div>
              <p className="mb-3 text-sm text-ink-soft">{r.email}</p>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                <div><dt className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Manifesti</dt><dd className="text-lg font-semibold text-ink">{r.manifesti_periodo}</dd></div>
                <div><dt className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Pensieri</dt><dd className="text-lg font-semibold text-ink">{r.pensieri_periodo}</dd></div>
                <div><dt className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Ordini</dt><dd className="text-lg font-semibold text-ink">{r.ordini_periodo}</dd></div>
                <div><dt className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Importo</dt><dd className="text-lg font-semibold text-ink">{euro(r.importo_ordini_periodo)}</dd></div>
                <div><dt className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Ultimo manifesto</dt><dd className="text-lg font-semibold text-ink">{data(r.ultimo_manifesto)}</dd></div>
              </dl>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                <p className="text-xs text-ink-faint">Manifesti totali: {r.manifesti_totali}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setAgenziaPerManifesto(r.agenzia_id);
                      setMostraFormManifesto(true);
                    }}
                    className="flex items-center gap-1.5 rounded-md bg-bronze-500 px-3 py-1.5 text-xs font-bold text-night-950 hover:bg-bronze-400"
                  >
                    <Plus className="h-3.5 w-3.5" /> Aggiungi manifesto
                  </button>
                  <button
                    onClick={() =>
                      setAgenziaGestioneManifesti(
                        agenziaGestioneManifesti === r.agenzia_id ? null : r.agenzia_id
                      )
                    }
                    className="flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-bronze-500"
                  >
                    <ScrollText className="h-3.5 w-3.5" />
                    {agenziaGestioneManifesti === r.agenzia_id ? 'Chiudi elenco' : 'Gestisci manifesti'}
                  </button>
                </div>
              </div>

              {agenziaGestioneManifesti === r.agenzia_id && (
                <div className="mt-4 border-t border-line pt-4">
                  <BachecaManifestiAgenzia agenziaId={r.agenzia_id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mb-10 mt-10">
        <ModerazionePensieri />
      </div>

      {mostraFormManifesto && (
        <FormManifesto
          agenziaId={agenziaPerManifesto}
          agenzieDisponibili={righe.map((r) => ({ id: r.agenzia_id, nome: r.nome }))}
          manifesto={null}
          onSalvato={() => {
            setMostraFormManifesto(false);
            carica();
          }}
          onAnnullato={() => setMostraFormManifesto(false)}
        />
      )}
    </div>
  );
}