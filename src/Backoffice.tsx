import { useMemo, useRef, useState } from "react";
import {
  ShieldCheck,
  Lock,
  FolderOpen,
  Flower2,
  Mail,
  Phone,
  FileUp,
  FileText,
  Send,
  CheckCircle2,
  Building2,
  CalendarClock,
  Wallet,
  Eye,
  BadgeCheck,
  LogOut,
} from "lucide-react";
import {
  AGENZIE,
  agenziaById,
  eur,
  PIANIFICAZIONI,
  PRATICHE,
  type OrdineFiori,
  type Pratica,
} from "./data";
import { Badge, Modal, ModalHeader, Reveal, useToast } from "./lib";
import { type Sessione } from "./auth";

const VOCI_FATTURA = [
  { voce: "Cofano funebre e accessori", importo: 1240 },
  { voce: "Vestizione e tanatocosmesi", importo: 280 },
  { voce: "Trasporto funebre (ambito comunale)", importo: 360 },
  { voce: "Pratiche amministrative e cimiteriali", importo: 320 },
  { voce: "Personale e assistenza alla cerimonia", importo: 450 },
  { voce: "Diritti e oneri di segreteria", importo: 200 },
];

export function Backoffice({
  sessione,
  ordini,
  onFatturaInviata,
  onLogout,
}: {
  sessione: Sessione;
  ordini: OrdineFiori[];
  onFatturaInviata: (id: string) => void;
  onLogout: () => void;
}) {
  const toast = useToast();
  const [agenziaId, setAgenziaId] = useState("pecorari");
  const [fattura, setFattura] = useState<Pratica | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const agenzia = agenziaById(agenziaId);

  const pratiche = useMemo(() => PRATICHE.filter((p) => p.agenzia === agenziaId), [agenziaId]);
  const ordiniAgenzia = useMemo(() => ordini.filter((o) => o.agenzia === agenziaId), [ordini, agenziaId]);

  const fatturato = pratiche.reduce((s, p) => s + p.imponibile * 1.1, 0);
  const daEvasi = ordiniAgenzia.filter((o) => !o.fatturaInviata).length;
  const pianificazioni = PIANIFICAZIONI[agenziaId] ?? 0;

  const cambiaAgenzia = (id: string) => {
    setAgenziaId(id);
    setFattura(null);
    setPdfName(null);
    toast(`Backoffice attivo: ${agenziaById(id).nome}`, "info");
  };

  const inviaFattura = (o: OrdineFiori) => {
    onFatturaInviata(o.id);
    toast(`Fattura inviata a ${o.cliente.email} (${o.cliente.nome}).`);
  };

  return (
    <div className="border-t border-night-700 bg-night-950 pb-16 text-paper">
      {/* intestazione dashboard */}
      <div className="border-b border-night-700 bg-night-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2.5 text-[10.5px] font-bold uppercase tracking-[0.24em] text-bronze-400">
              <Lock size={13} /> Backoffice B2B · Area riservata
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              {agenzia.nome}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-mist">
              <span className="flex items-center gap-1.5">
                <Building2 size={13} className="text-bronze-400" /> {agenzia.indirizzo}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-bronze-400" /> {agenzia.telefono}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <label className="flex items-center gap-3 text-[12px] text-mist">
              <span className="uppercase tracking-[0.14em]">Agenzia attiva</span>
              <select
                value={agenziaId}
                onChange={(e) => cambiaAgenzia(e.target.value)}
                className="rounded-md border border-night-600 bg-night-800 px-3 py-2 text-[13px] font-semibold text-paper focus:border-bronze-500 focus:outline-none"
              >
                {AGENZIE.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
            </label>
            <p className="flex items-center gap-2 rounded-md border border-night-600 bg-night-800 px-3 py-2 text-[11.5px] text-mist">
              <ShieldCheck size={13} className="shrink-0 text-bronze-400" />
              Operatore: <strong className="text-paper/90">{sessione.user}</strong> · sessione valida fino alle{" "}
              {new Date(sessione.scadeIl).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 rounded-md border border-night-600 px-4 py-2 text-[12.5px] font-semibold text-mist transition hover:border-[#9a3b2e] hover:text-[#e6b7ae]"
            >
              <LogOut size={14} /> Esci
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* -------- KPI -------- */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            icon={<FolderOpen size={18} />}
            label="Pratiche in archivio"
            value={String(pratiche.length)}
            sub={`${pratiche.filter((p) => p.stato === "In corso").length} in corso`}
            delay={0}
          />
          <Kpi
            icon={<Wallet size={18} />}
            label="Fatturato pratiche"
            value={eur(fatturato)}
            sub="IVA 10% inclusa"
            delay={70}
          />
          <Kpi
            icon={<Flower2 size={18} />}
            label="Ordini fiori da fatturare"
            value={String(daEvasi)}
            sub={`${ordiniAgenzia.length} totali ricevuti`}
            delay={140}
          />
          {/* Widget GDPR: contatore anonimo */}
          <Reveal delay={210} className="flex">
            <div className="kpi-in relative flex w-full flex-col justify-between overflow-hidden rounded-xl border border-bronze-500/60 bg-gradient-to-br from-night-800 to-night-900 p-5">
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-bronze-500/15 blur-2xl"
                aria-hidden="true"
              />
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-mist">
                  <CalendarClock size={14} className="text-bronze-400" /> Pianificazioni ricevute
                </p>
                <Lock size={14} className="text-bronze-400" />
              </div>
              <p className="mt-3 font-display text-5xl font-semibold text-bronze-300">
                {pianificazioni}
              </p>
              <p className="mt-1 text-[13.5px] font-semibold text-paper">
                {pianificazioni === 1 ? "utente ti ha scelto" : "utenti ti hanno scelto"}
              </p>
              <p className="mt-3 border-t border-night-600 pt-2.5 text-[11px] leading-relaxed text-mist">
                Dato aggregato e <strong className="text-paper/90">anonimo</strong>: nel rispetto del GDPR nessun nome di
                utenti in vita viene rivelato all'agenzia.
              </p>
            </div>
          </Reveal>
        </div>

        {/* -------- Archivio funerali & fatture -------- */}
        <Reveal className="mt-12">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="flex items-center gap-2.5 font-display text-3xl font-semibold">
              <FolderOpen size={20} className="text-bronze-400" /> Archivio Funerali &amp; Fatture
            </h2>
            <span className="h-px flex-1 bg-night-700" />
            <Badge tone="night">{pratiche.length} pratiche</Badge>
          </div>

          <div className="nice-scroll overflow-x-auto rounded-xl border border-night-700 bg-night-900">
            <table className="bo-table w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-night-700 bg-night-800/60">
                  <th className="px-5 py-3.5">Fattura</th>
                  <th className="px-5 py-3.5">Defunto</th>
                  <th className="px-5 py-3.5">Comune</th>
                  <th className="px-5 py-3.5">Data</th>
                  <th className="px-5 py-3.5">Rito</th>
                  <th className="px-5 py-3.5">Stato</th>
                  <th className="px-5 py-3.5 text-right">Importo</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {pratiche.map((p) => (
                  <tr key={p.id} className="border-b border-night-800 text-[13.5px] transition hover:bg-night-800/50">
                    <td className="px-5 py-3.5 font-mono text-[12.5px] text-bronze-300">{p.numFattura}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-paper">{p.defunto}</p>
                      <p className="text-[11.5px] text-mist">{p.famiglia}</p>
                    </td>
                    <td className="px-5 py-3.5 text-mist">{p.comune}</td>
                    <td className="px-5 py-3.5 text-mist">{p.data}</td>
                    <td className="px-5 py-3.5 text-mist">{p.rito}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={p.stato === "Completata" ? "green" : "amber"}>{p.stato}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-paper">{eur(p.imponibile)} + IVA</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setFattura(p);
                          setPdfName(null);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md border border-bronze-500 bg-bronze-500 px-3 py-1.5 text-[12px] font-bold text-night-950 transition hover:bg-bronze-400"
                      >
                        <Eye size={13} /> Vedi Fattura
                      </button>
                    </td>
                  </tr>
                ))}
                {pratiche.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-sm text-mist">
                      Nessuna pratica in archivio per questa agenzia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* -------- Gestione ordini fiori -------- */}
        <Reveal className="mt-12">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="flex items-center gap-2.5 font-display text-3xl font-semibold">
              <Flower2 size={20} className="text-bronze-400" /> Gestione Ordini Fiori
            </h2>
            <span className="h-px flex-1 bg-night-700" />
            <Badge tone="night">{ordiniAgenzia.length} ordini</Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {ordiniAgenzia.map((o) => (
              <article
                key={o.id}
                className="card-lift flex flex-col rounded-xl border border-night-700 bg-night-900 p-5 transition hover:border-bronze-500/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-semibold text-paper">{o.composizione}</p>
                    <p className="mt-0.5 text-[12.5px] text-mist">
                      In memoria di <strong className="text-paper/90">{o.defunto}</strong> · {o.comune} · funerale {o.dataFunerale}
                    </p>
                    {o.nastro && <p className="mt-1 text-[12px] italic text-bronze-300/90">Nastro: {o.nastro}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-semibold text-bronze-300">{eur(o.importo)}</p>
                    <Badge tone={o.fatturaInviata ? "green" : "amber"}>
                      {o.fatturaInviata ? "Fattura inviata" : o.stato}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 rounded-lg border border-night-700 bg-night-800/60 p-3.5 text-[12.5px]">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-mist">Dati fatturazione cliente</p>
                  <p className="flex items-center gap-2 text-paper">
                    <BadgeCheck size={13} className="text-bronze-400" /> {o.cliente.nome}
                  </p>
                  <p className="flex items-center gap-2 text-mist">
                    <Mail size={13} className="text-bronze-400" /> {o.cliente.email}
                  </p>
                  <p className="flex items-center gap-2 text-mist">
                    <Phone size={13} className="text-bronze-400" /> {o.cliente.telefono}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-night-700 pt-4">
                  <p className="text-[11.5px] text-mist">
                    Canale: <strong className="text-paper/80">{o.canale}</strong>
                  </p>
                  <button
                    onClick={() => inviaFattura(o)}
                    disabled={o.fatturaInviata}
                    className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[12.5px] font-bold transition ${
                      o.fatturaInviata
                        ? "cursor-default border border-night-600 bg-night-800 text-mist"
                        : "bg-bronze-500 text-night-950 hover:bg-bronze-400 active:scale-[0.98]"
                    }`}
                  >
                    {o.fatturaInviata ? (
                      <>
                        <CheckCircle2 size={14} /> Inviata a {o.cliente.email.split("@")[0]}…
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Invia fattura via email
                      </>
                    )}
                  </button>
                </div>
              </article>
            ))}
            {ordiniAgenzia.length === 0 && (
              <p className="rounded-xl border border-dashed border-night-600 bg-night-900 p-10 text-center text-sm text-mist lg:col-span-2">
                Nessun ordine fiori ricevuto per questa agenzia.
              </p>
            )}
          </div>
        </Reveal>
      </div>

      {/* -------- Modale fattura -------- */}
      <Modal open={!!fattura} onClose={() => setFattura(null)} labelledBy="fattura-title" wide>
        {fattura && (
          <>
            <ModalHeader
              id="fattura-title"
              onClose={() => setFattura(null)}
              title={
                <span className="flex items-center gap-2.5">
                  <FileText size={20} className="text-bronze-600" /> Fattura {fattura.numFattura}
                </span>
              }
              sub={`${fattura.defunto} · ${fattura.comune} · ${fattura.data} · intestata a ${fattura.famiglia}`}
            />
            <div className="px-6 py-5">
              <div className="overflow-hidden rounded-lg border border-line">
                <table className="w-full text-left text-[13.5px]">
                  <thead>
                    <tr className="border-b border-line bg-night-900 text-paper">
                      <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em]">Descrizione servizio</th>
                      <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-[0.14em]">Importo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VOCI_FATTURA.map((v) => (
                      <tr key={v.voce} className="border-b border-line-soft bg-card">
                        <td className="px-4 py-2.5 text-ink-soft">{v.voce}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-ink">{eur(v.importo)}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-line-soft bg-paper">
                      <td className="px-4 py-2.5 font-bold text-ink">Totale imponibile</td>
                      <td className="px-4 py-2.5 text-right font-bold text-ink">
                        {eur(VOCI_FATTURA.reduce((s, v) => s + v.importo, 0))}
                      </td>
                    </tr>
                    <tr className="border-b border-line-soft bg-paper">
                      <td className="px-4 py-2.5 text-ink-soft">IVA 10%</td>
                      <td className="px-4 py-2.5 text-right text-ink-soft">
                        {eur(VOCI_FATTURA.reduce((s, v) => s + v.importo, 0) * 0.1)}
                      </td>
                    </tr>
                    <tr className="bg-bronze-300/20">
                      <td className="px-4 py-3 font-display text-lg font-semibold text-ink">Totale documento</td>
                      <td className="px-4 py-3 text-right font-display text-lg font-semibold text-bronze-700">
                        {eur(VOCI_FATTURA.reduce((s, v) => s + v.importo, 0) * 1.1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-[12px] text-ink-faint">
                Importo pratica registrato: <strong className="text-ink-soft">{eur(fattura.imponibile)} + IVA</strong> — il
                dettaglio standard di riferimento ammonta a circa {eur(2850)} + IVA.
              </p>

              {/* Carica fattura PDF */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setPdfName(f.name);
                      toast(`Documento «${f.name}» allegato alla pratica ${fattura.numFattura}.`);
                    }
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-md border border-night-700 bg-night-800 px-4 py-2.5 text-[13px] font-semibold text-paper transition hover:border-bronze-500 hover:text-bronze-300"
                >
                  <FileUp size={15} /> Carica Fattura PDF
                </button>
                {pdfName && (
                  <p className="flex items-center gap-2 rounded-md border border-[#4c7a5a]/40 bg-[#4c7a5a]/10 px-3 py-2 text-[12.5px] font-semibold text-[#3c6349]">
                    <CheckCircle2 size={14} /> {pdfName}
                  </p>
                )}
                <p className="text-[11.5px] text-ink-faint sm:ml-auto">
                  Stato: <Badge tone={fattura.stato === "Completata" ? "green" : "amber"}>{fattura.stato}</Badge>
                </p>
              </div>

              <p className="mt-4 flex items-start gap-2 rounded-md border border-line-soft bg-paper px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-faint">
                <ShieldCheck size={13} className="mt-0.5 shrink-0 text-bronze-600" />
                Il documento è visibile esclusivamente all'agenzia incaricata e conservato secondo le norme fiscali e sulla
                protezione dei dati personali.
              </p>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay} className="flex">
      <div className="kpi-in flex w-full flex-col justify-between rounded-xl border border-night-700 bg-night-900 p-5">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-mist">
          <span className="text-bronze-400">{icon}</span> {label}
        </p>
        <p className="mt-3 font-display text-4xl font-semibold text-paper">{value}</p>
        <p className="mt-1 text-[12px] text-mist">{sub}</p>
      </div>
    </Reveal>
  );
}
