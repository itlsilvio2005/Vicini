import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  MemoryRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Flame,
  Phone,
  ScrollText,
  Landmark,
  Map as MapIcon,
  HeartHandshake,
  Lock,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import {
  MANIFESTI,
  ORDINI_INIZIALI,
  REPERIBILITA,
  type Manifesto,
  type OrdineFiori,
  type Pensiero,
} from "./data";
import { ErrorBoundary, ToastProvider, useToast } from "./lib";
import { getSessione, logout, LoginGate, type Sessione } from "./auth";
import { Bacheca, ManifestoDettaglio } from "./Bacheca";
import { Imprese } from "./Imprese";
import { Luoghi } from "./Luoghi";
import { B2C } from "./B2C";
import { Backoffice } from "./Backoffice";

const NAV = [
  { to: "/bacheca", label: "Bacheca Manifesti", short: "Bacheca", icon: <ScrollText size={16} /> },
  { to: "/imprese", label: "Le imprese del luogo", short: "Imprese", icon: <Landmark size={16} /> },
  { to: "/mappa", label: "Mappa & Luoghi del Territorio", short: "Mappa & Luoghi", icon: <MapIcon size={16} /> },
  { to: "/volonta-nucleo", label: "Le Mie Volontà & Il Nucleo", short: "Volontà & Nucleo", icon: <HeartHandshake size={16} /> },
  { to: "/area-agenzia", label: "Area Riservata Agenzia", short: "Area Agenzia", icon: <Lock size={16} /> },
];

const TITOLI: Record<string, string> = {
  "/bacheca": "Bacheca Manifesti",
  "/imprese": "Le imprese del luogo",
  "/mappa": "Mappa & Luoghi del Territorio",
  "/volonta-nucleo": "Le Mie Volontà & Il Nucleo",
  "/area-agenzia": "Area Riservata Agenzia",
};

/* In alcuni iframe sandbox la History API non è disponibile:
   URL puliti dove possibile, router in memoria come fallback sicuro. */
const historyDisponibile = (() => {
  try {
    window.history.pushState({}, "", window.location.href);
    return true;
  } catch {
    return false;
  }
})();

