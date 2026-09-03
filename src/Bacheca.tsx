import { useMemo, useState } from "react";
import {
  Flower2,
  HeartHandshake,
  Clock3,
  Church,
  MoonStar,
  Landmark,
  MapPin,
  QrCode,
  ChevronDown,
  Send,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
} from "lucide-react";
import {
  agenziaById,
  COMUNI,
  FIORI,
  URL_BASE,
  type Comune,
  type Manifesto,
  type OrdineFiori,
  type Pensiero,
} from "./data";
import { Badge, Field, inputCls, Modal, ModalHeader, Monogram, QrVisual, Reveal, SectionHeading, useToast } from "./lib";

/* ---------------- WhatsApp share ---------------- */

function waLink(m: Manifesto) {
  const text =
    `Manifesto funebre — ${m.nome} (${m.comune}).\n` +
    `Funerale: ${m.funerale.giorno}, ore ${m.funerale.ora} — ${m.funerale.luogo}.\n` +
    `Per inviare fiori o un pensiero: https://${URL_BASE}/m/${m.id}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/* ---------------- Bacheca ---------------- */

export function Bacheca({
  manifesti,
  onNuovoOrdine,
  onNuovoPensiero,
}: {
  manifesti: Manifesto[];
  onNuovoOrdine: (o: OrdineFiori) => void;
  onNuovoPensiero: (manifestoId: string, p: Pensiero) => void;
}) {
  const [filtro, setFiltro] = useState<Comune | "Tutti">("Tutti");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    manifesti.forEach((m) => map.set(m.comune, (map.get(m.comune) ?? 0) + 1));
    return map;
  }, [manifesti]);

  const visibili = filtro === "Tutti" ? manifesti : manifesti.filter((m) => m.comune === filtro);

  return (
    <section id="bacheca" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          num="01"
          kicker="Bacheca dei manifesti"
          title={
            <>
              Manifesti in <em className="italic text-bronze-600">pubblicazione</em>
            </>
          }
          sub="Ogni manifesto digitale riporta camera ardente, cerimonia e destinazione finale, con invio fiori, cordogli e QR code per la condivisione. Filtra per comune della provincia."
        />

        {/* Filtri rapidi comuni */}
        <Reveal className="mb-8 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFiltro("Tutti")}
            className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
              filtro === "Tutti"
                ? "border-night-800 bg-night-800 text-paper shadow-md"
                : "border-line bg-card text-ink-soft hover:border-bronze-500 hover:text-bronze-600"
            }`}
          >
            Tutti <span className="ml-1 opacity-70">{manifesti.length}</span>
          </button>
          {COMUNI.map((c) => {
            const n = counts.get(c) ?? 0;
            const attivo = filtro === c;
            return (
              <button
                key={c}
                onClick={() => setFiltro(attivo ? "Tutti" : c)}
                aria-pressed={attivo}
                className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                  attivo
                    ? "border-night-800 bg-night-800 text-paper shadow-md"
                    : "border-line bg-card text-ink-soft hover:border-bronze-500 hover:text-bronze-600"
                } ${n === 0 ? "opacity-50" : ""}`}
              >
                {c} <span className="ml-1 opacity-70">{n}</span>
              </button>
            );
          })}
          <span className="ml-auto hidden text-[12px] italic text-ink-faint md:block">
            Aggiornato oggi alle 08:42 dalle agenzie partner
          </span>
        </Reveal>

        {/* Griglia manifesti */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibili.map((m, i) => (
            <ManifestoCard
              key={m.id}
              m={m}
              delay={(i % 3) * 90}
              onOrdine={onNuovoOrdine}
              onPensiero={onNuovoPensiero}
            />
          ))}
        </div>

        {visibili.length === 0 && (
          <p className="rounded-lg border border-dashed border-line bg-card p-10 text-center text-sm text-ink-faint">
            Nessun manifesto in pubblicazione in questo comune al momento.
          </p>
        )}
      </div>
    </section>
  );
}

/* ---------------- Card manifesto ---------------- */

function ManifestoCard({
  m,
  delay,
  onPensiero,
  onOrdine,
}: {
  m: Manifesto;
  delay: number;
  onPensiero: (id: string, p: Pensiero) => void;
  onOrdine: (o: OrdineFiori) => void;
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const [fioriOpen, setFioriOpen] = useState(false);
  const [cordoglioOpen, setCordoglioOpen] = useState(false);
  const agenzia = agenziaById(m.agenzia);
  const IconRito = m.rito === "Musulmano" ? MoonStar : Church;

  return (
    <Reveal as="article" delay={delay} className="flex">
      <div className="card-lift group flex w-full flex-col overflow-hidden rounded-xl border border-line bg-card">
        {/* bordo superiore bronzo */}
        <div className="h-[3px] w-full bg-gradient-to-r from-bronze-600 via-bronze-400 to-bronze-600" />

        <div className="flex-1 px-5 pb-4 pt-5 sm:px-6">
          {/* intestazione */}
          <div className="flex items-start gap-4">
            <Monogram initials={initialsOf(m.nome)} />
            <div className="min-w-0">
              <h3 className="font-display text-[24px] font-semibold leading-tight text-ink">
                {m.nome}
              </h3>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                di anni {m.anni} · {m.nascita} — {m.morte}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="night">
                  <MapPin size={11} /> {m.comune}
                </Badge>
                <Badge tone={m.rito === "Musulmano" ? "bronze" : "neutral"}>
                  <IconRito size={11} /> Rito {m.rito.toLowerCase()}
                </Badge>
                <Badge tone="neutral">{m.pubblicato}</Badge>
              </div>
            </div>
          </div>

          {/* separatore */}
          <div className="my-4 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="h-1.5 w-1.5 rotate-45 border border-bronze-500 bg-bronze-300/40" />
            <span className="h-px flex-1 bg-line" />
          </div>

          {/* blocchi orari e luoghi */}
          <div className="space-y-3.5">
            <InfoBlock
              icon={<Clock3 size={14} />}
              label="Camera Ardente"
              rows={[
                m.cameraArdente.luogo,
                m.cameraArdente.indirizzo,
              ]}
              orari={m.cameraArdente.orari}
              nota={m.cameraArdente.indicazioni}
            />
            <InfoBlock
              icon={<IconRito size={14} />}
              label={m.rito === "Musulmano" ? "Preghiera / Cerimonia" : "Funerale / Cerimonia"}
              rows={[`${m.funerale.giorno} — ore ${m.funerale.ora}`, m.funerale.luogo, m.funerale.indirizzo]}
              nota={m.funerale.dettagli}
            />
            <InfoBlock
              icon={<Landmark size={14} />}
              label={m.commiato.tipo === "Cremazione" ? "Cinerario / Cremazione" : m.commiato.tipo}
              rows={[m.commiato.luogo, m.commiato.cimitero]}
            />
          </div>

          {/* ultimo pensiero */}
          {m.pensieri.length > 0 && (
            <blockquote className="mt-4 border-l-2 border-bronze-500 bg-paper px-3.5 py-2.5 text-[12.5px] italic leading-relaxed text-ink-soft">
              «{m.pensieri[0].testo}»
              <footer className="mt-1 text-[11px] not-italic text-ink-faint">
                — {m.pensieri[0].nome}, {m.pensieri[0].quando} · {m.pensieri.length}{" "}
                {m.pensieri.length === 1 ? "pensiero" : "pensieri"}
              </footer>
            </blockquote>
          )}
        </div>

        {/* azioni */}
        <div className="border-t border-line-soft bg-paper px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFioriOpen(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-bronze-500 px-3 py-2 text-[12.5px] font-bold text-night-950 transition hover:bg-bronze-400 active:scale-[0.98]"
            >
              <Flower2 size={14} /> Invia Fiori
            </button>
            <button
              onClick={() => setCordoglioOpen(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-night-700 bg-night-800 px-3 py-2 text-[12.5px] font-semibold text-paper transition hover:border-bronze-500 hover:text-bronze-300 active:scale-[0.98]"
            >
              <HeartHandshake size={14} /> Lascia un Pensiero
            </button>
            <a
              href={waLink(m)}
              target="_blank"
              rel="noreferrer"
              aria-label="Condividi su WhatsApp"
              title="Condividi su WhatsApp"
              className="rounded-md border border-line bg-card p-2 text-[#3d6b4f] transition hover:border-[#3d6b4f] hover:bg-[#3d6b4f]/10 active:scale-95"
            >
              <WhatsAppIcon />
            </a>
            <button
              onClick={() => setQrOpen((v) => !v)}
              aria-expanded={qrOpen}
              aria-label="Mostra QR code del manifesto"
              title="QR Code Manifesto"
              className={`rounded-md border p-2 transition active:scale-95 ${
                qrOpen
                  ? "border-bronze-500 bg-bronze-300/25 text-bronze-700"
                  : "border-line bg-card text-ink-soft hover:border-bronze-500 hover:text-bronze-600"
              }`}
            >
              <QrCode size={16} />
            </button>
          </div>

          {/* box QR code */}
          <div
            className={`grid transition-all duration-500 ease-out ${
              qrOpen ? "mt-3.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex items-center gap-4 rounded-lg border border-dashed border-bronze-500/60 bg-card p-3.5">
                <QrVisual seed={m.id + m.nome} />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-bronze-700">
                    QR Code Manifesto
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                    Inquadra per inviare fiori o cordogli dal cellulare.
                  </p>
                  <p className="mt-1.5 font-mono text-[10.5px] text-ink-faint">
                    {URL_BASE}/m/{m.id}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`ml-auto shrink-0 text-ink-faint transition-transform duration-300 ${qrOpen ? "rotate-180" : ""}`}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="border-t border-line-soft bg-card px-5 py-2 text-[11px] text-ink-faint sm:px-6">
          Pratica curata da <strong className="font-semibold text-ink-soft">{agenzia.nome}</strong> ·{" "}
          <a href={`tel:${agenzia.telefono.replace(/\s/g, "")}`} className="text-bronze-600 hover:underline">
            {agenzia.telefono}
          </a>
        </p>
      </div>

      {/* modali */}
      <FioriModal manifesto={m} open={fioriOpen} onClose={() => setFioriOpen(false)} onSubmitOrder={onOrdine} />
      <CordoglioModal manifesto={m} open={cordoglioOpen} onClose={() => setCordoglioOpen(false)} onInvia={onPensiero} />
    </Reveal>
  );
}

function initialsOf(nome: string) {
  return nome
    .replace(/ved\.|in |don |dott\.|sig\./gi, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && /^[A-ZÀ-Ú]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function InfoBlock({
  icon,
  label,
  rows,
  orari,
  nota,
}: {
  icon: React.ReactNode;
  label: string;
  rows: (string | undefined)[];
  orari?: string;
  nota?: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-bronze-500/50 bg-bronze-300/15 text-bronze-600">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-bronze-700">{label}</p>
        {rows.filter(Boolean).map((r, i) => (
          <p key={i} className={`mt-0.5 text-[13px] leading-snug ${i === 0 ? "font-semibold text-ink" : "text-ink-soft"}`}>
            {r}
          </p>
        ))}
        {orari && (
          <p className="mt-1 inline-flex items-center gap-1.5 rounded bg-night-800 px-2 py-0.5 text-[11.5px] font-semibold text-bronze-300">
            <Clock3 size={11} /> {orari}
          </p>
        )}
        {nota && <p className="mt-1 text-[11.5px] italic leading-snug text-ink-faint">{nota}</p>}
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" />
      <path d="M8.5 9.5c.5 2.5 3.5 5.5 6 6l1.5-1.5-2-1.2-1 .6c-1-.5-2-1.5-2.5-2.5l.6-1-1.2-2Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------------- Modale Invia Fiori ---------------- */

export function FioriModal({
  manifesto,
  open,
  onClose,
  onSubmitOrder,
}: {
  manifesto: Manifesto;
  open: boolean;
  onClose: () => void;
  onSubmitOrder?: (o: OrdineFiori) => void;
}) {
  const toast = useToast();
  const [composizione, setComposizione] = useState(FIORI[0].nome);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nastro, setNastro] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const agenzia = agenziaById(manifesto.agenzia);
  const prezzo = FIORI.find((f) => f.nome === composizione)?.prezzo ?? 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (nome.trim().length < 2) errs.nome = "Inserisci il nome del mittente.";
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Inserisci un indirizzo email valido (obbligatorio per la fatturazione).";
    if (telefono.replace(/\D/g, "").length < 8) errs.telefono = "Inserisci un numero di telefono valido (obbligatorio per la fatturazione).";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSubmitOrder?.({
      id: `ord-${Date.now()}`,
      defunto: manifesto.nome,
      comune: manifesto.comune,
      dataFunerale: `${manifesto.funerale.giorno.split(",")[0]} · ${manifesto.funerale.ora}`,
      composizione,
      importo: prezzo,
      nastro: nastro.trim() || undefined,
      cliente: { nome: nome.trim(), email: email.trim(), telefono: telefono.trim() },
      stato: "Da evadere",
      fatturaInviata: false,
      agenzia: manifesto.agenzia,
      canale: "Sito Vicini",
    });
    setDone(true);
    toast(`Richiesta fiori inviata a ${agenzia.nome}. Riceverai la fattura via email.`);
  };

  const reset = () => {
    setDone(false);
    setNome(""); setEmail(""); setTelefono(""); setNastro(""); setErrors({});
  };

  return (
    <Modal open={open} onClose={() => { onClose(); setTimeout(reset, 300); }} labelledBy="fiori-title">
      <ModalHeader
        id="fiori-title"
        onClose={() => { onClose(); setTimeout(reset, 300); }}
        title={<span className="flex items-center gap-2"><Flower2 size={20} className="text-bronze-600" /> Invia fiori</span>}
        sub={`In memoria di ${manifesto.nome} — ${manifesto.comune} · a cura di ${agenzia.nome}`}
      />

      {done ? (
        <div className="px-6 py-10 text-center">
          <CheckCircle2 size={44} className="mx-auto text-bronze-500" />
          <h4 className="mt-4 font-display text-2xl font-semibold text-ink">Richiesta inviata</h4>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
            <strong>{agenzia.nome}</strong> preparerà «{composizione}» e ti contatterà per la
            fatturazione all'indirizzo <strong>{email}</strong>.
          </p>
          <div className="mx-auto mt-5 flex max-w-sm items-start gap-2.5 rounded-lg border border-bronze-600/40 bg-bronze-300/15 px-4 py-3 text-left text-[12.5px] text-bronze-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>
              I fiori devono essere ordinati almeno <strong>24 ore prima del funerale</strong>{" "}
              (ore {manifesto.funerale.ora} del {manifesto.funerale.giorno}).
            </span>
          </div>
          <button
            onClick={() => { onClose(); setTimeout(reset, 300); }}
            className="mt-6 rounded-md bg-night-800 px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-night-700"
          >
            Chiudi
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 px-6 py-5" noValidate>
          <div className="flex items-start gap-2.5 rounded-lg border border-bronze-600/40 bg-bronze-300/15 px-4 py-3 text-[12.5px] leading-snug text-bronze-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <p>
              <strong>Avviso:</strong> i fiori devono essere ordinati almeno{" "}
              <strong>24 ore prima del funerale</strong>. Funerale: {manifesto.funerale.giorno}, ore{" "}
              {manifesto.funerale.ora}.
            </p>
          </div>

          <Field label="Composizione floreale" required>
            <select value={composizione} onChange={(e) => setComposizione(e.target.value)} className={inputCls()}>
              {FIORI.map((f) => (
                <option key={f.nome} value={f.nome}>
                  {f.nome} — {f.prezzo} €
                </option>
              ))}
            </select>
          </Field>

          <Field label="Nome del mittente" required error={errors.nome}>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls(!!errors.nome)} placeholder="Es. Famiglia Barbieri" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" required error={errors.email} hint="per la fatturazione">
              <div className="relative">
                <Mail size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls(!!errors.email)} pl-9`} placeholder="nome@esempio.it" />
              </div>
            </Field>
            <Field label="Telefono" required error={errors.telefono} hint="per la fatturazione">
              <div className="relative">
                <Phone size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={`${inputCls(!!errors.telefono)} pl-9`} placeholder="3xx xxx xxxx" />
              </div>
            </Field>
          </div>

          <Field label="Dedica per il nastro" hint="facoltativa">
            <input value={nastro} onChange={(e) => setNastro(e.target.value)} className={inputCls()} placeholder="«Con affetto — …»" maxLength={80} />
          </Field>

          <p className="text-[11.5px] leading-relaxed text-ink-faint">
            I dati di fatturazione (email e telefono) saranno trasmessi esclusivamente a{" "}
            {agenzia.nome} per l'emissione del documento fiscale. Importo indicativo:{" "}
            <strong className="text-ink-soft">{prezzo} €</strong> IVA inclusa, consegna al luogo
            della cerimonia compresa.
          </p>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-bronze-500 px-4 py-3 text-sm font-bold text-night-950 transition hover:bg-bronze-400 active:scale-[0.99]"
          >
            <Send size={15} /> Invia richiesta all'agenzia
          </button>
        </form>
      )}
    </Modal>
  );
}

/* ---------------- Modale Cordoglio ---------------- */

function CordoglioModal({
  manifesto,
  open,
  onClose,
  onInvia,
}: {
  manifesto: Manifesto;
  open: boolean;
  onClose: () => void;
  onInvia: (id: string, p: Pensiero) => void;
}) {
  const toast = useToast();
  const [nome, setNome] = useState("");
  const [relazione, setRelazione] = useState("");
  const [testo, setTesto] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (nome.trim().length < 2) errs.nome = "Indica il tuo nome o quello della famiglia.";
    if (testo.trim().length < 5) errs.testo = "Scrivi qualche parola di cordoglio.";
    setErr(errs);
    if (Object.keys(errs).length > 0) return;
    onInvia(manifesto.id, { nome: nome.trim(), relazione: relazione.trim() || undefined, testo: testo.trim(), quando: "Adesso" });
    setNome(""); setRelazione(""); setTesto("");
    toast("Il tuo pensiero è stato pubblicato sul manifesto.");
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="cordoglio-title">
      <ModalHeader
        id="cordoglio-title"
        onClose={onClose}
        title={<span className="flex items-center gap-2"><HeartHandshake size={20} className="text-bronze-600" /> Lascia un pensiero</span>}
        sub={`In memoria di ${manifesto.nome} — visibile sul manifesto digitale`}
      />
      <form onSubmit={submit} className="space-y-4 px-6 py-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" required error={err.nome}>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls(!!err.nome)} placeholder="Nome e cognome o famiglia" />
          </Field>
          <Field label="Legame" hint="facoltativo">
            <input value={relazione} onChange={(e) => setRelazione(e.target.value)} className={inputCls()} placeholder="Es. amici, colleghi, vicini…" />
          </Field>
        </div>
        <Field label="Il tuo pensiero" required error={err.testo}>
          <textarea
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            rows={4}
            maxLength={400}
            className={`${inputCls(!!err.testo)} resize-none`}
            placeholder="Poche parole sincere sono sufficienti…"
          />
        </Field>

        {manifesto.pensieri.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">
              Pensieri già lasciati ({manifesto.pensieri.length})
            </p>
            <ul className="max-h-44 space-y-2 overflow-y-auto nice-scroll pr-1">
              {manifesto.pensieri.map((p, i) => (
                <li key={i} className="rounded-md border border-line-soft bg-paper px-3.5 py-2.5 text-[12.5px] italic leading-relaxed text-ink-soft">
                  «{p.testo}»
                  <span className="mt-1 block text-[11px] not-italic text-ink-faint">
                    — {p.nome}{p.relazione ? `, ${p.relazione}` : ""} · {p.quando}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-md bg-night-800 px-4 py-3 text-sm font-semibold text-paper transition hover:bg-night-700 active:scale-[0.99]">
          <Send size={15} /> Pubblica il pensiero
        </button>
      </form>
    </Modal>
  );
}


