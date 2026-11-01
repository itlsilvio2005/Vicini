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
  const fondo = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fondo.current?.scrollIntoView?.({ block: 'end' });
  }, [messaggi, aperto]);

  useEffect(() => {
    if (!aperto) return;
    campo.current?.focus();
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

  const ultimoBot = [...messaggi].reverse().find((m) => m.da === 'bot');
  const suggerite = messaggi.length === 1 ? DOMANDE_RAPIDE : ultimoBot?.seguiti ?? [];

  // Portale su <body>: se un contenitore della pagina ha transform/filter, il
  // posizionamento "fixed" si sposta e il pannello esce dallo schermo.
  return createPortal(
    <>
      {!aperto && (
        <button
          onClick={() => setAperto(true)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-bronze-500 px-4 py-3 text-sm font-bold text-night-950 shadow-lg hover:bg-bronze-400"
          aria-label="Apri l’assistente: hai una domanda?"
        >
          <MessageCircle className="h-5 w-5" />
          Hai una domanda?
        </button>
      )}

      {aperto && (
        <div
          role="dialog"
          aria-label="Assistente di Vicini"
          className="fixed inset-x-2 bottom-2 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[24rem]"
        >
          <div className="flex items-center justify-between bg-night-800 px-4 py-3 text-paper">
            <div>
              <p className="font-display text-lg font-semibold leading-tight">Assistente Vicini</p>
              <p className="text-[11px] text-mist">{consensoIA ? 'Assistente avanzato attivo · non scrivere dati personali' : 'Informazioni generali · non salva ciò che scrivi'}</p>
            </div>
            <button onClick={() => setAperto(false)} aria-label="Chiudi l’assistente" className="rounded p-1 hover:bg-night-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3" aria-live="polite">
            {messaggi.map((m, i) => (
              <div key={i} className={m.da === 'utente' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.da === 'utente' ? 'bg-night-800 text-paper' : 'border border-line bg-paper text-ink'
                  }`}
                >
                  {m.testo}
                  {m.link?.map((l) => (
                    <button
                      key={l.to + l.etichetta}
                      onClick={() => vai(l.to)}
                      className="mt-2 block w-full rounded-md border border-bronze-500 px-3 py-1.5 text-left text-xs font-bold text-bronze-700 hover:bg-bronze-500/10"
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
            <div ref={fondo} />
          </div>

          {!consensoIA && isSupabaseConfigured() && (
            <div className="border-t border-line-soft bg-paper px-3 py-2 text-xs text-ink-soft">
              <p>
                Per rispondere a domande libere posso usare un assistente con intelligenza artificiale (servizio
                esterno: Anthropic). In quel caso le tue domande vengono inviate a quel servizio. Non scrivere
                nomi, indirizzi o altri dati personali.
              </p>
              <button
                onClick={() => setConsensoIA(true)}
                className="mt-1 font-bold text-bronze-700 underline"
              >
                Va bene, attiva l’assistente avanzato
              </button>
            </div>
          )}

          {suggerite.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-line-soft px-3 py-2">
              {suggerite.map((q) => (
                <button
                  key={q}
                  onClick={() => invia(q)}
                  className="rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-soft hover:border-bronze-500 hover:text-bronze-700"
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
            className="flex gap-2 border-t border-line p-3"
          >
            <input
              ref={campo}
              value={testo}
              onChange={(e) => setTesto(e.target.value)}
              maxLength={300}
              aria-label="Scrivi la tua domanda"
              placeholder="Scrivi la tua domanda…"
              className="min-w-0 flex-1 rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-bronze-500 focus:outline-none focus:ring-2 focus:ring-bronze-500"
            />
            <button
              type="submit"
              aria-label="Invia"
              className="flex items-center rounded-md bg-bronze-500 px-3 text-night-950 hover:bg-bronze-400 disabled:opacity-50"
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
