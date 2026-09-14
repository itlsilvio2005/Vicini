import { useState } from "react";
import { MapPin, Phone, Mail, ArrowRight, Landmark, Store } from "lucide-react";
import { AGENZIE, GRUPPI_IMPRESE } from "./data";
import { PageMast, Reveal } from "./lib";

export function Imprese({ onScegli }: { onScegli: (id: string) => void }) {
  const [gruppo, setGruppo] = useState<string>("tutti");

  const gruppiVisibili = GRUPPI_IMPRESE.filter((g) => gruppo === "tutti" || g.id === gruppo);

  return (
    <div>
      <PageMast
        kicker="Vetrina ufficiale · Modena e provincia"
        title={
          <>
            Le imprese <em className="italic text-bronze-300">del luogo</em>
          </>
        }
        sub="Tutte le imprese funebri accreditate sulla piattaforma, organizzate per comune di riferimento. L'elenco non costituisce alcuna classifica o priorità: ogni famiglia sceglie liberamente l'impresa di fiducia."
        meta={
          <>
            <span>{AGENZIE.length} imprese accreditate</span>
            <span className="hidden h-1 w-1 rounded-full bg-bronze-500 sm:inline-block" />
            <span>5 ambiti comunali</span>
            <span className="hidden h-1 w-1 rounded-full bg-bronze-500 sm:inline-block" />
            <span>Reperibilità h24 garantita</span>
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">

      {/* filtro per comune */}
      <Reveal className="mb-10 flex flex-wrap gap-2">
        <button
          onClick={() => setGruppo("tutti")}
          aria-pressed={gruppo === "tutti"}
          className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
            gruppo === "tutti"
              ? "border-night-800 bg-night-800 text-paper shadow-md"
              : "border-line bg-card text-ink-soft hover:border-bronze-500 hover:text-bronze-600"
          }`}
        >
          Tutti i comuni
        </button>
        {GRUPPI_IMPRESE.map((g) => {
          const n = AGENZIE.filter((a) => a.gruppi.includes(g.id)).length;
          const attivo = gruppo === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setGruppo(attivo ? "tutti" : g.id)}
              aria-pressed={attivo}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                attivo
                  ? "border-night-800 bg-night-800 text-paper shadow-md"
                  : "border-line bg-card text-ink-soft hover:border-bronze-500 hover:text-bronze-600"
              }`}
            >
              {g.nome} <span className="ml-1 opacity-70">{n}</span>
            </button>
          );
        })}
      </Reveal>

      {/* gruppi per comune */}
      <div className="space-y-14">
        {gruppiVisibili.map((g) => {
          const imprese = AGENZIE.filter((a) => a.gruppi.includes(g.id));
          return (
            <section key={g.id} aria-label={`Imprese di ${g.nome}`}>
              <Reveal>
                <div className="mb-6 flex items-end gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-bronze-500/50 bg-night-900 text-bronze-400">
                    <Landmark size={19} />
                  </span>
                  <div>
                    <h3 className="font-display text-3xl font-semibold text-ink">{g.nome}</h3>
                    <p className="text-[12.5px] text-ink-faint">
                      {imprese.length} {imprese.length === 1 ? "impresa accreditata" : "imprese accreditate"} sulla piattaforma Vicini
                    </p>
                  </div>
                  <span className="mb-1.5 hidden h-px flex-1 bg-line sm:block" />
                </div>
              </Reveal>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {imprese.map((a, i) => (
                  <Reveal key={`${a.id}-${g.id}`} delay={i * 60} className="flex">
                    <article className="card-lift group flex w-full flex-col rounded-xl border border-line bg-card overflow-hidden">
                      <div className="h-[3px] w-full bg-gradient-to-r from-night-600 via-bronze-500 to-night-600" />
                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-display text-[22px] font-semibold leading-tight text-ink">{a.nome}</h4>
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-paper text-ink-faint transition group-hover:border-bronze-500 group-hover:text-bronze-600">
                            <Store size={15} />
                          </span>
                        </div>
                        <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-ink-soft">{a.descrizione}</p>

                        <ul className="mt-4 space-y-1.5 border-t border-line-soft pt-4 text-[12.5px] text-ink-faint">
                          <li className="flex items-start gap-2">
                            <MapPin size={13} className="mt-0.5 shrink-0 text-bronze-600" />
                            <span className="text-ink-soft">{a.indirizzo}</span>
                          </li>
                          <li>
                            <a
                              href={`tel:${a.telefono.replace(/\s/g, "")}`}
                              className="flex items-center gap-2 font-semibold text-ink-soft transition hover:text-bronze-600"
                            >
                              <Phone size={13} className="text-bronze-600" /> {a.telefono} · reperibilità h24
                            </a>
                          </li>
                          <li>
                            <a
                              href={`mailto:${a.email}`}
                              className="link-rule inline-flex items-center gap-2 hover:text-bronze-600"
                            >
                              <Mail size={13} className="text-bronze-600" /> {a.email}
                            </a>
                          </li>
                        </ul>

                        <button
                          onClick={() => onScegli(a.id)}
                          className="group/btn mt-5 flex items-center justify-center gap-2 rounded-md border border-night-700 bg-night-800 px-4 py-2.5 text-[13px] font-semibold text-paper transition hover:border-bronze-500 hover:text-bronze-300 active:scale-[0.98]"
                        >
                          Scegli per «Le Mie Volontà»
                          <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                        </button>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* nota di trasparenza */}
      <Reveal className="mt-14">
        <p className="mx-auto max-w-3xl rounded-lg border border-line bg-card px-6 py-4 text-center text-[12.5px] leading-relaxed text-ink-faint">
          <strong className="text-ink-soft">Nota di trasparenza:</strong> la presentazione delle imprese è organizzata
          esclusivamente per comune e in ordine alfabetico. Nessuna impresa gode di posizioni privilegiate: la scelta resta
          sempre libera e senza vincoli per le famiglie.
        </p>
      </Reveal>
      </div>
    </div>
  );
}
