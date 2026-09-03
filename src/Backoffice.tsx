import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  FileText,
  Eye,
  Upload,
  Send,
  Flower2,
  Archive,
  CheckCircle2,
  Paperclip,
  Phone,
  Mail,
  Flame,
} from "lucide-react";
import {
  AGENZIE,
  agenziaById,
  IVA_ALIQUOTA,
  PRATICHE,
  URL_BASE,
  eur,
  type OrdineFiori,
  type Pratica,
} from "./data";
import { Badge, Modal, ModalHeader, Reveal, useToast } from "./lib";

type Tab = "pratiche" | "fiori";

export function Backoffice({
  ordini,
  onFatturaInviata,
  onExit,
}: {
  ordini: OrdineFiori[];
  onFatturaInviata: (id: string) => void;
  onExit: () => void;
}) {
  const toast = useToast();
  const [agenziaId, setAgenziaId] = useState("pecorari"); // predefinita: Pecorari
  const [tab, setTab] = useState<Tab>("pratiche");
  const [fatturaAperta, setFatturaAperta] = useState<Pratica | null>(null);

  const agenzia = agenziaById(agenziaId);

  const pratiche = useMemo(() => PRATICHE.filter((p) => p.agenzia === agenziaId), [agenziaId]);
  const ordiniAgenzia = useMemo(() => ordini.filter((o) => o.agenzia === agenziaId), [ordini, agenziaId]);

  const inCorso = pratiche.filter((p) => p.stato === "In corso").length;
  const daEvasi = ordiniAgenzia.filter((o) => o.stato === "Da evadere").length;
  const fattureInviate = ordiniAgenzia.filter((o) => o.fatturaInviata).length;

  const inviaFattura = (o: OrdineFiori) => {
    onFatturaInviata(o.id);
    toast(`Fattura inviata via email a ${o.cliente.email}.`);
  };

  return (
    <div className="min-h-screen bg-paper-deep/70 pb-20">
      {/* barra backoffice */}
      <div className="sticky top-0 z-50 border-b-2 border-bronze-600 bg-night-900 text-paper shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3.5 sm:px-6">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 rounded-md border border-night-600 px-3 py-1.5 text-[12.5px] font-semibold text-mist transition hover:border-bronze-500 hover:text-bronze-300"
          >
            <ArrowLeft size={14} /> Torna al sito
          </button>
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md border border-bronze-500/60 bg-night-800">
              <Flame size={15} className="text-bronze-400" />
            </span>
            <div className="leading-none">
              <p className="font-display text-xl font-semibold">Vicini Backoffice</p>
              <p className="mt-0.5 text-[9.5px] font-bold uppercase tracking-[0.24em] text-mist">Area riservata agenzie · B2B</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <label className="flex items-center gap-2 text-[12px] font-semibold text-mist">
              <Building2 size={14} className="text-bronze-400" />
              <span className="hidden sm:inline">Agenzia attiva:</span>
              <select
                value={agenziaId}
                onChange={(e) => setAgenziaId(e.target.value)}
                className="rounded-md border border-night-600 bg-night-800 px-3 py-2 text-[13px] font-semibold text-paper focus:border-bronze-500 focus:outline-none"
              >
                {AGENZIE.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}{a.principale ? " · principale" : ""}
                  </option>
                ))}
              </select>
            </label>
            <Badge tone="bronze">
              <ShieldCheck size={11} /> sessione verificata
            </Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* intestazione agenzia */}
        <Reveal className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-bronze-600">Scrivania operativa</p>
              <h1 className="mt-1 font-display text-4xl font-semibold text-ink sm:text-5xl">{agenzia.nome}</h1>
              <p className="mt-1.5 text-[13px] text-ink-faint">
                {agenzia.indirizzo} · {agenzia.telefono} · pratiche della provincia di Modena
              </p>
            </div>
            <p className="rounded-md border border-line bg-card px-3.5 py-2 text-[12px] text-ink-soft">
              Accesso del <strong>{new Date().toLocaleDateString("it-IT")}</strong> — dati dimostrativi
            </p>
          </div>
        </Reveal>

        {/* indicatori */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Pratiche archiviate", pratiche.length, Archive, "storico completo"],
            ["Pratiche in corso", inCorso, FileText, "cerimonie programmate"],
            ["Ordini fiori da evadere", daEvasi, Flower2, "richieste dal sito"],
            ["Fatture fiori inviate", fattureInviate, Send, "via email al cliente"],
          ].map(([label, val, Icon, sub], i) => {
            const I = Icon as typeof Archive;
            return (
              <Reveal key={label as string} delay={(i as number) * 70}>
                <div className="card-lift rounded-lg border border-line bg-card p-4.5 sm:p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-faint">{label as string}</p>
                    <I size={17} className="text-bronze-600" />
                  </div>
                  <p className="mt-2 font-display text-4xl font-semibold text-ink">{val as number}</p>
                  <p className="mt-0.5 text-[11.5px] italic text-ink-faint">{sub as string}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* tabs */}
        <div className="mt-8 flex gap-2">
          {(
            [
              ["pratiche", "Archivio Funerali & Fatture", Archive],
              ["fiori", "Gestione Ordini Fiori", Flower2],
            ] as [Tab, string, typeof Archive][]
          ).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              aria-pressed={tab === k}
              className={`flex items-center gap-2 rounded-t-lg border border-b-0 px-4 py-2.5 text-[13px] font-bold transition sm:px-5 ${
                tab === k
                  ? "border-line bg-card text-bronze-700"
                  : "border-transparent bg-paper-deep text-ink-faint hover:text-ink"
              }`}
            >
              <Icon size={15} /> {label}
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${tab === k ? "bg-bronze-300/30 text-bronze-700" : "bg-line-soft text-ink-faint"}`}>
                {k === "pratiche" ? pratiche.length : ordiniAgenzia.length}
              </span>
            </button>
          ))}
        </div>

        {/* contenuto tab */}
        <div className="rounded-b-xl rounded-tr-xl border border-line bg-card p-4 sm:p-6">
          {tab === "pratiche" ? (
            pratiche.length === 0 ? (
              <EmptyState msg="Nessuna pratica archiviata per questa agenzia nel periodo corrente." />
            ) : (
              <div className="overflow-x-auto nice-scroll">
                <table className="bo-table w-full min-w-[820px] border-collapse">
                  <thead>
                    <tr className="border-b-2 border-line">
                      <th className="px-3 py-3">Pratica / Fattura</th>
                      <th className="px-3 py-3">Defunto</th>
                      <th className="px-3 py-3">Comune</th>
                      <th className="px-3 py-3">Cerimonia</th>
                      <th className="px-3 py-3">Rito</th>
                      <th className="px-3 py-3">Stato</th>
                      <th className="px-3 py-3 text-right">Imponibile</th>
                      <th className="px-3 py-3 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pratiche.map((p) => (
                      <tr key={p.id} className="group border-b border-line-soft transition hover:bg-bronze-300/10">
                        <td className="px-3 py-3.5">
                          <p className="text-[13px] font-bold text-ink">{p.numFattura}</p>
                          <p className="text-[11px] text-ink-faint">pratica {p.id.toUpperCase()}-2026</p>
                        </td>
                        <td className="px-3 py-3.5">
                          <p className="font-display text-[16px] font-semibold leading-tight text-ink">{p.defunto}</p>
                          <p className="text-[11px] text-ink-faint">{p.famiglia}</p>
                        </td>
                        <td className="px-3 py-3.5 text-[13px] text-ink-soft">{p.comune}</td>
                        <td className="px-3 py-3.5 text-[13px] text-ink-soft">{p.data}</td>
                        <td className="px-3 py-3.5">
                          <Badge tone={p.rito === "Musulmano" ? "bronze" : "neutral"}>{p.rito}</Badge>
                        </td>
                        <td className="px-3 py-3.5">
                          <Badge tone={p.stato === "Completata" ? "green" : "amber"}>
                            <span className={`h-1.5 w-1.5 rounded-full ${p.stato === "Completata" ? "bg-[#3c6349]" : "bg-bronze-500 blink-dot"}`} />
                            {p.stato}
                          </Badge>
                        </td>
                        <td className="px-3 py-3.5 text-right text-[13.5px] font-bold text-ink">{eur(p.imponibile)} <span className="text-[10.5px] font-normal text-ink-faint">+ IVA</span></td>
                        <td className="px-3 py-3.5 text-right">
                          <button
                            onClick={() => setFatturaAperta(p)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-night-700 bg-night-800 px-3 py-1.5 text-[12px] font-bold text-paper transition hover:border-bronze-500 hover:text-bronze-300"
                          >
                            <Eye size={13} /> Vedi Fattura
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : ordiniAgenzia.length === 0 ? (
            <EmptyState msg="Nessun ordine fiori per questa agenzia: gli ordini inviati dal sito compariranno qui in tempo reale." />
          ) : (
            <div className="overflow-x-auto nice-scroll">
              <table className="bo-table w-full min-w-[860px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-line">
                    <th className="px-3 py-3">Ordine</th>
                    <th className="px-3 py-3">Cliente (fatturazione)</th>
                    <th className="px-3 py-3">Composizione</th>
                    <th className="px-3 py-3">In memoria di</th>
                    <th className="px-3 py-3">Consegna</th>
                    <th className="px-3 py-3 text-right">Importo</th>
                    <th className="px-3 py-3">Fattura</th>
                    <th className="px-3 py-3 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {ordiniAgenzia.map((o) => (
                    <tr key={o.id} className="border-b border-line-soft transition hover:bg-bronze-300/10">
                      <td className="px-3 py-3.5">
                        <p className="text-[13px] font-bold uppercase text-ink">{o.id.slice(-6)}</p>
                        <p className="text-[11px] text-ink-faint">canale: {o.canale}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-[13px] font-semibold text-ink">{o.cliente.nome}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-ink-faint">
                          <Mail size={11} className="text-bronze-600" /> {o.cliente.email}
                        </p>
                        <p className="flex items-center gap-1 text-[11.5px] text-ink-faint">
                          <Phone size={11} className="text-bronze-600" /> {o.cliente.telefono}
                        </p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-[13px] font-semibold text-ink-soft">{o.composizione}</p>
                        {o.nastro && <p className="text-[11px] italic text-ink-faint">nastro: {o.nastro}</p>}
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-display text-[15px] font-semibold leading-tight text-ink">{o.defunto}</p>
                        <p className="text-[11px] text-ink-faint">{o.comune}</p>
                      </td>
                      <td className="px-3 py-3.5 text-[12.5px] text-ink-soft">{o.dataFunerale}</td>
                      <td className="px-3 py-3.5 text-right text-[13.5px] font-bold text-ink">{eur(o.importo)}</td>
                      <td className="px-3 py-3.5">
                        {o.fatturaInviata ? (
                          <Badge tone="green"><CheckCircle2 size={11} /> Inviata</Badge>
                        ) : (
                          <Badge tone="amber">Da inviare</Badge>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        {o.fatturaInviata ? (
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3c6349]">
                            <CheckCircle2 size={14} /> Email recapitata
                          </span>
                        ) : (
                          <button
                            onClick={() => inviaFattura(o)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-bronze-500 px-3 py-1.5 text-[12px] font-bold text-night-950 transition hover:bg-bronze-400"
                          >
                            <Send size={13} /> Invia fattura via email
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-[11.5px] italic text-ink-faint">
          Gli ordini inviati dai cittadini tramite «Invia Fiori» sui manifesti confluiscono automaticamente
          in questa sezione, completi dei recapiti necessari alla fatturazione.
        </p>
      </div>

      {/* modale fattura */}
      <FatturaModal pratica={fatturaAperta} onClose={() => setFatturaAperta(null)} agenziaNome={agenzia.nome} agenziaIndirizzo={agenzia.indirizzo} />
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return <p className="rounded-lg border border-dashed border-line bg-paper p-10 text-center text-sm text-ink-faint">{msg}</p>;
}

/* ---------------- Modale fattura ---------------- */

const VOCI: [string, number][] = [
  ["Servizio funebre completo (organizzazione, personale, assistenza)", 0.52],
  ["Cofano funebre e accessori", 0.275],
  ["Trasporto salma e carro funebre", 0.09],
  ["Pratiche amministrative e cimiteriali", 0.065],
  ["Addobbi e allestimento sala del commiato", 0.05],
];

function FatturaModal({
  pratica,
  onClose,
  agenziaNome,
  agenziaIndirizzo,
}: {
  pratica: Pratica | null;
  onClose: () => void;
  agenziaNome: string;
  agenziaIndirizzo: string;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pdf, setPdf] = useState<string | null>(null);

  const chiudi = () => {
    setPdf(null);
    onClose();
  };

  const voci = useMemo(() => {
    if (!pratica) return [];
    let resto = pratica.imponibile;
    return VOCI.map(([desc, q], i) => {
      const val = i === VOCI.length - 1 ? resto : Math.round(pratica.imponibile * q);
      resto -= val;
      return { desc, val };
    });
  }, [pratica]);

  if (!pratica) return <Modal open={false} onClose={onClose}><div /></Modal>;

  const iva = Math.round(pratica.imponibile * IVA_ALIQUOTA);
  const totale = pratica.imponibile + iva;

  return (
    <Modal open={!!pratica} onClose={chiudi} wide labelledBy="fattura-title">
      <ModalHeader
        id="fattura-title"
        onClose={chiudi}
        title={<span className="flex items-center gap-2"><FileText size={20} className="text-bronze-600" /> Fattura {pratica.numFattura}</span>}
        sub={`Pratica funeraria — ${pratica.defunto} · ${pratica.comune}`}
      />
      <div className="px-6 py-5">
        {/* documento */}
        <div className="rounded-lg border border-line bg-white/60 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-night-800 pb-4">
            <div>
              <p className="font-display text-xl font-semibold text-ink">{agenziaNome}</p>
              <p className="text-[12px] text-ink-faint">{agenziaIndirizzo}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-bronze-700">Fattura accompagnatoria</p>
              <p className="mt-0.5 text-[13px] font-bold text-ink">{pratica.numFattura}</p>
              <p className="text-[12px] text-ink-faint">data cerimonia: {pratica.data}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-between gap-2 text-[12.5px] text-ink-soft">
            <p>
              <span className="font-bold uppercase tracking-wider text-ink-faint">Cliente: </span>
              {pratica.famiglia}
            </p>
            <p>
              <span className="font-bold uppercase tracking-wider text-ink-faint">Rito: </span>
              {pratica.rito} · <span className="font-bold uppercase tracking-wider text-ink-faint">Stato pratica: </span>{pratica.stato}
            </p>
          </div>

          <table className="mt-5 w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                <th className="py-2 pr-3">Descrizione prestazione</th>
                <th className="py-2 text-right">Importo</th>
              </tr>
            </thead>
            <tbody>
              {voci.map((v) => (
                <tr key={v.desc} className="border-b border-line-soft">
                  <td className="py-2.5 pr-3 text-ink">{v.desc}</td>
                  <td className="py-2.5 text-right font-semibold text-ink">{eur(v.val)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-[13.5px]">
            <p className="flex justify-between text-ink-soft">
              <span>Imponibile</span> <span className="font-semibold text-ink">{eur(pratica.imponibile)}</span>
            </p>
            <p className="flex justify-between text-ink-soft">
              <span>IVA {IVA_ALIQUOTA * 100}%</span> <span className="font-semibold text-ink">{eur(iva)}</span>
            </p>
            <p className="flex justify-between border-t-2 border-night-800 pt-2 text-[15px] font-bold text-ink">
              <span>Totale documento</span> <span className="text-bronze-700">{eur(totale)}</span>
            </p>
          </div>

          <p className="mt-4 rounded-md bg-paper px-3.5 py-2.5 text-[11.5px] italic leading-relaxed text-ink-faint">
            Prestazioni esenti marca da bollo · pagamento a 30 gg · il totale di riferimento per il
            servizio funebre completo è ≈ {eur(2850)} + IVA, come da listino provinciale concordato.
          </p>
        </div>

        {/* azioni */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setPdf(f.name);
                toast(`PDF caricato: ${f.name}`);
              }
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-md border border-night-700 bg-night-800 px-5 py-2.5 text-sm font-semibold text-paper transition hover:border-bronze-500 hover:text-bronze-300"
          >
            <Upload size={15} /> Carica Fattura PDF
          </button>
          {pdf ? (
            <span className="flex items-center gap-2 rounded-md border border-[#4c7a5a]/40 bg-[#4c7a5a]/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-[#3c6349]">
              <Paperclip size={14} /> {pdf} <CheckCircle2 size={14} />
            </span>
          ) : (
            <span className="text-[12px] italic text-ink-faint">Nessun allegato caricato per {pratica.numFattura}</span>
          )}
          <button
            onClick={() => {
              toast(`Copia di ${pratica.numFattura} inviata a ${pratica.famiglia.split("—")[0]?.trim() ?? "cliente"}.`);
              chiudi();
            }}
            className="flex items-center justify-center gap-2 rounded-md bg-bronze-500 px-5 py-2.5 text-sm font-bold text-night-950 transition hover:bg-bronze-400 sm:ml-auto"
          >
            <Send size={15} /> Invia copia al cliente
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-ink-faint">
          Documento generato dalla piattaforma {URL_BASE} · conservazione sostitutiva a norma
        </p>
      </div>
    </Modal>
  );
}
