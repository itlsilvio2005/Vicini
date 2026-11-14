import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  KeyRound,
  Copy,
  Check,
  Share2,
  UserCheck,
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
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { useAuth } from "./lib/auth";

/* ================= TIPI ================= */

interface Membro {
  id: string;
  nome: string;
  relazione: string;
  comune: Comune;
  contatto: string;
  annoNascita?: number | null;
  codiceCollegato?: string | null;
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
// Il familiare di esempio esiste solo in sviluppo: in produzione l'elenco parte vuoto.
const MEMBRI_INIZIALI: Membro[] = import.meta.env.DEV
  ? [{ id: "n1", nome: "Lina Bonetti ved. Malagoli", relazione: "Genitore", comune: "Nonantola", contatto: "marco.malagoli@gmail.com", annoNascita: 1942 }]
  : [];

function saveLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignora */
  }
}

function generaCodiceLocale(): string {
  try {
    const esistente = localStorage.getItem("vicini_mio_codice_nucleo");
    if (esistente) return esistente;
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const pick = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const nuovo = `VCN-${pick(4)}-${pick(2)}`;
    localStorage.setItem("vicini_mio_codice_nucleo", nuovo);
    return nuovo;
  } catch {
    return "VCN-8492-MO";
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
        sub="Due strumenti riservati: registra come desideri sia organizzato il tuo funerale e gestisci il tuo Elenco Nucleo tramite Codice Personale o inserimento diretto per ricevere avvisi tempestivi sui nuovi manifesti."
        bgImage="/images/nucleo.jpg"
        meta={
          <>
            <span>Codice ID personale univoco</span>
            <span className="hidden h-1 w-1 rounded-full bg-bronze-500 sm:inline-block" />
            <span>Notifiche automatiche H24 GDPR-compliant</span>
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
  const { utente } = useAuth();
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
  const [consenso, setConsenso] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [riepilogo, setRiepilogo] = useState<VolontaSalvata | null>(null);
  const [salvata, setSalvata] = useState<VolontaSalvata | null>(null);

  useEffect(() => {
    const caricaVolonta = async () => {
      if (isSupabaseConfigured() && utente) {
        const { data, error } = await supabase
          .from("volonta")
          .select("*")
          .eq("user_id", utente.id)
          .single();

        if (data && !error) {
          const v: VolontaSalvata = {
            nome: utente.nome_completo || utente.email,
            email: utente.email,
            agenzia: data.agenzia_id || "",
            rito: data.rito as Rito,
            destinazione: data.destinazione || "",
            trasporto: data.trasporto_fuori_comune
              ? { comune: data.trasporto_comune || "", citta: data.trasporto_citta || "" }
              : undefined,
            rimpatrio: data.rimpatrio_estero ? { paese: data.rimpatrio_paese || "" } : undefined,
            ritoDettagli: data.dettagli_rito ? Object.values(data.dettagli_rito) : undefined,
            note: data.note || undefined,
            salvataIl: new Date(data.updated_at).toLocaleDateString("it-IT"),
          };
          setSalvata(v);
          setNome(v.nome);
          setEmail(v.email);
          setAgenzia(v.agenzia);
          setRito(v.rito);
          setDestinazione(v.destinazione);
          if (v.trasporto) {
            setTrasportoOn(true);
            setTComune(v.trasporto.comune);
            setTCitta(v.trasporto.citta);
          }
          if (v.rimpatrio) {
            setRimpatrioOn(true);
            setPaese(v.rimpatrio.paese);
          }
          if (v.note) setNote(v.note);
        }
      } else {
        try {
          const raw = localStorage.getItem("vicini_volonta_v2");
          if (raw) {
            const v = JSON.parse(raw) as VolontaSalvata;
            setSalvata(v);
            setNome(v.nome);
            setEmail(v.email);
            setAgenzia(v.agenzia);
            setRito(v.rito);
            setDestinazione(v.destinazione);
            if (v.trasporto) {
              setTrasportoOn(true);
              setTComune(v.trasporto.comune);
              setTCitta(v.trasporto.citta);
            }
            if (v.rimpatrio) {
              setRimpatrioOn(true);
              setPaese(v.rimpatrio.paese);
            }
            if (v.note) setNote(v.note);
          }
        } catch {
          // ignora
        }
      }
    };

    caricaVolonta();
  }, [utente]);

  useEffect(() => {
    if (prefill) {
      setAgenzia(prefill.id);
      toast(`Agenzia di fiducia impostata: ${agenziaById(prefill.id).nome}`, "info");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill?.ts]);

  const ortodosso = rito === "Ortodosso";
  const musulmano = rito === "Musulmano";

  const submit = async (e: React.FormEvent) => {
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
    if (!consenso) errs.consenso = "Per salvare le tue volontà serve il consenso al trattamento dei dati.";
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

    if (isSupabaseConfigured() && utente) {
      const { error } = await supabase.from("volonta").upsert([
        {
          user_id: utente.id,
          agenzia_id: agenzia,
          rito: rito as string,
          destinazione,
          trasporto_fuori_comune: trasportoOn,
          trasporto_comune: trasportoOn ? tComune.trim() : null,
          trasporto_citta: trasportoOn ? tCitta.trim() : null,
          rimpatrio_estero: rimpatrioOn,
          rimpatrio_paese: rimpatrioOn ? paese : null,
          dettagli_rito: dettagli.length ? dettagli : null,
          note: note.trim() || null,
        },
      ]);

      if (error) {
        console.error("Errore salvataggio volontà:", error);
        toast("Errore nel salvataggio. Riprova.", "info");
        return;
      }
    } else {
      saveLS("vicini_volonta_v2", v);
    }

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

        {rito && (
          <div className="anim-fade mt-5">
            <Field label="Destinazione finale" required error={errors.destinazione}>
              <select value={destinazione} onChange={(e) => setDestinazione(e.target.value)} className={inputCls(!!errors.destinazione)}>
                <option value="">— Seleziona —</option>
                {DESTINAZIONI.filter((d) => !(ortodosso && d === "Cremazione")).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

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


        <label className="mt-6 flex items-start gap-3 text-[13px] leading-relaxed text-ink-soft">
          <input
            type="checkbox"
            checked={consenso}
            onChange={(e) => setConsenso(e.target.checked)}
            aria-invalid={!!errors.consenso}
            className="mt-1 h-4 w-4 shrink-0 accent-bronze-600"
          />
          <span>
            Acconsento al trattamento dei dati che inserisco, comprese le informazioni sul rito religioso, come descritto
            nell'<Link to="/privacy" className="font-semibold text-bronze-700 underline">informativa privacy</Link>. Posso ritirare
            il consenso in qualsiasi momento.
            {errors.consenso && <span role="alert" className="mt-1 block font-semibold text-red-700">{errors.consenso}</span>}
          </span>
        </label>

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

/* ================= IL NUCLEO (CON CODICE PERSONALE + ELENCO IBRIDO) ================= */

function Nucleo() {
  const toast = useToast();
  const { utente } = useAuth();
  const [mioCodice, setMioCodice] = useState<string>("");
  const [copiato, setCopiato] = useState(false);

  const [membri, setMembri] = useState<Membro[]>([]);
  const [modalita, setModalita] = useState<"codice" | "manuale">("codice");

  // Campi form
  const [codiceInput, setCodiceInput] = useState("");
  const [nome, setNome] = useState("");
  const [annoNascita, setAnnoNascita] = useState("");
  const [relazione, setRelazione] = useState("");
  const [comune, setComune] = useState<Comune | "">("");
  const [contatto, setContatto] = useState("");
  const [consensoNucleo, setConsensoNucleo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carica il Codice ID personale e l'Elenco Nucleo
  useEffect(() => {
    const inizializzaNucleo = async () => {
      if (isSupabaseConfigured() && utente) {
        // 1. Ottiene o genera il Codice ID univoco su Supabase
        const { data: cod } = await supabase.rpc("ottieni_mio_codice_nucleo", {
          p_nome: utente.nome_completo || utente.email,
        });
        setMioCodice(cod || generaCodiceLocale());

        // 2. Carica l'Elenco Nucleo dell'utente
        const { data, error } = await supabase
          .from("nucleo")
          .select("*")
          .eq("user_id", utente.id)
          .order("created_at", { ascending: false });

        if (data && !error) {
          setMembri(
            data.map((m) => ({
              id: m.id,
              nome: m.nome,
              relazione: m.relazione,
              comune: m.comune as Comune,
              contatto: m.contatto,
              annoNascita: m.anno_nascita ?? null,
              codiceCollegato: m.codice_collegato ?? null,
            }))
          );
        }
      } else {
        setMioCodice(generaCodiceLocale());
        try {
          const raw = localStorage.getItem("vicini_nucleo_v2");
          setMembri(raw ? (JSON.parse(raw) as Membro[]) : MEMBRI_INIZIALI);
        } catch {
          setMembri(MEMBRI_INIZIALI);
        }
      }
    };

    inizializzaNucleo();
  }, [utente]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !utente) {
      saveLS("vicini_nucleo_v2", membri);
    }
  }, [membri, utente]);

  const copiaCodice = async () => {
    if (!mioCodice) return;
    try {
      await navigator.clipboard.writeText(mioCodice);
      setCopiato(true);
      toast("Codice Personale copiato negli appunti.");
      setTimeout(() => setCopiato(false), 2500);
    } catch {
      toast(`Il tuo codice è ${mioCodice}`, "info");
    }
  };

  const condividiWhatsApp = () => {
    const testo = `Ciao, questo è il mio Codice Personale su Vicini: *${mioCodice}*. Puoi inserirlo nella tua sezione "Il Nucleo" per collegarci.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(testo)}`, "_blank", "noopener,noreferrer");
  };

  const aggiungi = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!consensoNucleo) {
      setErrors({ consenso: "Per aggiungere una persona serve il consenso al trattamento dei dati." });
      return;
    }

    let nomeFinale = nome.trim();
    let comuneFinale = comune as Comune;
    let annoFinale = annoNascita ? Number(annoNascita) : null;
    let codiceFinale: string | null = null;
    let collegatoUserId: string | null = null;

    if (modalita === "codice") {
      const cPulito = codiceInput.trim().toUpperCase();
      if (!/^VCN-[A-Z0-9]{4}-[A-Z0-9]{2}$/.test(cPulito)) {
        errs.codiceInput = "Inserisci un codice valido nel formato VCN-XXXX-XX.";
      } else if (cPulito === mioCodice) {
        errs.codiceInput = "Non puoi inserire il tuo stesso codice personale.";
      } else if (membri.some((m) => m.codiceCollegato === cPulito)) {
        errs.codiceInput = "Questa persona è già presente nel tuo Elenco Nucleo.";
      }

      if (!relazione) errs.relazione = "Seleziona il grado di parentela o legame.";
      if (contatto.trim().length < 5) errs.contatto = "Indica la tua email o telefono per ricevere gli avvisi.";

      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }

      codiceFinale = cPulito;

      // Cerca il codice su Supabase se attivo
      if (isSupabaseConfigured() && utente) {
        const { data: trovato } = await supabase.rpc("cerca_codice_nucleo", { p_codice: cPulito });
        const profilo = Array.isArray(trovato) ? trovato[0] : null;
        if (!profilo && !nomeFinale) {
          setErrors({
            codiceInput: "Codice non trovato o non ancora attivato. Verifica il codice o inserisci anche il nome qui sotto.",
          });
          return;
        }
        if (profilo) {
          nomeFinale = profilo.nome_completo || nomeFinale || `Utente ${cPulito}`;
          comuneFinale = (profilo.comune as Comune) || (comune as Comune) || "Modena";
          annoFinale = profilo.anno_nascita || annoFinale;
          collegatoUserId = profilo.user_id;
        }
      } else if (!nomeFinale) {
        setErrors({ nome: "In modalità demo indica anche il nome e cognome del caro." });
        return;
      }
    } else {
      if (nomeFinale.length < 3) errs.nome = "Inserisci nome e cognome del tuo caro.";
      if (!relazione) errs.relazione = "Seleziona il grado di parentela.";
      if (!comune) errs.comune = "Seleziona il comune di residenza.";
      if (annoFinale && (annoFinale < 1900 || annoFinale > new Date().getFullYear())) {
        errs.annoNascita = "Inserisci un anno di nascita valido (es. 1945).";
      }
      if (contatto.trim().length < 5) errs.contatto = "Indica un'email o un numero di telefono.";
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }

    setErrors({});

    const nuovoMembro: Membro = {
      id: `n-${Date.now()}`,
      nome: nomeFinale,
      relazione,
      comune: (comuneFinale || "Modena") as Comune,
      contatto: contatto.trim(),
      annoNascita: annoFinale,
      codiceCollegato: codiceFinale,
    };

    if (isSupabaseConfigured() && utente) {
      const { data, error } = await supabase
        .from("nucleo")
        .insert([
          {
            user_id: utente.id,
            nome: nuovoMembro.nome,
            relazione: nuovoMembro.relazione,
            comune: nuovoMembro.comune,
            contatto: nuovoMembro.contatto,
            anno_nascita: nuovoMembro.annoNascita,
            codice_collegato: nuovoMembro.codiceCollegato,
            collegato_user_id: collegatoUserId,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Errore salvataggio membro:", error);
        toast("Errore nel salvataggio. Riprova.", "info");
        return;
      }

      if (data) {
        setMembri((m) => [
          {
            id: data.id,
            nome: data.nome,
            relazione: data.relazione,
            comune: data.comune as Comune,
            contatto: data.contatto,
            annoNascita: data.anno_nascita,
            codiceCollegato: data.codice_collegato,
          },
          ...m,
        ]);
      }
    } else {
      setMembri((m) => [nuovoMembro, ...m]);
    }

    toast(`${nuovoMembro.nome} aggiunto al tuo Elenco Nucleo.`);
    setCodiceInput("");
    setNome("");
    setAnnoNascita("");
    setRelazione("");
    setComune("");
  };

  const rimuovi = async (id: string) => {
    const m = membri.find((x) => x.id === id);

    if (isSupabaseConfigured() && utente) {
      const { error } = await supabase.from("nucleo").delete().eq("id", id);
      if (error) {
        toast("Errore nell'eliminazione. Riprova.", "info");
        return;
      }
    }

    setMembri((list) => list.filter((x) => x.id !== id));
    if (m) toast(`${m.nome} rimosso dall'Elenco Nucleo.`, "info");
  };

  return (
    <div className="space-y-6">
      {/* CARD 1: CODICE ID PERSONALE DA CONDIVIDERE */}
      <Reveal delay={60}>
        <div className="rounded-xl border border-bronze-500/50 bg-night-900 p-6 text-paper shadow-md sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-bronze-500/60 bg-night-800 text-bronze-300">
                <KeyRound size={18} />
              </span>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-bronze-300">
                  Il tuo Codice ID Personale
                </p>
                <h4 className="font-display text-xl font-semibold text-paper">Fatti aggiungere al Nucleo</h4>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[12.5px] leading-relaxed text-mist">
            Invia questo codice alle persone a te più care: inserendolo nel loro Nucleo, sarete collegati in modo
            diretto e sicuro senza errori di omonimia.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-night-600 bg-night-800 px-4 py-3">
            <span className="font-mono text-lg font-bold tracking-widest text-bronze-300">
              {mioCodice || "VCN-••••-••"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copiaCodice}
                className="flex items-center gap-1.5 rounded-md border border-night-600 bg-night-900 px-3 py-1.5 text-xs font-semibold text-paper transition hover:border-bronze-400"
              >
                {copiato ? <Check size={13} className="text-green-400" /> : <Copy size={13} className="text-bronze-300" />}
                {copiato ? "Copiato" : "Copia"}
              </button>
              <button
                type="button"
                onClick={condividiWhatsApp}
                className="flex items-center gap-1.5 rounded-md bg-bronze-500 px-3 py-1.5 text-xs font-bold text-night-950 transition hover:bg-bronze-400"
              >
                <Share2 size={13} /> Invia ai tuoi cari
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* CARD 2: ELENCO NUCLEO + AGGIUNTA IBRIDA */}
      <Reveal delay={120}>
        <div className="rounded-xl border border-line bg-card p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3 border-b border-line-soft pb-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg border border-bronze-500/50 bg-night-900 text-bronze-400">
                <Users size={19} />
              </span>
              <div>
                <h3 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Elenco Nucleo</h3>
                <p className="text-[12.5px] text-ink-faint">
                  Persone care collegate e avvisi automatici sui manifesti
                </p>
              </div>
            </div>
            <Badge tone="bronze">{membri.length} {membri.length === 1 ? "caro" : "cari"}</Badge>
          </div>

          {/* Lista persone care */}
          <ul className="mt-5 space-y-3">
            {membri.length === 0 && (
              <li className="rounded-md border border-dashed border-line bg-paper p-4 text-[13px] italic text-ink-faint">
                Il tuo Elenco Nucleo è vuoto: aggiungi un familiare tramite il suo Codice ID o inseriscilo manualmente.
              </li>
            )}
            {membri.map((m) => (
              <li
                key={m.id}
                className="group flex items-center gap-3.5 rounded-lg border border-line-soft bg-paper px-4 py-3 transition hover:border-bronze-500/70"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-bronze-500/60 bg-night-900 font-display text-sm font-semibold text-bronze-300">
                  {m.nome
                    .split(/\s+/)
                    .filter((w) => w.length > 1)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[14px] font-bold text-ink">{m.nome}</p>
                    {m.codiceCollegato && (
                      <span className="inline-flex items-center gap-1 rounded bg-night-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-bronze-300">
                        <UserCheck size={10} /> {m.codiceCollegato}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-ink-faint">
                    {m.relazione}
                    {m.annoNascita ? ` · classe ${m.annoNascita}` : ""} · {m.comune} · avvisi a {m.contatto}
                  </p>
                </div>
                <span className="hidden items-center gap-1 rounded-full border border-[#4c7a5a]/40 bg-[#4c7a5a]/10 px-2 py-0.5 text-[10.5px] font-bold text-[#3c6349] sm:flex">
                  <BellRing size={10} /> Attivo
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

          {/* Selettore modalità aggiunta */}
          <div className="mt-6 border-t border-line-soft pt-5">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">
              <Plus size={13} /> Aggiungi una persona cara all'Elenco Nucleo
            </p>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg border border-line bg-paper p-1">
              <button
                type="button"
                onClick={() => {
                  setModalita("codice");
                  setErrors({});
                }}
                className={`rounded-md py-2 text-xs font-bold transition ${
                  modalita === "codice"
                    ? "bg-night-900 text-bronze-300 shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Con Codice ID (Consigliato)
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalita("manuale");
                  setErrors({});
                }}
                className={`rounded-md py-2 text-xs font-bold transition ${
                  modalita === "manuale"
                    ? "bg-night-900 text-bronze-300 shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Senza codice (Anziani / Manuale)
              </button>
            </div>

            <form onSubmit={aggiungi} noValidate className="space-y-4">
              {modalita === "codice" ? (
                <>
                  <Field
                    label="Codice ID della persona cara"
                    required
                    error={errors.codiceInput}
                    hint="formato VCN-XXXX-XX"
                  >
                    <input
                      value={codiceInput}
                      onChange={(e) => setCodiceInput(e.target.value.toUpperCase())}
                      className={`${inputCls(!!errors.codiceInput)} font-mono uppercase`}
                      placeholder="Es. VCN-4829-MX"
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nome e cognome (opzionale se già nel codice)" error={errors.nome}>
                      <input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className={inputCls(!!errors.nome)}
                        placeholder="Es. Mario Rossi"
                      />
                    </Field>
                    <Field label="Comune di riferimento" error={errors.comune}>
                      <select
                        value={comune}
                        onChange={(e) => setComune(e.target.value as Comune)}
                        className={inputCls(!!errors.comune)}
                      >
                        <option value="">— Automatico o scegli —</option>
                        {COMUNI.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
                    <Field label="Nome e cognome del caro" required error={errors.nome}>
                      <input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className={inputCls(!!errors.nome)}
                        placeholder="Es. Maria Rossi"
                      />
                    </Field>
                    <Field label="Anno nascita" error={errors.annoNascita} hint="evita omonimie">
                      <input
                        type="number"
                        min={1900}
                        max={new Date().getFullYear()}
                        value={annoNascita}
                        onChange={(e) => setAnnoNascita(e.target.value)}
                        className={inputCls(!!errors.annoNascita)}
                        placeholder="Es. 1942"
                      />
                    </Field>
                  </div>
                </>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Parentela / Legame" required error={errors.relazione}>
                  <select
                    value={relazione}
                    onChange={(e) => setRelazione(e.target.value)}
                    className={inputCls(!!errors.relazione)}
                  >
                    <option value="">— Seleziona —</option>
                    {RELAZIONI.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>

                {modalita === "manuale" ? (
                  <Field label="Comune" required error={errors.comune}>
                    <select
                      value={comune}
                      onChange={(e) => setComune(e.target.value as Comune)}
                      className={inputCls(!!errors.comune)}
                    >
                      <option value="">— Seleziona —</option>
                      {COMUNI.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                ) : (
                  <Field label="Il tuo recapito per gli avvisi" required error={errors.contatto}>
                    <input
                      value={contatto}
                      onChange={(e) => setContatto(e.target.value)}
                      className={inputCls(!!errors.contatto)}
                      placeholder="tua-email@esempio.it"
                    />
                  </Field>
                )}
              </div>

              {modalita === "manuale" && (
                <Field label="Recapito notifiche" required error={errors.contatto} hint="la tua email o telefono">
                  <input
                    value={contatto}
                    onChange={(e) => setContatto(e.target.value)}
                    className={inputCls(!!errors.contatto)}
                    placeholder="nome@esempio.it · 3xx xxx xxxx"
                  />
                </Field>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-md border border-line-soft bg-paper px-4 py-3 text-[12.5px] text-ink-soft">
                <span className="flex items-center gap-2">
                  <MailCheck size={14} className="text-bronze-600" /> Avviso automatico H24 su sito ed email
                </span>
                <span className="flex items-center gap-2">
                  <Smartphone size={14} className="text-bronze-600" /> Controllo anti-omonimia attivo
                </span>
              </div>


        <label className="mt-1 flex items-start gap-3 text-[13px] leading-relaxed text-ink-soft">
          <input
            type="checkbox"
            checked={consensoNucleo}
            onChange={(e) => setConsensoNucleo(e.target.checked)}
            aria-invalid={!!errors.consenso}
            className="mt-1 h-4 w-4 shrink-0 accent-bronze-600"
          />
          <span>
            Acconsento al trattamento dei dati che inserisco, comprese le informazioni sul rito religioso, come descritto
            nell'<Link to="/privacy" className="font-semibold text-bronze-700 underline">informativa privacy</Link>. Posso ritirare
            il consenso in qualsiasi momento.
            {errors.consenso && <span role="alert" className="mt-1 block font-semibold text-red-700">{errors.consenso}</span>}
          </span>
        </label>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-bronze-500 px-5 py-3 text-sm font-bold text-night-950 transition hover:bg-bronze-400 active:scale-[0.99]"
              >
                <Plus size={16} /> Aggiungi all'Elenco Nucleo
              </button>
            </form>
          </div>
        </div>
      </Reveal>

      <Reveal delay={180}>
        <p className="flex items-center gap-2.5 rounded-lg border border-line bg-card px-5 py-4 text-[12.5px] leading-relaxed text-ink-soft">
          <HeartHandshake size={16} className="shrink-0 text-bronze-600" />
          <span>
            <strong className="text-ink">Privacy totale:</strong> il tuo Elenco Nucleo è visibile esclusivamente a te.
            Quando un'agenzia pubblica un manifesto compatibile per nome, comune ed età, il sistema genera subito un
            avviso riservato con luoghi e orari della cerimonia.
          </span>
        </p>
      </Reveal>
    </div>
  );
}