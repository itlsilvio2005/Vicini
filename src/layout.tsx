import { useEffect, useState } from "react";
import {
  Flame,
  Menu,
  X,
  Phone,
  ArrowRight,
  ShieldCheck,
  BellRing,
  Landmark,
} from "lucide-react";
import { COMUNI, MANIFESTI, REPERIBILITA, URL_BASE } from "./data";

/* ---------------- Top utility bar ---------------- */

export function TopBar() {
  return (
    <div className="border-b border-night-700 bg-night-950 text-[12px] text-mist">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <p className="flex items-center gap-2">
          <span className="blink-dot inline-block h-1.5 w-1.5 rounded-full bg-bronze-400" />
          Reperibilità continuativa 24 ore su 24
        </p>
        <p className="hidden items-center gap-4 sm:flex">
          <span className="text-mist/70">Provincia di Modena · 6 comuni collegati</span>
          <a
            href={`tel:${REPERIBILITA.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 font-semibold text-bronze-300 transition hover:text-bronze-200"
          >
            <Phone size={12} /> {REPERIBILITA}
          </a>
        </p>
        <a
          href={`tel:${REPERIBILITA.replace(/\s/g, "")}`}
          className="flex items-center gap-1.5 font-semibold text-bronze-300 sm:hidden"
        >
          <Phone size={12} /> 24h
        </a>
      </div>
    </div>
  );
}

/* ---------------- Header ---------------- */

const NAV = [
  { href: "#bacheca", label: "Bacheca" },
  { href: "#luoghi", label: "Luoghi" },
  { href: "#agenzie", label: "Agenzie" },
  { href: "#volonta", label: "Le Mie Volontà" },
  { href: "#nucleo", label: "Il Nucleo" },
];

export function Header({ onBackoffice }: { onBackoffice: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-night-700 bg-night-900/95 shadow-lg shadow-night-950/40 backdrop-blur"
          : "border-night-800 bg-night-900"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3.5 sm:px-6">
        <a href="#bacheca" className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-bronze-500/60 bg-night-800 transition group-hover:border-bronze-400">
            <Flame size={19} className="text-bronze-400" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[26px] font-semibold tracking-wide text-paper">
              Vicini
            </span>
            <span className="mt-1 block text-[9.5px] font-semibold uppercase tracking-[0.28em] text-mist">
              Servizi funebri · Modena
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Sezioni del sito">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="link-rule text-[13.5px] font-medium text-paper/85 transition hover:text-paper"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackoffice}
            className="hidden items-center gap-2 rounded-md border border-bronze-500 bg-bronze-500 px-4 py-2 text-[13px] font-semibold text-night-950 transition hover:bg-bronze-400 sm:flex"
          >
            <ShieldCheck size={15} />
            Area Agenzie
          </button>
          <button
            className="rounded-md border border-night-600 p-2 text-paper lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="anim-fade border-t border-night-700 bg-night-900 px-4 pb-5 pt-2 lg:hidden">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block border-b border-night-800 py-3 font-display text-xl text-paper/90"
            >
              {n.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              onBackoffice();
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-bronze-500 px-4 py-2.5 text-sm font-semibold text-night-950"
          >
            <ShieldCheck size={15} /> Area Agenzie (B2B)
          </button>
        </div>
      )}
    </header>
  );
}

/* ---------------- Animated candle ---------------- */

function Candle() {
  return (
    <svg viewBox="0 0 120 190" className="h-40 w-auto sm:h-48" aria-hidden="true">
      <defs>
        <radialGradient id="glow" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#ddc38d" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ddc38d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wax" x1="0" x2="1">
          <stop offset="0%" stopColor="#2c4674" />
          <stop offset="50%" stopColor="#172a4a" />
          <stop offset="100%" stopColor="#101d33" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="62" r="52" fill="url(#glow)" className="flame-glow" />
      {/* flame */}
      <g className="flame-flicker">
        <path
          d="M60 26c7 14 14 20 14 32a14 14 0 0 1-28 0c0-8 4.5-13 7.5-18.5 1.6 3.4 3.4 5.4 5.5 6C57.6 39.5 58.4 33 60 26Z"
          fill="#ddc38d"
        />
        <path
          d="M60 42c3.4 7 6.5 10 6.5 16a6.5 6.5 0 0 1-13 0c0-5 3.5-8 4.5-12 .8 2 1.6 3 2.6 3.4.6-2.6.5-4.8-.6-7.4Z"
          fill="#b08a45"
        />
      </g>
      {/* wick */}
      <rect x="58.6" y="74" width="2.8" height="10" rx="1.4" fill="#0b1424" />
      {/* candle body */}
      <rect x="42" y="84" width="36" height="92" rx="4" fill="url(#wax)" stroke="#2c4674" />
      <path d="M42 92c4 3 8 3 12 0 4-3 8-3 12 0 4 3 8 3 12 0v-4H42v4Z" fill="#21375f" />
      {/* band */}
      <rect x="42" y="130" width="36" height="14" fill="#b08a45" opacity="0.9" />
      <text
        x="60"
        y="140.5"
        textAnchor="middle"
        fontFamily="Cormorant Garamond, serif"
        fontSize="10"
        fontStyle="italic"
        fill="#0b1424"
      >
        Vicini
      </text>
      {/* base */}
      <ellipse cx="60" cy="178" rx="30" ry="5" fill="#101d33" />
      <rect x="34" y="172" width="52" height="7" rx="2" fill="#172a4a" stroke="#2c4674" />
    </svg>
  );
}

/* ---------------- Masthead ---------------- */

const MASTHEAD_IMG =
  "https://image.qwenlm.ai/generated-images/ddb71b0c-1804-4b23-a5c3-fdf4dcef67eb/_result.png";

export function Masthead() {
  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative overflow-hidden bg-night-900 text-paper">
      {/* layered background: gradient + generated skyline */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45"
        style={{
          backgroundImage: `url(${MASTHEAD_IMG})`,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, #0b1424 0%, rgba(11,20,36,0.92) 42%, rgba(11,20,36,0.55) 70%, rgba(16,29,51,0.72) 100%), linear-gradient(to top, #0b1424 4%, transparent 45%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bronze-500/70 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-14 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:pb-20 lg:pt-20">
        <div>
          <p className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-bronze-300">
            <Flame size={14} className="text-bronze-400" />
            Bacheca digitale del commiato
            <span className="hidden text-mist/70 sm:inline">·</span>
            <span className="text-mist">Provincia di Modena</span>
          </p>

          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
            Nel momento del distacco,
            <br />
            <em className="font-medium italic text-bronze-300">nessuno resta solo.</em>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-mist">
            Vicini riunisce in un unico luogo i manifesti funebri, i luoghi del commiato, le agenzie
            partner e le tue volontà anticipate. Un servizio pubblico, sobrio e rispettoso per i
            comuni di <strong className="font-semibold text-paper/90">Modena, Nonantola, Vignola, Carpi, Formigine e Sassuolo</strong>.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#bacheca"
              className="group flex items-center gap-2 rounded-md bg-bronze-500 px-5 py-3 text-sm font-semibold text-night-950 transition hover:bg-bronze-400"
            >
              Consulta i manifesti
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#volonta"
              className="rounded-md border border-night-500 px-5 py-3 text-sm font-semibold text-paper/90 transition hover:border-bronze-500 hover:text-bronze-300"
            >
              Registra le mie volontà
            </a>
          </div>

          <p className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12.5px] capitalize text-mist/90">
            <span>Modena, {today}</span>
            <span className="hidden h-1 w-1 rounded-full bg-bronze-500 sm:inline-block" />
            <span>{MANIFESTI.length} manifesti in pubblicazione</span>
            <span className="hidden h-1 w-1 rounded-full bg-bronze-500 sm:inline-block" />
            <span>5 agenzie partner accreditate</span>
          </p>
        </div>

        {/* candle panel */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 -z-10 rounded-lg border border-night-600 bg-night-800/60" />
          <div className="flex h-full flex-col items-center justify-end gap-5 rounded-lg px-8 pb-8 pt-10">
            <Candle />
            <div className="text-center">
              <p className="font-display text-xl italic text-bronze-300">La luce resta accesa</p>
              <p className="mt-2 max-w-[240px] text-[12.5px] leading-relaxed text-mist">
                Ogni manifesto pubblicato è subito raggiungibile da familiari e conoscenti, anche
                tramite QR code affisso nei luoghi del commiato.
              </p>
            </div>
            <div className="grid w-full grid-cols-3 divide-x divide-night-600 rounded-md border border-night-600 bg-night-900/70 text-center">
              <div className="px-2 py-3">
                <p className="font-display text-2xl font-semibold text-bronze-300">6</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-mist">Comuni</p>
              </div>
              <div className="px-2 py-3">
                <p className="font-display text-2xl font-semibold text-bronze-300">24h</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-mist">Reperibilità</p>
              </div>
              <div className="px-2 py-3">
                <p className="font-display text-2xl font-semibold text-bronze-300">7</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-mist">Luoghi mappati</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ticker: ultime pubblicazioni */}
      <div className="relative border-t border-night-700 bg-night-950/80">
        <div className="mx-auto flex max-w-7xl items-stretch px-4 sm:px-6">
          <p className="flex shrink-0 items-center gap-2 border-r border-night-700 py-2.5 pr-4 text-[10.5px] font-bold uppercase tracking-[0.2em] text-bronze-400">
            <BellRing size={13} /> Ultime pubblicazioni
          </p>
          <div className="relative flex-1 overflow-hidden" aria-hidden="true">
            <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap py-2.5 pl-8">
              {[...MANIFESTI, ...MANIFESTI].map((m, i) => (
                <span key={`${m.id}-${i}`} className="flex items-center gap-2 text-[12.5px] text-mist">
                  <Landmark size={12} className="text-bronze-500/80" />
                  <span className="font-display text-[15px] italic text-paper/90">{m.nome}</span>
                  <span>· {m.comune} ·</span>
                  <span className="text-paper/70">
                    funerale {m.funerale.giorno.split(",")[0]}, ore {m.funerale.ora}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

export function Footer({ onBackoffice }: { onBackoffice: () => void }) {
  return (
    <footer className="border-t-2 border-bronze-600 bg-night-950 text-mist">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md border border-bronze-500/60 bg-night-800">
              <Flame size={17} className="text-bronze-400" />
            </span>
            <span className="font-display text-2xl font-semibold text-paper">Vicini</span>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed">
            Piattaforma B2B2C dei servizi funebri della provincia di Modena. Manifesti digitali,
            fiori, cordogli, luoghi del commiato e volontà anticipate — con la riservatezza che il
            momento richiede.
          </p>
          <p className="mt-4 text-[12px] text-mist/70">{URL_BASE} · piattaforma dimostrativa</p>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-bronze-400">
            Comuni serviti
          </h4>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13.5px]">
            {COMUNI.map((c) => (
              <li key={c}>
                <a href="#bacheca" className="link-rule text-paper/85 transition hover:text-bronze-300">
                  {c}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-bronze-400">
            La piattaforma
          </h4>
          <ul className="mt-4 space-y-2.5 text-[13.5px]">
            <li><a className="link-rule text-paper/85 hover:text-bronze-300" href="#bacheca">Bacheca manifesti</a></li>
            <li><a className="link-rule text-paper/85 hover:text-bronze-300" href="#luoghi">Luoghi vicini</a></li>
            <li><a className="link-rule text-paper/85 hover:text-bronze-300" href="#agenzie">Agenzie partner</a></li>
            <li><a className="link-rule text-paper/85 hover:text-bronze-300" href="#volonta">Le Mie Volontà</a></li>
            <li><a className="link-rule text-paper/85 hover:text-bronze-300" href="#nucleo">Il Nucleo</a></li>
            <li>
              <button onClick={onBackoffice} className="link-rule text-bronze-300 hover:text-bronze-200">
                Area Agenzie — Backoffice B2B
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-bronze-400">
            Contatti
          </h4>
          <ul className="mt-4 space-y-2.5 text-[13.5px] text-paper/85">
            <li>
              Reperibilità 24h:{" "}
              <a href={`tel:${REPERIBILITA.replace(/\s/g, "")}`} className="font-semibold text-bronze-300">
                {REPERIBILITA}
              </a>
            </li>
            <li>
              <a href="mailto:segreteria@vicini.mo" className="link-rule hover:text-bronze-300">
                segreteria@vicini.mo
              </a>
            </li>
            <li>
              <a href="mailto:vicinimodena@pec.it" className="link-rule hover:text-bronze-300">
                vicinimodena@pec.it
              </a>
            </li>
            <li className="pt-2 text-[12px] leading-relaxed text-mist/80">
              In caso di decesso in struttura sanitaria, contattare prima l'agenzia scelta o la
              reperibilità: vi guideremo passo passo.
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-night-800">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-[11.5px] text-mist/70 sm:flex-row sm:items-center sm:px-6">
          <p>Vicini S.r.l. — P.IVA 03845670361 · Via Nonantolana 555, Modena · © 2026</p>
          <p className="flex items-center gap-4">
            <a href="#bacheca" className="link-rule hover:text-bronze-300">Privacy</a>
            <a href="#bacheca" className="link-rule hover:text-bronze-300">Trasparenza</a>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-bronze-500" /> Dati trattati con riservatezza
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
