import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Church,
  MoonStar,
  Cross,
  Building2,
  MapPin,
  Phone,
  Clock3,
  ExternalLink,
  ListFilter,
  LocateFixed,
} from "lucide-react";
import { CATEGORIE_LUOGHI, LUOGHI, type CatLuogo, type Luogo } from "./data";
import { CENTRO_MODENA, GEO } from "./geo";
import { Badge, Modal, ModalHeader, PageMast, Reveal } from "./lib";

const CAT_STYLES: Record<
  CatLuogo,
  { color: string; soft: string; label: string; Icon: React.ComponentType<{ size?: number | string; className?: string }> }
> = {
  chiese: { color: "#c7a262", soft: "rgba(199,162,98,0.14)", label: "Chiesa Cattolica", Icon: Church },
  sanitarie: { color: "#8ea6c8", soft: "rgba(142,166,200,0.13)", label: "Ospedale / Casa Funeraria", Icon: Building2 },
  ortodosso: { color: "#d8b25c", soft: "rgba(216,178,92,0.15)", label: "Luogo Ortodosso", Icon: Cross },
  musulmano: { color: "#7fbf9a", soft: "rgba(127,191,154,0.13)", label: "Luogo Musulmano", Icon: MoonStar },
};

/* ---------------- Mappa Leaflet + OpenStreetMap ---------------- */

