import { useState } from "react";
import { Building2, MoonStar, MapPin, Phone, Clock3, ArrowUpRight } from "lucide-react";
import { LUOGHI, type Luogo } from "./data";
import { Badge, Modal, ModalHeader, Reveal, SectionHeading } from "./lib";

type Filtro = "tutti" | "sanitarie" | "musulmano";

export function Luoghi() {
  const [filtro, setFiltro] = useState<Filtro>("tutti");
  const [sel, setSel] = useState<Luogo | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const visibili = filtro === "tutti" ? LUOGHI : LUOGHI.filter((l) => l.categoria === filtro);

  return (
    <section id="luoghi" className="scroll-mt-24 bg-night-900 py-16 text-paper sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          light
          num="02"
          kicker="Mappa interattiva"
          title={
            <>
              Luoghi <em className="italic text-bronze-300">vicini</em> a chi resta
            </>
          }
          sub="Strutture sanitarie, case funerarie e luoghi di culto della provincia — inclusa la rete dedicata al rito musulmano. Seleziona un luogo per aprire la scheda completa."
        />

        {/* filtri */}
        <Reveal className="mb-8 flex flex-wrap gap-2">
          {(
            [
              ["tutti", "Tutti i luoghi"],
              ["sanitarie", "Strutture sanitarie & case funerarie"],
              ["musulmano", "Rito musulmano"],
            ] as [Filtro, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFiltro(k)}
              aria-pressed={filtro === k}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                filtro === k
                  ? "border-bronze-500 bg-bronze-500 text-night-950"
                  : "border-night-600 bg-night-800 text-mist hover:border-bronze-500 hover:text-bronze-300"
              }`}
            >
              {k === "musulmano" ? <MoonStar size={13} /> : k === "sanitarie" ? <Building2 size={13} /> : <MapPin size={13} />}
              {label}
            </button>
          ))}
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* lista interattiva */}
          <Reveal className="order-2 lg:order-1">
            <ul className="space-y-3">
              {visibili.map((l, i) => {
                const Icon = l.categoria === "musulmano" ? MoonStar : Building2;
                return (
                  <li key={l.id} style={{ transitionDelay: `${i * 40}ms` }}>
                    <button
                      onClick={() => setSel(l)}
                      onMouseEnter={() => setHoverId(l.id)}
                      onMouseLeave={() => setHoverId(null)}
                      className={`card-lift group w-full rounded-lg border bg-night-800 px-5 py-4 text-left transition ${
                        hoverId === l.id || sel?.id === l.id
                          ? "border-bronze-500"
                          : "border-night-600 hover:border-night-500"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md border ${
                            l.categoria === "musulmano"
                              ? "border-bronze-500/60 bg-bronze-500/15 text-bronze-300"
                              : "border-night-500 bg-night-700 text-mist"
                          }`}
                        >
                          <Icon size={17} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center justify-between gap-2 font-display text-lg font-semibold leading-tight text-paper">
                            {l.nome}
                            <ArrowUpRight size={16} className="shrink-0 text-bronze-400 opacity-0 transition group-hover:opacity-100" />
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-mist">
                            <MapPin size={12} className="shrink-0 text-bronze-500" /> {l.indirizzo}
                          </p>
                          <p className="mt-1.5 text-[12px] leading-relaxed text-mist/80 line-clamp-2">{l.descrizione}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          {/* mappa schematica */}
          <Reveal className="order-1 lg:order-2" delay={120}>
            <div className="rounded-xl border border-night-600 bg-night-800/70 p-4 lg:sticky lg:top-24">
              <MappaSchematica luoghi={visibili} onSeleziona={setSel} hoverId={hoverId} />
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-2 text-[11.5px] text-mist">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2c4674] ring-1 ring-mist/40" /> Strutture sanitarie & case funerarie
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-bronze-500" /> Rito musulmano
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rotate-45 border border-mist/60" /> Comuni della provincia
                </span>
                <span className="ml-auto hidden italic sm:inline">Mappa schematica — non in scala</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* modale dettaglio luogo */}
      <Modal open={!!sel} onClose={() => setSel(null)} wide labelledBy="luogo-title">
        {sel && (
          <>
            <ModalHeader
              id="luogo-title"
              onClose={() => setSel(null)}
              title={sel.nome}
              sub={
                <span className="flex items-center gap-1.5">
                  <MapPin size={11} /> {sel.indirizzo}
                </span>
              }
            />
            <div className="px-6 py-5">
              <div className="flex flex-wrap gap-2">
                <Badge tone={sel.categoria === "musulmano" ? "bronze" : "night"}>
                  {sel.categoria === "musulmano" ? <MoonStar size={11} /> : <Building2 size={11} />}
                  {sel.categoria === "musulmano" ? "Luogo di culto · rito musulmano" : "Struttura sanitaria / casa funeraria"}
                </Badge>
                <Badge tone="neutral">
                  <Clock3 size={11} /> {sel.orari}
                </Badge>
              </div>

              <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">{sel.descrizione}</p>

              <div className="mt-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">Servizi offerti</p>
                <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
                  {sel.servizi.map((s) => (
                    <li key={s} className="flex items-start gap-2 rounded-md border border-line-soft bg-paper px-3 py-2 text-[13px] text-ink">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-bronze-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-lg border border-night-700 bg-night-800 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-mist">Telefono / Contatti</p>
                  <p className="mt-1 font-display text-xl font-semibold text-bronze-300">{sel.telefono}</p>
                </div>
                <a
                  href={`tel:${sel.telefono.replace(/[^\d+]/g, "").slice(0, 12)}`}
                  className="flex items-center justify-center gap-2 rounded-md bg-bronze-500 px-5 py-2.5 text-sm font-bold text-night-950 transition hover:bg-bronze-400"
                >
                  <Phone size={15} /> Chiama ora
                </a>
              </div>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}

/* ---------------- Mappa schematica della provincia ---------------- */

const COMUNI_MAPPA = [
  { nome: "Carpi", x: 468, y: 118 },
  { nome: "Nonantola", x: 528, y: 212 },
  { nome: "Modena", x: 428, y: 248 },
  { nome: "Formigine", x: 432, y: 322 },
  { nome: "Vignola", x: 316, y: 344 },
  { nome: "Sassuolo", x: 505, y: 354 },
];

function MappaSchematica({
  luoghi,
  onSeleziona,
  hoverId,
}: {
  luoghi: Luogo[];
  onSeleziona: (l: Luogo) => void;
  hoverId: string | null;
}) {
  return (
    <svg viewBox="0 0 760 520" className="h-auto w-full select-none" role="img" aria-label="Mappa schematica della provincia di Modena con i luoghi del commiato">
      <defs>
        <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#94a2b8" strokeOpacity="0.07" strokeWidth="1" />
        </pattern>
        <radialGradient id="maphalo" cx="56%" cy="47%" r="60%">
          <stop offset="0%" stopColor="#21375f" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#101d33" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="760" height="520" rx="12" fill="#0f1b2e" />
      <rect width="760" height="520" rx="12" fill="url(#mapgrid)" />
      <rect width="760" height="520" rx="12" fill="url(#maphalo)" />

      {/* contorno provincia (stilizzato) */}
      <path
        d="M140 172 L252 92 L362 62 L520 56 L642 100 L674 172 L652 262 L586 362 L470 456 L358 470 L254 430 L182 342 L150 252 Z"
        fill="#17294a"
        fillOpacity="0.55"
        stroke="#2c4674"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M140 172 L252 92 L362 62 L520 56 L642 100 L674 172 L652 262 L586 362 L470 456 L358 470 L254 430 L182 342 L150 252 Z"
        fill="none"
        stroke="#c7a262"
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeDasharray="1 7"
        strokeLinejoin="round"
      />

      {/* fiumi */}
      <path d="M262 70 C300 160 322 240 340 300 C356 352 352 420 356 470" fill="none" stroke="#2c4674" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d="M560 78 C546 162 522 222 506 282 C492 342 482 404 472 466" fill="none" stroke="#2c4674" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <text x="300" y="140" fontSize="11" fontStyle="italic" fill="#94a2b8" opacity="0.65" transform="rotate(68 300 140)">f. Panaro</text>
      <text x="548" y="150" fontSize="11" fontStyle="italic" fill="#94a2b8" opacity="0.65" transform="rotate(96 548 150)">f. Secchia</text>

      {/* rosa dei venti + scala */}
      <g transform="translate(52,60)" opacity="0.8">
        <circle r="16" fill="none" stroke="#94a2b8" strokeOpacity="0.5" />
        <path d="M0 -22 L4 0 L0 22 L-4 0 Z" fill="#c7a262" opacity="0.9" />
        <text y="-28" textAnchor="middle" fontSize="11" fill="#ddc38d" fontFamily="Cormorant Garamond, serif" fontStyle="italic">N</text>
      </g>
      <g transform="translate(580,486)" opacity="0.8">
        <path d="M0 0h120" stroke="#94a2b8" strokeWidth="1.5" />
        <path d="M0 -4v8M60 -4v8M120 -4v8" stroke="#94a2b8" strokeWidth="1.5" />
        <text x="60" y="-8" textAnchor="middle" fontSize="10" fill="#94a2b8">≈ 10 km</text>
      </g>
      <text x="52" y="498" fontSize="12" fill="#94a2b8" opacity="0.7" fontFamily="Cormorant Garamond, serif" fontStyle="italic">Provincia di Modena</text>

      {/* comuni */}
      {COMUNI_MAPPA.map((c) => (
        <g key={c.nome}>
          <rect
            x={c.x - 4}
            y={c.y - 4}
            width="8"
            height="8"
            transform={`rotate(45 ${c.x} ${c.y})`}
            fill="#0f1b2e"
            stroke="#94a2b8"
            strokeWidth="1.2"
          />
          <text
            x={c.nome === "Modena" ? c.x - 14 : c.x + 12}
            y={c.nome === "Modena" ? c.y - 12 : c.y + 4}
            fontSize={c.nome === "Modena" ? 15 : 12.5}
            fontWeight={c.nome === "Modena" ? 700 : 400}
            fill={c.nome === "Modena" ? "#ecdcba" : "#94a2b8"}
            fontFamily={c.nome === "Modena" ? "Cormorant Garamond, serif" : "Archivo, sans-serif"}
            textAnchor={c.nome === "Modena" ? "middle" : "start"}
          >
            {c.nome}
          </text>
        </g>
      ))}

      {/* pin luoghi */}
      {luoghi.map((l) => {
        const isHover = hoverId === l.id;
        const color = l.categoria === "musulmano" ? "#b08a45" : "#3d5a8f";
        return (
          <g
            key={l.id}
            transform={`translate(${l.x},${l.y})`}
            className="cursor-pointer"
            onClick={() => onSeleziona(l)}
          >
            <circle r="10" fill={color} opacity="0.28" className="pin-pulse" />
            <circle r={isHover ? 9.5 : 7.5} fill={color} stroke="#ecdcba" strokeWidth="1.4" style={{ transition: "r .2s" }} />
            {l.categoria === "musulmano" ? (
              <path
                d="M3.2 -0.2 A 3.4 3.4 0 1 1 -1.8 -3.4 A 2.7 2.7 0 1 0 3.2 -0.2 Z"
                fill="#0f1b2e"
                transform="translate(-0.5,0.4)"
              />
            ) : (
              <path d="M0 -3.4V3.4M-3.4 0H3.4" stroke="#0f1b2e" strokeWidth="1.6" strokeLinecap="round" />
            )}
            <title>{l.nome}</title>
            <text
              y={-14}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#ecdcba"
              opacity={isHover ? 1 : 0}
              style={{ transition: "opacity .2s", pointerEvents: "none" }}
            >
              {l.nome.length > 30 ? l.nome.slice(0, 28) + "…" : l.nome}
            </text>
            {/* area cliccabile ampia */}
            <circle r="16" fill="transparent" />
          </g>
        );
      })}
    </svg>
  );
}
