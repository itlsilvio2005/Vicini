/* ============================================================
   VICINI — dati della piattaforma SPA (Provincia di Modena)
   ============================================================ */

export type Comune = "Modena" | "Nonantola" | "Vignola" | "Carpi" | "Formigine" | "Sassuolo";
export const COMUNI: Comune[] = ["Modena", "Nonantola", "Vignola", "Carpi", "Formigine", "Sassuolo"];

/* ---------------- IMPRESE DEL LUOGO (per comune, senza classifiche) ---------------- */

export interface GruppoImprese {
  id: string;
  nome: string;
  nota?: string;
}

export const GRUPPI_IMPRESE: GruppoImprese[] = [
  { id: "modena", nome: "Modena Città" },
  { id: "formigine", nome: "Formigine" },
  { id: "carpi", nome: "Carpi" },
  { id: "sassuolo", nome: "Sassuolo" },
  { id: "vignola-nonantola", nome: "Vignola & Nonantola" },
];

export interface Agenzia {
  id: string;
  nome: string;
  gruppi: string[];
  indirizzo: string;
  descrizione: string;
  telefono: string;
  email: string;
}

export const AGENZIE: Agenzia[] = [
  {
    id: "pecorari",
    nome: "Onoranze Funebri Pecorari",
    gruppi: ["modena", "vignola-nonantola"],
    indirizzo: "Via Nonantolana, 555 — 41122 Modena (MO)",
    descrizione: "Opera nei comuni di Modena, Nonantola e Ravarino organizzando funerali completi con serietà e discrezione.",
    telefono: "059 364 218",
    email: "info@onoranzefunebripecorari.it",
  },
  {
    id: "borsari",
    nome: "Onoranze Funebri Borsari",
    gruppi: ["modena"],
    indirizzo: "Strada Cimitero San Cataldo, 131 — 41123 Modena (MO)",
    descrizione: "Servizio discreto e professionale h24 con sede a San Cataldo.",
    telefono: "059 826 115",
    email: "segreteria@onoranziborsari.it",
  },
  {
    id: "farri",
    nome: "Onoranze Funebri Farri",
    gruppi: ["modena"],
    indirizzo: "Viale Gaetano Moreali, 229 — 41124 Modena (MO)",
    descrizione: "Supporto completo per l'organizzazione del funerale nel momento del lutto.",
    telefono: "059 301 577",
    email: "info@onoranzefarri.it",
  },
  {
    id: "gibellini",
    nome: "Onoranze Funebri Gianni Gibellini",
    gruppi: ["modena"],
    indirizzo: "Via del Pozzo, 101/a — 41124 Modena (MO)",
    descrizione: "Impresa di onoranze funebri che offre servizi per l'organizzazione di funerali completi.",
    telefono: "059 373 892",
    email: "gibellini@onoranzemodena.it",
  },
  {
    id: "roffi",
    nome: "Onoranze Funebri ROFFI",
    gruppi: ["modena"],
    indirizzo: "Via Giardini, 452 — 41124 Modena (MO)",
    descrizione: "Storica impresa modenese: cerimonie complete, trasporti e pratiche con esperienza pluridecennale.",
    telefono: "059 352 046",
    email: "info@onoranziroffi.it",
  },
  {
    id: "croceblu",
    nome: "Onoranze Funebri Croce Blu",
    gruppi: ["modena"],
    indirizzo: "Via del Lancillotto, 10 — 41122 Modena (MO)",
    descrizione: "Società di mutuo soccorso convenzionata: funerali completi e assistenza continuativa alla famiglia.",
    telefono: "059 366 022",
    email: "segreteria@croceblumodena.it",
  },
  {
    id: "sanmartino",
    nome: "Onoranze Funebri San Martino",
    gruppi: ["formigine"],
    indirizzo: "Via Don Adelmo Martinelli, 23 — 41043 Formigine (MO)",
    descrizione: "Servizio 24h per cerimonie complete dalla preparazione e vestizione al trasporto.",
    telefono: "059 512 340",
    email: "info@onoranzesanmartino.it",
  },
  {
    id: "gibellini-formigine",
    nome: "Onoranze Funebri Gibellini",
    gruppi: ["formigine"],
    indirizzo: "Via Giardini Nord, 33 — 41043 Formigine (MO)",
    descrizione: "Impresa familiare attiva nel distretto ceramico: funerali completi, cremazioni e pratiche cimiteriali.",
    telefono: "059 558 130",
    email: "info@gibellini.formigine.it",
  },
  {
    id: "salvioli",
    nome: "Onoranze Funebri Salvioli",
    gruppi: ["carpi"],
    indirizzo: "Corso Alberto Pio, 68 — 41012 Carpi (MO)",
    descrizione: "Impresa storica carpigiana: onoranze complete, vestizione e trasporti in tutta la provincia.",
    telefono: "059 642 873",
    email: "info@onoranzisalvioli.it",
  },
  {
    id: "bellodi",
    nome: "Onoranze Funebri Bellodi",
    gruppi: ["carpi"],
    indirizzo: "Via Cattani, 45 — 41012 Carpi (MO)",
    descrizione: "Accompagnamento discreto delle famiglie di Carpi con reperibilità continuativa giorno e notte.",
    telefono: "059 655 410",
    email: "bellodi@onoranzecarpi.it",
  },
  {
    id: "lugli",
    nome: "Onoranze Funebri Lugli",
    gruppi: ["carpi"],
    indirizzo: "Via Pezzana, 8 — 41012 Carpi (MO)",
    descrizione: "Servizi funebri completi e disbrigo delle pratiche cimiteriali per Carpi e le sue frazioni.",
    telefono: "059 661 224",
    email: "info@onoranzilugli.it",
  },
  {
    id: "depietri",
    nome: "Onoranze Funebri De Pietri",
    gruppi: ["sassuolo"],
    indirizzo: "Via Radici in Piano, 27 — 41049 Sassuolo (MO)",
    descrizione: "Riferimento per Sassuolo e il distretto ceramico: funerali completi, cremazioni e rimpatri.",
    telefono: "0536 807 315",
    email: "info@onoranzidepietri.it",
  },
  {
    id: "gibellini-falcinelli",
    nome: "Onoranze Funebri Gibellini & Falcinelli",
    gruppi: ["sassuolo"],
    indirizzo: "Via Mazzini, 74 — 41049 Sassuolo (MO)",
    descrizione: "Due famiglie, un'unica cura: cerimonie religiose e civili nel comprensorio di Sassuolo.",
    telefono: "0536 884 502",
    email: "segreteria@gibellinifalcinelli.it",
  },
  {
    id: "muratori",
    nome: "Onoranze Funebri Muratori",
    gruppi: ["vignola-nonantola"],
    indirizzo: "Via Libertà, 55 — 41058 Vignola (MO) · sede anche a Nonantola, Via Marconi 3",
    descrizione: "Presente tra Vignola e Nonantola: funerali completi con attenzione alle tradizioni locali.",
    telefono: "059 771 368",
    email: "info@onoranzimuratori.it",
  },
];

