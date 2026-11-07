import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from "react";
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
import { AuthProvider, useAuth } from "./lib/auth";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { HelmetProvider } from "react-helmet-async";
import { Bacheca, ManifestoDettaglio } from "./Bacheca";
import { Privacy } from "./Privacy";
const Imprese = lazy(() => import("./Imprese").then((m) => ({ default: m.Imprese })));
const Luoghi = lazy(() => import("./Luoghi").then((m) => ({ default: m.Luoghi })));
const B2C = lazy(() => import("./B2C").then((m) => ({ default: m.B2C })));
const LoginUnificato = lazy(() => import("./components/LoginUnificato").then((m) => ({ default: m.LoginUnificato })));
const DashboardAgenzia = lazy(() => import("./components/DashboardAgenzia").then((m) => ({ default: m.DashboardAgenzia })));
const GruppoChatPensieri = lazy(() => import("./components/GruppoChatPensieri").then((m) => ({ default: m.GruppoChatPensieri })));
const AdminDashboard = lazy(() => import("./components/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AssistenteVicini = lazy(() => import("./components/AssistenteVicini").then((m) => ({ default: m.AssistenteVicini })));
const PannelloNotifiche = lazy(() => import("./components/NotificheNucleo").then((m) => ({ default: m.PannelloNotifiche })));

const NAV = [
  { to: "/bacheca", label: "Bacheca Manifesti", short: "Bacheca", icon: <ScrollText size={16} /> },
  { to: "/imprese", label: "Le imprese del luogo", short: "Imprese", icon: <Landmark size={16} /> },
  { to: "/mappa", label: "Mappa & Luoghi del Territorio", short: "Mappa", icon: <MapIcon size={16} /> },
  { to: "/volonta-nucleo", label: "Le Mie Volontà & Il Nucleo", short: "Volontà", icon: <HeartHandshake size={16} /> },
  { to: "/area-riservata", label: "Area Riservata", short: "Area", icon: <Lock size={16} /> },
];

const TITOLI: Record<string, string> = {
  "/bacheca": "Bacheca Manifesti",
  "/imprese": "Le imprese del luogo",
  "/mappa": "Mappa & Luoghi del Territorio",
  "/volonta-nucleo": "Le Mie Volontà & Il Nucleo",
  "/area-riservata": "Area Riservata",
  "/admin": "Amministrazione",
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
  const { utente, logout } = useAuth();
  const [manifesti, setManifesti] = useState<Manifesto[]>(MANIFESTI);
  const [ordini, setOrdini] = useState<OrdineFiori[]>(ORDINI_INIZIALI);
  const [prefill, setPrefill] = useState<{ id: string; ts: number } | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  /* Ogni rotta aggiorna titolo, posizione di scroll e registra la visita anonima */
  useEffect(() => {
    const segmento = location.pathname.split("/")[1] || "bacheca";
    const base = "/" + segmento;
    try {
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

    // Tracciamento anonimo GDPR-safe per il pannello Admin (esclude le navigazioni dell'admin stesso)
    if (isSupabaseConfigured() && utente?.ruolo !== "admin" && segmento !== "admin") {
      if (segmento === "manifesto") {
        supabase.rpc("registra_interazione", { p_evento: "apertura_manifesto" }).then(() => {});
      } else {
        supabase.rpc("registra_interazione", { p_evento: `visita_${segmento}` }).then(() => {});
      }
    }
  }, [location.pathname, utente?.ruolo]);

  const aggiungiPensiero = useCallback((manifestoId: string, p: Pensiero) => {
    setManifesti((list) => list.map((m) => (m.id === manifestoId ? { ...m, pensieri: [p, ...m.pensieri] } : m)));
  }, []);

  const scegliAgenzia = useCallback(
    (id: string) => {
      setPrefill({ id, ts: Date.now() });
      navigate("/volonta-nucleo");
    },
    [navigate]
  );

  const fatturaInviata = useCallback((id: string) => {
    setOrdini((list) => list.map((o) => (o.id === id ? { ...o, fatturaInviata: true } : o)));
  }, []);

  const esci = useCallback(async () => {
    await logout();
    toast("Sessione chiusa. L'area agenzia è di nuovo protetta.", "info");
    navigate("/login");
  }, [logout, toast, navigate]);

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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 pt-2 sm:gap-4 sm:px-6 sm:pt-3">
          <button onClick={() => navigate("/bacheca")} className="group flex items-center gap-3 text-left">
            <span className="grid h-9 w-9 place-items-center rounded-lg sm:h-10 sm:w-10 border border-bronze-500/60 bg-night-800 transition group-hover:border-bronze-400">
              <Flame size={19} className="text-bronze-400" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-[24px] font-semibold sm:text-[26px] tracking-wide text-paper">Vicini</span>
              <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.28em] text-mist sm:block">
                Servizi funebri · Modena
              </span>
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Pannello Notifiche (solo per utenti loggati) */}
            {utente && <PannelloNotifiche />}

            <p className="hidden items-center gap-2 text-[11.5px] text-mist lg:flex">
              <span className="blink-dot inline-block h-1.5 w-1.5 rounded-full bg-bronze-400" />
              Reperibilità 24h · {oggi}
            </p>
            <a
              href={`tel:${REPERIBILITA.replace(/\s/g, "")}`}
              className="flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-md border border-night-600 px-3 py-1.5 text-[13px] font-semibold text-bronze-300 transition hover:border-bronze-500 hover:text-bronze-200"
            >
              <Phone size={14} /> <span className="sm:hidden">Chiama 24h</span><span className="hidden sm:inline">{REPERIBILITA}</span>
            </a>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mt-2 border-t border-night-800 sm:mt-3">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6">
            <nav className="nice-scroll flex flex-1 gap-0 overflow-x-auto sm:gap-1" aria-label="Sezioni della piattaforma">
              {NAV.map((t, idx) => {
                const active = sezioneCorrente === t.to;
                return (
                  <button
                    key={t.to}
                    onClick={() => navigate(t.to)}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex shrink-0 items-center gap-1.5 px-1.5 pb-3 pt-2.5 text-[12.5px] font-semibold tracking-wide transition-colors sm:gap-2 sm:px-3 sm:text-[13px] ${
                      active ? "text-bronze-300" : "text-mist hover:text-paper"
                    }`}
                  >
                    <span className={`hidden font-display text-[11px] italic sm:inline ${active ? "text-bronze-400" : "text-mist-dark"}`}>
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className={`${active ? "text-bronze-400" : "hidden text-mist-dark sm:inline"}`}>{t.icon}</span>
                    <span className="hidden md:inline">{t.label}</span>
                    <span className="md:hidden">{t.short}</span>
                    {t.to === "/area-riservata" && utente && (
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
            element={<Bacheca manifesti={manifesti} onNuovoPensiero={aggiungiPensiero} />}
          />
          <Route
            path="/bacheca/:comune"
            element={<Bacheca manifesti={manifesti} onNuovoPensiero={aggiungiPensiero} />}
          />
          <Route
            path="/manifesto/:id"
            element={<ManifestoDettaglio manifesti={manifesti} onNuovoPensiero={aggiungiPensiero} />}
          />
          <Route path="/imprese" element={<Imprese onScegli={scegliAgenzia} />} />
          <Route path="/mappa" element={<Luoghi />} />
          <Route path="/volonta-nucleo" element={<B2C prefillAgenzia={prefill} />} />
          <Route path="/login" element={<LoginUnificato />} />
          <Route path="/dashboard-agenzia" element={<DashboardAgenzia />} />
          <Route
            path="/area-privata"
            element={utente?.ruolo === "admin" ? <Navigate to="/admin" replace /> : <B2C prefillAgenzia={null} />}
          />
          <Route
            path="/area-riservata"
            element={
              utente ? (
                utente.ruolo === "agenzia" ? (
                  <DashboardAgenzia />
                ) : utente.ruolo === "admin" ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/area-privata" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/bacheca" replace />} />
        </Routes>
      </main>

      <Suspense fallback={null}>
        <AssistenteVicini />
      </Suspense>

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
                  <a href="mailto:info.vicini059@gmail.com" className="link-rule text-paper/85 hover:text-bronze-300">
                    info.vicini059@gmail.com
                  </a>
                </li>
                <li>
                  <button onClick={() => navigate("/privacy")} className="link-rule text-paper/85 transition hover:text-bronze-300">
                    Informativa privacy
                  </button>
                </li>
                {utente ? (
                  <li>
                    <button
                      onClick={esci}
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-bronze-300 hover:text-bronze-200"
                    >
                      <LogOut size={12} /> Esci ({utente.email})
                    </button>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-night-800">
          <p className="mx-auto max-w-7xl px-4 py-4 text-[11px] text-mist/70 sm:px-6">
            Vicini — progetto per la provincia di Modena · © 2026 · I dati delle
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
    <HelmetProvider>
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-stone-500 text-sm">Caricamento...</div>}>
          <AuthProvider>
            <ToastProvider>
              <Router>
                <Shell />
              </Router>
            </ToastProvider>
          </AuthProvider>
        </Suspense>
      </ErrorBoundary>
    </HelmetProvider>
  );
}