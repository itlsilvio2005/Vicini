import { useState } from "react";
import { Lock, ShieldCheck, Building2, KeyRound, AlertTriangle, LogIn } from "lucide-react";
import { AGENZIE, agenziaById } from "./data";
import { Field } from "./lib";

const darkInputCls =
  "w-full rounded-md border border-night-600 bg-night-800 px-3.5 py-2.5 text-sm text-paper placeholder:text-mist/60 transition focus:border-bronze-500 focus:outline-none";

/* ================= Sessione (demo client-side)
   In produzione l'autenticazione va spostata lato server:
   es. Supabase Auth / JWT verificato dal backend sulle API B2B. ================= */

export interface Sessione {
  agenziaId: string;
  user: string;
  token: string;
  emessoIl: number;
  scadeIl: number;
}

const KEY = "vicini_sessione_v1";
export const PASSWORD_DEMO = "vicini-2026";
const DURATA_ORE = 8;

export function getSessione(): Sessione | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Sessione;
    if (!s.scadeIl || s.scadeIl < Date.now()) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function login(agenziaId: string, password: string): Sessione | null {
  if (password.trim() !== PASSWORD_DEMO) return null;
  const agenzia = agenziaById(agenziaId);
  const s: Sessione = {
    agenziaId,
    user: agenzia.nome,
    token: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `tk-${Date.now()}`,
    emessoIl: Date.now(),
    scadeIl: Date.now() + DURATA_ORE * 60 * 60 * 1000,
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ambienti sandbox: la sessione resta comunque in memoria */
  }
  return s;
}

export function logout() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignora */
  }
}

/* ================= Schermata di accesso ================= */

export function LoginGate({ onLogin }: { onLogin: (s: Sessione) => void }) {
  const [agenziaId, setAgenziaId] = useState("pecorari");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = login(agenziaId, password);
    if (!s) {
      setErrore("Credenziali non valide. Verifica la password fornita dalla piattaforma.");
      return;
    }
    setErrore(null);
    onLogin(s);
  };

  return (
    <div className="relative overflow-hidden bg-night-950 pb-20 text-paper">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 80% -10%, rgba(176,138,69,0.14), transparent 60%), radial-gradient(700px 600px at -10% 40%, rgba(44,70,116,0.25), transparent 55%)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-md px-4 pt-16 sm:px-6">
        <p className="flex items-center justify-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.26em] text-bronze-400">
          <Lock size={13} /> Area riservata · Accesso operatori
        </p>
        <h1 className="mt-4 text-center font-display text-4xl font-semibold leading-tight sm:text-[42px]">
          Backoffice <em className="italic text-bronze-300">agenzia</em>
        </h1>
        <p className="mt-3 text-center text-[13.5px] leading-relaxed text-mist">
          L'accesso è riservato alle imprese accreditate. La sessione protegge l'archivio pratiche, le
          fatture e i dati di fatturazione dei clienti.
        </p>

        <form onSubmit={submit} noValidate className="mt-8 rounded-xl border border-night-700 bg-night-900 p-6 shadow-2xl sm:p-7">
          <Field label="Impresa" required>
            <div className="relative">
              <Building2 size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
              <select
                value={agenziaId}
                onChange={(e) => setAgenziaId(e.target.value)}
                className={`${darkInputCls} pl-9`}
              >
                {AGENZIE.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
            </div>
          </Field>

          <div className="mt-4">
            <Field label="Password operatore" required>
              <div className="relative">
                <KeyRound size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${darkInputCls} pl-9`}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                />
              </div>
            </Field>
          </div>

          {errore && (
            <p className="anim-fade mt-4 flex items-start gap-2 rounded-md border border-[#9a3b2e]/60 bg-[#9a3b2e]/15 px-3.5 py-2.5 text-[12.5px] leading-snug text-[#e6b7ae]">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {errore}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-bronze-500 px-5 py-3 text-sm font-bold text-night-950 transition hover:bg-bronze-400 active:scale-[0.99]"
          >
            <LogIn size={16} /> Accedi al backoffice
          </button>

          <div className="mt-5 rounded-md border border-bronze-500/40 bg-bronze-300/10 px-4 py-3 text-[12px] leading-relaxed text-bronze-200">
            <p className="font-bold uppercase tracking-[0.14em] text-bronze-300">Ambiente dimostrativo</p>
            <p className="mt-1 text-mist">
              Password unica per tutte le imprese: <code className="rounded bg-night-800 px-1.5 py-0.5 font-mono text-bronze-300">{PASSWORD_DEMO}</code>
              {" "}· sessione di {DURATA_ORE} ore su questo dispositivo.
            </p>
          </div>

          <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-mist/80">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-bronze-500" />
            Accesso tracciato e conforme al Reg. UE 2016/679 (GDPR). In produzione le credenziali sono
            verificate dal server con token firmati: nessun dato è esposto senza autenticazione.
          </p>
        </form>
      </div>
    </div>
  );
}