export const agenziaById = (id: string) => AGENZIE.find((a) => a.id === id) ?? AGENZIE[0];

/* Pianificazioni ricevute — contatore ANONIMO per agenzia (GDPR) */
export const PIANIFICAZIONI: Record<string, number> = {
  pecorari: 38,
  borsari: 14,
  farri: 11,
  gibellini: 6,
  roffi: 4,
  croceblu: 7,
  sanmartino: 12,
  "gibellini-formigine": 2,
  salvioli: 5,
  bellodi: 1,
  lugli: 3,
  depietri: 4,
  "gibellini-falcinelli": 2,
  muratori: 9,
};

/* ---------------- LUOGHI DEL TERRITORIO ---------------- */

export type CatLuogo = "chiese" | "sanitarie" | "ortodosso" | "musulmano";

export const CATEGORIE_LUOGHI: { id: CatLuogo | "tutte"; nome: string; breve: string }[] = [
  { id: "tutte", nome: "Tutti i luoghi", breve: "Tutti" },
  { id: "chiese", nome: "Chiese Cattoliche di Modena", breve: "Chiese Cattoliche" },
  { id: "sanitarie", nome: "Ospedali e Case Funerarie", breve: "Ospedali & Case Funerarie" },
  { id: "ortodosso", nome: "Luoghi Ortodossi", breve: "Luoghi Ortodossi" },
  { id: "musulmano", nome: "Luoghi Musulmani", breve: "Luoghi Musulmani" },
];

export interface Luogo {
  id: string;
  nome: string;
  categoria: CatLuogo;
  indirizzo: string;
  descrizione: string;
  servizi: string[];
  telefono: string;
  orari: string;
  x: number;
  y: number;
}

const servChiesa = ["Cerimonie funebri e S. Rosario", "Cappella feriale", "Confessioni e assistenza spirituale"];