function MappaLeaflet({
  luoghi,
  onSeleziona,
  focus,
}: {
  luoghi: Luogo[];
  onSeleziona: (l: Luogo) => void;
  focus: Luogo | null;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const userRef = useRef<L.CircleMarker | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  /* inizializzazione una sola volta */
  useEffect(() => {
    if (!boxRef.current || mapRef.current) return;
    const map = L.map(boxRef.current, { center: CENTRO_MODENA, zoom: 12, scrollWheelZoom: true });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    map.on("locationfound", (e: L.LocationEvent) => {
      userRef.current?.remove();
      userRef.current = L.circleMarker(e.latlng, {
        radius: 8,
        color: "#ddc38d",
        weight: 3,
        fillColor: "#b08a45",
        fillOpacity: 0.9,
      }).addTo(map);
      userRef.current.bindTooltip("La tua posizione", { direction: "top" });
      setGeoMsg("Posizione trovata: la mappa è centrata su di te.");
    });
    map.on("locationerror", () => setGeoMsg("Geolocalizzazione non disponibile in questo browser."));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* marker per i luoghi filtrati */
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    luoghi.forEach((l) => {
      const pos = GEO[l.id];
      if (!pos) return;
      const st = CAT_STYLES[l.categoria];
      const icon = L.divIcon({
        className: "vicini-pin-wrap",
        html: `<span class="vicini-pin" style="--pin:${st.color}"></span>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const mk = L.marker([pos.lat, pos.lng], { icon, title: l.nome }).addTo(layer);
      mk.bindTooltip(l.nome, { direction: "top", offset: [0, -12], opacity: 0.96 });
      mk.on("click", () => onSeleziona(l));
    });
  }, [luoghi, onSeleziona]);

  /* volo sul luogo selezionato dall'elenco */
  useEffect(() => {
    if (!focus || !mapRef.current) return;
    const pos = GEO[focus.id];
    if (pos) mapRef.current.flyTo([pos.lat, pos.lng], 15, { duration: 0.9 });
  }, [focus]);

  const localizzami = () => {
    const map = mapRef.current;
    if (!map) return;
    setGeoMsg("Ricerca della posizione in corso…");
    map.locate({ setView: true, maxZoom: 14, timeout: 8000 });
  };

  return (
    <div className="relative z-0 overflow-hidden rounded-xl border border-night-700 shadow-inner">
      <div ref={boxRef} className="h-[420px] w-full sm:h-[540px]" aria-label="Mappa dei luoghi del commiato" />

      {/* overlay comandi */}
      <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
        <div className="pointer-events-auto flex flex-wrap gap-1.5 rounded-lg border border-night-700 bg-night-900/95 px-3 py-2 text-[10.5px] text-mist shadow-lg backdrop-blur">
          {Object.entries(CAT_STYLES).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5 pr-1">
              <span className="h-2 w-2 rounded-full" style={{ background: v.color }} />
              {v.label}
            </span>
          ))}
        </div>
        <button
          onClick={localizzami}
          className="pointer-events-auto flex items-center gap-2 rounded-lg border border-bronze-500/70 bg-night-900/95 px-3.5 py-2 text-[12px] font-bold text-bronze-300 shadow-lg backdrop-blur transition hover:bg-bronze-500 hover:text-night-950 active:scale-95"
        >
          <LocateFixed size={14} /> La mia posizione
        </button>
      </div>

      {geoMsg && (
        <p className="anim-fade absolute bottom-3 left-3 rounded-md border border-night-600 bg-night-900/95 px-3 py-1.5 text-[11.5px] text-mist shadow-lg backdrop-blur">
          {geoMsg}
        </p>
      )}

      <p className="flex items-center gap-2 border-t border-night-700 bg-night-900 px-5 py-2.5 text-[11px] text-mist">
        <MapPin size={12} className="text-bronze-400" />
        Tocca un marker sulla mappa o un elemento dell'elenco per aprire la scheda completa del luogo.
      </p>
    </div>
  );
}

/* ---------------- Sezione Luoghi (tab 3) ---------------- */

export function Luoghi() {
  const [cat, setCat] = useState<CatLuogo | "tutte">("tutte");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [sel, setSel] = useState<Luogo | null>(null);
  const [focus, setFocus] = useState<Luogo | null>(null);

  const visibili = cat === "tutte" ? LUOGHI : LUOGHI.filter((l) => l.categoria === cat);

  const seleziona = useCallback((l: Luogo) => {
    setSel(l);
    setFocus(l);
  }, []);

  return (
    <div>
      <PageMast
        kicker="Mappa & Luoghi del Territorio"
        title={
          <>
            I luoghi del <em className="italic text-bronze-300">commiato</em>
          </>
        }
        sub="Chiese cattoliche di Modena, ospedali e case funerarie, luoghi di culto ortodossi e musulmani: una mappa reale del territorio, con posizioni e schede complete per orientare le famiglie nel momento del bisogno."
        meta={
          <>
            <span className="flex items-center gap-2">
              <MapPin size={13} className="text-bronze-400" /> {LUOGHI.length} luoghi geolocalizzati
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-bronze-500 sm:inline-block" />
            <span>4 categorie di luoghi</span>
            <span className="hidden h-1 w-1 rounded-full bg-bronze-500 sm:inline-block" />
            <span>Mappa OpenStreetMap</span>
          </>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* filtri categoria */}
        <Reveal className="mb-8 flex flex-wrap gap-2">
          {CATEGORIE_LUOGHI.map((c) => {
            const n = c.id === "tutte" ? LUOGHI.length : LUOGHI.filter((l) => l.categoria === c.id).length;
            const attivo = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                aria-pressed={attivo}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                  attivo
                    ? "border-night-800 bg-night-800 text-paper shadow-md"
                    : "border-line bg-card text-ink-soft hover:border-bronze-500 hover:text-bronze-600"
                }`}
              >
                {c.id !== "tutte" && (
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: CAT_STYLES[c.id as CatLuogo].color }} />
                )}
                {c.breve} <span className="opacity-70">{n}</span>
              </button>
            );
          })}
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <MappaLeaflet luoghi={visibili} onSeleziona={seleziona} focus={focus} />
          </Reveal>

          {/* elenco sincronizzato */}
          <Reveal delay={120}>
            <div className="flex h-full flex-col rounded-xl border border-line bg-card">
              <div className="flex items-center justify-between border-b border-line-soft px-5 py-3.5">
                <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
                  <ListFilter size={16} className="text-bronze-600" />
                  {CATEGORIE_LUOGHI.find((c) => c.id === cat)?.nome}
                </h3>
                <span className="text-[12px] text-ink-faint">{visibili.length} luoghi</span>
              </div>
              <ul className="nice-scroll max-h-[560px] flex-1 divide-y divide-line-soft overflow-y-auto">
                {visibili.map((l) => {
                  const st = CAT_STYLES[l.categoria];
                  const Ic = st.Icon;
                  return (
                    <li key={l.id}>
                      <button
                        onClick={() => seleziona(l)}
                        onMouseEnter={() => setHoverId(l.id)}
                        onMouseLeave={() => setHoverId(null)}
                        className={`group flex w-full items-start gap-3.5 px-5 py-3.5 text-left transition ${
                          hoverId === l.id ? "bg-bronze-300/15" : "hover:bg-paper"
                        }`}
                      >
                        <span
                          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border"
                          style={{ background: st.soft, borderColor: `${st.color}66`, color: st.color }}
                        >
                          <Ic size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-bold leading-snug text-ink group-hover:text-bronze-700">
                            {l.nome}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-faint">
                            <MapPin size={11} /> {l.indirizzo}
                          </span>
                        </span>
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: st.color }} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      {/* modale luogo */}
      <Modal open={!!sel} onClose={() => setSel(null)} labelledBy="luogo-title" wide>
        {sel && (
          <>
            <ModalHeader
              id="luogo-title"
              onClose={() => setSel(null)}
              title={sel.nome}
              sub={
                <span className="flex flex-wrap items-center gap-2">
                  <Badge tone="bronze">{CAT_STYLES[sel.categoria].label}</Badge>
                  {sel.indirizzo}
                </span>
              }
            />
            <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-[14px] leading-relaxed text-ink-soft">{sel.descrizione}</p>
                <p className="mb-2.5 mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-faint">Servizi offerti</p>
                <ul className="space-y-2">
                  {sel.servizi.map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-[13.5px] text-ink-soft">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 border border-bronze-500 bg-bronze-300/50" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3.5">
                <div className="rounded-lg border border-line bg-paper p-4">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                    <MapPin size={13} className="text-bronze-600" /> Indirizzo
                  </p>
                  <p className="mt-1.5 text-[13.5px] font-semibold text-ink">{sel.indirizzo}</p>
                </div>
                <div className="rounded-lg border border-line bg-paper p-4">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                    <Clock3 size={13} className="text-bronze-600" /> Orari
                  </p>
                  <p className="mt-1.5 text-[13.5px] font-semibold text-ink">{sel.orari}</p>
                </div>
                <div className="rounded-lg border border-line bg-paper p-4">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
                    <Phone size={13} className="text-bronze-600" /> Contatti
                  </p>
                  <a
                    href={`tel:${sel.telefono.replace(/[^\d+]/g, "").slice(0, 12)}`}
                    className="mt-1.5 block text-[13.5px] font-semibold text-bronze-700 hover:underline"
                  >
                    {sel.telefono}
                  </a>
                </div>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(sel.nome + " " + sel.indirizzo)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-md bg-night-800 px-4 py-2.5 text-[13px] font-semibold text-paper transition hover:bg-night-700"
                >
                  <ExternalLink size={14} /> Indicazioni stradali
                </a>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
