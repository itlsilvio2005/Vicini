import { AGENZIE, FIORI, REPERIBILITA, eur } from '../data';

/* ============================================================================
   ASSISTENTE DI VICINI — risposte a domande frequenti dei visitatori.
   Nessuna intelligenza artificiale esterna: il testo scritto dall'utente resta
   nel browser, non viene inviato né salvato da nessuna parte.
   Le risposte sono informazioni GENERALI. Non sono consulenza legale: le regole
   concrete dipendono dal comune e le gestisce l'agenzia scelta dalla famiglia.
   ============================================================================ */

export interface Risposta {
  id: string;
  testo: string;
  link?: { etichetta: string; to: string }[];
  seguiti?: string[]; // domande suggerite dopo la risposta
}

interface Argomento {
  id: string;
  /* radici di parole, già senza accenti e in minuscolo; peso = lunghezza della frase */
  parole: string[];
  rispondi: (testo: string) => Risposta;
}

/* Domande rapide mostrate all'apertura (etichetta = testo che "scrive" il visitatore). */
export const DOMANDE_RAPIDE = [
  'È appena morto un familiare, cosa devo fare?',
  'Quali documenti servono?',
  'Quanto costa un funerale?',
  'Come posso mandare dei fiori?',
  'Come lascio un pensiero per la famiglia?',
  'Quali agenzie ci sono nella mia zona?',
];

export const normalizza = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const COMUNI_GRUPPI: Record<string, string> = {
  modena: 'modena',
  formigine: 'formigine',
  carpi: 'carpi',
  sassuolo: 'sassuolo',
  vignola: 'vignola-nonantola',
  nonantola: 'vignola-nonantola',
};

const NOMI_COMUNI: Record<string, string> = {
  modena: 'Modena',
  formigine: 'Formigine',
  carpi: 'Carpi',
  sassuolo: 'Sassuolo',
  vignola: 'Vignola',
  nonantola: 'Nonantola',
};

const FOOTER_AGENZIA =
  'L’agenzia che scegli segue per te le pratiche e può darti i dettagli per il tuo comune.';