export const LUOGHI: Luogo[] = [
  /* ---- Chiese cattoliche di Modena ---- */
  {
    id: "l-duomo", nome: "Duomo di Modena — Cattedrale di Santa Maria Assunta", categoria: "chiese",
    indirizzo: "Corso Duomo / Piazza Grande — Modena",
    descrizione: "La Cattedrale romanica, patrimonio UNESCO, accoglie le celebrazioni solenni più importanti della città.",
    servizi: ["Celebrazioni solenni", "S. Rosario", "Cappella musicale"], telefono: "059 216 070",
    orari: "Aperto tutti i giorni 7:00 – 19:00", x: 418, y: 228,
  },
  {
    id: "l-sanpietro", nome: "Abbazia di San Pietro", categoria: "chiese",
    indirizzo: "Largo San Pietro, 1 — Modena",
    descrizione: "Complesso benedettino nel cuore della città, spesso scelto dalle famiglie per l'ampiezza e la sobrietà.",
    servizi: servChiesa, telefono: "059 222 482", orari: "7:30 – 12:00 · 15:30 – 19:00", x: 436, y: 244,
  },
  {
    id: "l-sanfrancesco", nome: "Chiesa di San Francesco", categoria: "chiese",
    indirizzo: "Piazzale San Francesco — Modena",
    descrizione: "Chiesa gotica tra le più amate dai modenesi per le esequie, con ampia capienza.",
    servizi: servChiesa, telefono: "059 222 042", orari: "7:00 – 12:30 · 15:00 – 19:30", x: 402, y: 246,
  },
  {
    id: "l-santagostino", nome: "Chiesa di Sant'Agostino", categoria: "chiese",
    indirizzo: "Via Emilia Centro, 315 — Modena",
    descrizione: "La «Pantheon degli Estensi» in pieno centro storico, affacciata su Largo Sant'Agostino.",
    servizi: servChiesa, telefono: "059 236 511", orari: "8:00 – 12:00 · 16:00 – 19:00", x: 426, y: 258,
  },
  {
    id: "l-sanvincenzo", nome: "Chiesa di San Vincenzo", categoria: "chiese",
    indirizzo: "Corso Canalgrande — Modena",
    descrizione: "Chiesa barocca annessa all'ex convento dei Teatini, luogo di forte raccoglimento.",
    servizi: servChiesa, telefono: "059 217 411", orari: "8:00 – 18:30", x: 444, y: 220,
  },
  {
    id: "l-sangiuseppe", nome: "Chiesa di San Giuseppe", categoria: "chiese",
    indirizzo: "Via San Giuseppe — Modena",
    descrizione: "Parrocchia del quartiere ovest, punto di riferimento per le famiglie della zona.",
    servizi: servChiesa, telefono: "059 333 710", orari: "7:30 – 19:00", x: 392, y: 230,
  },
  {
    id: "l-sanpiox", nome: "Chiesa di San Pio X", categoria: "chiese",
    indirizzo: "Viale Gramsci, 78 — Modena",
    descrizione: "Parrocchia moderna del quartiere Crocetta, con sala del commiato attigua.",
    servizi: servChiesa, telefono: "059 306 222", orari: "8:00 – 19:30", x: 466, y: 252,
  },
  {
    id: "l-madonnina", nome: "Chiesa della Madonna Pellegrina", categoria: "chiese",
    indirizzo: "Via Panni, 202 — Modena",
    descrizione: "Santuario mariano molto frequentato, scelto spesso per il Santo Rosario e le esequie.",
    servizi: servChiesa, telefono: "059 355 118", orari: "6:30 – 19:30", x: 452, y: 270,
  },
  {
    id: "l-sanbiagio", nome: "Chiesa di San Biagio", categoria: "chiese",
    indirizzo: "Via del Voltone — Modena",
    descrizione: "Antica parrocchia del centro, sobria e raccolta, con sagrato accessibile.",
    servizi: servChiesa, telefono: "059 224 331", orari: "8:00 – 18:00", x: 386, y: 254,
  },
  {
    id: "l-sanfaustino", nome: "Chiesa di San Faustino", categoria: "chiese",
    indirizzo: "Piazza San Faustino — Modena",
    descrizione: "Parrocchia storica dell'omonimo quartiere, sede del Tempio monumentale dei caduti.",
    servizi: servChiesa, telefono: "059 218 633", orari: "7:30 – 12:00 · 16:00 – 19:00", x: 408, y: 212,
  },
  /* ---- Ospedali e case funerarie ---- */
  {
    id: "l-terracielo", nome: "Casa Funeraria Terracielo", categoria: "sanitarie",
    indirizzo: "Via Emilia Ovest, 1380 — Modena",
    descrizione: "Casa funeraria di riferimento per la città: quattro sale del commiato personalizzabili, tanatocosmesi e area di raccoglimento riservata alle famiglie.",
    servizi: ["Sale del commiato", "Tanatocosmesi", "Sala rinfreschi per famiglie", "Parcheggio interno"],
    telefono: "059 336 0142", orari: "Tutti i giorni 8:00 – 20:00", x: 296, y: 262,
  },
  {
    id: "l-policlinico", nome: "Ospedale Policlinico di Modena", categoria: "sanitarie",
    indirizzo: "Via del Pozzo, 71 — Modena",
    descrizione: "Presidio ospedaliero universitario. In caso di decesso, la salma è accolta nelle camere ardenti interne fino alla presa in carico dell'agenzia scelta.",
    servizi: ["Obitorio", "Medicina legale", "Assistenza spirituale multiconfessionale"],
    telefono: "059 422 2111", orari: "Camere ardenti 8:00 – 19:00", x: 474, y: 206,
  },
  {
    id: "l-baggiovara", nome: "Ospedale Civile di Baggiovara", categoria: "sanitarie",
    indirizzo: "Largo del Pozzo — Baggiovara, Modena",
    descrizione: "Ospedale Sant'Agostino–Estense: camere ardenti sobrie e raccolte per l'ultimo saluto prima della cerimonia, con accesso carro funebre dedicato.",
    servizi: ["Camere ardenti", "Veglia funebre", "Assistenza h24"],
    telefono: "059 396 1111", orari: "Camere ardenti 8:00 – 19:00", x: 336, y: 330,
  },
  /* ---- Luogo ortodosso ---- */
  {
    id: "l-sannicola", nome: "Chiesa Ortodossa Rumena di San Nicola", categoria: "ortodosso",
    indirizzo: "Viale Amendola — Modena",
    descrizione: "Parrocchia ortodossa rumena di Modena: celebrazione del funerale secondo la tradizione bizantina, con veglia (parastas) e divina liturgia. Il rito non prevede la cremazione.",
    servizi: ["Veglia funebre (parastas)", "Divina liturgia funebre", "Sacerdote di lingua rumena e italiana", "Cordoglio comunitario"],
    telefono: "059 877 620", orari: "Su appuntamento con il parroco", x: 452, y: 194,
  },
  /* ---- Luoghi musulmani ---- */
  {
    id: "l-repartoislamico", nome: "Reparto Islamico — Cimitero di San Cataldo", categoria: "musulmano",
    indirizzo: "Strada Cimitero San Cataldo — Modena",
    descrizione: "Area dedicata alla sepoltura secondo il rito islamico, con tombe orientate verso la qibla, nel rispetto della normativa comunale e delle tradizioni religiose.",
    servizi: ["Inumazione secondo la qibla", "Area dedicata", "Coordinamento con le moschee cittadine"],
    telefono: "059 826 115", orari: "Cimitero: tutti i giorni 8:00 – 17:30", x: 352, y: 186,
  },
  {
    id: "l-misericordia", nome: "Moschea La Misericordia (Masjid Ar-Rahma)", categoria: "musulmano",
    indirizzo: "Via Sgarzeria / Via delle Suore — Modena",
    descrizione: "Uno dei principali luoghi di culto islamici di Modena: qui si tiene la preghiera funebre collettiva (Ṣalāt al-Janāza) e il supporto spirituale alla famiglia.",
    servizi: ["Preghiera funebre (Ṣalāt al-Janāza)", "Sala per l'abluzione rituale", "Imam per le cerimonie"],
    telefono: "059 218 903", orari: "Aperta per le cinque preghiere quotidiane", x: 416, y: 272,
  },
  {
    id: "l-takwah", nome: "Moschea Takwah", categoria: "musulmano",
    indirizzo: "Via Canaletto Sud — Modena",
    descrizione: "Luogo di culto e centro comunitario nella zona est della città: accoglie la preghiera funebre e accompagna le famiglie nel percorso di commiato.",
    servizi: ["Preghiera funebre", "Lavaggio rituale su richiesta (Ghusl)", "Spazi per la veglia"],
    telefono: "059 309 447", orari: "Aperta per le cinque preghiere quotidiane", x: 486, y: 240,
  },
  {
    id: "l-turco", nome: "Centro Culturale Islamico Turco", categoria: "musulmano",
    indirizzo: "Via Pellegrino Munari — Modena",
    descrizione: "Centro culturale e religioso della comunità turca: supporto per il rimpatrio della salma e per le cerimonie secondo la tradizione.",
    servizi: ["Assistenza per il rimpatrio", "Preghiera funebre", "Contatti consolari"],
    telefono: "059 224 561", orari: "Tutti i giorni 9:00 – 21:00", x: 380, y: 196,
  },
];

