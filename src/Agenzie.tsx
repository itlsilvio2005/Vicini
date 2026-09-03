import { Flame, MapPin, Phone, Mail, ArrowRight, Star, ShieldCheck } from "lucide-react";
import { AGENZIE } from "./data";
import { Badge, Reveal, SectionHeading } from "./lib";

export function Agenzie({ onAffida }: { onAffida: (id: string) => void }) {
  const [principale, ...altre] = AGENZIE;

  return (
    <section id="agenzie" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          num="03"
          kicker="Elenco agenzie partner"
          title={
            <>
              Le imprese accreditate, <em className="italic text-bronze-600">in ordine di priorità</em>
            </>
          }
          sub="Ogni agenzia partner è verificata, assicurata e formata al rispetto del protocollo di sobrietà della piattaforma. Scegli la tua impresa di fiducia anche per le volontà anticipate."
        />

        {/* Partner principale */}
        <Reveal>
          <article className="card-lift relative overflow-hidden rounded-xl border border-bronze-500/60 bg-night-900 text-paper">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.16]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 85% 15%, #b08a45 0%, transparent 42%), repeating-linear-gradient(115deg, transparent 0 26px, rgba(199,162,98,0.12) 26px 27px)",
              }}
              aria-hidden="true"
            />
            <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="bronze">
                    <Star size={11} /> Partner Principale
                  </Badge>
                  <Badge tone="night">
                    <ShieldCheck size={11} /> Accreditata Vicini
                  </Badge>
                </div>
                <h3 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
                  {principale.nome}
                </h3>
                <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-mist">
                  {principale.descrizione}
                </p>
                <ul className="mt-5 space-y-2 text-[13.5px] text-paper/90">
                  <li className="flex items-center gap-2.5">
                    <MapPin size={14} className="text-bronze-400" /> {principale.indirizzo}
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone size={14} className="text-bronze-400" /> {principale.telefono} — reperibilità h24
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail size={14} className="text-bronze-400" /> {principale.email}
                  </li>
                </ul>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {principale.comuni.map((c) => (
                    <span key={c} className="rounded-full border border-night-500 bg-night-800 px-3 py-1 text-[11.5px] font-semibold text-bronze-300">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3 lg:border-l lg:border-night-600 lg:pl-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mist">
                  Area riservata dedicata
                </p>
                <p className="font-display text-xl italic leading-snug text-bronze-300">
                  «Il backoffice della piattaforma è impostato sulla nostra agenzia: pratiche,
                  fatture e ordini fiori in un'unica vista.»
                </p>
                <button
                  onClick={() => onAffida(principale.id)}
                  className="group mt-2 flex items-center justify-center gap-2 rounded-md bg-bronze-500 px-5 py-3 text-sm font-bold text-night-950 transition hover:bg-bronze-400"
                >
                  Affida le tue volontà
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
                <a
                  href={`tel:${principale.telefono.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 rounded-md border border-night-500 px-5 py-3 text-sm font-semibold text-paper transition hover:border-bronze-500 hover:text-bronze-300"
                >
                  <Phone size={15} /> Chiama {principale.telefono}
                </a>
              </div>
            </div>
            <div className="relative flex items-center gap-2 border-t border-night-700 bg-night-950/60 px-7 py-2.5 text-[11.5px] text-mist sm:px-9">
              <Flame size={12} className="text-bronze-500" />
              Priorità 1/5 nell'elenco partner · sede operativa e amministrativa su Vicini Backoffice
            </div>
          </article>
        </Reveal>

        {/* Altre agenzie in ordine di priorità */}
        <div className="mt-8 space-y-4">
          {altre.map((a, i) => (
            <Reveal key={a.id} delay={i * 70}>
              <article className="card-lift group grid gap-4 rounded-lg border border-line bg-card p-5 transition hover:border-bronze-500/70 sm:grid-cols-[64px_1fr_auto] sm:items-center sm:gap-6 sm:p-6">
                <p className="font-display text-4xl font-semibold italic leading-none text-bronze-500/80 transition group-hover:text-bronze-600">
                  {String(i + 2).padStart(2, "0")}
                </p>
                <div className="min-w-0">
                  <h3 className="font-display text-2xl font-semibold leading-tight text-ink">{a.nome}</h3>
                  <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">{a.descrizione}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-ink-faint">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-bronze-600" /> {a.indirizzo}
                    </span>
                    <a href={`tel:${a.telefono.replace(/\s/g, "")}`} className="flex items-center gap-1.5 font-semibold text-ink-soft transition hover:text-bronze-600">
                      <Phone size={12} className="text-bronze-600" /> {a.telefono} · h24
                    </a>
                    <span className="flex flex-wrap gap-1">
                      {a.comuni.map((c) => (
                        <span key={c} className="rounded-full border border-line bg-paper px-2 py-0.5 text-[10.5px] font-semibold text-ink-soft">
                          {c}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <button
                    onClick={() => onAffida(a.id)}
                    className="flex items-center gap-1.5 rounded-md border border-night-700 bg-night-800 px-4 py-2 text-[12.5px] font-semibold text-paper transition hover:border-bronze-500 hover:text-bronze-300"
                  >
                    Scegli come mia agenzia <ArrowRight size={13} />
                  </button>
                  <a
                    href={`mailto:${a.email}`}
                    className="link-rule self-start text-[12px] text-ink-faint transition hover:text-bronze-600 sm:self-end"
                  >
                    {a.email}
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
