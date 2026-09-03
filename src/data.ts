/* ============================================================
   VICINI — dati della piattaforma (Provincia di Modena)
   ============================================================ */

export type Comune = "Modena" | "Nonantola" | "Vignola" | "Carpi" | "Formigine" | "Sassuolo";

export const COMUNI: Comune[] = ["Modena", "Nonantola", "Vignola", "Carpi", "Formigine", "Sassuolo"];

export type Rito = "Cattolico" | "Civile / Ateo" | "Musulmano" | "Ortodosso" | "Altro";
export const RITI: Rito[] = ["Cattolico", "Civile / Ateo", "Musulmano", "Ortodosso", "Altro"];

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

export interface Luogo {
  id: string;
  nome: string;
  categoria: "sanitarie" | "musulmano";
  indirizzo: string;
  descrizione: string;
  servizi: string[];
  telefono: string;
  orari: string;
  x: number;
  y: number;
}

export interface Agenzia {
  id: string;
  nome: string;
  indirizzo: string;
  descrizione: string;
  telefono: string;
  email: string;
  comuni: string[];
  principale?: boolean;
}

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

/* ---------------- AGENZIE PARTNER (ordine di priorità) ---------------- */

export const AGENZIE: Agenzia[] = [
  {
    id: "pecorari",
    nome: "Onoranze Funebri Pecorari",
    indirizzo: "Via Nonantolana, 555 — 41122 Modena (MO)",
    descrizione:
      "Opera nei comuni di Modena, Nonantola e Ravarino organizzando funerali completi con serietà e discrezione.",
    telefono: "059 364 218",
    email: "info@onoranzefunebripecorari.it",
    comuni: ["Modena", "Nonantola", "Ravarino"],
    principale: true,
  },
  {
    id: "sanmartino",
    nome: "Onoranze Funebri San Martino",
    indirizzo: "Via Don Adelmo Martinelli, 23 — 41043 Formigine (MO)",
    descrizione: "Servizio 24h per cerimonie complete dalla preparazione e vestizione al trasporto.",
    telefono: "059 512 340",
    email: "info@onoranzesanmartino.it",
    comuni: ["Formigine", "Modena"],
  },
  {
    id: "borsari",
    nome: "Onoranze Funebri Borsari",
    indirizzo: "Strada Cimitero San Cataldo, 131 — 41123 Modena (MO)",
    descrizione: "Servizio discreto e professionale h24 con sede a San Cataldo.",
    telefono: "059 826 115",
    email: "segreteria@onoranziborsari.it",
    comuni: ["Modena"],
  },
  {
    id: "farri",
    nome: "Onoranze Funebri Farri",
    indirizzo: "Viale Gaetano Moreali, 229 — 41124 Modena (MO)",
    descrizione: "Supporto completo per l'organizzazione del funerale nel momento del lutto.",
    telefono: "059 301 577",
    email: "info@onoranzefarri.it",
    comuni: ["Modena", "Formigine"],
  },
  {
    id: "gibellini",
    nome: "Onoranze Funebri Gianni Gibellini",
    indirizzo: "Via del Pozzo, 101/a — 41124 Modena (MO)",
    descrizione: "Impresa di onoranze funebri che offre servizi per l'organizzazione di funerali completi.",
    telefono: "059 373 892",
    email: "gibellini@onoranzemodena.it",
    comuni: ["Modena"],
  },
];

export const agenziaById = (id: string) => AGENZIE.find((a) => a.id === id) ?? AGENZIE[0];

/* ---------------- MANIFESTI DI ESEMPIO ---------------- */

