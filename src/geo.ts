/* Coordinate geografiche dei luoghi (WGS84).
   Valori indicativi a livello civico: in produzione vanno verificati con geocoding ufficiale. */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export const CENTRO_MODENA: [number, number] = [44.6471, 10.9252];

export const GEO: Record<string, GeoPoint> = {
  /* Chiese cattoliche di Modena */
  "l-duomo": { lat: 44.646, lng: 10.9257 }, // Duomo — Piazza Grande
  "l-sanpietro": { lat: 44.6433, lng: 10.9283 }, // Abbazia di San Pietro
  "l-sanfrancesco": { lat: 44.648, lng: 10.9222 }, // San Francesco
  "l-santagostino": { lat: 44.6489, lng: 10.9199 }, // Sant'Agostino
  "l-sanvincenzo": { lat: 44.6455, lng: 10.93 }, // San Vincenzo
  "l-sangiuseppe": { lat: 44.642, lng: 10.913 }, // San Giuseppe
  "l-sanpiox": { lat: 44.658, lng: 10.926 }, // San Pio X — Viale Gramsci
  "l-madonnina": { lat: 44.627, lng: 10.93 }, // Madonna Pellegrina — Via Panni
  "l-sanbiagio": { lat: 44.651, lng: 10.918 }, // San Biagio
  "l-sanfaustino": { lat: 44.654, lng: 10.919 }, // San Faustino

  /* Ospedali e case funerarie */
  "l-terracielo": { lat: 44.638, lng: 10.885 }, // Casa Funeraria Terracielo — Via Emilia Ovest
  "l-policlinico": { lat: 44.653, lng: 10.9405 }, // Policlinico — Via del Pozzo
  "l-baggiovara": { lat: 44.605, lng: 10.89 }, // Ospedale Civile di Baggiovara

  /* Luogo ortodosso */
  "l-sannicola": { lat: 44.6495, lng: 10.935 }, // Chiesa Ortodossa Rumena San Nicola — Viale Amendola

  /* Luoghi musulmani */
  "l-repartoislamico": { lat: 44.659, lng: 10.895 }, // Reparto Islamico — Cimitero San Cataldo
  "l-misericordia": { lat: 44.647, lng: 10.929 }, // Moschea La Misericordia — Via Sgarzeria
  "l-takwah": { lat: 44.663, lng: 10.931 }, // Moschea Takwah — Via Canaletto Sud
  "l-turco": { lat: 44.6435, lng: 10.917 }, // Centro Culturale Islamico Turco — Via P. Munari
};
