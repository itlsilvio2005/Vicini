import { useState } from "react";
import { Church, MoonStar, Cross, Building2, MapPin, Phone, Clock3, ExternalLink, ListFilter } from "lucide-react";
import { CATEGORIE_LUOGHI, LUOGHI, type CatLuogo, type Luogo } from "./data";
import { Badge, Modal, ModalHeader, Reveal, SectionHeading } from "./lib";

const CAT_STYLES: Record<CatLuogo, { color: string; soft: string; label: string; Icon: React.ComponentType<{ size?: number | string; className?: string }> }> = {
  chiese: { color: "#c7a262", soft: "rgba(199,162,98,0.14)", label: "Chiesa Cattolica", Icon: Church },
  sanitarie: { color: "#8ea6c8", soft: "rgba(142,166,200,0.13)", label: "Ospedale / Casa Funeraria", Icon: Building2 },
  ortodosso: { color: "#d8b25c", soft: "rgba(216,178,92,0.15)", label: "Luogo Ortodosso", Icon: Cross },
  musulmano: { color: "#7fbf9a", soft: "rgba(127,191,154,0.13)", label: "Luogo Musulmano", Icon: MoonStar },
};

export function Luoghi() {
  const [cat, setCat] = useState<CatLuogo | "tutte">("tutte");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [sel, setSel] = useState<Luogo | null>(null);

  const visibili = cat === "tutte" ? LUOGHI : LUOGHI.filter((l) => l.categoria === cat);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <SectionHeading
        num="03"
        kicker="Mappa & Luoghi del Territorio"
        title={
          <>
            I luoghi del <em className="italic text-bronze-600">commiato</em>
          </>
        }
        sub="Chiese cattoliche di Modena, ospedali e case funerarie, luoghi di culto ortodossi e musulmani: una mappa interattiva del territorio per orientare le famiglie nel momento del bisogno."
      />

      {/* filtri categoria */}
      <Reveal className="mb-9 flex flex-wrap gap-2">
        {CATEGORIE_LUOGHI.map((c) => {
          const n = c.id === "tutte" ? LUOGHI.length : LUOGHI.filter((l) => l.categoria === c.id).length;
          const attivo = cat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              aria-pressed={attivo}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                attivo
                  ? "border-night-800 bg-night-800 text-paper shadow-md"
                  : "border-line bg-card text-ink-soft hover:border-bronze-500 hover:text-bronze-600"
              }`}
            >
              {c.id !== "tutte" && (
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: CAT_STYLES[c.id as CatLuogo].color }}
                />
              )}
              {c.breve} <span className="opacity-70">{n}</span>
            </button>
          );
        })}
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        {/* -------- Mappa -------- */}
        <Reveal>
          <figure className="overflow-hidden rounded-xl border border-night-700 bg-night-900 shadow-inner">
            <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-night-700 px-5 py-3.5">
              <span className="font-display text-xl italic text-paper">Pianta schematica — Modena e provincia</span>
              <span className="flex flex-wrap items-center gap-3 text-[10.5px] text-mist">
                {Object.entries(CAT_STYLES).map(([k, v]) => (
                  <span key={k} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: v.color }} />
                    {v.label}
                  </span>
                ))}
              </span>
            </figcaption>

            <svg viewBox="0 0 640 420" className="block w-full" role="img" aria-label="Mappa dei luoghi del commiato">
              <defs>
                <pattern id="graticule" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M32 0H0V32" fill="none" stroke="#94a2b8" strokeOpacity="0.07" />
                </pattern>
              </defs>
              <rect width="640" height="420" fill="#0b1424" />
              <rect width="640" height="420" fill="url(#graticule)" />

              {/* fiumi */}
              <path d="M-20 128 C 130 96, 300 158, 470 122 S 660 96, 660 96" stroke="#2c4674" strokeWidth="15" fill="none" opacity="0.5" strokeLinecap="round" />
              <path d="M-20 336 C 150 360, 320 318, 470 352 S 660 332, 660 332" stroke="#2c4674" strokeWidth="11" fill="none" opacity="0.4" strokeLinecap="round" />
              <text x="36" y="116" fontSize="10" fill="#94a2b8" opacity="0.6" fontStyle="italic">fiume Secchia</text>
              <text x="470" y="372" fontSize="10" fill="#94a2b8" opacity="0.6" fontStyle="italic">fiume Panaro</text>

              {/* strade principali */}
              <path d="M40 268 C 180 250, 300 246, 430 240 S 600 228, 640 224" stroke="#21375f" strokeWidth="3" fill="none" opacity="0.8" />
              <text x="70" y="258" fontSize="9.5" fill="#94a2b8" opacity="0.55">Via Emilia</text>
              <path d="M430 240 C 440 200, 448 160, 452 120" stroke="#21375f" strokeWidth="2" fill="none" opacity="0.6" />
              <text x="458" y="150" fontSize="9.5" fill="#94a2b8" opacity="0.55">Viale Amendola</text>
              <path d="M300 262 C 340 268, 380 260, 420 252" stroke="#21375f" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M430 240 C 450 280, 470 300, 480 320" stroke="#21375f" strokeWidth="2" fill="none" opacity="0.6" />

              {/* centri urbani */}
              {[
                { n: "Modena", x: 424, y: 238, r: 46 },
                { n: "Carpi", x: 168, y: 118, r: 26 },
                { n: "Sassuolo", x: 545, y: 330, r: 22 },
                { n: "Vignola", x: 476, y: 352, r: 17 },
                { n: "Formigine", x: 492, y: 288, r: 18 },
                { n: "Nonantola", x: 540, y: 152, r: 16 },
              ].map((c) => (
                <g key={c.n}>
                  <circle cx={c.x} cy={c.y} r={c.r} fill="#172a4a" opacity="0.6" />
                  <circle cx={c.x} cy={c.y} r={c.r} fill="none" stroke="#2c4674" strokeDasharray="3 4" opacity="0.7" />
                  <text x={c.x} y={c.y + 4} textAnchor="middle" fontSize="11.5" fill="#94a2b8" fontWeight="600" letterSpacing="1">
                    {c.n.toUpperCase()}
                  </text>
                </g>
              ))}

              {/* rosa dei venti */}
              <g transform="translate(54,58)" opacity="0.85">
                <circle r="17" fill="none" stroke="#94a2b8" strokeOpacity="0.5" />
                <path d="M0 -13 L3.5 0 L0 13 L-3.5 0 Z" fill="#c7a262" />
                <text y="-23" textAnchor="middle" fontSize="10" fill="#ddc38d" fontStyle="italic">N</text>
              </g>

              {/* cornice */}
              <rect x="6" y="6" width="628" height="408" fill="none" stroke="#c7a262" strokeOpacity="0.35" />
              <rect x="12" y="12" width="616" height="396" fill="none" stroke="#c7a262" strokeOpacity="0.15" />

              {/* pin */}
              {visibili.map((l) => {
                const st = CAT_STYLES[l.categoria];
                const hot = hoverId === l.id;
                return (
                  <g
                    key={l.id}
                    transform={`translate(${l.x}, ${l.y})`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverId(l.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onClick={() => setSel(l)}
                    role="button"
                    aria-label={l.nome}
                  >
                    {hot && <circle r="13" fill={st.color} opacity="0.35" className="pin-pulse" />}
                    <circle
                      r={hot ? 9 : 6.5}
                      fill={st.color}
                      stroke="#0b1424"
                      strokeWidth="2"
                      style={{ transition: "r .2s ease" }}
                    />
                    <circle r={hot ? 2.6 : 1.8} fill="#0b1424" style={{ transition: "r .2s ease" }} />
                    {hot && (
                      <g transform="translate(0, -16)">
                        <rect
                          x={-Math.min(l.nome.length * 3.4, 150)}
                          y="-24"
                          width={Math.min(l.nome.length * 6.8, 300)}
                          height="20"
                          rx="4"
                          fill="#070d18"
                          stroke={st.color}
                          strokeOpacity="0.6"
                        />
                        <text
                          y="-10"
                          textAnchor="middle"
                          fontSize="10.5"
                          fill="#f5f1e7"
                          style={{ fontWeight: 600 }}
                        >
                          {l.nome.length > 44 ? l.nome.slice(0, 42) + "…" : l.nome}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            <p className="flex items-center gap-2 border-t border-night-700 px-5 py-2.5 text-[11px] text-mist">
              <MapPin size={12} className="text-bronze-400" />
              Tocca un punto sulla mappa o un elemento dell'elenco per aprire la scheda completa del luogo.
            </p>
          </figure>
        </Reveal>

        {/* -------- Elenco -------- */}
        <Reveal delay={120}>
          <div className="flex h-full flex-col rounded-xl border border-line bg-card">
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-3.5">
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
                <ListFilter size={16} className="text-bronze-600" />
                {CATEGORIE_LUOGHI.find((c) => c.id === cat)?.nome}
              </h3>
              <span className="text-[12px] text-ink-faint">{visibili.length} luoghi</span>
            </div>
            <ul className="nice-scroll max-h-[560px] flex-1 divide-y divide-line-soft overflow-y-auto">
              {visibili.map((l) => {
                const st = CAT_STYLES[l.categoria];
                const Ic = st.Icon;
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => setSel(l)}
                      onMouseEnter={() => setHoverId(l.id)}
                      onMouseLeave={() => setHoverId(null)}
                      className={`group flex w-full items-start gap-3.5 px-5 py-3.5 text-left transition ${
                        hoverId === l.id ? "bg-bronze-300/15" : "hover:bg-paper"
                      }`}
                    >
                      <span
                        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border"
                        style={{ background: st.soft, borderColor: `${st.color}66`, color: st.color }}
                      >
                        <Ic size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-bold leading-snug text-ink group-hover:text-bronze-700">
                          {l.nome}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-faint">
                          <MapPin size={11} /> {l.indirizzo}
                        </span>
                      </span>
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: st.color }}
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </div>

      {/* -------- Modale luogo -------- */}
      <Modal open={!!sel} onClose={() => setSel(null)} labelledBy="luogo-title" wide>
        {sel && (
          <>
            <ModalHeader
              id="luogo-title"
              onClose={() => setSel(null)}
              title={sel.nome}
              sub={
                <span className="flex flex-wrap items-center gap-2">
                  <Badge tone="bronze">{CAT_STYLES[sel.categoria].label}</Badge>
                  {sel.indirizzo}
                </span>
              }
            />
            <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-[14px] leading-relaxed text-ink-soft">{sel.descrizione}</p>
                <p className="mb-2.5 mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">
                  Servizi offerti
                </p>
                <ul className="space-y-2">
                  {sel.servizi.map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-[13.5px] text-ink-soft">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 border border-bronze-500 bg-bronze-300/50" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3.5">
                <div className="rounded-lg border border-line bg-paper p-4">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                    <MapPin size={13} className="text-bronze-600" /> Indirizzo
                  </p>
                  <p className="mt-1.5 text-[13.5px] font-semibold text-ink">{sel.indirizzo}</p>
                </div>
                <div className="rounded-lg border border-line bg-paper p-4">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                    <Clock3 size={13} className="text-bronze-600" /> Orari
                  </p>
                  <p className="mt-1.5 text-[13.5px] font-semibold text-ink">{sel.orari}</p>
                </div>
                <div className="rounded-lg border border-line bg-paper p-4">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                    <Phone size={13} className="text-bronze-600" /> Contatti
                  </p>
                  <a
                    href={`tel:${sel.telefono.replace(/[^\d+]/g, "").slice(0, 12)}`}
                    className="mt-1.5 block text-[13.5px] font-semibold text-bronze-700 hover:underline"
                  >
                    {sel.telefono}
                  </a>
                </div>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(sel.nome + " " + sel.indirizzo)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-md bg-night-800 px-4 py-2.5 text-[13px] font-semibold text-paper transition hover:bg-night-700"
                >
                  <ExternalLink size={14} /> Indicazioni stradali
                </a>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