function Shell() {
  const [sessione, setSessione] = useState<Sessione | null>(() => getSessione());
  const [manifesti, setManifesti] = useState<Manifesto[]>(MANIFESTI);
  const [ordini, setOrdini] = useState<OrdineFiori[]>(ORDINI_INIZIALI);
  const [prefill, setPrefill] = useState<{ id: string; ts: number } | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  /* Ogni rotta aggiorna titolo e posizione di scroll, come una pagina autonoma */
  useEffect(() => {
    try {
      const base = "/" + (location.pathname.split("/")[1] ?? "bacheca");
      const titolo = TITOLI[base === "/" ? "/bacheca" : base] ?? TITOLI["/bacheca"];
      document.title = `Vicini — ${titolo} · Provincia di Modena`;
    } catch {
      /* anteprime sandbox: ignora */
    }
    try {
      window.scrollTo({ top: 0 });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const aggiungiOrdine = useCallback((o: OrdineFiori) => {
    setOrdini((list) => [o, ...list]);
  }, []);

  const aggiungiPensiero = useCallback((manifestoId: string, p: Pensiero) => {
    setManifesti((list) => list.map((m) => (m.id === manifestoId ? { ...m, pensieri: [p, ...m.pensieri] } : m)));
  }, []);

  const scegliAgenzia = useCallback(
    (id: string) => {
      setPrefill({ id, ts: Date.now() });
      navigate("/volonta-nucleo");
      // La conferma avviene nella sezione Volontà al ricevimento del prefill
    },
    [navigate]
  );

  const fatturaInviata = useCallback((id: string) => {
    setOrdini((list) => list.map((o) => (o.id === id ? { ...o, fatturaInviata: true } : o)));
  }, []);

  const esci = useCallback(() => {
    logout();
    setSessione(null);
    toast("Sessione chiusa. L'area agenzia è di nuovo protetta.", "info");
  }, [toast]);

  const oggi = useMemo(
    () =>
      new Date().toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    []
  );

  const sezioneCorrente = "/" + (location.pathname.split("/")[1] ?? "bacheca");

  return (
    <div className="paper-ambient flex min-h-screen flex-col">
      {/* ---------- Header sticky con Tab Bar ---------- */}
      <header className="sticky top-0 z-50 border-b border-night-700 bg-night-900/95 shadow-lg shadow-night-950/30 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pt-3 sm:px-6">
          <button onClick={() => navigate("/bacheca")} className="group flex items-center gap-3 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-bronze-500/60 bg-night-800 transition group-hover:border-bronze-400">
              <Flame size={19} className="text-bronze-400" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-[26px] font-semibold tracking-wide text-paper">Vicini</span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.28em] text-mist">
                Servizi funebri · Modena
              </span>
            </span>
          </button>

          <div className="flex items-center gap-3">
            <p className="hidden items-center gap-2 text-[11.5px] text-mist lg:flex">
              <span className="blink-dot inline-block h-1.5 w-1.5 rounded-full bg-bronze-400" />
              Reperibilità 24h · {oggi}
            </p>
            <a
              href={`tel:${REPERIBILITA.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 rounded-md border border-night-600 px-3 py-1.5 text-[12px] font-semibold text-bronze-300 transition hover:border-bronze-500 hover:text-bronze-200"
            >
              <Phone size={13} /> {REPERIBILITA}
            </a>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mt-3 border-t border-night-800">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6">
            <nav className="nice-scroll flex flex-1 gap-1 overflow-x-auto" aria-label="Sezioni della piattaforma">
              {NAV.map((t, idx) => {
                const active = sezioneCorrente === t.to;
                return (
                  <button
                    key={t.to}
                    onClick={() => navigate(t.to)}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex shrink-0 items-center gap-2 px-3.5 pb-3 pt-2 text-[12.5px] font-semibold tracking-wide transition-colors sm:text-[13px] ${
                      active ? "text-bronze-300" : "text-mist hover:text-paper"
                    }`}
                  >
                    <span className={`font-display text-[11px] italic ${active ? "text-bronze-400" : "text-mist-dark"}`}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className={active ? "text-bronze-400" : "text-mist-dark"}>{t.icon}</span>
                    <span className="hidden md:inline">{t.label}</span>
                    <span className="md:hidden">{t.short}</span>
                    {t.to === "/area-agenzia" && sessione && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7fbf9a]" title="Accesso attivo" />
                    )}
                    <span
                      className={`absolute inset-x-1 bottom-0 h-[3px] origin-left rounded-t-full bg-gradient-to-r from-bronze-600 via-bronze-400 to-bronze-600 transition-transform duration-300 ${
                        active ? "scale-x-100" : "scale-x-0"
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </nav>
            <p className="hidden shrink-0 pb-2.5 font-display text-sm italic tracking-wide text-mist lg:block">
              sezione{" "}
              <span className="text-bronze-300">
                {String(Math.max(1, NAV.findIndex((t) => t.to === sezioneCorrente) + 1)).padStart(2, "0")}
              </span>{" "}
              / 05
            </p>
          </div>
        </div>
      </header>

      {/* ---------- Vista attiva ---------- */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/bacheca" replace />} />
          <Route
            path="/bacheca"
            element={<Bacheca manifesti={manifesti} onNuovoOrdine={aggiungiOrdine} onNuovoPensiero={aggiungiPensiero} />}
          />
          <Route
            path="/bacheca/:comune"
            element={<Bacheca manifesti={manifesti} onNuovoOrdine={aggiungiOrdine} onNuovoPensiero={aggiungiPensiero} />}
          />
          <Route
            path="/manifesto/:id"
            element={<ManifestoDettaglio manifesti={manifesti} onNuovoOrdine={aggiungiOrdine} onNuovoPensiero={aggiungiPensiero} />}
          />
          <Route path="/imprese" element={<Imprese onScegli={scegliAgenzia} />} />
          <Route path="/mappa" element={<Luoghi />} />
          <Route path="/volonta-nucleo" element={<B2C prefillAgenzia={prefill} />} />
          <Route
            path="/area-agenzia"
            element={
              sessione ? (
                <Backoffice
                  sessione={sessione}
                  ordini={ordini}
                  onFatturaInviata={fatturaInviata}
                  onLogout={esci}
                />
              ) : (
                <LoginGate
                  onLogin={(s) => {
                    setSessione(s);
                    toast(`Accesso eseguito: ${s.user}. Benvenuti nel backoffice.`);
                  }}
                />
              )
            }
          />
          <Route path="*" element={<Navigate to="/bacheca" replace />} />
        </Routes>
      </main>

      {/* ---------- Footer persistente ---------- */}
      <footer className="border-t-2 border-bronze-600 bg-night-950 text-mist">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Flame size={18} className="text-bronze-400" />
              <span className="font-display text-xl font-semibold text-paper">Vicini</span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-mist">Provincia di Modena</span>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-mist/90">
              Piattaforma B2B2C dei servizi funebri: bacheca manifesti, imprese del luogo, luoghi del
              territorio, volontà anticipate e area riservata alle agenzie.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-[12.5px] sm:grid-cols-3">
            <div>
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-bronze-400">Sezioni</p>
              <ul className="space-y-1.5">
                {NAV.map((t) => (
                  <li key={t.to}>
                    <button onClick={() => navigate(t.to)} className="link-rule text-paper/85 transition hover:text-bronze-300">
                      {t.short}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-bronze-400">Comuni</p>
              <ul className="space-y-1.5">
                {["Modena", "Nonantola", "Vignola", "Carpi", "Formigine", "Sassuolo"].map((c) => (
                  <li key={c}>
                    <button
                      onClick={() => navigate(`/bacheca/${c.toLowerCase()}`)}
                      className="link-rule text-paper/85 transition hover:text-bronze-300"
                    >
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-bronze-400">Contatti</p>
              <ul className="space-y-1.5">
                <li>
                  Reperibilità:{" "}
                  <a href={`tel:${REPERIBILITA.replace(/\s/g, "")}`} className="font-semibold text-bronze-300">
                    {REPERIBILITA}
                  </a>
                </li>
                <li>
                  <a href="mailto:segreteria@vicini.mo" className="link-rule text-paper/85 hover:text-bronze-300">
                    segreteria@vicini.mo
                  </a>
                </li>
                {sessione ? (
                  <li>
                    <button
                      onClick={esci}
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-bronze-300 hover:text-bronze-200"
                    >
                      <LogOut size={12} /> Esci dal backoffice
                    </button>
                  </li>
                ) : (
                  <li className="flex items-center gap-1.5 pt-1 text-[11.5px] text-mist/80">
                    <ShieldCheck size={12} className="text-bronze-500" /> Conformità GDPR
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-night-800">
          <p className="mx-auto max-w-7xl px-4 py-4 text-[11px] text-mist/70 sm:px-6">
            Vicini S.r.l. — P.IVA 03845670361 · Via Nonantolana 555, Modena · © 2026 · I dati delle
            pianificazioni sono mostrati alle agenzie solo in forma aggregata e anonima.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const Router = historyDisponibile ? BrowserRouter : MemoryRouter;
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <Shell />
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}
