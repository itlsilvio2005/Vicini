import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, X } from 'lucide-react';
import { DOMANDE_RAPIDE, rispondi, Risposta, usaIntelligenzaArtificiale } from '../lib/assistente';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Messaggio {
  da: 'utente' | 'bot';
  testo: string;
  link?: Risposta['link'];
  seguiti?: string[];
}

const BENVENUTO: Messaggio = {
  da: 'bot',
  testo:
    'Ciao, sono l’assistente di Vicini. Posso darti informazioni generali sul sito e sui primi passi in caso di lutto. Non sostituisco un’agenzia: per le pratiche del tuo caso è lei che ti guida.',
};

export function AssistenteVicini() {
  const [aperto, setAperto] = useState(false);
  const [messaggi, setMessaggi] = useState<Messaggio[]>([BENVENUTO]);
  const [testo, setTesto] = useState('');
  const [consensoIA, setConsensoIA] = useState(false);
  const [inAttesa, setInAttesa] = useState(false);
  const [dettagliIA, setDettagliIA] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [vista, setVista] = useState<{ h: number; top: number } | null>(null);
  const scorrimento = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Si scorre solo la lista dei messaggi (scrollIntoView farebbe muovere anche la pagina).
  useEffect(() => {
    const el = scorrimento.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messaggi, aperto, inAttesa, vista?.h]);

  // Telefono: pannello a tutto schermo che segue la parte VISIBILE dello schermo
  // (quando si apre la tastiera si restringe invece di finirci sotto).
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const aggiorna = () => setMobile(mq.matches);
    aggiorna();
    mq.addEventListener('change', aggiorna);
    return () => mq.removeEventListener('change', aggiorna);
  }, []);

  useEffect(() => {
    if (!aperto || !mobile) {
      setVista(null);
      return;
    }
    const v = window.visualViewport;
    const aggiorna = () => setVista(v ? { h: Math.round(v.height), top: Math.round(v.offsetTop) } : null);
    aggiorna();
    v?.addEventListener('resize', aggiorna);
    v?.addEventListener('scroll', aggiorna);
    const prima = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // la pagina sotto non scorre
    return () => {
      v?.removeEventListener('resize', aggiorna);
      v?.removeEventListener('scroll', aggiorna);
      document.body.style.overflow = prima;
    };
  }, [aperto, mobile]);

  useEffect(() => {
    if (!aperto) return;
    // Sul telefono la tastiera si apre solo se tocchi il campo.
    if (!window.matchMedia('(pointer: coarse)').matches) campo.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAperto(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [aperto]);

  const aggiungi = (...m: Messaggio[]) => setMessaggi((prev) => [...prev, ...m]);

  const invia = async (domanda: string) => {
    const t = domanda.trim().slice(0, 300);
    if (!t || inAttesa) return;
    setTesto('');
    const locale = rispondi(t);
    const domandaUtente: Messaggio = { da: 'utente', testo: t };
    const rispostaLocale: Messaggio = { da: 'bot', testo: locale.testo, link: locale.link, seguiti: locale.seguiti };

    // L'IA solo se: il visitatore ha acconsentito, il servizio è configurato e la
    // domanda non è già coperta da una risposta esatta (fiori, agenzie, crisi...).
    if (!consensoIA || !isSupabaseConfigured() || !usaIntelligenzaArtificiale(t, locale)) {
      aggiungi(domandaUtente, rispostaLocale);
      return;
    }

    aggiungi(domandaUtente);
    setInAttesa(true);
    try {
      const storia = [...messaggi, domandaUtente]
        .filter((m) => m !== BENVENUTO)
        .slice(-6)
        .map((m) => ({ role: m.da === 'utente' ? 'user' : 'assistant', content: m.testo.slice(0, 300) }));
      const { data, error } = await supabase.functions.invoke('assistente', { body: { messaggi: storia } });
      const risposta = (data as { testo?: string } | null)?.testo;
      if (error || !risposta) throw new Error('ia non disponibile');
      aggiungi({
        da: 'bot',
        testo: risposta,
        link: [{ etichetta: 'Vedi le agenzie del territorio', to: '/imprese' }].filter(() => /agenzi/i.test(risposta)),
      });
    } catch {
      // Servizio IA non raggiungibile o tetto raggiunto: si torna alle risposte rapide.
      aggiungi({ ...rispostaLocale, testo: rispostaLocale.testo });
    } finally {
      setInAttesa(false);
    }
  };

  const vai = (to: string) => {
    setAperto(false);
    navigate(to);
  };

  // Con la tastiera aperta lo spazio è poco: restano solo messaggi e campo di testo.
  const compatto = mobile && vista !== null && vista.h < 520;
  const ultimoBot = [...messaggi].reverse().find((m) => m.da === 'bot');
  const suggerite = messaggi.length === 1 ? DOMANDE_RAPIDE : ultimoBot?.seguiti ?? [];

  // Portale su <body>: se un contenitore della pagina ha transform/filter, il
  // posizionamento "fixed" si sposta e il pannello esce dallo schermo.
  return createPortal(
    <>
      {!aperto && (
        <button
          onClick={() => setAperto(true)}
          className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-bronze-500 text-sm sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:px-4 sm:py-3 font-bold text-night-950 shadow-xl hover:bg-bronze-400 transition-transform active:scale-95"
          aria-label="Apri l’assistente: hai una domanda?"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Hai una domanda?</span>
        </button>
      )}

      {aperto && (
        <div
          role="dialog"
          aria-label="Assistente di Vicini"
          style={mobile && vista ? { height: vista.h, top: vista.top } : undefined}
          className="fixed inset-x-0 top-0 z-50 flex h-[100dvh] flex-col overflow-hidden bg-card shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:top-auto sm:h-auto sm:max-h-[80vh] sm:w-[24rem] sm:rounded-2xl sm:border sm:border-line"
        >
          <div className="flex shrink-0 items-center justify-between bg-night-800 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-paper sm:pt-3">
            <div>
              <p className="font-display text-lg font-semibold leading-tight">Assistente Vicini</p>
              <p className="text-[11px] text-mist">{consensoIA ? 'Assistente avanzato attivo · non scrivere dati personali' : 'Informazioni generali · non salva ciò che scrivi'}</p>
            </div>
            <button onClick={() => setAperto(false)} aria-label="Chiudi l’assistente" className="grid h-11 w-11 shrink-0 place-items-center rounded hover:bg-night-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scorrimento} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3" aria-live="polite">
            {messaggi.map((m, i) => (
              <div key={i} className={m.da === 'utente' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[88%] whitespace-pre-line break-words rounded-2xl px-3 py-2 text-[15px] leading-relaxed sm:text-sm ${
                    m.da === 'utente' ? 'bg-night-800 text-paper' : 'border border-line bg-paper text-ink'
                  }`}
                >
                  {m.testo}
                  {m.link?.map((l) => (
                    <button
                      key={l.to + l.etichetta}
                      onClick={() => vai(l.to)}
                      className="mt-2 block min-h-[40px] w-full rounded-md border border-bronze-500 px-3 py-2 text-left text-[13px] font-bold text-bronze-700 hover:bg-bronze-500/10"
                    >
                      {l.etichetta} →
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {inAttesa && (
              <p className="text-xs italic text-ink-faint" role="status">L’assistente sta scrivendo…</p>
            )}
          </div>

          {!compatto && !consensoIA && isSupabaseConfigured() && (
            <div className="shrink-0 border-t border-line-soft bg-paper px-3 py-2 text-[12.5px] leading-snug text-ink-soft">
              <p>
                Vuoi risposte a domande libere? Posso usare l’IA di Google (gratuita): le tue domande vengono inviate a Google.
                {dettagliIA && (
                  <>
                    {' '}Nella versione gratuita possono essere conservate e usate dal fornitore per migliorare i propri servizi. Non scrivere nomi, indirizzi, telefoni o altri dati personali.{' '}
                    <button type="button" onClick={() => navigate('/privacy')} className="underline">Informativa privacy</button>
                  </>
                )}
              </p>
              <div className="mt-1.5 flex items-center gap-4">
                <button onClick={() => setConsensoIA(true)} className="min-h-[36px] font-bold text-bronze-700 underline">
                  Attiva l’assistente avanzato
                </button>
                <button type="button" onClick={() => setDettagliIA((v) => !v)} className="min-h-[36px] underline">
                  {dettagliIA ? 'Meno dettagli' : 'Dettagli'}
                </button>
              </div>
            </div>
          )}

          {!compatto && suggerite.length > 0 && (
            <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-line-soft px-3 py-2 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible">
              {suggerite.map((q) => (
                <button
                  key={q}
                  onClick={() => invia(q)}
                  className="min-h-[36px] shrink-0 whitespace-nowrap rounded-full border border-line bg-paper px-3.5 py-1.5 text-[13px] text-ink-soft hover:border-bronze-500 hover:text-bronze-700 sm:whitespace-normal sm:text-xs"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              invia(testo);
            }}
            className="flex shrink-0 gap-2 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <input
              ref={campo}
              value={testo}
              onChange={(e) => setTesto(e.target.value)}
              maxLength={300}
              aria-label="Scrivi la tua domanda"
              placeholder="Scrivi la tua domanda…"
              className="min-h-[44px] min-w-0 flex-1 rounded-md border border-line bg-paper px-3 py-2 text-base text-ink focus:border-bronze-500 focus:outline-none focus:ring-2 focus:ring-bronze-500 sm:min-h-0 sm:text-sm"
            />
            <button
              type="submit"
              aria-label="Invia"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-bronze-500 px-3 text-night-950 hover:bg-bronze-400 disabled:opacity-50 sm:min-h-0"
              disabled={!testo.trim() || inAttesa}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>,
    document.body
  );
}