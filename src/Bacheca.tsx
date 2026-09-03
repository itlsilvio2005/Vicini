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
  BellRing,
  Flame,
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
import { Badge, Field, inputCls, Modal, ModalHeader, Monogram, QrVisual, Reveal, useToast } from "./lib";

/* ---------------- WhatsApp share ---------------- */

function waLink(m: Manifesto) {
  const text =
    `Manifesto funebre — ${m.nome} (${m.comune}).\n` +
    `Funerale: ${m.funerale.giorno}, ore ${m.funerale.ora} — ${m.funerale.luogo}.\n` +
    `Per inviare fiori o un pensiero: https://${URL_BASE}/m/${m.id}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/* ---------------- Candela ---------------- */

function Candle({ className = "h-32 sm:h-40" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 190" className={`w-auto ${className}`} aria-hidden="true">
      <defs>
        <radialGradient id="bc-glow" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#ddc38d" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ddc38d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bc-wax" x1="0" x2="1">
          <stop offset="0%" stopColor="#2c4674" />
          <stop offset="50%" stopColor="#172a4a" />
          <stop offset="100%" stopColor="#101d33" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="62" r="52" fill="url(#bc-glow)" className="flame-glow" />
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
      <rect x="58.6" y="74" width="2.8" height="10" rx="1.4" fill="#0b1424" />
      <rect x="42" y="84" width="36" height="92" rx="4" fill="url(#bc-wax)" stroke="#2c4674" />
      <path d="M42 92c4 3 8 3 12 0 4-3 8-3 12 0 4 3 8 3 12 0v-4H42v4Z" fill="#21375f" />
      <rect x="42" y="130" width="36" height="14" fill="#b08a45" opacity="0.9" />
      <text x="60" y="140.5" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="10" fontStyle="italic" fill="#0b1424">
        Vicini
      </text>
      <ellipse cx="60" cy="178" rx="30" ry="5" fill="#101d33" />
      <rect x="34" y="172" width="52" height="7" rx="2" fill="#172a4a" stroke="#2c4674" />
    </svg>
  );
}

const MASTHEAD_IMG =
  "https://image.qwenlm.ai/generated-images/ddb71b0c-1804-4b23-a5c3-fdf4dcef67eb/_result.png";

/* ---------------- Band di apertura (bacheca come albo pubblico) ---------------- */

function BachecaBand({ manifesti }: { manifesti: Manifesto[] }) {
  const oggi = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative overflow-hidden bg-night-900 text-paper">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${MASTHEAD_IMG})` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(97deg, #0b1424 0%, rgba(11,20,36,0.9) 45%, rgba(11,20,36,0.55) 72%, rgba(16,29,51,0.75) 100%), linear-gradient(to top, #0b1424 6%, transparent 50%)",
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bronze-500/70 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-8 pt-10 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
        <div>
          <p className="flex flex-wrap items-center gap-3 text-[10.5px] font-semibold uppercase tracking-[0.26em] text-bronze-300">
            <Flame size={13} className="text-bronze-400" />
            Bacheca digitale del commiato · Provincia di Modena
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.03] sm:text-5xl lg:text-[54px]">
            Il commiato,
            <em className="italic text-bronze-300"> in pubblica evidenza.</em>
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-mist">
            Manifesti funebri aggiornati dalle imprese del luogo per i comuni di{" "}
            <strong className="font-semibold text-paper/90">Modena, Nonantola, Vignola, Carpi, Formigine e Sassuolo</strong>:
            camera ardente, cerimonia e destinazione finale, con invio fiori, cordogli e QR code.
          </p>
          <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] capitalize text-mist/90">
            <span className="flex items-center gap-2">
              <span className="blink-dot h-1.5 w-1.5 rounded-full bg-bronze-400" /> Modena, {oggi}
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-bronze-500 sm:inline-block" />
            <span>{manifesti.length} manifesti in pubblicazione</span>
            <span className="hidden h-1 w-1 rounded-full bg-bronze-500 sm:inline-block" />
            <span>14 imprese accreditate</span>
          </p>
        </div>
        <div className="hidden items-end justify-end gap-6 lg:flex">
          <Candle />
          <div className="max-w-[230px] pb-2">
            <p className="font-display text-lg italic leading-snug text-bronze-300">«La luce resta accesa per chi resta.»</p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-mist">
              Ogni manifesto è raggiungibile anche da cellulare tramite il QR code affisso nei luoghi del commiato.
            </p>
          </div>
        </div>
      </div>

      {/* ticker ultime pubblicazioni */}
      <div className="relative border-t border-night-700 bg-night-950/85">
        <div className="mx-auto flex max-w-7xl items-stretch px-4 sm:px-6">
          <p className="flex shrink-0 items-center gap-2 border-r border-night-700 py-2.5 pr-4 text-[10px] font-bold uppercase tracking-[0.2em] text-bronze-400">
            <BellRing size={13} /> Ultime pubblicazioni
          </p>
          <div className="relative flex-1 overflow-hidden" aria-hidden="true">
            <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap py-2.5 pl-8">
              {[...manifesti, ...manifesti].map((m, i) => (
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
    </div>
  );
}

/* ---------------- Bacheca (tab 1) ---------------- */

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
    <div>
      <BachecaBand manifesti={manifesti} />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Filtri rapidi comuni */}
        <div className="mb-8 flex items-center gap-3">
          <h2 className="font-display text-2xl font-semibold text-ink">Filtra per comune</h2>
          <span className="h-px flex-1 bg-line" />
        </div>
        <Reveal className="mb-9 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFiltro("Tutti")}
            aria-pressed={filtro === "Tutti"}
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
          <span className="ml-auto hidden text-[12px] italic text-ink-faint xl:block">
            Aggiornato oggi alle 08:42 dalle imprese del luogo
          </span>
        </Reveal>

        {/* Griglia manifesti */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibili.map((m, i) => (
            <ManifestoCard key={m.id} m={m} delay={(i % 3) * 90} onOrdine={onNuovoOrdine} onPensiero={onNuovoPensiero} />
          ))}
        </div>

        {visibili.length === 0 && (
          <p className="rounded-lg border border-dashed border-line bg-card p-10 text-center text-sm text-ink-faint">
            Nessun manifesto in pubblicazione in questo comune al momento.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Card manifesto ---------------- */

function initialsOf(nome: string) {
  return nome
    .replace(/ved\.|in |don |dott\.|sig\./gi, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && /^[A-ZÀ-Ú]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

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
        <div className="h-[3px] w-full bg-gradient-to-r from-bronze-600 via-bronze-400 to-bronze-600" />

        <div className="flex-1 px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start gap-4">
            <Monogram initials={initialsOf(m.nome)} />
            <div className="min-w-0">
              <h3 className="font-display text-[24px] font-semibold leading-tight text-ink">{m.nome}</h3>
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

          <div className="my-4 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="h-1.5 w-1.5 rotate-45 border border-bronze-500 bg-bronze-300/40" />
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="space-y-3.5">
            <InfoBlock
              icon={<Clock3 size={14} />}
              label="Camera Ardente"
              rows={[m.cameraArdente.luogo, m.cameraArdente.indirizzo]}
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

          <div
            className={`grid transition-all duration-500 ease-out ${
              qrOpen ? "mt-3.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex items-center gap-4 rounded-lg border border-dashed border-bronze-500/60 bg-card p-3.5">
                <QrVisual seed={m.id + m.nome} />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-bronze-700">QR Code Manifesto</p>
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

      <FioriModal manifesto={m} open={fioriOpen} onClose={() => setFioriOpen(false)} onSubmitOrder={onOrdine} />
      <CordoglioModal manifesto={m} open={cordoglioOpen} onClose={() => setCordoglioOpen(false)} onInvia={onPensiero} />
    </Reveal>
  );
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

function FioriModal({
  manifesto,
  open,
  onClose,
  onSubmitOrder,
}: {
  manifesto: Manifesto;
  open: boolean;
  onClose: () => void;
  onSubmitOrder: (o: OrdineFiori) => void;
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

  const chiudi = () => {
    onClose();
    setTimeout(() => {
      setDone(false);
      setNome(""); setEmail(""); setTelefono(""); setNastro(""); setErrors({});
    }, 300);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (nome.trim().length < 2) errs.nome = "Inserisci il nome del mittente.";
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Inserisci un'email valida: è obbligatoria per la fatturazione.";
    if (telefono.replace(/\D/g, "").length < 8) errs.telefono = "Inserisci un telefono valido: è obbligatorio per la fatturazione.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSubmitOrder({
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

  return (
    <Modal open={open} onClose={chiudi} labelledBy="fiori-title">
      <ModalHeader
        id="fiori-title"
        onClose={chiudi}
        title={<span className="flex items-center gap-2"><Flower2 size={20} className="text-bronze-600" /> Invia fiori</span>}
        sub={`In memoria di ${manifesto.nome} — ${manifesto.comune} · a cura di ${agenzia.nome}`}
      />

      {done ? (
        <div className="px-6 py-10 text-center">
          <CheckCircle2 size={44} className="mx-auto text-bronze-500" />
          <h4 className="mt-4 font-display text-2xl font-semibold text-ink">Richiesta inviata</h4>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
            <strong>{agenzia.nome}</strong> preparerà «{composizione}» e ti contatterà per la fatturazione all'indirizzo{" "}
            <strong>{email}</strong>.
          </p>
          <div className="mx-auto mt-5 flex max-w-sm items-start gap-2.5 rounded-lg border border-bronze-600/40 bg-bronze-300/15 px-4 py-3 text-left text-[12.5px] text-bronze-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>
              I fiori devono essere ordinati almeno <strong>24 ore prima del funerale</strong> (ore {manifesto.funerale.ora} del{" "}
              {manifesto.funerale.giorno}).
            </span>
          </div>
          <button onClick={chiudi} className="mt-6 rounded-md bg-night-800 px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-night-700">
            Chiudi
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 px-6 py-5" noValidate>
          <div className="flex items-start gap-2.5 rounded-lg border border-bronze-600/40 bg-bronze-300/15 px-4 py-3 text-[12.5px] leading-snug text-bronze-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <p>
              <strong>Avviso:</strong> i fiori devono essere ordinati almeno <strong>24 ore prima del funerale</strong>. Funerale:{" "}
              {manifesto.funerale.giorno}, ore {manifesto.funerale.ora}.
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
            I dati di fatturazione (email e telefono) saranno trasmessi esclusivamente a {agenzia.nome} per l'emissione del
            documento fiscale. Importo indicativo: <strong className="text-ink-soft">{prezzo} €</strong> IVA inclusa, consegna al
            luogo della cerimonia compresa.
          </p>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-bronze-500 px-4 py-3 text-sm font-bold text-night-950 transition hover:bg-bronze-400 active:scale-[0.99]"
          >
            <Send size={15} /> Invia richiesta all'impresa
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
            <ul className="nice-scroll max-h-44 space-y-2 overflow-y-auto pr-1">
              {manifesto.pensieri.map((p, i) => (
                <li key={i} className="rounded-md border border-line-soft bg-paper px-3.5 py-2.5 text-[12.5px] italic leading-relaxed text-ink-soft">
                  «{p.testo}»
                  <span className="mt-1 block text-[11px] not-italic text-ink-faint">
                    — {p.nome}
                    {p.relazione ? `, ${p.relazione}` : ""} · {p.quando}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-night-800 px-4 py-3 text-sm font-semibold text-paper transition hover:bg-night-700 active:scale-[0.99]"
        >
          <Send size={15} /> Pubblica il pensiero
        </button>
      </form>
    </Modal>
  );
}
