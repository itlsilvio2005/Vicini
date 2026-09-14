import { useEffect, useState } from "react";
import {
  FileCheck2,
  MoonStar,
  ShieldCheck,
  Truck,
  PlaneTakeoff,
  Church,
  Cross,
  Landmark,
  BellRing,
  Users,
  Trash2,
  Smartphone,
  MailCheck,
  Plus,
  Lock,
  Music2,
  Shirt,
  Flower2,
  CheckCircle2,
  Send,
  HeartHandshake,
  Ban,
} from "lucide-react";
import {
  AGENZIE,
  agenziaById,
  CHIESE_CERIMONIA,
  COMUNI,
  GRUPPI_IMPRESE,
  MOSCHEE,
  PAESI_RIMPATRIO,
  RITI,
  type Comune,
  type Rito,
} from "./data";
import { Badge, Field, inputCls, Modal, ModalHeader, PageMast, Reveal, Switch, useToast } from "./lib";

/* ================= TIPI ================= */

interface Membro {
  id: string;
  nome: string;
  relazione: string;
  comune: Comune;
  contatto: string;
}

interface VolontaSalvata {
  nome: string;
  email: string;
  agenzia: string;
  rito: Rito;
  destinazione: string;
  trasporto?: { comune: string; citta: string };
  rimpatrio?: { paese: string };
  ritoDettagli?: string[];
  note?: string;
  salvataIl: string;
}

const RELAZIONI = ["Coniuge", "Figlio/a", "Genitore", "Fratello/Sorella", "Nipote", "Compagno/a", "Amico/a stretto", "Altro"];
const MEMBRI_INIZIALI: Membro[] = [
  { id: "n1", nome: "Lina Bonetti ved. Malagoli", relazione: "Genitore", comune: "Nonantola", contatto: "marco.malagoli@gmail.com" },
];

/** Salvataggio locale sicuro: in anteprime sandbox localStorage può essere inaccessibile. */
function saveLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignora: i dati restano comunque nello stato dell'app */
  }
}

const ABBIGLIAMENTO = ["Abito preferito indicato dalla famiglia", "Abito formale scuro", "Abito religioso / confraternita"];
const MUSICA = ["Nessuna musica", "Organista", "Coro parrocchiale", "Brano preferito (da concordare)"];
const ALLESTIMENTI = ["Fiori bianchi", "Composizioni di stagione", "Nessun addobbo floreale"];
const DESTINAZIONI = ["Tumulazione", "Cremazione", "Inumazione"];

/* ================= TAB 4 ================= */

