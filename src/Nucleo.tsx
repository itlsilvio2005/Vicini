import { useEffect, useState } from "react";
import { BellRing, Users, Trash2, ShieldCheck, Smartphone, MailCheck, Plus } from "lucide-react";
import { COMUNI, type Comune } from "./data";
import { Field, inputCls, Reveal, SectionHeading, useToast } from "./lib";

const RELAZIONI = ["Coniuge", "Figlio/a", "Genitore", "Fratello/Sorella", "Nipote", "Compagno/a", "Amico/a stretto", "Altro"];

interface Membro {
  id: string;
  nome: string;
  relazione: string;
  comune: Comune;
  contatto: string;
}

const MEMBRI_INIZIALI: Membro[] = [
  { id: "n1", nome: "Lina Bonetti ved. Malagoli", relazione: "Genitore", comune: "Nonantola", contatto: "marco.malagoli@gmail.com" },
];

export function Nucleo() {
  const toast = useToast();
  const [membri, setMembri] = useState<Membro[]>(() => {
    try {
      const raw = localStorage.getItem("vicini_nucleo");
      return raw ? (JSON.parse(raw) as Membro[]) : MEMBRI_INIZIALI;
    } catch {
      return MEMBRI_INIZIALI;
    }
  });
  const [nome, setNome] = useState("");
  const [relazione, setRelazione] = useState("");
  const [comune, setComune] = useState<Comune | "">("");
  const [contatto, setContatto] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem("vicini_nucleo", JSON.stringify(membri));
  }, [membri]);

  const aggiungi = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (nome.trim().length < 3) errs.nome = "Inserisci nome e cognome del tuo caro.";
    if (!relazione) errs.relazione = "Seleziona il grado di parentela.";
    if (!comune) errs.comune = "Seleziona il comune di residenza.";
    if (contatto.trim().length < 5) errs.contatto = "Indica un'email o un numero di telefono.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setMembri((m) => [...m, { id: `n-${Date.now()}`, nome: nome.trim(), relazione, comune: comune as Comune, contatto: contatto.trim() }]);
    toast(`${nome.trim()} aggiunto al tuo Nucleo: le notifiche sono attive.`);
    setNome(""); setRelazione(""); setComune(""); setContatto("");
  };

  const rimuovi = (id: string) => {
    const m = membri.find((x) => x.id === id);
    setMembri((list) => list.filter((x) => x.id !== id));
    if (m) toast(`${m.nome} rimosso dal Nucleo.`, "info");
  };

  const esempio = membri[0];

  return (
    <section id="nucleo" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          num="05"
          kicker="Notifiche riservate"
          title={
            <>
              Il <em className="italic text-bronze-600">Nucleo</em>
            </>
          }
          sub="Registra in modo riservato l'elenco dei tuoi cari: se viene pubblicato un manifesto che li riguarda, ricevi subito una notifica automatica con orari, luoghi e recapiti — prima ancora che la notizia circoli."
        />

        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          {/* colonna esplicativa + anteprima notifica */}
          <div className="space-y-6">
            <Reveal>
              <div className="rounded-xl border border-line bg-card p-6 sm:p-7">
                <h3 className="flex items-center gap-2.5 font-display text-2xl font-semibold text-ink">
                  <Users size={20} className="text-bronze-600" /> Chi fa parte del tuo Nucleo
                </h3>
                <ul className="mt-4 space-y-3">
                  {membri.length === 0 && (
                    <li className="rounded-md border border-dashed border-line bg-paper p-4 text-[13px] italic text-ink-faint">
                      Nessun caro registrato: aggiungi il primo dal modulo a fianco.
                    </li>
                  )}
                  {membri.map((m) => (
                    <li key={m.id} className="group flex items-center gap-3.5 rounded-lg border border-line-soft bg-paper px-4 py-3 transition hover:border-bronze-500/70">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-bronze-500/60 bg-night-900 font-display text-sm font-semibold text-bronze-300">
                        {m.nome.split(/\s+/).filter((w) => w.length > 1).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-bold text-ink">{m.nome}</p>
                        <p className="text-[12px] text-ink-faint">
                          {m.relazione} · Comune di {m.comune} · notifiche a {m.contatto}
                        </p>
                      </div>
                      <span className="hidden items-center gap-1 rounded-full border border-[#4c7a5a]/40 bg-[#4c7a5a]/10 px-2 py-0.5 text-[10.5px] font-bold text-[#3c6349] sm:flex">
                        <BellRing size={10} /> Attive
                      </span>
                      <button
                        onClick={() => rimuovi(m.id)}
                        aria-label={`Rimuovi ${m.nome}`}
                        className="rounded-md border border-transparent p-1.5 text-ink-faint transition hover:border-[#9a3b2e]/40 hover:text-[#9a3b2e]"
                      >
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* anteprima notifica */}
            <Reveal delay={140}>
              <div className="rounded-xl border border-night-700 bg-night-900 p-6 text-paper sm:p-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mist">Anteprima — notifica automatica</p>
                <div className="mt-4 rounded-lg border border-night-600 bg-night-800 p-4 shadow-inner">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-bronze-500 text-night-950">
                      <BellRing size={17} />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist">Vicini · adesso</p>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-paper/90">
                        È stato pubblicato un manifesto per{" "}
                        <strong className="text-bronze-300">{esempio ? esempio.nome : "un tuo caro"}</strong>{" "}
                        {esempio ? `(Comune di ${esempio.comune})` : ""}. Camera ardente, orario della
                        cerimonia e QR del manifesto sono già disponibili.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-mist">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0 text-bronze-400" />
                  I dati del Nucleo non sono pubblici né visibili alle agenzie: servono solo al
                  sistema di notifica automatica della piattaforma.
                </p>
              </div>
            </Reveal>
          </div>

          {/* modulo registrazione */}
          <Reveal delay={80}>
            <form onSubmit={aggiungi} noValidate className="rounded-xl border border-line bg-card p-6 sm:p-8">
              <h3 className="font-display text-2xl font-semibold text-ink">Aggiungi un caro al Nucleo</h3>
              <p className="mt-1 text-[13px] text-ink-faint">
                Alla pubblicazione di un manifesto correlato, la notifica parte immediatamente via email o SMS.
              </p>

              <div className="mt-6 space-y-5">
                <Field label="Nome e cognome del caro" required error={errors.nome}>
                  <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls(!!errors.nome)} placeholder="Es. Lina Bonetti" />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Grado di parentela" required error={errors.relazione}>
                    <select value={relazione} onChange={(e) => setRelazione(e.target.value)} className={inputCls(!!errors.relazione)}>
                      <option value="">— Seleziona —</option>
                      {RELAZIONI.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Comune di residenza" required error={errors.comune}>
                    <select value={comune} onChange={(e) => setComune(e.target.value as Comune)} className={inputCls(!!errors.comune)}>
                      <option value="">— Seleziona —</option>
                      {COMUNI.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Recapito per la notifica" required error={errors.contatto} hint="email o telefono">
                  <input value={contatto} onChange={(e) => setContatto(e.target.value)} className={inputCls(!!errors.contatto)} placeholder="Es. nome@esempio.it · 3xx xxx xxxx" />
                </Field>

                <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-md border border-line-soft bg-paper px-4 py-3 text-[12.5px] text-ink-soft">
                  <span className="flex items-center gap-2"><MailCheck size={14} className="text-bronze-600" /> Notifica email immediata</span>
                  <span className="flex items-center gap-2"><Smartphone size={14} className="text-bronze-600" /> SMS in caso di mancata lettura</span>
                </div>

                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-md bg-bronze-500 px-5 py-3.5 text-sm font-bold text-night-950 transition hover:bg-bronze-400 active:scale-[0.99]">
                  <Plus size={16} /> Registra nel Nucleo
                </button>
                <p className="text-center text-[11.5px] text-ink-faint">
                  {membri.length} {membri.length === 1 ? "persona registrata" : "persone registrate"} · rimozione immediata in qualsiasi momento
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