const ARGOMENTI: Argomento[] = [
  {
    id: 'emergenza-persona',
    parole: ['voglio morire', 'farla finita', 'togliermi la vita', 'uccidermi', 'suicid', 'non voglio piu vivere'],
    rispondi: () => ({
      id: 'emergenza-persona',
      testo:
        'Mi dispiace molto che tu stia soffrendo così. Non devi affrontarlo da solo/a.\n\nSe sei in pericolo adesso, chiama il 112 (numero unico di emergenza). Puoi anche parlare con una persona al Telefono Amico Italia: 02 2327 2327, oppure rivolgerti al tuo medico o al pronto soccorso più vicino.\n\nSe c’è qualcuno vicino a te, dillo anche a lui/lei: stare insieme aiuta.',
    }),
  },
  {
    id: 'primi-passi',
    parole: [
      'appena morto', 'appena mancato', 'e morto', 'e morta', 'morto ieri', 'morta ieri', 'deceduto', 'deceduta', 'e mancato', 'e mancata',
      'cosa devo fare', 'cosa fare', 'primi passi', 'da dove inizio', 'da dove comincio', 'si e spento', 'si e spenta', 'lutto', 'decesso',
    ],
    rispondi: () => ({
      id: 'primi-passi',
      testo:
        'Mi dispiace per la vostra perdita. In generale, i primi passi sono questi:\n\n1. Se il decesso è avvenuto in casa, chiama il medico curante o il 118: il medico deve constatare il decesso e rilasciare la documentazione.\n2. Contatta un’agenzia funebre: molte sono raggiungibili a qualsiasi ora. Si occupa lei delle pratiche, del trasporto e dell’organizzazione.\n3. Tieni a portata di mano un documento d’identità e la tessera sanitaria della persona scomparsa.\n4. Non c’è bisogno di decidere tutto subito: rito, luogo e data si scelgono con l’agenzia, con calma.\n\nSono informazioni generali: per il tuo caso conta il comune e la situazione.',
      link: [{ etichetta: 'Vedi le agenzie del territorio', to: '/imprese' }],
      seguiti: ['Quali documenti servono?', 'Quanto costa un funerale?', 'Quali agenzie ci sono nella mia zona?'],
    }),
  },
  {
    id: 'documenti',
    parole: ['document', 'carta d identita', 'tessera sanitaria', 'certificato', 'serve per', 'servono', 'occorre', 'occorrono', 'pratiche', 'burocrazia'],
    rispondi: () => ({
      id: 'documenti',
      testo:
        'In genere servono: un documento d’identità e la tessera sanitaria della persona scomparsa, i dati anagrafici e, se ci sono, le volontà espresse (per esempio per la cremazione). Il certificato del medico che constata il decesso lo ottiene la famiglia tramite il medico stesso.\n\nIl resto (dichiarazioni al comune, autorizzazioni, permessi di trasporto) di solito lo gestisce l’agenzia: chiedile un elenco preciso per il tuo comune. ' +
        FOOTER_AGENZIA,
      seguiti: ['Come funziona la cremazione?', 'Quanto costa un funerale?'],
    }),
  },
  {
    id: 'costi',
    parole: ['costa', 'costo', 'costi', 'prezzo', 'prezzi', 'quanto si spende', 'spesa', 'preventivo', 'tariffe', 'quanto viene', 'economico', 'pagare'],
    rispondi: (testo) => {
      // "quanto costa mandare dei fiori?" riguarda il listino, non il funerale
      if (/\b(fior|coron|rose|gigli|cuscin|cesto|mazzo)/.test(normalizza(testo))) {
        return ARGOMENTI.find((a) => a.id === 'fiori')!.rispondi(testo);
      }
      return {
      id: 'costi',
      testo:
        'Non posso darti una cifra seria senza sapere cosa serve: il costo cambia molto con il rito, il tipo di cassa, il trasporto, la sepoltura o la cremazione, gli addobbi floreali e le tasse del comune.\n\nIl consiglio è di chiedere all’agenzia un preventivo scritto e dettagliato, voce per voce, e di confrontarlo anche con un’altra agenzia se vuoi. Un’agenzia seria te lo spiega senza fretta.\n\nPer i fiori, invece, i prezzi sono quelli del nostro listino (vedi “Come posso mandare dei fiori?”).',
      link: [{ etichetta: 'Contatta un’agenzia', to: '/imprese' }],
      seguiti: ['Come posso mandare dei fiori?'],
      };
    },
  },
  {
    id: 'tempi',
    parole: ['quando si fa', 'quando e il funerale', 'quanti giorni', 'quanto tempo', 'tempi', 'entro quando', 'quanto ci vuole', 'in quanto tempo', 'data del funerale'],
    rispondi: () => ({
      id: 'tempi',
      testo:
        'Di solito il funerale si tiene nel giro di alcuni giorni dal decesso, ma la data dipende da più cose: tempi previsti dalla legge, disponibilità della chiesa o della sala, del cimitero o del crematorio, e dalle esigenze dei familiari (anche chi arriva da lontano).\n\nL’agenzia ti propone una data e ti tiene aggiornato. Le cerimonie già fissate le trovi sulla Bacheca dei manifesti.',
      link: [{ etichetta: 'Apri la Bacheca manifesti', to: '/bacheca' }],
    }),
  },
  {
    id: 'cremazione',
    parole: ['cremazion', 'cremare', 'ceneri', 'urna', 'crematorio', 'sepoltura', 'inumazion', 'tumulazion', 'loculo', 'cimitero', 'terra o'],
    rispondi: () => ({
      id: 'cremazione',
      testo:
        'In breve:\n• Inumazione: sepoltura in terra.\n• Tumulazione: sepoltura in un loculo o in una tomba.\n• Cremazione: la salma viene cremata e le ceneri hanno una destinazione (cimitero, affidamento ai familiari o dispersione, nei casi e con le regole previsti).\n\nPer la cremazione servono un’autorizzazione e la volontà della persona (o dei familiari secondo le regole di legge). Le regole concrete variano con il comune: ' +
        FOOTER_AGENZIA +
        ' Se vuoi lasciare scritte le tue scelte, puoi farlo nella sezione Volontà.',
      link: [{ etichetta: 'Le mie volontà', to: '/volonta-nucleo' }],
      seguiti: ['Cosa sono le volontà anticipate?'],
    }),
  },
  {
    id: 'fiori',
    parole: ['fiori', 'fiore', 'corona', 'mazzo', 'cesto', 'composizione', 'cuscino', 'rose', 'gigli', 'ordinare', 'ordine', 'omaggio floreale', 'mandare fiori', 'inviare fiori'],
    rispondi: () => ({
      id: 'fiori',
      testo:
        'Puoi ordinare un omaggio floreale direttamente dalla pagina del manifesto della persona, nella Bacheca. Il listino attuale:\n' +
        FIORI.map((f) => `• ${f.nome}: ${eur(f.prezzo)}`).join('\n') +
        '\n\nPuoi aggiungere un nastro con una dedica. L’ordine viene preso in carico dall’agenzia che cura il funerale.',
      link: [{ etichetta: 'Vai alla Bacheca manifesti', to: '/bacheca' }],
      seguiti: ['Come lascio un pensiero per la famiglia?'],
    }),
  },
  {
    id: 'pensiero',
    parole: ['pensiero', 'pensieri', 'condoglianze', 'cordoglio', 'messaggio alla famiglia', 'scrivere alla famiglia', 'ricordo', 'dedica', 'vicinanza', 'lasciare un messaggio', 'scrivere un messaggio'],
    rispondi: () => ({
      id: 'pensiero',
      testo:
        'Apri il manifesto della persona dalla Bacheca e scrivi il tuo pensiero nello spazio dedicato: lo leggeranno la famiglia e chi segue il manifesto. Ti basta indicare il tuo nome e, se vuoi, il legame con la persona.\n\nI messaggi vengono controllati per evitare contenuti offensivi. Se il tuo non compare subito, riprova con parole più semplici o contatta l’agenzia.',
      link: [{ etichetta: 'Vai alla Bacheca manifesti', to: '/bacheca' }],
      seguiti: ['Come posso mandare dei fiori?'],
    }),
  },
  {
    id: 'manifesto',
    parole: ['manifesto', 'manifesti', 'bacheca', 'orario della cerimonia', 'dove si svolge', 'camera ardente', 'dove e il funerale', 'a che ora', 'cerimonia', 'trovare il funerale', 'chi e morto'],
    rispondi: () => ({
      id: 'manifesto',
      testo:
        'Nella Bacheca trovi i manifesti pubblicati dalle agenzie: nome, comune, camera ardente, luogo e orario della cerimonia. Puoi filtrare per comune.\n\nSe non trovi quello che cerchi, il manifesto potrebbe non essere ancora stato pubblicato: chiedilo alla famiglia o all’agenzia che segue il funerale.',
      link: [{ etichetta: 'Apri la Bacheca manifesti', to: '/bacheca' }],
    }),
  },
  {
    id: 'agenzie',
    parole: ['agenzia', 'agenzie', 'onoranze', 'impresa', 'imprese', 'telefono', 'numero', 'contatt', 'chiamare', 'nella mia zona', 'vicino a me', 'h24', 'reperibil'],
    rispondi: (testo) => {
      const n = normalizza(testo);
      const trovato = Object.keys(COMUNI_GRUPPI).find((c) => n.includes(c));
      if (trovato) {
        const lista = AGENZIE.filter((a) => a.gruppi.includes(COMUNI_GRUPPI[trovato]));
        if (lista.length) {
          return {
            id: 'agenzie',
            testo:
              `Agenzie che operano a ${NOMI_COMUNI[trovato]}:\n` +
              lista.map((a) => `• ${a.nome} — ${a.telefono}`).join('\n') +
              `\n\nTrovi indirizzi e dettagli nella sezione Imprese. Reperibilità Vicini: ${REPERIBILITA}.`,
            link: [{ etichetta: 'Vedi tutte le imprese', to: '/imprese' }],
          };
        }
      }
      return {
        id: 'agenzie',
        testo:
          'Nella sezione Imprese trovi le agenzie del territorio, raggruppate per comune, con indirizzo, telefono ed email. Scrivimi il tuo comune (Modena, Carpi, Sassuolo, Formigine, Vignola, Nonantola) e ti indico quelle della zona.\n\nReperibilità Vicini: ' +
          REPERIBILITA +
          '.',
        link: [{ etichetta: 'Vedi le imprese', to: '/imprese' }],
      };
    },
  },
  {
    id: 'volonta',
    parole: ['volonta', 'volonte', 'anticipate', 'pianificar', 'in anticipo', 'testamento', 'nucleo', 'familiari', 'lasciare scritto', 'per quando non ci saro'],
    rispondi: () => ({
      id: 'volonta',
      testo:
        'Nella sezione Volontà e Nucleo puoi lasciare scritte, con calma, le tue scelte: rito, sepoltura o cremazione, eventuale trasporto, note per i tuoi cari. Puoi anche indicare i familiari del tuo nucleo da avvisare.\n\nÈ un aiuto per chi resta: non dovrà indovinare cosa avresti voluto. Serve un account privato gratuito.',
      link: [{ etichetta: 'Le mie volontà', to: '/volonta-nucleo' }],
    }),
  },
  {
    id: 'riti',
    parole: ['rito', 'riti', 'cattolic', 'musulman', 'islam', 'ortodoss', 'civile', 'laico', 'religios', 'moschea', 'chiesa', 'imam', 'prete', 'parroco'],
    rispondi: () => ({
      id: 'riti',
      testo:
        'Sul sito sono previsti il rito cattolico, civile, musulmano e ortodosso. Ognuno ha le sue esigenze (luoghi, tempi, preparazione): l’agenzia le conosce e organizza insieme a te e alla comunità di riferimento.\n\nNella Mappa trovi chiese, moschee e altri luoghi del territorio.',
      link: [{ etichetta: 'Mappa e luoghi', to: '/mappa' }],
    }),
  },
  {
    id: 'trasporto',
    parole: ['rimpatrio', 'estero', 'trasporto', 'portare la salma', 'altro comune', 'fuori comune', 'altra citta', 'altro paese', 'paese d origine'],
    rispondi: () => ({
      id: 'trasporto',
      testo:
        'Il trasporto della salma in un altro comune o all’estero è possibile, ma richiede autorizzazioni e documenti specifici (che cambiano in base al Paese di destinazione). È una pratica che segue l’agenzia: dille subito che vorresti il rimpatrio, così può dirti tempi e costi.\n\nNella sezione Volontà puoi anche indicare in anticipo il luogo desiderato.',
      link: [{ etichetta: 'Contatta un’agenzia', to: '/imprese' }],
    }),
  },
  {
    id: 'sono-agenzia',
    parole: ['sono un agenzia', 'siamo un agenzia', 'registrare la mia agenzia', 'iscrivere agenzia', 'pubblicare manifesti', 'area riservata', 'accesso agenzia', 'diventare agenzia', 'unirmi a vicini', 'entrare in vicini'],
    rispondi: () => ({
      id: 'sono-agenzia',
      testo:
        'Le agenzie del territorio possono richiedere l’accesso all’area riservata dalla pagina di accesso (scheda “Agenzia”). La richiesta viene verificata a mano da Vicini: finché non è approvata, l’account resta un normale account privato.',
      link: [{ etichetta: 'Vai all’accesso', to: '/login' }],
    }),
  },
  {
    id: 'privacy',
    parole: ['privacy', 'dati personali', 'i miei dati', 'gdpr', 'cookie', 'tracciat'],
    rispondi: () => ({
      id: 'privacy',
      testo:
        'Questa chat funziona nel tuo browser: quello che scrivi qui non viene inviato né salvato da nessuna parte. I dati che lasci su Vicini (pensieri, ordini, account) servono al funzionamento del servizio. Per richieste sui tuoi dati scrivi a segreteria@vicini.mo.',
    }),
  },
  {
    id: 'chi-siamo',
    parole: ['cos e vicini', 'chi siete', 'cosa fate', 'cos e questo sito', 'a cosa serve', 'come funziona vicini', 'che cosa e'],
    rispondi: () => ({
      id: 'chi-siamo',
      testo:
        'Vicini è una piattaforma per il territorio di Modena: raccoglie i manifesti delle agenzie funebri, permette di lasciare un pensiero o un omaggio floreale, aiuta a trovare le imprese e i luoghi, e permette di lasciare scritte le proprie volontà.\n\nNon è un’agenzia funebre: i funerali li organizzano le agenzie del territorio.',
      link: [{ etichetta: 'Le imprese del luogo', to: '/imprese' }],
    }),
  },
  {
    id: 'saluto',
    parole: ['ciao', 'buongiorno', 'buonasera', 'salve', 'buonanotte', 'hey'],
    rispondi: () => ({
      id: 'saluto',
      testo: 'Ciao, sono l’assistente di Vicini. Posso darti informazioni generali sul sito e sui primi passi in caso di lutto. Cosa ti serve?',
      seguiti: DOMANDE_RAPIDE.slice(0, 3),
    }),
  },
  {
    id: 'grazie',
    parole: ['grazie', 'ti ringrazio', 'gentilissimo', 'perfetto grazie'],
    rispondi: () => ({
      id: 'grazie',
      testo: 'Di nulla. Se ti serve altro sono qui. Ti sono vicino in questo momento.',
    }),
  },
];

export function rispondi(testoUtente: string): Risposta {
  const n = ` ${normalizza(testoUtente)} `;
  let migliore: { a: Argomento; punti: number } | null = null;
  for (const a of ARGOMENTI) {
    let punti = 0;
    for (const p of a.parole) {
      if (n.includes(` ${p}`) || (p.length >= 5 && n.includes(p))) punti += p.split(' ').length + (p.length >= 7 ? 1 : 0);
    }
    if (punti > 0 && (!migliore || punti > migliore.punti)) migliore = { a, punti };
  }
  if (migliore) return migliore.a.rispondi(testoUtente);
  return {
    id: 'non-capito',
    testo:
      'Non sono sicuro di aver capito. Posso aiutarti su: primi passi dopo un lutto, documenti, costi, fiori e pensieri, manifesti, agenzie per comune, volontà anticipate.\n\nPer una situazione urgente o una domanda specifica è meglio sentire direttamente un’agenzia. Reperibilità Vicini: ' +
      REPERIBILITA +
      '.',
    link: [{ etichetta: 'Vedi le agenzie', to: '/imprese' }],
    seguiti: DOMANDE_RAPIDE.slice(0, 4),
  };
}