export const MANIFESTI: Manifesto[] = [
  {
    id: "m-benassi",
    nome: "Anna Benassi ved. Corradi",
    anni: 87,
    nascita: "12 marzo 1938",
    morte: "9 febbraio 2026",
    comune: "Modena",
    rito: "Cattolico",
    cameraArdente: {
      luogo: "Casa Funeraria Terracielo — Sala «Gigli»",
      indirizzo: "Via Emilia Ovest, 1380 — Modena",
      orari: "Oggi 8:30 – 19:00 · domani dalle 8:00",
      indicazioni: "Parcheggio interno riservato, ingresso dal viale pedonale.",
    },
    funerale: {
      giorno: "Giovedì 12 febbraio 2026",
      ora: "10:30",
      luogo: "Chiesa Parrocchiale della Madonnina",
      indirizzo: "Via Panni, 202 — Modena",
      dettagli: "Il Santo Rosario sarà recitato mercoledì alle 18:00 nella stessa chiesa.",
    },
    commiato: {
      tipo: "Cremazione",
      luogo: "Tempio Crematorio di Modena",
      cimitero: "Cinerario del Cimitero di San Cataldo",
    },
    agenzia: "pecorari",
    pubblicato: "Oggi · 08:15",
    pensieri: [
      {
        nome: "Famiglia Baraldi",
        relazione: "vicini di casa",
        testo: "Cara Anna, la tua gentilezza resterà con noi. Un abbraccio a tutta la famiglia.",
        quando: "2 ore fa",
      },
    ],
  },
  {
    id: "m-benyoussef",
    nome: "Omar Ben Youssef",
    anni: 74,
    nascita: "3 giugno 1951",
    morte: "10 febbraio 2026",
    comune: "Modena",
    rito: "Musulmano",
    cameraArdente: {
      luogo: "Sala del Commiato — Casa Funeraria Terracielo",
      indirizzo: "Via Emilia Ovest, 1380 — Modena",
      orari: "Oggi 9:00 – 12:30",
      indicazioni: "Preparazione rituale (Ghusl) a cura della comunità, in forma riservata.",
    },
    funerale: {
      giorno: "Mercoledì 11 febbraio 2026",
      ora: "14:00",
      luogo: "Preghiera funebre (Ṣalāt al-Janāza) — Moschea La Misericordia (Masjid Ar-Rahma)",
      indirizzo: "Via Sgarzeria / Via delle Suore — Modena",
      dettagli: "La comunità è invitata alla preghiera; la cerimonia si terrà in forma sobria.",
    },
    commiato: {
      tipo: "Inumazione",
      luogo: "Reparto Islamico",
      cimitero: "Cimitero di San Cataldo — Strada Cimitero San Cataldo, Modena",
    },
    agenzia: "borsari",
    pubblicato: "Oggi · 09:40",
    pensieri: [
      {
        nome: "Comunità Masjid Ar-Rahma",
        testo: "Che Allah gli conceda la Sua misericordia. Vicini alla famiglia Ben Youssef.",
        quando: "1 ora fa",
      },
    ],
  },
  {
    id: "m-malagoli",
    nome: "Giuseppe Malagoli",
    anni: 91,
    nascita: "28 gennaio 1935",
    morte: "8 febbraio 2026",
    comune: "Nonantola",
    rito: "Cattolico",
    cameraArdente: {
      luogo: "Camera Ardente Comunale di Nonantola",
      indirizzo: "Via Guglielmo Marconi — Nonantola",
      orari: "Tutti i giorni 8:00 – 19:30",
      indicazioni: "Accesso dal cortile interno, ascensore per il primo piano.",
    },
    funerale: {
      giorno: "Mercoledì 11 febbraio 2026",
      ora: "15:00",
      luogo: "Abbazia di San Silvestro",
      indirizzo: "Piazza Abbazia — Nonantola",
      dettagli: "Il corteo partirà dalla camera ardente alle 14:40.",
    },
    commiato: {
      tipo: "Tumulazione",
      luogo: "Tomba di famiglia",
      cimitero: "Cimitero di Nonantola",
    },
    agenzia: "pecorari",
    pubblicato: "Ieri · 17:05",
    pensieri: [
      {
        nome: "Carlo e Franca",
        relazione: "amici di una vita",
        testo: "Beppe, le partite a carte al bar non saranno più le stesse. Riposa in pace.",
        quando: "5 ore fa",
      },
      {
        nome: "Sez. ANPI Nonantola",
        testo: "Salutiamo un compagno sempre presente. Onore alla sua memoria.",
        quando: "3 ore fa",
      },
    ],
  },
  {
    id: "m-benatti",
    nome: "Teresa Benatti in Golinelli",
    anni: 79,
    nascita: "17 aprile 1946",
    morte: "9 febbraio 2026",
    comune: "Nonantola",
    rito: "Cattolico",
    cameraArdente: {
      luogo: "Abitazione della famiglia",
      indirizzo: "Via Provinciale Ovest, 42 — Nonantola",
      orari: "Oggi 10:00 – 18:00",
      indicazioni: "La famiglia riceve le visite in forma riservata.",
    },
    funerale: {
      giorno: "Giovedì 12 febbraio 2026",
      ora: "09:30",
      luogo: "Abbazia di San Silvestro",
      indirizzo: "Piazza Abbazia — Nonantola",
      dettagli: "Seguirà breve benedizione al cimitero.",
    },
    commiato: {
      tipo: "Tumulazione",
      luogo: "Loculo n. 214 — campo 7",
      cimitero: "Cimitero di Nonantola",
    },
    agenzia: "pecorari",
    pubblicato: "Oggi · 07:50",
    pensieri: [],
  },
  {
    id: "m-zanasi",
    nome: "Franco Zanasi",
    anni: 84,
    nascita: "5 novembre 1941",
    morte: "7 febbraio 2026",
    comune: "Vignola",
    rito: "Civile",
    cameraArdente: {
      luogo: "Casa Funeraria Terracielo — Sala «Ulivi»",
      indirizzo: "Via Emilia Ovest, 1380 — Modena",
      orari: "Oggi e domani 8:30 – 19:00",
      indicazioni: "Sala con musica diffusa scelta dalla famiglia.",
    },
    funerale: {
      giorno: "Giovedì 12 febbraio 2026",
      ora: "11:00",
      luogo: "Cerimonia civile — Sala del Commiato",
      indirizzo: "Cimitero di Vignola, Via per Modena — Vignola",
      dettagli: "Ricordo laico a cura del nipote Matteo; letture di Cesare Pavese.",
    },
    commiato: {
      tipo: "Cremazione",
      luogo: "Tempio Crematorio di Modena",
      cimitero: "Cinerario del Cimitero di Vignola",
    },
    agenzia: "gibellini",
    pubblicato: "Ieri · 15:20",
    pensieri: [
      {
        nome: "Matteo",
        relazione: "nipote",
        testo: "Nonno, ci hai insegnato a guardare le stelle. Buon viaggio.",
        quando: "20 ore fa",
      },
    ],
  },
  {
    id: "m-barbolini",
    nome: "Rina Barbolini ved. Losi",
    anni: 93,
    nascita: "2 febbraio 1932",
    morte: "10 febbraio 2026",
    comune: "Carpi",
    rito: "Cattolico",
    cameraArdente: {
      luogo: "Ospedale Ramazzini — Camera Ardente",
      indirizzo: "Via Guido Molinari, 2 — Carpi",
      orari: "Oggi 9:00 – 18:00",
      indicazioni: "Ingresso visitatori dal padiglione B.",
    },
    funerale: {
      giorno: "Venerdì 13 febbraio 2026",
      ora: "10:00",
      luogo: "Chiesa di San Francesco",
      indirizzo: "Piazza Martiri — Carpi",
      dettagli: "La famiglia ringrazia il personale del reparto di geriatria.",
    },
    commiato: {
      tipo: "Tumulazione",
      luogo: "Loculo di famiglia",
      cimitero: "Cimitero Urbano di Carpi",
    },
    agenzia: "farri",
    pubblicato: "Oggi · 10:30",
    pensieri: [],
  },
  {
    id: "m-ferrarini",
    nome: "Luigi Ferrarini",
    anni: 76,
    nascita: "22 settembre 1949",
    morte: "9 febbraio 2026",
    comune: "Formigine",
    rito: "Cattolico",
    cameraArdente: {
      luogo: "Casa Funeraria Terracielo — Sala «Rose»",
      indirizzo: "Via Emilia Ovest, 1380 — Modena",
      orari: "Oggi 14:00 – 19:00 · domani dalle 8:30",
      indicazioni: "Disponibile navetta dal centro di Formigine alle 9:15 di giovedì.",
    },
    funerale: {
      giorno: "Giovedì 12 febbraio 2026",
      ora: "14:30",
      luogo: "Chiesa Parrocchiale di San Bartolomeo",
      indirizzo: "Via San Bartolomeo — Formigine",
      dettagli: "Rosario mercoledì alle 20:30 nella chiesa parrocchiale.",
    },
    commiato: {
      tipo: "Cremazione",
      luogo: "Tempio Crematorio di Modena",
      cimitero: "Cinerario del Cimitero di Formigine",
    },
    agenzia: "sanmartino",
    pubblicato: "Oggi · 11:10",
    pensieri: [
      {
        nome: "G.S. Formiginese",
        testo: "Ciao Gigi, dirigente e amico di tutti noi. Il campo ti ricorderà sempre.",
        quando: "40 minuti fa",
      },
    ],
  },
  {
    id: "m-caselgrandi",
    nome: "Elena Caselgrandi in Ferrari",
    anni: 68,
    nascita: "30 maggio 1957",
    morte: "10 febbraio 2026",
    comune: "Sassuolo",
    rito: "Cattolico",
    cameraArdente: {
      luogo: "Ospedale di Sassuolo — Camera Ardente",
      indirizzo: "Via Francesco Ruini, 2 — Sassuolo",
      orari: "Oggi 8:30 – 18:30",
      indicazioni: "Obitorio piano terra, seguire la segnaletica interna.",
    },
    funerale: {
      giorno: "Giovedì 12 febbraio 2026",
      ora: "15:30",
      luogo: "Chiesa di San Giorgio",
      indirizzo: "Piazza Garibaldi — Sassuolo",
      dettagli: "Le offerte raccolte saranno devolute all'Hospice di Sassuolo.",
    },
    commiato: {
      tipo: "Tumulazione",
      luogo: "Loculo n. 87 — campo 3",
      cimitero: "Cimitero di Sassuolo",
    },
    agenzia: "farri",
    pubblicato: "Oggi · 12:05",
    pensieri: [
      {
        nome: "Le colleghe della ceramica Marazzi",
        testo: "Elena, trent'anni di sorrisi in reparto. Non ti dimenticheremo.",
        quando: "15 minuti fa",
      },
    ],
  },
  {
    id: "m-barbieri",
    nome: "Maria Carla Barbieri in Venturi",
    anni: 82,
    nascita: "11 luglio 1943",
    morte: "8 febbraio 2026",
    comune: "Modena",
    rito: "Cattolico",
    cameraArdente: {
      luogo: "Camere Ardenti — Ospedale di Baggiovara",
      indirizzo: "Largo del Pozzo — Baggiovara, Modena",
      orari: "Tutti i giorni 8:00 – 19:00",
      indicazioni: "Accesso pedonale dal corpo C, reparto obitorio.",
    },
    funerale: {
      giorno: "Mercoledì 11 febbraio 2026",
      ora: "09:00",
      luogo: "Chiesa di San Pietro Apostolo",
      indirizzo: "Largo San Pietro — Modena",
      dettagli: "La cerimonia sarà accompagnata dal coro parrocchiale.",
    },
    commiato: {
      tipo: "Cremazione",
      luogo: "Tempio Crematorio di Modena",
      cimitero: "Cinerario del Cimitero di San Cataldo",
    },
    agenzia: "pecorari",
    pubblicato: "Ieri · 18:45",
    pensieri: [
      {
        nome: "Nipote Silvia",
        testo: "Grazie per ogni domenica insieme, nonna. Ti porterò sempre nel cuore.",
        quando: "12 ore fa",
      },
    ],
  },
];

