import { useEffect, useMemo, useState } from "react";
import {
  FileCheck2,
  MoonStar,
  ShieldCheck,
  Truck,
  Church,
  Landmark,
  Sparkles,
  CheckCircle2,
  Send,
  PenLine,
} from "lucide-react";
import { AGENZIE, agenziaById, RITI, type Rito } from "./data";
import { Badge, Field, inputCls, Modal, ModalHeader, Reveal, SectionHeading, Switch, useToast } from "./lib";

const MOSCHEE = [
  "Moschea La Misericordia (Masjid Ar-Rahma)",
  "Moschea Takwah",
  "Centro Culturale Islamico Turco",
];

interface VolontaSalvata {
  nome: string;
  email: string;
  agenzia: string;
  rito: Rito;
  trasporto?: { comune: string; citta: string };
  musulmano?: { moschea: string; rimpatrio?: string; ghusl: boolean };
  note?: string;
  salvataIl: string;
}

export function Volonta({ prefillAgenzia }: { prefillAgenzia: string | null }) {
  const toast = useToast();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [agenzia, setAgenzia] = useState("");
  const [trasportoOn, setTrasportoOn] = useState(false);
  const [trasportoComune, setTrasportoComune] = useState("");
  const [trasportoCitta, setTrasportoCitta] = useState("");
  const [rito, setRito] = useState<Rito | "">("");
  const [moschea, setMoschea] = useState("");
  const [rimpatrioOn, setRimpatrioOn] = useState(false);
  const [rimpatrioStato, setRimpatrioStato] = useState("");
  const [ghusl, setGhusl] = useState(false);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [riepilogo, setRiepilogo] = useState<VolontaSalvata | null>(null);
  const [salvata, setSalvata] = useState<VolontaSalvata | null>(() => {
    try {
      const raw = localStorage.getItem("vicini_volonta");
      return raw ? (JSON.parse(raw) as VolontaSalvata) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (prefillAgenzia) {
      setAgenzia(prefillAgenzia);
      toast(`Agenzia di fiducia impostata: ${agenziaById(prefillAgenzia).nome}`, "info");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillAgenzia]);

  const agSel = useMemo(() => AGENZIE.find((a) => a.id === agenzia), [agenzia]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (nome.trim().length < 2) errs.nome = "Inserisci nome e cognome.";
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Inserisci un'email valida.";
    if (!agenzia) errs.agenzia = "Seleziona l'agenzia di fiducia.";
    if (!rito) errs.rito = "Seleziona il rito desiderato.";
    if (trasportoOn) {
      if (trasportoComune.trim().length < 2) errs.trasportoComune = "Indica il comune/provincia di destinazione.";
      if (trasportoCitta.trim().length < 2) errs.trasportoCitta = "Indica la città o località specifica.";
    }
    if (rito === "Musulmano") {
      if (!moschea) errs.moschea = "Seleziona il luogo di preghiera.";
      if (rimpatrioOn && rimpatrioStato.trim().length < 2)
        errs.rimpatrioStato = "Specifica lo Stato di destinazione (es. Marocco).";
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast("Compila i campi obbligatori evidenziati.", "info");
      return;
    }

    const v: VolontaSalvata = {
      nome: nome.trim(),
      email: email.trim(),
      agenzia,
      rito: rito as Rito,
      trasporto: trasportoOn ? { comune: trasportoComune.trim(), citta: trasportoCitta.trim() } : undefined,
      musulmano:
        rito === "Musulmano"
          ? { moschea, rimpatrio: rimpatrioOn ? rimpatrioStato.trim() : undefined, ghusl }
          : undefined,
      note: note.trim() || undefined,
      salvataIl: new Date().toLocaleDateString("it-IT"),
    };
    localStorage.setItem("vicini_volonta", JSON.stringify(v));
    setSalvata(v);
    setRiepilogo(v);
    toast("Le tue volontà sono state registrate in forma riservata.");
  };

  return (
    <section id="volonta" className="scroll-mt-24 bg-paper-deep/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          num="04"
          kicker="Sezione riservata B2C"
          title={
            <>
              Le Mie <em className="italic text-bronze-600">Volontà</em>
            </>
          }
          sub="Un modulo dinamico e riservato per indicare come desideri sia organizzato il tuo funerale: agenzia di fiducia, trasporto, rito — con opzioni dedicate che compaiono solo quando servono."
        />

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* modulo */}
          <Reveal>
            <form onSubmit={submit} noValidate className="rounded-xl border border-line bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3 border-b border-line-soft pb-5">
                <span className="grid h-10 w-10 place-items-center rounded-md border border-bronze-500/50 bg-bronze-300/15 text-bronze-600">
                  <PenLine size={18} />
                </span>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-ink">Modulo delle volontà</h3>
                  <p className="text-[12.5px] text-ink-faint">Compilazione libera · nessuna spesa · revocabile in qualsiasi momento</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Nome e cognome" required error={errors.nome}>
                  <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls(!!errors.nome)} placeholder="Es. Carla Mantovani" />
                </Field>
                <Field label="Email riservata" required error={errors.email}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls(!!errors.email)} placeholder="nome@esempio.it" />
                </Field>
              </div>

              {/* Agenzia di fiducia */}
              <div className="mt-6">
                <Field label="Agenzia di fiducia" required error={errors.agenzia} hint="partner accreditati Vicini">
                  <select value={agenzia} onChange={(e) => setAgenzia(e.target.value)} className={inputCls(!!errors.agenzia)}>
                    <option value="">— Seleziona l'agenzia a cui affidare la gestione —</option>
                    {AGENZIE.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome}{a.principale ? " · Partner Principale" : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                {agSel && (
                  <p className="anim-fade mt-2 flex items-start gap-2 rounded-md border border-line-soft bg-paper px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-soft">
                    <ShieldCheck size={14} className="mt-0.5 shrink-0 text-bronze-600" />
                    <span>
                      <strong>{agSel.nome}</strong> — {agSel.indirizzo} · {agSel.telefono}. {agSel.descrizione}
                    </span>
                  </p>
                )}
              </div>

              {/* Trasporto fuori comune */}
              <div className="mt-6 rounded-lg border border-line bg-paper p-4.5 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-md border border-line bg-card text-ink-soft">
                      <Truck size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">Trasporto fuori comune</p>
                      <p className="text-[12px] text-ink-faint">Opzione generale valida per qualsiasi rito</p>
                    </div>
                  </div>
                  <Switch on={trasportoOn} onChange={setTrasportoOn} label="Attiva trasporto fuori comune" />
                </div>
                {trasportoOn && (
                  <div className="anim-fade mt-4 grid gap-4 border-t border-line-soft pt-4 sm:grid-cols-2">
                    <Field label="Comune / Provincia di destinazione" required error={errors.trasportoComune}>
                      <input value={trasportoComune} onChange={(e) => setTrasportoComune(e.target.value)} className={inputCls(!!errors.trasportoComune)} placeholder="Es. Ferrara (FE)" />
                    </Field>
                    <Field label="Città / Località specifica" required error={errors.trasportoCitta}>
                      <input value={trasportoCitta} onChange={(e) => setTrasportoCitta(e.target.value)} className={inputCls(!!errors.trasportoCitta)} placeholder="Es. Cimitero della Certosa" />
                    </Field>
                  </div>
                )}
              </div>

              {/* Rito */}
              <div className="mt-6">
                <Field label="Selezione del rito" required error={errors.rito}>
                  <select value={rito} onChange={(e) => setRito(e.target.value as Rito)} className={inputCls(!!errors.rito)}>
                    <option value="">— Scegli il rito —</option>
                    {RITI.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Campi condizionali — rito musulmano */}
              {rito === "Musulmano" && (
                <fieldset className="anim-fade mt-5 rounded-lg border-2 border-bronze-500/60 bg-bronze-300/10 p-5">
                  <legend className="flex items-center gap-2 rounded-md bg-night-900 px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-bronze-300">
                    <MoonStar size={13} /> Opzioni dedicate al rito musulmano
                  </legend>

                  <Field label="Luogo di preghiera / Moschea" required error={errors.moschea}>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {MOSCHEE.map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setMoschea(m)}
                          aria-pressed={moschea === m}
                          className={`rounded-md border px-3 py-2.5 text-left text-[12.5px] font-semibold leading-snug transition ${
                            moschea === m
                              ? "border-bronze-600 bg-night-900 text-bronze-300"
                              : "border-line bg-card text-ink-soft hover:border-bronze-500"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Sepoltura</p>
                    <div className="mt-2 flex items-center gap-3 rounded-md border border-bronze-600/50 bg-card px-4 py-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-bronze-500 bg-bronze-300/20 text-bronze-600">
                        <Landmark size={15} />
                      </span>
                      <div>
                        <p className="text-[13.5px] font-bold text-ink">Reparto Islamico — Cimitero di San Cataldo</p>
                        <p className="text-[12px] text-ink-faint">Strada Cimitero San Cataldo, Modena · inumazione secondo la qibla</p>
                      </div>
                      <CheckCircle2 size={18} className="ml-auto shrink-0 text-bronze-600" />
                    </div>
                  </div>

                  <div className="mt-4 rounded-md border border-line bg-card p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-ink">Rimpatrio salma nel Paese d'Origine</p>
                        <p className="text-[12px] text-ink-faint">Opzione flessibile, con pratiche consolari a cura dell'agenzia</p>
                      </div>
                      <Switch on={rimpatrioOn} onChange={setRimpatrioOn} label="Attiva rimpatrio salma" />
                    </div>
                    {rimpatrioOn && (
                      <div className="anim-fade mt-3 border-t border-line-soft pt-3">
                        <Field label="Stato di destinazione" required error={errors.rimpatrioStato}>
                          <input value={rimpatrioStato} onChange={(e) => setRimpatrioStato(e.target.value)} className={inputCls(!!errors.rimpatrioStato)} placeholder="Es. Marocco, Tunisia, Senegal…" />
                        </Field>
                      </div>
                    )}
                  </div>

                  <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-md border border-line bg-card px-4 py-3 transition hover:border-bronze-500">
                    <input
                      type="checkbox"
                      checked={ghusl}
                      onChange={(e) => setGhusl(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#b08a45]"
                    />
                    <span>
                      <span className="block text-sm font-bold text-ink">Lavaggio e preparazione rituale (Ghusl)</span>
                      <span className="block text-[12px] text-ink-faint">Servizio rituale svolto in forma riservata, in coordinamento con la moschea scelta</span>
                    </span>
                  </label>
                </fieldset>
              )}

              {rito && rito !== "Musulmano" && (
                <p className="anim-fade mt-5 flex items-center gap-2.5 rounded-md border border-line bg-paper px-4 py-3 text-[12.5px] text-ink-soft">
                  {rito === "Cattolico" || rito === "Ortodosso" ? <Church size={15} className="shrink-0 text-bronze-600" /> : <Sparkles size={15} className="shrink-0 text-bronze-600" />}
                  Per il rito <strong>{rito}</strong> l'agenzia curerà parrocchia o sala del commiato nel comune indicato; aggiungi qui sotto eventuali disposizioni particolari.
                </p>
              )}

              <div className="mt-6">
                <Field label="Disposizioni particolari" hint="facoltative">
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={`${inputCls()} resize-none`} placeholder="Es. musica, letture, abiti, destinazioni benefiche delle offerte…" />
                </Field>
              </div>

              <button type="submit" className="mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-night-800 px-5 py-3.5 text-sm font-bold text-paper transition hover:bg-night-700 active:scale-[0.99]">
                <FileCheck2 size={16} className="text-bronze-400" /> Registra le mie volontà in forma riservata
              </button>
              <p className="mt-3 text-center text-[11.5px] text-ink-faint">
                Documento senza valore testamentario: è una traccia operativa per l'agenzia e per i tuoi cari.
              </p>
            </form>
          </Reveal>

          {/* colonna informativa */}
          <div className="space-y-6">
            <Reveal delay={120}>
              <div className="rounded-xl border border-night-700 bg-night-900 p-6 text-paper sm:p-7">
                <h3 className="font-display text-2xl font-semibold">Come funziona</h3>
                <ol className="mt-4 space-y-4">
                  {[
                    ["Compili", "Indichi agenzia, rito e preferenze: i campi dedicati compaiono solo quando servono."],
                    ["Resta riservato", "Le volontà sono visibili solo all'agenzia scelta e attivabili dai tuoi cari del Nucleo."],
                    ["Al momento opportuno", "L'agenzia segue le tue indicazioni passo passo, senza gravare la famiglia di decisioni."],
                  ].map(([t, d], i) => (
                    <li key={t} className="flex gap-3.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-bronze-500/60 font-display text-lg italic text-bronze-300">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-bronze-300">{t}</p>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-mist">{d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="rounded-xl border border-line bg-card p-6 sm:p-7">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-bronze-700">
                  <ShieldCheck size={14} /> Stato della registrazione
                </p>
                {salvata ? (
                  <div className="mt-3">
                    <p className="text-[13.5px] leading-relaxed text-ink-soft">
                      Volontà di <strong className="text-ink">{salvata.nome}</strong> registrate il{" "}
                      <strong className="text-ink">{salvata.salvataIl}</strong> · rito{" "}
                      <Badge tone="bronze">{salvata.rito}</Badge>
                    </p>
                    <p className="mt-2 text-[12.5px] text-ink-faint">
                      Agenzia: {agenziaById(salvata.agenzia).nome}
                      {salvata.musulmano?.moschea ? ` · ${salvata.musulmano.moschea}` : ""}
                      {salvata.trasporto ? ` · trasporto verso ${salvata.trasporto.comune}` : ""}
                    </p>
                    <p className="mt-3 rounded-md border border-line-soft bg-paper px-3 py-2 text-[12px] italic text-ink-soft">
                      Ricompila il modulo per aggiornare le tue disposizioni: l'ultima versione sostituisce la precedente.
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
                    Nessuna volontà registrata da questo dispositivo. La compilazione richiede meno
                    di due minuti ed è completamente riservata.
                  </p>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* modale riepilogo */}
      <Modal open={!!riepilogo} onClose={() => setRiepilogo(null)} labelledBy="volonta-title">
        {riepilogo && (
          <>
            <ModalHeader
              id="volonta-title"
              onClose={() => setRiepilogo(null)}
              title="Volontà registrate"
              sub={`Salvate in forma riservata il ${riepilogo.salvataIl}`}
            />
            <div className="px-6 py-5">
              <dl className="space-y-3 text-[13.5px]">
                {[
                  ["Titolare", `${riepilogo.nome} · ${riepilogo.email}`],
                  ["Agenzia di fiducia", agenziaById(riepilogo.agenzia).nome],
                  ["Rito", riepilogo.rito],
                  riepilogo.trasporto
                    ? ["Trasporto fuori comune", `${riepilogo.trasporto.comune} — ${riepilogo.trasporto.citta}`]
                    : null,
                  riepilogo.musulmano ? ["Luogo di preghiera", riepilogo.musulmano.moschea] : null,
                  riepilogo.musulmano ? ["Sepoltura", "Reparto Islamico — Cimitero di San Cataldo"] : null,
                  riepilogo.musulmano?.rimpatrio ? ["Rimpatrio salma", riepilogo.musulmano.rimpatrio] : null,
                  riepilogo.musulmano ? ["Servizio rituale (Ghusl)", riepilogo.musulmano.ghusl ? "Richiesto" : "Non richiesto"] : null,
                  riepilogo.note ? ["Disposizioni particolari", riepilogo.note] : null,
                ]
                  .filter((x): x is [string, string] => x !== null)
                  .map(([k, v]) => (
                    <div key={k as string} className="flex flex-col gap-0.5 border-b border-line-soft pb-2.5 sm:flex-row sm:gap-4">
                      <dt className="w-44 shrink-0 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint sm:pt-0.5">{k}</dt>
                      <dd className="font-medium text-ink">{v}</dd>
                    </div>
                  ))}
              </dl>
              <p className="mt-4 flex items-start gap-2 rounded-md border border-bronze-600/40 bg-bronze-300/15 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-bronze-700">
                <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                Riceverai una copia riservata via email. Potrai modificarla o revocarla in qualunque momento.
              </p>
              <button
                onClick={() => setRiepilogo(null)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-night-800 px-4 py-3 text-sm font-semibold text-paper transition hover:bg-night-700"
              >
                <Send size={15} /> Conferma e chiudi
              </button>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}