export function B2C({ prefillAgenzia }: { prefillAgenzia: { id: string; ts: number } | null }) {
  return (
    <div>
      <PageMast
        kicker="Area riservata B2C"
        title={
          <>
            Le Mie Volontà <em className="italic text-bronze-300">&amp; Il Nucleo</em>
          </>
        }
        sub="Due strumenti riservati: registra come desideri sia organizzato il tuo funerale e proteggi i tuoi cari con notifiche automatiche sui nuovi manifesti. Nessun dato è pubblico."
        meta={
          <>
            <span>Registrazione riservata e revocabile</span>
            <span className="hidden h-1 w-1 rounded-full bg-bronze-500 sm:inline-block" />
            <span>Notifiche automatiche GDPR-compliant</span>
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 xl:grid-cols-[1.15fr_0.85fr]">
          <Volonta prefill={prefillAgenzia} />
          <Nucleo />
        </div>
      </div>
    </div>
  );
}

/* ================= LE MIE VOLONTÀ ================= */

function Volonta({ prefill }: { prefill: { id: string; ts: number } | null }) {
  const toast = useToast();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [agenzia, setAgenzia] = useState("");
  const [trasportoOn, setTrasportoOn] = useState(false);
  const [tComune, setTComune] = useState("");
  const [tCitta, setTCitta] = useState("");
  const [rimpatrioOn, setRimpatrioOn] = useState(false);
  const [paese, setPaese] = useState("");
  const [rito, setRito] = useState<Rito | "">("");
  const [chiesa, setChiesa] = useState("");
  const [sala, setSala] = useState("");
  const [moschea, setMoschea] = useState("");
  const [ghusl, setGhusl] = useState(false);
  const [veglia, setVeglia] = useState(false);
  const [destinazione, setDestinazione] = useState("");
  const [abbigliamento, setAbbigliamento] = useState("");
  const [musica, setMusica] = useState("");
  const [allestimento, setAllestimento] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [riepilogo, setRiepilogo] = useState<VolontaSalvata | null>(null);
  const [salvata, setSalvata] = useState<VolontaSalvata | null>(() => {
    try {
      const raw = localStorage.getItem("vicini_volonta_v2");
      return raw ? (JSON.parse(raw) as VolontaSalvata) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (prefill) {
      setAgenzia(prefill.id);
      toast(`Agenzia di fiducia impostata: ${agenziaById(prefill.id).nome}`, "info");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill?.ts]);

  const ortodosso = rito === "Ortodosso";
  const musulmano = rito === "Musulmano";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (nome.trim().length < 2) errs.nome = "Inserisci nome e cognome.";
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Inserisci un'email valida.";
    if (!agenzia) errs.agenzia = "Seleziona l'agenzia di fiducia dall'elenco «Le imprese del luogo».";
    if (trasportoOn) {
      if (tComune.trim().length < 2) errs.tComune = "Indica il comune/provincia di destinazione.";
      if (tCitta.trim().length < 2) errs.tCitta = "Indica la città o località specifica.";
    }
    if (rimpatrioOn && !paese) errs.paese = "Seleziona il Paese di destinazione.";
    if (!rito) errs.rito = "Seleziona il rito.";
    if (musulmano && !moschea) errs.moschea = "Seleziona il luogo di preghiera.";
    if (!destinazione) errs.destinazione = "Indica la destinazione finale.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast("Compila i campi obbligatori evidenziati.", "info");
      return;
    }

    const dettagli: string[] = [];
    if (musulmano) {
      dettagli.push(`Luogo di preghiera: ${moschea}`);
      dettagli.push("Sepoltura: Reparto Islamico — Cimitero di San Cataldo");
      dettagli.push(`Ghusl (lavaggio rituale): ${ghusl ? "richiesto" : "non richiesto"}`);
    }
    if (ortodosso) {
      dettagli.push("Celebrazione: Chiesa Ortodossa Rumena di San Nicola — Viale Amendola");
      dettagli.push(`Veglia funebre (parastas): ${veglia ? "richiesta" : "non richiesta"}`);
      dettagli.push("Cremazione non consentita dal rito");
    }
    if (rito === "Cattolico" && chiesa) dettagli.push(`Chiesa: ${chiesa}`);
    if (rito === "Civile" && sala) dettagli.push(`Sala: ${sala}`);

    const v: VolontaSalvata = {
      nome: nome.trim(),
      email: email.trim(),
      agenzia,
      rito: rito as Rito,
      destinazione,
      trasporto: trasportoOn ? { comune: tComune.trim(), citta: tCitta.trim() } : undefined,
      rimpatrio: rimpatrioOn ? { paese } : undefined,
      ritoDettagli: dettagli.length ? dettagli : undefined,
      note: note.trim() || undefined,
      salvataIl: new Date().toLocaleDateString("it-IT"),
    };
    saveLS("vicini_volonta_v2", v);
    setSalvata(v);
    setRiepilogo(v);
    toast("Le tue volontà sono state registrate in forma riservata.");
  };

  return (
    <Reveal>
      <form onSubmit={submit} noValidate className="rounded-xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3 border-b border-line-soft pb-5">
          <span className="grid h-11 w-11 place-items-center rounded-lg border border-bronze-500/50 bg-night-900 text-bronze-400">
            <FileCheck2 size={19} />
          </span>
          <div>
            <h3 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Le Mie Volontà</h3>
            <p className="text-[12.5px] text-ink-faint">Modulo dinamico e riservato · revocabile in qualsiasi momento</p>
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
          <Field label="Agenzia di fiducia" required error={errors.agenzia} hint="dall'elenco «Le imprese del luogo»">
            <select value={agenzia} onChange={(e) => setAgenzia(e.target.value)} className={inputCls(!!errors.agenzia)}>
              <option value="">— Seleziona l'impresa a cui affidare la gestione —</option>
              {AGENZIE.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome} · {a.gruppi.map((g) => GRUPPI_IMPRESE.find((x) => x.id === g)?.nome ?? g).join(" · ")}
                </option>
              ))}
            </select>
          </Field>
          {agenzia && (
            <p className="anim-fade mt-2 flex items-start gap-2 rounded-md border border-line-soft bg-paper px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-soft">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-bronze-600" />
              <span>
                <strong>{agenziaById(agenzia).nome}</strong> — {agenziaById(agenzia).indirizzo} · {agenziaById(agenzia).telefono}.
              </span>
            </p>
          )}
        </div>

        {/* Trasporto fuori comune */}
        <div className="mt-6 rounded-lg border border-line bg-paper p-4 sm:p-5">
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
              <Field label="Comune / Provincia di destinazione" required error={errors.tComune}>
                <input value={tComune} onChange={(e) => setTComune(e.target.value)} className={inputCls(!!errors.tComune)} placeholder="Es. Ferrara (FE)" />
              </Field>
              <Field label="Città / Località specifica" required error={errors.tCitta}>
                <input value={tCitta} onChange={(e) => setTCitta(e.target.value)} className={inputCls(!!errors.tCitta)} placeholder="Es. Cimitero della Certosa" />
              </Field>
            </div>
          )}
        </div>

        {/* Rimpatrio salma all'estero — universale */}
        <div className={`mt-4 rounded-lg border p-4 sm:p-5 transition-colors ${rimpatrioOn ? "border-bronze-500 bg-bronze-300/10" : "border-line bg-paper"}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`grid h-9 w-9 place-items-center rounded-md border ${rimpatrioOn ? "border-bronze-500 bg-night-900 text-bronze-300" : "border-line bg-card text-ink-soft"}`}>
                <PlaneTakeoff size={16} />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">Rimpatrio salma all'Estero</p>
                <p className="text-[12px] text-ink-faint">Opzione universale, per qualsiasi rito · pratiche consolari a cura dell'agenzia</p>
              </div>
            </div>
            <Switch on={rimpatrioOn} onChange={setRimpatrioOn} label="Attiva rimpatrio salma all'estero" />
          </div>
          {rimpatrioOn && (
            <div className="anim-fade mt-4 border-t border-bronze-500/30 pt-4">
              <Field label="Paese di destinazione" required error={errors.paese}>
                <select value={paese} onChange={(e) => setPaese(e.target.value)} className={inputCls(!!errors.paese)}>
                  <option value="">— Seleziona il Paese —</option>
                  {PAESI_RIMPATRIO.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <p className="mt-3 flex items-start gap-2.5 rounded-md border border-bronze-600/40 bg-card px-3.5 py-3 text-[12.5px] leading-relaxed text-bronze-700">
                <Lock size={14} className="mt-0.5 shrink-0" />
                <span>
                  <strong>Rimpatrio attivo:</strong> le preferenze di abbigliamento, musica e allestimenti locali sono state
                  automaticamente disabilitate perché non applicabili al trasferimento all'estero.
                </span>
              </p>
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

        {/* campi condizionali per rito */}
        {rito === "Cattolico" && (
          <div className="anim-fade mt-5 rounded-lg border border-line bg-paper p-5">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-bronze-700">
              <Church size={13} /> Opzioni rito cattolico
            </p>
            <div className="mt-3">
              <Field label="Chiesa per la cerimonia" hint="chiese di Modena">
                <select value={chiesa} onChange={(e) => setChiesa(e.target.value)} className={inputCls()}>
                  <option value="">— A cura della parrocchia di residenza —</option>
                  {CHIESE_CERIMONIA.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        )}

        {rito === "Civile" && (
          <div className="anim-fade mt-5 rounded-lg border border-line bg-paper p-5">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-bronze-700">
              <Landmark size={13} /> Opzioni cerimonia civile
            </p>
            <div className="mt-3">
              <Field label="Sala del commiato">
                <select value={sala} onChange={(e) => setSala(e.target.value)} className={inputCls()}>
                  <option value="">— Nessuna preferenza —</option>
                  <option>Casa Funeraria Terracielo — Sala «Gigli»</option>
                  <option>Casa Funeraria Terracielo — Sala «Ulivi»</option>
                  <option>Casa Funeraria Terracielo — Sala «Rose»</option>
                  <option>Sala del Commiato — Cimitero di Vignola</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {musulmano && (
          <fieldset className="anim-fade mt-5 rounded-lg border-2 border-[#7fbf9a]/60 bg-[#7fbf9a]/10 p-5">
            <legend className="flex items-center gap-2 rounded-md bg-night-900 px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#7fbf9a]">
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
                        ? "border-night-800 bg-night-900 text-bronze-300"
                        : "border-line bg-card text-ink-soft hover:border-[#7fbf9a]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </Field>
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Sepoltura</p>
              <div className="mt-2 flex items-center gap-3 rounded-md border border-[#7fbf9a]/50 bg-card px-4 py-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#7fbf9a] bg-[#7fbf9a]/15 text-[#3c6349]">
                  <Landmark size={15} />
                </span>
                <div>
                  <p className="text-[13.5px] font-bold text-ink">Reparto Islamico — Cimitero di San Cataldo</p>
                  <p className="text-[12px] text-ink-faint">Strada Cimitero San Cataldo, Modena · inumazione secondo la qibla</p>
                </div>
                <CheckCircle2 size={18} className="ml-auto shrink-0 text-[#3c6349]" />
              </div>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-md border border-line bg-card px-4 py-3 transition hover:border-[#7fbf9a]">
              <input type="checkbox" checked={ghusl} onChange={(e) => setGhusl(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#4c7a5a]" />
              <span>
                <span className="block text-sm font-bold text-ink">Lavaggio e preparazione rituale (Ghusl)</span>
                <span className="block text-[12px] text-ink-faint">Servizio rituale in forma riservata, in coordinamento con la moschea scelta</span>
              </span>
            </label>
          </fieldset>
        )}

        {ortodosso && (
          <fieldset className="anim-fade mt-5 rounded-lg border-2 border-[#d8b25c]/70 bg-[#d8b25c]/10 p-5">
            <legend className="flex items-center gap-2 rounded-md bg-night-900 px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#d8b25c]">
              <Cross size={13} /> Opzioni dedicate al rito ortodosso
            </legend>
            <div className="flex items-center gap-3 rounded-md border border-[#d8b25c]/50 bg-card px-4 py-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#d8b25c] bg-[#d8b25c]/15 text-[#8a6a35]">
                <Church size={15} />
              </span>
              <div>
                <p className="text-[13.5px] font-bold text-ink">Chiesa Ortodossa Rumena di San Nicola</p>
                <p className="text-[12px] text-ink-faint">Viale Amendola — Modena · celebrazione secondo la tradizione bizantina</p>
              </div>
              <CheckCircle2 size={18} className="ml-auto shrink-0 text-[#8a6a35]" />
            </div>
            <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-md border border-line bg-card px-4 py-3 transition hover:border-[#d8b25c]">
              <input type="checkbox" checked={veglia} onChange={(e) => setVeglia(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#b08a45]" />
              <span>
                <span className="block text-sm font-bold text-ink">Veglia funebre (parastas)</span>
                <span className="block text-[12px] text-ink-faint">Veglia di preghiera la sera precedente la divina liturgia funebre</span>
              </span>
            </label>
            <p className="mt-3 flex items-start gap-2.5 rounded-md border border-[#9a3b2e]/40 bg-[#9a3b2e]/5 px-3.5 py-3 text-[12.5px] leading-relaxed text-[#8a3526]">
              <Ban size={14} className="mt-0.5 shrink-0" />
              <span>
                <strong>Divieto di cremazione:</strong> la tradizione ortodossa non la consente. L'opzione «Cremazione» è
                stata rimossa dalle destinazioni possibili.
              </span>
            </p>
          </fieldset>
        )}

        {/* Destinazione finale */}
        {rito && (
          <div className="anim-fade mt-5">
            <Field label="Destinazione finale" required error={errors.destinazione}>
              <select value={destinazione} onChange={(e) => setDestinazione(e.target.value)} className={inputCls(!!errors.destinazione)}>
                <option value="">— Seleziona —</option>
                {DESTINAZIONI.filter((d) => !(ortodosso && d === "Cremazione")).map((d) => (
                  <option key={d} value={d}>{d}{ortodosso && d === "Cremazione" ? " (non consentita)" : ""}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {/* Abbigliamento / Musica / Allestimenti — nascosti se rimpatrio attivo */}
        {!rimpatrioOn && (
          <div className="anim-fade mt-6">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Preferenze per la cerimonia
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-line bg-paper p-4">
                <p className="flex items-center gap-2 text-[12px] font-bold text-ink">
                  <Shirt size={13} className="text-bronze-600" /> Abbigliamento
                </p>
                <select value={abbigliamento} onChange={(e) => setAbbigliamento(e.target.value)} className={`${inputCls()} mt-2.5 py-2! text-[12.5px]`}>
                  <option value="">Nessuna preferenza</option>
                  {ABBIGLIAMENTO.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg border border-line bg-paper p-4">
                <p className="flex items-center gap-2 text-[12px] font-bold text-ink">
                  <Music2 size={13} className="text-bronze-600" /> Musica
                </p>
                <select value={musica} onChange={(e) => setMusica(e.target.value)} className={`${inputCls()} mt-2.5 py-2! text-[12.5px]`}>
                  <option value="">Nessuna preferenza</option>
                  {MUSICA.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg border border-line bg-paper p-4">
                <p className="flex items-center gap-2 text-[12px] font-bold text-ink">
                  <Flower2 size={13} className="text-bronze-600" /> Allestimenti locali
                </p>
                <select value={allestimento} onChange={(e) => setAllestimento(e.target.value)} className={`${inputCls()} mt-2.5 py-2! text-[12.5px]`}>
                  <option value="">Nessuna preferenza</option>
                  {ALLESTIMENTI.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Field label="Disposizioni particolari" hint="facoltative">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={`${inputCls()} resize-none`} placeholder="Es. letture, destinazioni benefiche delle offerte…" />
          </Field>
        </div>

        <button
          type="submit"
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-md bg-night-800 px-5 py-3.5 text-sm font-bold text-paper transition hover:bg-night-700 active:scale-[0.99]"
        >
          <FileCheck2 size={16} className="text-bronze-400" /> Registra le mie volontà in forma riservata
        </button>

        {salvata && (
          <p className="mt-4 rounded-md border border-line-soft bg-paper px-4 py-3 text-[12.5px] leading-relaxed text-ink-soft">
            <Badge tone="green"><ShieldCheck size={11} /> Attive</Badge>{" "}
            Volontà di <strong className="text-ink">{salvata.nome}</strong> registrate il {salvata.salvataIl} · rito{" "}
            <Badge tone="bronze">{salvata.rito}</Badge> · agenzia {agenziaById(salvata.agenzia).nome}. Ricompila per aggiornarle.
          </p>
        )}
      </form>

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
                  ["Destinazione finale", riepilogo.destinazione],
                  riepilogo.trasporto ? ["Trasporto fuori comune", `${riepilogo.trasporto.comune} — ${riepilogo.trasporto.citta}`] : null,
                  riepilogo.rimpatrio ? ["Rimpatrio salma", riepilogo.rimpatrio.paese] : null,
                  ...(riepilogo.ritoDettagli ?? []).map((d) => ["Dettaglio rito", d] as [string, string]),
                  riepilogo.note ? ["Disposizioni", riepilogo.note] : null,
                ]
                  .filter(Boolean)
                  .map((row, i) => {
                    const [k, v] = row as [string, string];
                    return (
                      <div key={`${k}-${i}`} className="flex flex-col gap-0.5 border-b border-line-soft pb-2.5 sm:flex-row sm:gap-4">
                        <dt className="w-44 shrink-0 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint sm:pt-0.5">{k}</dt>
                        <dd className="font-medium text-ink">{v}</dd>
                      </div>
                    );
                  })}
              </dl>
              <p className="mt-4 flex items-start gap-2 rounded-md border border-bronze-600/40 bg-bronze-300/15 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-bronze-700">
                <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                Documento senza valore testamentario: è una traccia operativa per l'agenzia e per i tuoi cari del Nucleo.
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
    </Reveal>
  );
}

/* ================= IL NUCLEO ================= */

function Nucleo() {
  const toast = useToast();
  const [membri, setMembri] = useState<Membro[]>(() => {
    try {
      const raw = localStorage.getItem("vicini_nucleo_v2");
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
    saveLS("vicini_nucleo_v2", membri);
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

  return (
    <div className="space-y-6">
      <Reveal delay={100}>
        <div className="rounded-xl border border-line bg-card p-6 sm:p-7">
          <div className="flex items-center gap-3 border-b border-line-soft pb-5">
            <span className="grid h-11 w-11 place-items-center rounded-lg border border-bronze-500/50 bg-night-900 text-bronze-400">
              <Users size={19} />
            </span>
            <div>
              <h3 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Il Nucleo</h3>
              <p className="text-[12.5px] text-ink-faint">Notifiche automatiche sui nuovi manifesti dei tuoi cari</p>
            </div>
          </div>

          {/* membri */}
          <ul className="mt-5 space-y-3">
            {membri.length === 0 && (
              <li className="rounded-md border border-dashed border-line bg-paper p-4 text-[13px] italic text-ink-faint">
                Nessun caro registrato: aggiungi il primo dal modulo qui sotto.
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

          {/* form aggiunta */}
          <form onSubmit={aggiungi} noValidate className="mt-6 border-t border-line-soft pt-5">
            <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">
              <Plus size={13} /> Registra un caro
            </p>
            <div className="space-y-4">
              <Field label="Nome e cognome" required error={errors.nome}>
                <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls(!!errors.nome)} placeholder="Es. Lina Bonetti" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Parentela" required error={errors.relazione}>
                  <select value={relazione} onChange={(e) => setRelazione(e.target.value)} className={inputCls(!!errors.relazione)}>
                    <option value="">— Seleziona —</option>
                    {RELAZIONI.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Comune" required error={errors.comune}>
                  <select value={comune} onChange={(e) => setComune(e.target.value as Comune)} className={inputCls(!!errors.comune)}>
                    <option value="">— Seleziona —</option>
                    {COMUNI.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Recapito notifiche" required error={errors.contatto} hint="email o telefono">
                <input value={contatto} onChange={(e) => setContatto(e.target.value)} className={inputCls(!!errors.contatto)} placeholder="nome@esempio.it · 3xx xxx xxxx" />
              </Field>
              <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-md border border-line-soft bg-paper px-4 py-3 text-[12.5px] text-ink-soft">
                <span className="flex items-center gap-2"><MailCheck size={14} className="text-bronze-600" /> Notifica email immediata</span>
                <span className="flex items-center gap-2"><Smartphone size={14} className="text-bronze-600" /> SMS di backup</span>
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-bronze-500 px-5 py-3 text-sm font-bold text-night-950 transition hover:bg-bronze-400 active:scale-[0.99]"
              >
                <Plus size={16} /> Aggiungi al Nucleo
              </button>
            </div>
          </form>
        </div>
      </Reveal>

      {/* anteprima notifica + gdpr */}
      <Reveal delay={180}>
        <div className="rounded-xl border border-night-700 bg-night-900 p-6 text-paper sm:p-7">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-mist">Anteprima — notifica automatica</p>
          <div className="mt-4 rounded-lg border border-night-600 bg-night-800 p-4 shadow-inner">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-bronze-500 text-night-950">
                <BellRing size={17} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist">Vicini · adesso</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-paper/90">
                  È stato pubblicato un manifesto per{" "}
                  <strong className="text-bronze-300">{membri[0]?.nome ?? "un tuo caro"}</strong>{" "}
                  {membri[0] ? `(Comune di ${membri[0].comune})` : ""}. Camera ardente, orario della cerimonia e QR del
                  manifesto sono già disponibili.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-mist">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-bronze-400" />
            L'elenco del Nucleo è visibile solo a te: nessuna agenzia può consultarlo. In conformità al GDPR, i dati
            servono esclusivamente al sistema di notifica automatica della piattaforma.
          </p>
        </div>
      </Reveal>

      <Reveal delay={240}>
        <p className="flex items-center gap-2.5 rounded-lg border border-line bg-card px-5 py-4 text-[12.5px] leading-relaxed text-ink-soft">
          <HeartHandshake size={16} className="shrink-0 text-bronze-600" />
          <span>
            <strong className="text-ink">Come funziona:</strong> alla pubblicazione di un manifesto che riguarda una persona
            del Nucleo, ricevi subito una notifica con luoghi, orari e contatti — prima ancora che la notizia circoli.
          </span>
        </p>
      </Reveal>
    </div>
  );
}