/* ---------------- LUOGHI VICINI ---------------- */

export const LUOGHI: Luogo[] = [
  {
    id: "l-terracielo",
    nome: "Casa Funeraria Terracielo",
    categoria: "sanitarie",
    indirizzo: "Via Emilia Ovest, 1380 — Modena",
    descrizione:
      "Casa funeraria di riferimento per la città: quattro sale del commiato personalizzabili, spazio per la tanatocosmesi e un'area di raccoglimento riservata alle famiglie.",
    servizi: ["Sale del commiato", "Tanatocosmesi", "Sala rinfreschi per famiglie", "Parcheggio interno", "Accessibilità senza barriere"],
    telefono: "059 336 0142",
    orari: "Tutti i giorni 8:00 – 20:00",
    x: 318,
    y: 252,
  },
  {
    id: "l-policlinico",
    nome: "Ospedale Policlinico di Modena",
    categoria: "sanitarie",
    indirizzo: "Via del Pozzo, 71 — Modena",
    descrizione:
      "Presidio ospedaliero universitario. In caso di decesso presso la struttura, la salma viene accolta nelle camere ardenti interne fino alla presa in carico da parte dell'agenzia scelta dalla famiglia.",
    servizi: ["Obitorio", "Medicina legale", "Assistenza spirituale multiconfessionale", "Sportello denunce di morte"],
    telefono: "059 422 2111",
    orari: "Accesso camere ardenti 8:00 – 19:00",
    x: 462,
    y: 218,
  },
  {
    id: "l-camereardenti",
    nome: "Camere Ardenti Policlinico / Baggiovara",
    categoria: "sanitarie",
    indirizzo: "Largo del Pozzo — Modena · Ospedale Civile di Baggiovara",
    descrizione:
      "Camere ardenti dei due principali presidi cittadini: Policlinico (Via del Pozzo) e Ospedale Civile Sant'Agostino–Estense di Baggiovara. Locali sobri e raccolti per l'ultimo saluto prima della cerimonia.",
    servizi: ["Veglia funebre", "Spazi per la preghiera", "Assistenza del personale h24", "Accesso carro funebre"],
    telefono: "059 422 2111 · Baggiovara 059 396 1111",
    orari: "Tutti i giorni 8:00 – 19:00",
    x: 396,
    y: 300,
  },
  {
    id: "l-repartoislamico",
    nome: "Reparto Islamico — Cimitero di San Cataldo",
    categoria: "musulmano",
    indirizzo: "Strada Cimitero San Cataldo — Modena",
    descrizione:
      "Area dedicata alla sepoltura secondo il rito islamico, con orientamento delle tombe verso la qibla. L'inumazione avviene nel rispetto della normativa comunale e delle tradizioni religiose.",
    servizi: ["Inumazione secondo la qibla", "Area monumentale dedicata", "Coordinamento con le moschee cittadine", "Concessioni specifiche per la comunità"],
    telefono: "059 826 115 (agenzia Borsari, sede San Cataldo)",
    orari: "Cimitero: tutti i giorni 8:00 – 17:30",
    x: 372,
    y: 196,
  },
  {
    id: "l-misericordia",
    nome: "Moschea La Misericordia (Masjid Ar-Rahma)",
    categoria: "musulmano",
    indirizzo: "Via Sgarzeria / Via delle Suore — Modena",
    descrizione:
      "Uno dei principali luoghi di culto islamici di Modena. Qui si tiene la preghiera funebre collettiva (Ṣalāt al-Janāza) e il supporto spirituale alla famiglia del defunto.",
    servizi: ["Preghiera funebre (Ṣalāt al-Janāza)", "Sala per l'abluzione rituale", "Imam disponibile per le cerimonie", "Mediazione con la famiglia"],
    telefono: "059 218 903",
    orari: "Aperta per le cinque preghiere quotidiane",
    x: 428,
    y: 236,
  },
  {
    id: "l-takwah",
    nome: "Moschea Takwah",
    categoria: "musulmano",
    indirizzo: "Via Canaletto Sud — Modena",
    descrizione:
      "Luogo di culto e centro comunitario nella zona sud della città. Accoglie la preghiera funebre e offre accompagnamento alle famiglie nel percorso di commiato.",
    servizi: ["Preghiera funebre", "Lavaggio rituale su richiesta (Ghusl)", "Sostegno alla famiglia", "Spazi per la veglia"],
    telefono: "059 309 447",
    orari: "Aperta per le cinque preghiere quotidiane",
    x: 452,
    y: 262,
  },
  {
    id: "l-turco",
    nome: "Centro Culturale Islamico Turco",
    categoria: "musulmano",
    indirizzo: "Via Pellegrino Munari — Modena",
    descrizione:
      "Centro culturale e religioso della comunità turca di Modena: supporto per le pratiche di rimpatrio della salma e per le cerimonie secondo la tradizione.",
    servizi: ["Assistenza per il rimpatrio in Turchia", "Preghiera funebre", "Contatti con le autorità consolari", "Traduzione e mediazione"],
    telefono: "059 224 561",
    orari: "Tutti i giorni 9:00 – 21:00",
    x: 414,
    y: 210,
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

export const PRATICHE: Pratica[] = [
  { id: "p1", numFattura: "FT-2026/114", defunto: "Anna Benassi ved. Corradi", comune: "Modena", data: "12/02/2026", rito: "Cattolico", stato: "In corso", imponibile: 2850, agenzia: "pecorari", famiglia: "Famiglia Corradi — Modena" },
  { id: "p2", numFattura: "FT-2026/113", defunto: "Teresa Benatti in Golinelli", comune: "Nonantola", data: "12/02/2026", rito: "Cattolico", stato: "In corso", imponibile: 2850, agenzia: "pecorari", famiglia: "Famiglia Golinelli — Nonantola" },
  { id: "p3", numFattura: "FT-2026/112", defunto: "Giuseppe Malagoli", comune: "Nonantola", data: "11/02/2026", rito: "Cattolico", stato: "Completata", imponibile: 2850, agenzia: "pecorari", famiglia: "Eredi Malagoli — Nonantola" },
  { id: "p4", numFattura: "FT-2026/111", defunto: "Maria Carla Barbieri in Venturi", comune: "Modena", data: "11/02/2026", rito: "Cattolico", stato: "Completata", imponibile: 2640, agenzia: "pecorari", famiglia: "Famiglia Venturi — Modena" },
  { id: "p5", numFattura: "FT-2026/109", defunto: "Sergio Vandelli", comune: "Ravarino", data: "07/02/2026", rito: "Civile", stato: "Completata", imponibile: 2450, agenzia: "pecorari", famiglia: "Famiglia Vandelli — Ravarino" },
  { id: "p6", numFattura: "FT-2026/110", defunto: "Luigi Ferrarini", comune: "Formigine", data: "12/02/2026", rito: "Cattolico", stato: "In corso", imponibile: 2850, agenzia: "sanmartino", famiglia: "Famiglia Ferrarini — Formigine" },
  { id: "p7", numFattura: "FT-2026/108", defunto: "Omar Ben Youssef", comune: "Modena", data: "11/02/2026", rito: "Musulmano", stato: "In corso", imponibile: 2850, agenzia: "borsari", famiglia: "Famiglia Ben Youssef — Modena" },
  { id: "p8", numFattura: "FT-2026/107", defunto: "Franco Zanasi", comune: "Vignola", data: "12/02/2026", rito: "Civile", stato: "In corso", imponibile: 2320, agenzia: "gibellini", famiglia: "Famiglia Zanasi — Vignola" },
  { id: "p9", numFattura: "FT-2026/106", defunto: "Rina Barbolini ved. Losi", comune: "Carpi", data: "13/02/2026", rito: "Cattolico", stato: "In corso", imponibile: 2850, agenzia: "farri", famiglia: "Famiglia Losi — Carpi" },
];

/* ---------------- ORDINI FIORI (B2B) ---------------- */

export const ORDINI_INIZIALI: OrdineFiori[] = [
  {
    id: "ord-001",
    defunto: "Anna Benassi ved. Corradi",
    comune: "Modena",
    dataFunerale: "12/02/2026 · 10:30",
    composizione: "Corona floreale con nastro",
    importo: 180,
    nastro: "«Con affetto — i condomini di Via Lanzi»",
    cliente: { nome: "Paolo Manfredini", email: "p.manfredini@libero.it", telefono: "348 220 4417" },
    stato: "Confermato",
    fatturaInviata: true,
    agenzia: "pecorari",
    canale: "WhatsApp",
  },
  {
    id: "ord-002",
    defunto: "Giuseppe Malagoli",
    comune: "Nonantola",
    dataFunerale: "11/02/2026 · 15:00",
    composizione: "Cuscino di fiori di stagione",
    importo: 90,
    nastro: "«Ciao Beppe — gli amici del bar»",
    cliente: { nome: "Rita Sacchetti", email: "rita.sacchetti@gmail.com", telefono: "333 871 2290" },
    stato: "Da evadere",
    fatturaInviata: false,
    agenzia: "pecorari",
    canale: "Sito Vicini",
  },
  {
    id: "ord-003",
    defunto: "Anna Benassi ved. Corradi",
    comune: "Modena",
    dataFunerale: "12/02/2026 · 10:30",
    composizione: "Composizione di gigli bianchi",
    importo: 120,
    cliente: { nome: "Ditta Baraldi Costruzioni", email: "amministrazione@baraldicostruzioni.it", telefono: "059 455 8090" },
    stato: "Da evadere",
    fatturaInviata: false,
    agenzia: "pecorari",
    canale: "Sito Vicini",
  },
  {
    id: "ord-004",
    defunto: "Luigi Ferrarini",
    comune: "Formigine",
    dataFunerale: "12/02/2026 · 14:30",
    composizione: "Mazzo di rose chiare",
    importo: 60,
    cliente: { nome: "Anna Prandini", email: "anna.prandini@pec.it", telefono: "329 004 5561" },
    stato: "Confermato",
    fatturaInviata: false,
    agenzia: "sanmartino",
    canale: "Sito Vicini",
  },
];

/* ---------------- COSTANTI ---------------- */

export const REPERIBILITA = "059 203 4060";
export const URL_BASE = "vicini.mo";
export const IVA_ALIQUOTA = 0.1;

export const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

export const initials = (nome: string) =>
  nome
    .replace(/ved\.|in |don |dott\.|sig\./gi, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && /^[A-ZÀ-Ú]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
