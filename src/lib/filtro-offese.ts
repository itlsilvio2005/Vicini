// ============================================================================
// FILTRO ANTI-OFFESE PER PENSIERI E CORDOGLI
// ============================================================================
// Sistema di moderazione automatica per contenuti inappropriati

// Lista di parole e pattern da filtrare (in italiano)
const PAROLE_VIETATE = [
  // Parole offensive comuni
  'cazzo', 'cazz', 'stronzo', 'stronz', 'merda', 'merd',
  'vaffanculo', 'vaffan', 'fanculo', 'culo',
  'puttana', 'puttan', 'troia', 'troi', 'bastardo', 'bastard',
  'idiota', 'cretino', 'deficiente', 'ritardato',
  
  // Insulti diretti
  'ti odio', 'ti ammazzo', 'ti ammazz', 'muori',
  'vergognati', 'vergogn',
  
  // Linguaggio inappropriato al contesto
  'porn', 'sex', 'drog', 'alcol',
];

// Pattern regex per rilevare tentativi di elusione
const PATTERN_ELUSIONE = [
  /c[a@4][z2][z2]o/i,
  /str[o0]nz[o0]/i,
  /v[a@4]ff[a@4]ncul[o0]/i,
  /putt[a@4]n[a@4]/i,
];

// Lista di contesti sospetti (combinazioni di parole)
const CONTESTI_SOSPETTI = [
  'non merita',
  'se ne va',
  'finalmente',
  'meno male',
];

export interface RisultatoFiltro {
  approvato: boolean;
  motivo?: string;
  livello: 'ok' | 'sospetto' | 'bloccato';
}

/**
 * Filtra un testo per contenuti inappropriati
 * @param testo - Il testo da filtrare
 * @returns Oggetto con esito del filtro e motivo eventuale
 */
export function filtraTesto(testo: string): RisultatoFiltro {
  if (!testo || testo.trim().length === 0) {
    return { approvato: false, motivo: 'Il testo è vuoto', livello: 'bloccato' };
  }

  const testoLower = testo.toLowerCase();

  // Controllo 1: parole vietate esatte
  for (const parola of PAROLE_VIETATE) {
    if (testoLower.includes(parola)) {
      return {
        approvato: false,
        motivo: 'Il messaggio contiene linguaggio inappropriato',
        livello: 'bloccato',
      };
    }
  }

  // Controllo 2: pattern di elusione
  for (const pattern of PATTERN_ELUSIONE) {
    if (pattern.test(testo)) {
      return {
        approvato: false,
        motivo: 'Il messaggio contiene linguaggio inappropriato',
        livello: 'bloccato',
      };
    }
  }

  // Controllo 3: contesti sospetti (richiede moderazione umana)
  for (const contesto of CONTESTI_SOSPETTI) {
    if (testoLower.includes(contesto)) {
      return {
        approvato: false,
        motivo: 'Il messaggio potrebbe non essere appropriato al contesto e richiede verifica',
        livello: 'sospetto',
      };
    }
  }

  // Controllo 4: lunghezza minima
  if (testo.trim().length < 5) {
    return {
      approvato: false,
      motivo: 'Il messaggio è troppo breve',
      livello: 'bloccato',
    };
  }

  // Controllo 5: troppo maiuscolo (urla)
  const maiuscole = (testo.match(/[A-ZÀ-Ú]/g) || []).length;
  const totale = testo.replace(/\s/g, '').length;
  if (totale > 10 && maiuscole / totale > 0.7) {
    return {
      approvato: false,
      motivo: 'Evita di scrivere tutto in maiuscolo',
      livello: 'bloccato',
    };
  }

  // Tutto ok
  return { approvato: true, livello: 'ok' };
}

/**
 * Messaggi di errore user-friendly per il filtro
 */
export const MESSAGGI_FILTRO = {
  bloccato: 'Il tuo messaggio non è stato pubblicato perché contiene linguaggio inappropriato. Ti preghiamo di riformularlo con rispetto.',
  sospetto: 'Il tuo messaggio è stato inviato per verifica e sarà pubblicato dopo la moderazione. Grazie per la comprensione.',
  ok: '',
};