export const CHIESE_CERIMONIA = LUOGHI.filter((l) => l.categoria === "chiese").map((l) => l.nome);

/* ---------------- MANIFESTI ---------------- */

export interface Pensiero {
  nome: string;
  relazione?: string;
  testo: string;
  quando: string;
}

export interface Manifesto {
  id: string;
  nome: string;
  anni: number;
  nascita: string;
  morte: string;
  comune: Comune;
  rito: "Cattolico" | "Musulmano" | "Civile";
  cameraArdente: { luogo: string; indirizzo: string; orari: string; indicazioni: string };
  funerale: { giorno: string; ora: string; luogo: string; indirizzo: string; dettagli: string };
  commiato: { tipo: "Tumulazione" | "Cremazione" | "Inumazione"; luogo: string; cimitero: string };
  agenzia: string;
  pubblicato: string;
  pensieri: Pensiero[];
}

export const MANIFESTI: Manifesto[] = [
  {
    id: "m-benassi", nome: "Anna Benassi ved. Corradi", anni: 87,
    nascita: "12 marzo 1938", morte: "9 febbraio 2026", comune: "Modena", rito: "Cattolico",
    cameraArdente: { luogo: "Casa Funeraria Terracielo — Sala «Gigli»", indirizzo: "Via Emilia Ovest, 1380 — Modena", orari: "Oggi 8:30 – 19:00 · domani dalle 8:00", indicazioni: "Parcheggio interno riservato, ingresso dal viale pedonale." },
    funerale: { giorno: "Giovedì 12 febbraio 2026", ora: "10:30", luogo: "Chiesa della Madonna Pellegrina", indirizzo: "Via Panni, 202 — Modena", dettagli: "Il Santo Rosario sarà recitato mercoledì alle 18:00 nella stessa chiesa." },
    commiato: { tipo: "Cremazione", luogo: "Tempio Crematorio di Modena", cimitero: "Cinerario del Cimitero di San Cataldo" },
    agenzia: "pecorari", pubblicato: "Oggi · 08:15",
    pensieri: [{ nome: "Famiglia Baraldi", relazione: "vicini di casa", testo: "Cara Anna, la tua gentilezza resterà con noi. Un abbraccio a tutta la famiglia.", quando: "2 ore fa" }],
  },
  {
    id: "m-benyoussef", nome: "Omar Ben Youssef", anni: 74,
    nascita: "3 giugno 1951", morte: "10 febbraio 2026", comune: "Modena", rito: "Musulmano",
    cameraArdente: { luogo: "Sala del Commiato — Casa Funeraria Terracielo", indirizzo: "Via Emilia Ovest, 1380 — Modena", orari: "Oggi 9:00 – 12:30", indicazioni: "Preparazione rituale (Ghusl) a cura della comunità, in forma riservata." },
    funerale: { giorno: "Mercoledì 11 febbraio 2026", ora: "14:00", luogo: "Preghiera funebre (Ṣalāt al-Janāza) — Moschea La Misericordia", indirizzo: "Via Sgarzeria / Via delle Suore — Modena", dettagli: "La comunità è invitata alla preghiera; la cerimonia si terrà in forma sobria." },
    commiato: { tipo: "Inumazione", luogo: "Reparto Islamico", cimitero: "Cimitero di San Cataldo — Modena" },
    agenzia: "borsari", pubblicato: "Oggi · 09:40",
    pensieri: [{ nome: "Comunità Masjid Ar-Rahma", testo: "Che Allah gli conceda la Sua misericordia. Vicini alla famiglia Ben Youssef.", quando: "1 ora fa" }],
  },
  {
    id: "m-malagoli", nome: "Giuseppe Malagoli", anni: 91,
    nascita: "28 gennaio 1935", morte: "8 febbraio 2026", comune: "Nonantola", rito: "Cattolico",
    cameraArdente: { luogo: "Camera Ardente Comunale di Nonantola", indirizzo: "Via Guglielmo Marconi — Nonantola", orari: "Tutti i giorni 8:00 – 19:30", indicazioni: "Accesso dal cortile interno, ascensore per il primo piano." },
    funerale: { giorno: "Mercoledì 11 febbraio 2026", ora: "15:00", luogo: "Abbazia di San Silvestro", indirizzo: "Piazza Abbazia — Nonantola", dettagli: "Il corteo partirà dalla camera ardente alle 14:40." },
    commiato: { tipo: "Tumulazione", luogo: "Tomba di famiglia", cimitero: "Cimitero di Nonantola" },
    agenzia: "pecorari", pubblicato: "Ieri · 17:05",
    pensieri: [
      { nome: "Carlo e Franca", relazione: "amici di una vita", testo: "Beppe, le partite a carte al bar non saranno più le stesse. Riposa in pace.", quando: "5 ore fa" },
      { nome: "Sez. ANPI Nonantola", testo: "Salutiamo un compagno sempre presente. Onore alla sua memoria.", quando: "3 ore fa" },
    ],
  },
  {
    id: "m-benatti", nome: "Teresa Benatti in Golinelli", anni: 79,
    nascita: "17 aprile 1946", morte: "9 febbraio 2026", comune: "Nonantola", rito: "Cattolico",
    cameraArdente: { luogo: "Abitazione della famiglia", indirizzo: "Via Provinciale Ovest, 42 — Nonantola", orari: "Oggi 10:00 – 18:00", indicazioni: "La famiglia riceve le visite in forma riservata." },
    funerale: { giorno: "Giovedì 12 febbraio 2026", ora: "09:30", luogo: "Abbazia di San Silvestro", indirizzo: "Piazza Abbazia — Nonantola", dettagli: "Seguirà breve benedizione al cimitero." },
    commiato: { tipo: "Tumulazione", luogo: "Loculo n. 214 — campo 7", cimitero: "Cimitero di Nonantola" },
    agenzia: "pecorari", pubblicato: "Oggi · 07:50",
    pensieri: [],
  },
  {
    id: "m-zanasi", nome: "Franco Zanasi", anni: 84,
    nascita: "5 novembre 1941", morte: "7 febbraio 2026", comune: "Vignola", rito: "Civile",
    cameraArdente: { luogo: "Casa Funeraria Terracielo — Sala «Ulivi»", indirizzo: "Via Emilia Ovest, 1380 — Modena", orari: "Oggi e domani 8:30 – 19:00", indicazioni: "Sala con musica diffusa scelta dalla famiglia." },
    funerale: { giorno: "Giovedì 12 febbraio 2026", ora: "11:00", luogo: "Cerimonia civile — Sala del Commiato", indirizzo: "Cimitero di Vignola, Via per Modena — Vignola", dettagli: "Ricordo laico a cura del nipote Matteo; letture di Cesare Pavese." },
    commiato: { tipo: "Cremazione", luogo: "Tempio Crematorio di Modena", cimitero: "Cinerario del Cimitero di Vignola" },
    agenzia: "muratori", pubblicato: "Ieri · 15:20",
    pensieri: [{ nome: "Matteo", relazione: "nipote", testo: "Nonno, ci hai insegnato a guardare le stelle. Buon viaggio.", quando: "20 ore fa" }],
  },
  {
    id: "m-barbolini", nome: "Rina Barbolini ved. Losi", anni: 93,
    nascita: "2 febbraio 1932", morte: "10 febbraio 2026", comune: "Carpi", rito: "Cattolico",
    cameraArdente: { luogo: "Ospedale Ramazzini — Camera Ardente", indirizzo: "Via Guido Molinari, 2 — Carpi", orari: "Oggi 9:00 – 18:00", indicazioni: "Ingresso visitatori dal padiglione B." },
    funerale: { giorno: "Venerdì 13 febbraio 2026", ora: "10:00", luogo: "Chiesa di San Francesco (Carpi)", indirizzo: "Piazza Martiri — Carpi", dettagli: "La famiglia ringrazia il personale del reparto di geriatria." },
    commiato: { tipo: "Tumulazione", luogo: "Loculo di famiglia", cimitero: "Cimitero Urbano di Carpi" },
    agenzia: "salvioli", pubblicato: "Oggi · 10:30",
    pensieri: [],
  },
  {
    id: "m-ferrarini", nome: "Luigi Ferrarini", anni: 76,
    nascita: "22 settembre 1949", morte: "9 febbraio 2026", comune: "Formigine", rito: "Cattolico",
    cameraArdente: { luogo: "Casa Funeraria Terracielo — Sala «Rose»", indirizzo: "Via Emilia Ovest, 1380 — Modena", orari: "Oggi 14:00 – 19:00 · domani dalle 8:30", indicazioni: "Disponibile navetta dal centro di Formigine alle 9:15 di giovedì." },
    funerale: { giorno: "Giovedì 12 febbraio 2026", ora: "14:30", luogo: "Chiesa Parrocchiale di San Bartolomeo", indirizzo: "Via San Bartolomeo — Formigine", dettagli: "Rosario mercoledì alle 20:30 nella chiesa parrocchiale." },
    commiato: { tipo: "Cremazione", luogo: "Tempio Crematorio di Modena", cimitero: "Cinerario del Cimitero di Formigine" },
    agenzia: "sanmartino", pubblicato: "Oggi · 11:10",
    pensieri: [{ nome: "G.S. Formiginese", testo: "Ciao Gigi, dirigente e amico di tutti noi. Il campo ti ricorderà sempre.", quando: "40 minuti fa" }],
  },
  {
    id: "m-caselgrandi", nome: "Elena Caselgrandi in Ferrari", anni: 68,
    nascita: "30 maggio 1957", morte: "10 febbraio 2026", comune: "Sassuolo", rito: "Cattolico",
    cameraArdente: { luogo: "Ospedale di Sassuolo — Camera Ardente", indirizzo: "Via Francesco Ruini, 2 — Sassuolo", orari: "Oggi 8:30 – 18:30", indicazioni: "Obitorio piano terra, seguire la segnaletica interna." },
    funerale: { giorno: "Giovedì 12 febbraio 2026", ora: "15:30", luogo: "Chiesa di San Giorgio", indirizzo: "Piazza Garibaldi — Sassuolo", dettagli: "Le offerte raccolte saranno devolute all'Hospice di Sassuolo." },
    commiato: { tipo: "Tumulazione", luogo: "Loculo n. 87 — campo 3", cimitero: "Cimitero di Sassuolo" },
    agenzia: "depietri", pubblicato: "Oggi · 12:05",
    pensieri: [{ nome: "Le colleghe della ceramica Marazzi", testo: "Elena, trent'anni di sorrisi in reparto. Non ti dimenticheremo.", quando: "15 minuti fa" }],
  },
  {
    id: "m-barbieri", nome: "Maria Carla Barbieri in Venturi", anni: 82,
    nascita: "11 luglio 1943", morte: "8 febbraio 2026", comune: "Modena", rito: "Cattolico",
    cameraArdente: { luogo: "Camere Ardenti — Ospedale di Baggiovara", indirizzo: "Largo del Pozzo — Baggiovara, Modena", orari: "Tutti i giorni 8:00 – 19:00", indicazioni: "Accesso pedonale dal corpo C, reparto obitorio." },
    funerale: { giorno: "Mercoledì 11 febbraio 2026", ora: "09:00", luogo: "Abbazia di San Pietro", indirizzo: "Largo San Pietro — Modena", dettagli: "La cerimonia sarà accompagnata dal coro parrocchiale." },
    commiato: { tipo: "Cremazione", luogo: "Tempio Crematorio di Modena", cimitero: "Cinerario del Cimitero di San Cataldo" },
    agenzia: "pecorari", pubblicato: "Ieri · 18:45",
    pensieri: [{ nome: "Nipote Silvia", testo: "Grazie per ogni domenica insieme, nonna. Ti porterò sempre nel cuore.", quando: "12 ore fa" }],
  },
];

