/**
 * Validazione form avanzata per Vicini
 * Include validazione email, telefono italiano, password e messaggi di errore localizzati
 */

// ============================================================================
// VALIDAZIONE EMAIL
// ============================================================================

/**
 * Regex per validazione email robusta
 * Supporta:
 * - Email standard (nome@dominio.it)
 * - Email con sottodomini (nome@sub.dominio.it)
 * - Email con caratteri speciali (nome.cognome@dominio.it)
 * - Email internazionali
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Valida un indirizzo email
 * @param email - Email da validare
 * @returns true se valida, false altrimenti
 */
export function validaEmail(email: string): boolean {
  if (!email || email.trim().length === 0) {
    return false;
  }
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Messaggio di errore per email non valida
 */
export const ERRORE_EMAIL = "Inserisci un indirizzo email valido (es. nome@esempio.it)";

// ============================================================================
// VALIDAZIONE TELEFONO ITALIANO
// ============================================================================

/**
 * Regex per validazione telefono italiano
 * Supporta:
 * - Numeri fissi (02 1234567, 059 1234567)
 * - Numeri mobili (333 1234567, 348 1234567)
 * - Numeri con prefisso internazionale (+39 333 1234567)
 * - Numeri con spazi, trattini o punti
 */
const TELEFONO_REGEX = /^(\+?39\s?)?(\d{2,4}[\s.-]?)?\d{6,8}$/;

/**
 * Valida un numero di telefono italiano
 * @param telefono - Telefono da validare
 * @returns true se valido, false altrimenti
 */
export function validaTelefono(telefono: string): boolean {
  if (!telefono || telefono.trim().length === 0) {
    return false;
  }
  
  // Rimuovi spazi, trattini e punti per la validazione
  const telefonoPulito = telefono.replace(/[\s.-]/g, "");
  
  // Lunghezza minima 8 cifre, massima 13 (con prefisso internazionale)
  if (telefonoPulito.length < 8 || telefonoPulito.length > 13) {
    return false;
  }
  
  return TELEFONO_REGEX.test(telefono.trim());
}

/**
 * Messaggio di errore per telefono non valido
 */
export const ERRORE_TELEFONO = "Inserisci un numero di telefono valido (es. 333 1234567 o +39 059 1234567)";

// ============================================================================
// VALIDAZIONE PASSWORD
// ============================================================================

/**
 * Criteri per una password sicura
 */
export interface CriteriPassword {
  lunghezzaMinima: boolean;
  haMaiuscola: boolean;
  haMinuscola: boolean;
  haNumero: boolean;
  haCarattereSpeciale: boolean;
}

/**
 * Valida una password e restituisce i criteri soddisfatti
 * @param password - Password da validare
 * @returns Oggetto con i criteri soddisfatti
 */
export function validaPassword(password: string): CriteriPassword {
  return {
    lunghezzaMinima: password.length >= 8,
    haMaiuscola: /[A-Z]/.test(password),
    haMinuscola: /[a-z]/.test(password),
    haNumero: /[0-9]/.test(password),
    haCarattereSpeciale: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

/**
 * Verifica se una password è abbastanza sicura
 * @param password - Password da verificare
 * @returns true se la password soddisfa i criteri minimi
 */
export function passwordSicura(password: string): boolean {
  const criteri = validaPassword(password);
  // Richiede: lunghezza minima, maiuscola, minuscola e numero
  return criteri.lunghezzaMinima && criteri.haMaiuscola && criteri.haMinuscola && criteri.haNumero;
}

/**
 * Messaggi di errore per password non sicura
 */
export const ERRORI_PASSWORD = {
  troppoCorta: "La password deve essere lunga almeno 8 caratteri",
  nessunaMaiuscola: "La password deve contenere almeno una lettera maiuscola",
  nessunaMinuscola: "La password deve contenere almeno una lettera minuscola",
  nessunNumero: "La password deve contenere almeno un numero",
  nessunCarattereSpeciale: "La password deve contenere almeno un carattere speciale (!@#$%^&*)",
};

/**
 * Restituisce i messaggi di errore per una password non valida
 * @param password - Password da verificare
 * @returns Array di messaggi di errore
 */
export function erroriPassword(password: string): string[] {
  const errori: string[] = [];
  const criteri = validaPassword(password);
  
  if (!criteri.lunghezzaMinima) errori.push(ERRORI_PASSWORD.troppoCorta);
  if (!criteri.haMaiuscola) errori.push(ERRORI_PASSWORD.nessunaMaiuscola);
  if (!criteri.haMinuscola) errori.push(ERRORI_PASSWORD.nessunaMinuscola);
  if (!criteri.haNumero) errori.push(ERRORI_PASSWORD.nessunNumero);
  
  return errori;
}

// ============================================================================
// VALIDAZIONE CONFERMA PASSWORD
// ============================================================================

/**
 * Verifica che due password coincidano
 * @param password - Password principale
 * @param conferma - Password di conferma
 * @returns true se coincidono, false altrimenti
 */
export function passwordCoincidono(password: string, conferma: string): boolean {
  return password === conferma && password.length > 0;
}

/**
 * Messaggio di errore per password non coincidenti
 */
export const ERRORE_CONFERMA_PASSWORD = "Le password non coincidono";

// ============================================================================
// VALIDAZIONE CAMPI OBBLIGATORI
// ============================================================================

/**
 * Valida un campo obbligatorio
 * @param valore - Valore da validare
 * @param nomeCampo - Nome del campo (per il messaggio di errore)
 * @returns true se valido, false altrimenti
 */
export function validaCampoObbligatorio(valore: string, nomeCampo: string): boolean {
  return valore.trim().length > 0;
}

/**
 * Genera un messaggio di errore per campo obbligatorio
 * @param nomeCampo - Nome del campo
 * @returns Messaggio di errore
 */
export function erroreCampoObbligatorio(nomeCampo: string): string {
  return `Il campo "${nomeCampo}" è obbligatorio`;
}

// ============================================================================
// VALIDAZIONE COMPLETA FORM
// ============================================================================

/**
 * Risultato della validazione di un form
 */
export interface RisultatoValidazione {
  valido: boolean;
  errori: Record<string, string>;
}

/**
 * Valida un form di registrazione
 * @param dati - Dati del form
 * @returns Risultato della validazione
 */
export function validaFormRegistrazione(dati: {
  nome: string;
  email: string;
  password: string;
  confermaPassword: string;
}): RisultatoValidazione {
  const errori: Record<string, string> = {};
  
  // Validazione nome
  if (!validaCampoObbligatorio(dati.nome, "Nome")) {
    errori.nome = erroreCampoObbligatorio("Nome");
  } else if (dati.nome.trim().length < 2) {
    errori.nome = "Il nome deve essere lungo almeno 2 caratteri";
  }
  
  // Validazione email
  if (!validaEmail(dati.email)) {
    errori.email = ERRORE_EMAIL;
  }
  
  // Validazione password
  const erroriPwd = erroriPassword(dati.password);
  if (erroriPwd.length > 0) {
    errori.password = erroriPwd.join(". ");
  }
  
  // Validazione conferma password
  if (!passwordCoincidono(dati.password, dati.confermaPassword)) {
    errori.confermaPassword = ERRORE_CONFERMA_PASSWORD;
  }
  
  return {
    valido: Object.keys(errori).length === 0,
    errori,
  };
}

/**
 * Valida un form di login
 * @param dati - Dati del form
 * @returns Risultato della validazione
 */
export function validaFormLogin(dati: {
  email: string;
  password: string;
}): RisultatoValidazione {
  const errori: Record<string, string> = {};
  
  // Validazione email
  if (!validaEmail(dati.email)) {
    errori.email = ERRORE_EMAIL;
  }
  
  // Validazione password
  if (!validaCampoObbligatorio(dati.password, "Password")) {
    errori.password = erroreCampoObbligatorio("Password");
  }
  
  return {
    valido: Object.keys(errori).length === 0,
    errori,
  };
}

/**
 * Valida un form di contatto
 * @param dati - Dati del form
 * @returns Risultato della validazione
 */
export function validaFormContatto(dati: {
  nome: string;
  email: string;
  telefono?: string;
  messaggio: string;
}): RisultatoValidazione {
  const errori: Record<string, string> = {};
  
  // Validazione nome
  if (!validaCampoObbligatorio(dati.nome, "Nome")) {
    errori.nome = erroreCampoObbligatorio("Nome");
  }
  
  // Validazione email
  if (!validaEmail(dati.email)) {
    errori.email = ERRORE_EMAIL;
  }
  
  // Validazione telefono (opzionale)
  if (dati.telefono && dati.telefono.trim().length > 0 && !validaTelefono(dati.telefono)) {
    errori.telefono = ERRORE_TELEFONO;
  }
  
  // Validazione messaggio
  if (!validaCampoObbligatorio(dati.messaggio, "Messaggio")) {
    errori.messaggio = erroreCampoObbligatorio("Messaggio");
  } else if (dati.messaggio.trim().length < 10) {
    errori.messaggio = "Il messaggio deve essere lungo almeno 10 caratteri";
  }
  
  return {
    valido: Object.keys(errori).length === 0,
    errori,
  };
}

// ============================================================================
// VALIDAZIONE DATI AGENZIA
// ============================================================================

/**
 * Valida i dati di un'agenzia
 * @param dati - Dati dell'agenzia
 * @returns Risultato della validazione
 */
export function validaDatiAgenzia(dati: {
  nome: string;
  indirizzo: string;
  telefono: string;
  email: string;
}): RisultatoValidazione {
  const errori: Record<string, string> = {};
  
  // Validazione nome
  if (!validaCampoObbligatorio(dati.nome, "Nome agenzia")) {
    errori.nome = erroreCampoObbligatorio("Nome agenzia");
  }
  
  // Validazione indirizzo
  if (!validaCampoObbligatorio(dati.indirizzo, "Indirizzo")) {
    errori.indirizzo = erroreCampoObbligatorio("Indirizzo");
  }
  
  // Validazione telefono
  if (!validaTelefono(dati.telefono)) {
    errori.telefono = ERRORE_TELEFONO;
  }
  
  // Validazione email
  if (!validaEmail(dati.email)) {
    errori.email = ERRORE_EMAIL;
  }
  
  return {
    valido: Object.keys(errori).length === 0,
    errori,
  };
}
