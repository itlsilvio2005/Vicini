import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";

/* ================= Reveal on scroll ================= */

export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "li" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ ["--rv-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ================= Modal shell ================= */

export function Modal({
  open,
  onClose,
  children,
  wide = false,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  labelledBy?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div className="anim-fade absolute inset-0 bg-night-950/70 backdrop-blur-[3px]" onClick={onClose} />
      <div
        className={`anim-rise relative max-h-[92vh] w-full overflow-y-auto nice-scroll rounded-t-2xl border border-line bg-card shadow-2xl sm:rounded-xl ${
          wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({
  title,
  sub,
  onClose,
  id,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  onClose: () => void;
  id?: string;
}) {
  return (
    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line-soft bg-card/95 px-6 py-4 backdrop-blur">
      <div>
        <h3 id={id} className="font-display text-2xl font-semibold leading-tight text-ink">
          {title}
        </h3>
        {sub && <p className="mt-0.5 text-xs text-ink-faint">{sub}</p>}
      </div>
      <button
        onClick={onClose}
        aria-label="Chiudi"
        className="rounded-md border border-line bg-paper p-1.5 text-ink-soft transition hover:border-bronze-500 hover:text-bronze-600"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/* ================= Toast ================= */

type Toast = { id: number; msg: string; tone: "ok" | "info" };
const ToastCtx = createContext<(msg: string, tone?: "ok" | "info") => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((msg: string, tone: "ok" | "info" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[120] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`anim-rise pointer-events-auto flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-xl ${
              t.tone === "ok"
                ? "border-bronze-500/50 bg-night-900 text-paper"
                : "border-line bg-card text-ink"
            }`}
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                t.tone === "ok" ? "bg-bronze-400" : "bg-ink-faint"
              }`}
            />
            <span className="leading-snug">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ================= Section heading ================= */

export function SectionHeading({
  num,
  kicker,
  title,
  sub,
  light = false,
}: {
  num: string;
  kicker: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  light?: boolean;
}) {
  return (
    <Reveal className="mb-10">
      <div className="flex items-center gap-3">
        <span className={`font-display text-lg italic ${light ? "text-bronze-300" : "text-bronze-600"}`}>
          {num}
        </span>
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
            light ? "text-mist" : "text-ink-faint"
          }`}
        >
          {kicker}
        </span>
        <span className={`h-px flex-1 ${light ? "bg-night-600" : "bg-line"}`} />
      </div>
      <h2
        className={`mt-4 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl ${
          light ? "text-paper" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p className={`mt-3 max-w-2xl text-[15px] leading-relaxed ${light ? "text-mist" : "text-ink-soft"}`}>
          {sub}
        </p>
      )}
    </Reveal>
  );
}

/* ================= Monogram medallion ================= */

export function Monogram({ initials: ini, size = 76 }: { initials: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 76 76" aria-hidden="true" className="shrink-0">
      <circle cx="38" cy="38" r="36" fill="#101d33" />
      <circle cx="38" cy="38" r="36" fill="none" stroke="#c7a262" strokeWidth="1.4" />
      <circle cx="38" cy="38" r="30.5" fill="none" stroke="#c7a262" strokeWidth="0.7" opacity="0.65" />
      <circle cx="38" cy="38" r="27" fill="none" stroke="#ddc38d" strokeWidth="0.4" opacity="0.35" />
      <text
        x="38"
        y="46.5"
        textAnchor="middle"
        fontFamily="Cormorant Garamond, Georgia, serif"
        fontSize="27"
        fontWeight="600"
        fill="#ecdcba"
      >
        {ini}
      </text>
      <path d="M24 58c4.6 2.2 9.2 3.2 14 3.2s9.4-1 14-3.2" fill="none" stroke="#c7a262" strokeWidth="0.8" opacity="0.8" />
      <path d="M24 18c4.6-2.2 9.2-3.2 14-3.2s9.4 1 14 3.2" fill="none" stroke="#c7a262" strokeWidth="0.8" opacity="0.8" />
    </svg>
  );
}

/* ================= Pseudo-QR (deterministic) ================= */

function seeded(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

export function QrVisual({ seed, size = 116 }: { seed: string; size?: number }) {
  const N = 21;
  const rnd = seeded(seed);
  const cells: boolean[] = [];
  for (let i = 0; i < N * N; i++) cells.push(rnd() > 0.52);

  const inFinder = (r: number, c: number) =>
    (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8);

  const finder = (r0: number, c0: number) => (
    <g key={`f${r0}${c0}`}>
      <rect x={c0} y={r0} width={7} height={7} fill="#1c2b45" />
      <rect x={c0 + 1} y={r0 + 1} width={5} height={5} fill="#fbf8f0" />
      <rect x={c0 + 2} y={r0 + 2} width={3} height={3} fill="#1c2b45" />
    </g>
  );

  return (
    <svg viewBox="-2 -2 25 25" width={size} height={size} className="rounded-sm" role="img" aria-label={`QR code del manifesto`}>
      <rect x={-2} y={-2} width={25} height={25} fill="#fbf8f0" />
      {cells.map((on, i) => {
        const r = Math.floor(i / N);
        const c = i % N;
        if (inFinder(r, c)) return null;
        if (r === 6 || c === 6) {
          return (i % 2 === 0) ? (
            <rect key={i} x={c} y={r} width={0.92} height={0.92} fill="#1c2b45" />
          ) : null;
        }
        return on ? <rect key={i} x={c} y={r} width={0.92} height={0.92} fill="#1c2b45" /> : null;
      })}
      {finder(0, 0)}
      {finder(0, N - 7)}
      {finder(N - 7, 0)}
      <rect x={13} y={13} width={3} height={3} fill="#b08a45" />
    </svg>
  );
}

/* ================= Form primitives ================= */

export function Field({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
        <span>
          {label} {required && <span className="text-bronze-600">*</span>}
        </span>
        {hint && <span className="normal-case tracking-normal text-[11px] font-normal text-ink-faint">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-[#9a3b2e]">{error}</span>}
    </label>
  );
}

export const inputCls = (invalid?: boolean) =>
  `w-full rounded-md border bg-white/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint/70 transition focus:border-bronze-500 focus:bg-white focus:outline-none ${
    invalid ? "border-[#9a3b2e]" : "border-line"
  }`;

export function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 ${
        on ? "border-bronze-600 bg-bronze-500" : "border-line bg-paper-deep"
      }`}
    >
      <span
        className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-card shadow transition-all duration-300 ${
          on ? "left-[22px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

/* ================= Error boundary (l'anteprima non resta mai bianca) ================= */

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center bg-night-950 p-6 text-paper">
          <div className="w-full max-w-md rounded-xl border border-bronze-500/50 bg-night-900 p-8 text-center">
            <p className="font-display text-3xl font-semibold">Vicini</p>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              Si è verificato un errore imprevisto durante il caricamento della piattaforma.
            </p>
            <p className="mt-3 rounded-md border border-night-700 bg-night-800 px-3 py-2 font-mono text-[11px] text-bronze-300">
              {String(this.state.error.message || this.state.error)}
            </p>
            <button
              onClick={() => {
                this.setState({ error: null });
                try {
                  window.location.reload();
                } catch {
                  this.forceUpdate();
                }
              }}
              className="mt-5 rounded-md bg-bronze-500 px-5 py-2.5 text-sm font-bold text-night-950 transition hover:bg-bronze-400"
            >
              Ricarica la pagina
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "bronze" | "neutral" | "night" | "green" | "amber" }) {
  const tones: Record<string, string> = {
    bronze: "border-bronze-500/50 bg-bronze-300/20 text-bronze-700",
    neutral: "border-line bg-paper-deep text-ink-soft",
    night: "border-night-600 bg-night-800 text-paper",
    green: "border-[#4c7a5a]/40 bg-[#4c7a5a]/10 text-[#3c6349]",
    amber: "border-bronze-600/40 bg-bronze-300/15 text-bronze-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}