/* ---------------- COMPOSIZIONI FLOREALI ---------------- */

export const FIORI = [
  { nome: "Composizione di gigli bianchi", prezzo: 120 },
  { nome: "Cuscino di fiori di stagione", prezzo: 90 },
  { nome: "Corona floreale con nastro", prezzo: 180 },
  { nome: "Cesto bianco e verde", prezzo: 70 },
  { nome: "Mazzo di rose chiare", prezzo: 60 },
];

/* ---------------- ARCHIVIO PRATICHE (B2B) ---------------- */

export interface Pratica {
  id: string;
  numFattura: string;
  defunto: string;
  comune: string;
  data: string;
  rito: string;
  stato: "Completata" | "In corso";
  imponibile: number;
  agenzia: string;
  famiglia: string;
}

export const PRATICHE: Pratica[] = [
  { id: "p1", numFattura: "FT-2026/114", defunto: "Anna Benassi ved. Corradi", comune: "Modena", data: "12/02/2026", rito: "Cattolico", stato: "In corso", imponibile: 2850, agenzia: "pecorari", famiglia: "Famiglia Corradi — Modena" },
  { id: "p2", numFattura: "FT-2026/113", defunto: "Teresa Benatti in Golinelli", comune: "Nonantola", data: "12/02/2026", rito: "Cattolico", stato: "In corso", imponibile: 2850, agenzia: "pecorari", famiglia: "Famiglia Golinelli — Nonantola" },
  { id: "p3", numFattura: "FT-2026/112", defunto: "Giuseppe Malagoli", comune: "Nonantola", data: "11/02/2026", rito: "Cattolico", stato: "Completata", imponibile: 2850, agenzia: "pecorari", famiglia: "Eredi Malagoli — Nonantola" },
  { id: "p4", numFattura: "FT-2026/111", defunto: "Maria Carla Barbieri in Venturi", comune: "Modena", data: "11/02/2026", rito: "Cattolico", stato: "Completata", imponibile: 2640, agenzia: "pecorari", famiglia: "Famiglia Venturi — Modena" },
  { id: "p5", numFattura: "FT-2026/109", defunto: "Sergio Vandelli", comune: "Ravarino", data: "07/02/2026", rito: "Civile", stato: "Completata", imponibile: 2450, agenzia: "pecorari", famiglia: "Famiglia Vandelli — Ravarino" },
  { id: "p6", numFattura: "FT-2026/110", defunto: "Luigi Ferrarini", comune: "Formigine", data: "12/02/2026", rito: "Cattolico", stato: "In corso", imponibile: 2850, agenzia: "sanmartino", famiglia: "Famiglia Ferrarini — Formigine" },
  { id: "p7", numFattura: "FT-2026/108", defunto: "Omar Ben Youssef", comune: "Modena", data: "11/02/2026", rito: "Musulmano", stato: "In corso", imponibile: 2850, agenzia: "borsari", famiglia: "Famiglia Ben Youssef — Modena" },
  { id: "p8", numFattura: "FT-2026/107", defunto: "Franco Zanasi", comune: "Vignola", data: "12/02/2026", rito: "Civile", stato: "In corso", imponibile: 2320, agenzia: "muratori", famiglia: "Famiglia Zanasi — Vignola" },
  { id: "p9", numFattura: "FT-2026/106", defunto: "Rina Barbolini ved. Losi", comune: "Carpi", data: "13/02/2026", rito: "Cattolico", stato: "In corso", imponibile: 2850, agenzia: "salvioli", famiglia: "Famiglia Losi — Carpi" },
];

/* ---------------- ORDINI FIORI (B2B) ---------------- */

export interface OrdineFiori {
  id: string;
  defunto: string;
  comune: string;
  dataFunerale: string;
  composizione: string;
  importo: number;
  nastro?: string;
  cliente: { nome: string; email: string; telefono: string };
  stato: "Da evadere" | "Confermato";
  fatturaInviata: boolean;
  agenzia: string;
  canale: string;
}

export const ORDINI_INIZIALI: OrdineFiori[] = [
  {
    id: "ord-001", defunto: "Anna Benassi ved. Corradi", comune: "Modena", dataFunerale: "12/02/2026 · 10:30",
    composizione: "Corona floreale con nastro", importo: 180, nastro: "«Con affetto — i condomini di Via Lanzi»",
    cliente: { nome: "Paolo Manfredini", email: "p.manfredini@libero.it", telefono: "348 220 4417" },
    stato: "Confermato", fatturaInviata: true, agenzia: "pecorari", canale: "WhatsApp",
  },
  {
    id: "ord-002", defunto: "Giuseppe Malagoli", comune: "Nonantola", dataFunerale: "11/02/2026 · 15:00",
    composizione: "Cuscino di fiori di stagione", importo: 90, nastro: "«Ciao Beppe — gli amici del bar»",
    cliente: { nome: "Rita Sacchetti", email: "rita.sacchetti@gmail.com", telefono: "333 871 2290" },
    stato: "Da evadere", fatturaInviata: false, agenzia: "pecorari", canale: "Sito Vicini",
  },
  {
    id: "ord-003", defunto: "Anna Benassi ved. Corradi", comune: "Modena", dataFunerale: "12/02/2026 · 10:30",
    composizione: "Composizione di gigli bianchi", importo: 120,
    cliente: { nome: "Ditta Baraldi Costruzioni", email: "amministrazione@baraldicostruzioni.it", telefono: "059 455 8090" },
    stato: "Da evadere", fatturaInviata: false, agenzia: "pecorari", canale: "Sito Vicini",
  },
  {
    id: "ord-004", defunto: "Luigi Ferrarini", comune: "Formigine", dataFunerale: "12/02/2026 · 14:30",
    composizione: "Mazzo di rose chiare", importo: 60,
    cliente: { nome: "Anna Prandini", email: "anna.prandini@pec.it", telefono: "329 004 5561" },
    stato: "Confermato", fatturaInviata: false, agenzia: "sanmartino", canale: "Sito Vicini",
  },
];

/* ---------------- COSTANTI ---------------- */

export type Rito = "Cattolico" | "Civile" | "Musulmano" | "Ortodosso";
export const RITI: Rito[] = ["Cattolico", "Civile", "Musulmano", "Ortodosso"];

export const MOSCHEE = [
  "Moschea La Misericordia (Masjid Ar-Rahma)",
  "Moschea Takwah",
  "Centro Culturale Islamico Turco",
];

export const PAESI_RIMPATRIO = [
  "Albania", "Argentina", "Brasile", "Cina", "Ecuador", "Egitto", "Ghana", "India",
  "Marocco", "Moldavia", "Nigeria", "Pakistan", "Perù", "Romania", "Senegal",
  "Tunisia", "Ucraina", "Altro Paese",
];

export const REPERIBILITA = "059 203 4060";
export const URL_BASE = "vicini.mo";

export const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
