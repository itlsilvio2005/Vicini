-- ============================================================================
-- DATI DI ESEMPIO PER VICINI
-- ============================================================================
-- Esegui questo script nel SQL Editor di Supabase dopo aver eseguito SUPABASE_SCHEMA.sql
-- Questo popola il database con dati di esempio per testare l'applicazione

-- ============================================================================
-- 1. CREA UTENTI DI ESEMPIO
-- ============================================================================

-- NOTA: Gli utenti devono essere creati tramite l'interfaccia di autenticazione di Supabase
-- oppure tramite il seguente script (sostituisci le email con quelle reali)

-- Per creare utenti, vai su Authentication → Users nel dashboard Supabase
-- e clicca "Add User" → "Create New User"

-- Esempio di utenti da creare:
-- Email: agenzia@vicini.mo | Password: test123456 | Metadata: {"ruolo": "agenzia"}
-- Email: utente@vicini.mo | Password: test123456 | Metadata: {"ruolo": "privato"}

-- Dopo aver creato gli utenti, copia i loro UUID e usali negli INSERT seguenti

-- ============================================================================
-- 2. INSERISCI AGENZIE DI ESEMPIO
-- ============================================================================

-- IMPORTANTE: Sostituisci 'USER_ID_AGENZIA_QUI' con l'UUID reale dell'utente agenzia
-- che hai creato nel passo precedente

INSERT INTO public.agenzie (user_id, nome, indirizzo, descrizione, telefono, email, orari_apertura, servizi_offerti, aree_coperte)
VALUES 
(
  'USER_ID_AGENZIA_QUI', -- SOSTITUISCI CON UUID REALE
  'Onoranze Funebri Pecorari',
  'Via Nonantolana, 555 — 41122 Modena (MO)',
  'Opera nei comuni di Modena, Nonantola e Ravarino organizzando funerali completi con serietà e discrezione. Esperienza pluridecennale nel settore.',
  '059 364 218',
  'info@onoranzefunebripecorari.it',
  'Lunedì-Sabato: 8:00-19:00 | Domenica: 9:00-13:00 | Reperibilità 24h',
  '["Trasporto salma", "Allestimento camera ardente", "Organizzazione cerimonia", "Pratiche cimiteriali", "Cremazione", "Rimpatrio salma"]'::jsonb,
  '["Modena", "Nonantola", "Ravarino"]'::jsonb
),
(
  'USER_ID_AGENZIA_QUI', -- SOSTITUISCI CON UUID REALE
  'Onoranze Funebri San Martino',
  'Via Don Adelmo Martinelli, 23 — 41043 Formigine (MO)',
  'Servizio 24h per cerimonie complete dalla preparazione e vestizione al trasporto. Professionalità e discrezione garantite.',
  '059 512 340',
  'info@onoranzesanmartino.it',
  'Reperibilità 24h su 24',
  '["Trasporto salma", "Vestizione defunto", "Allestimento camera ardente", "Cerimonia religiosa", "Cerimonia civile"]'::jsonb,
  '["Formigine", "Modena", "Sassuolo"]'::jsonb
),
(
  'USER_ID_AGENZIA_QUI', -- SOSTITUISCI CON UUID REALE
  'Onoranze Funebri Borsari',
  'Strada Cimitero San Cataldo, 131 — 41123 Modena (MO)',
  'Servizio discreto e professionale h24 con sede a San Cataldo. Vicinanza al cimitero per operazioni rapide.',
  '059 826 115',
  'segreteria@onoranziborsari.it',
  'Reperibilità 24h su 24',
  '["Trasporto salma", "Allestimento camera ardente", "Pratiche cimiteriali", "Tumulazione", "Inumazione"]'::jsonb,
  '["Modena"]'::jsonb
);

-- ============================================================================
-- 3. INSERISCI MANIFESTI DI ESEMPIO
-- ============================================================================

-- IMPORTANTE: Sostituisci 'AGENZIA_ID_QUI' con l'UUID reale dell'agenzia
-- che hai inserito nel passo precedente

INSERT INTO public.manifesti (
  agenzia_id, nome_defunto, anni, data_nascita, data_morte, comune, rito,
  camera_ardente_luogo, camera_ardente_indirizzo, camera_ardente_orari, camera_ardente_indicazioni,
  funerale_giorno, funerale_ora, funerale_luogo, funerale_indirizzo, funerale_dettagli,
  commiato_tipo, commiato_luogo, commiato_cimitero, pubblicato
)
VALUES 
(
  'AGENZIA_ID_QUI', -- SOSTITUISCI CON UUID REALE AGENZIA
  'Mario Rossi',
  78,
  '15 marzo 1946',
  '10 febbraio 2026',
  'Modena',
  'Cattolico',
  'Camera Ardente Comunale',
  'Via Emilia Centro, 100 — Modena',
  'Oggi 9:00-19:00, domani 8:00-12:00',
  'Parcheggio disponibile, accesso disabili',
  'Giovedì 12 febbraio 2026',
  '10:30',
  'Chiesa di San Agostino',
  'Via Emilia Centro, 315 — Modena',
  'Santa Messa esequiale celebrata da Don Giovanni',
  'Cremazione',
  'Tempio Crematorio',
  'Cimitero di San Cataldo, Modena',
  true
),
(
  'AGENZIA_ID_QUI', -- SOSTITUISCI CON UUID REALE AGENZIA
  'Giuseppe Verdi',
  85,
  '22 ottobre 1940',
  '9 febbraio 2026',
  'Nonantola',
  'Cattolico',
  'Abitazione privata',
  'Via Roma, 45 — Nonantola',
  'Oggi 14:00-18:00',
  'La famiglia riceve le condoglianze',
  'Mercoledì 11 febbraio 2026',
  '15:00',
  'Chiesa di San Silvestro',
  'Piazza Abbazia — Nonantola',
  'Funerale religioso con coro parrocchiale',
  'Tumulazione',
  'Tomba di famiglia',
  'Cimitero di Nonantola',
  true
),
(
  'AGENZIA_ID_QUI', -- SOSTITUISCI CON UUID REALE AGENZIA
  'Ahmed Hassan',
  62,
  '8 giugno 1963',
  '10 febbraio 2026',
  'Modena',
  'Musulmano',
  'Sala del Commiato Islamica',
  'Via Canaletto, 89 — Modena',
  'Oggi 10:00-18:00',
  'Lavaggio rituale disponibile',
  'Mercoledì 11 febbraio 2026',
  '14:00',
  'Moschea di Modena',
  'Via Canaletto Sud, 120 — Modena',
  'Preghiera funebre islamica (Salat al-Janazah)',
  'Inumazione',
  'Reparto Islamico',
  'Cimitero di San Cataldo, Modena',
  true
),
(
  'AGENZIA_ID_QUI', -- SOSTITUISCI CON UUID REALE AGENZIA
  'Maria Bianchi',
  91,
  '3 gennaio 1935',
  '8 febbraio 2026',
  'Formigine',
  'Cattolico',
  'Casa Funeraria San Martino',
  'Via Don Adelmo Martinelli, 23 — Formigine',
  'Oggi 9:00-19:00, domani 8:00-11:00',
  'Sala rinfreschi disponibile per i familiari',
  'Giovedì 12 febbraio 2026',
  '11:00',
  'Chiesa di San Bartolomeo',
  'Piazza Calcagnini — Formigine',
  'Concelebrazione con Don Marco',
  'Cremazione',
  'Tempio Crematorio',
  'Cimitero di Formigine',
  true
);

-- ============================================================================
-- 4. INSERISCI PENSIERI DI ESEMPIO
-- ============================================================================

-- IMPORTANTE: Sostituisci 'MANIFESTO_ID_QUI' con gli UUID reali dei manifesti
-- e 'USER_ID_PRIVATO_QUI' con l'UUID dell'utente privato

INSERT INTO public.pensieri (manifesto_id, user_id, nome, relazione, testo, approvato)
VALUES 
(
  'MANIFESTO_ID_QUI', -- SOSTITUISCI CON UUID REALE MANIFESTO
  'USER_ID_PRIVATO_QUI', -- SOSTITUISCI CON UUID REALE UTENTE PRIVATO
  'Laura Neri',
  'Amica di famiglia',
  'Caro Mario, ci mancherai tanto. La tua gentilezza e il tuo sorriso illuminavano le nostre giornate. Riposa in pace.',
  true
),
(
  'MANIFESTO_ID_QUI', -- SOSTITUISCI CON UUID REALE MANIFESTO
  'USER_ID_PRIVATO_QUI', -- SOSTITUISCI CON UUID REALE UTENTE PRIVATO
  'Famiglia Colombo',
  'Vicini di casa',
  'Alla famiglia Rossi le nostre più sentite condoglianze. Mario era una persona speciale.',
  true
),
(
  'MANIFESTO_ID_QUI', -- SOSTITUISCI CON UUID REALE MANIFESTO
  'USER_ID_PRIVATO_QUI', -- SOSTITUISCI CON UUID REALE UTENTE PRIVATO
  'Giuseppe Ferrari',
  'Collega di lavoro',
  'Condoglianze alla famiglia. Mario è stato un collega stimato e un amico prezioso.',
  true
);

-- ============================================================================
-- 5. INSERISCI ORDINI FIORI DI ESEMPIO
-- ============================================================================

INSERT INTO public.ordini_fiori (
  manifesto_id, user_id, composizione, importo, nastro,
  cliente_nome, cliente_email, cliente_telefono, stato, fattura_inviata
)
VALUES 
(
  'MANIFESTO_ID_QUI', -- SOSTITUISCI CON UUID REALE MANIFESTO
  'USER_ID_PRIVATO_QUI', -- SOSTITUISCI CON UUID REALE UTENTE PRIVATO
  'Corona di fiori bianchi',
  120.00,
  'Con affetto - La famiglia Colombo',
  'Anna Colombo',
  'anna.colombo@email.it',
  '3331234567',
  'Confermato',
  true
),
(
  'MANIFESTO_ID_QUI', -- SOSTITUISCI CON UUID REALE MANIFESTO
  'USER_ID_PRIVATO_QUI', -- SOSTITUISCI CON UUID REALE UTENTE PRIVATO
  'Cuscino di rose rosse',
  95.00,
  'Per sempre nel nostro cuore - I colleghi',
  'Marco Ferrari',
  'marco.ferrari@email.it',
  '3399876543',
  'Da evadere',
  false
);

-- ============================================================================
-- 6. INSERISCI PRATICHE DI ESEMPIO
-- ============================================================================

INSERT INTO public.pratiche (
  agenzia_id, manifesto_id, num_fattura, defunto, comune, data_cerimonia,
  rito, stato, imponibile, famiglia
)
VALUES 
(
  'AGENZIA_ID_QUI', -- SOSTITUISCI CON UUID REALE AGENZIA
  'MANIFESTO_ID_QUI', -- SOSTITUISCI CON UUID REALE MANIFESTO
  'FT-2026-001',
  'Mario Rossi',
  'Modena',
  '12/02/2026',
  'Cattolico',
  'In corso',
  2850.00,
  'Famiglia Rossi - Via Emilia 45, Modena'
),
(
  'AGENZIA_ID_QUI', -- SOSTITUISCI CON UUID REALE AGENZIA
  'MANIFESTO_ID_QUI', -- SOSTITUISCI CON UUID REALE MANIFESTO
  'FT-2026-002',
  'Giuseppe Verdi',
  'Nonantola',
  '11/02/2026',
  'Cattolico',
  'In corso',
  2650.00,
  'Famiglia Verdi - Via Roma 45, Nonantola'
);

-- ============================================================================
-- 7. INSERISCI VOLONTÀ DI ESEMPIO
-- ============================================================================

INSERT INTO public.volonta (
  user_id, agenzia_id, rito, destinazione,
  trasporto_fuori_comune, trasporto_comune, trasporto_citta,
  rimpatrio_estero, rimpatrio_paese,
  dettagli_rito, note
)
VALUES 
(
  'USER_ID_PRIVATO_QUI', -- SOSTITUISCI CON UUID REALE UTENTE PRIVATO
  'AGENZIA_ID_QUI', -- SOSTITUISCI CON UUID REALE AGENZIA
  'Cattolico',
  'Cremazione',
  false,
  NULL,
  NULL,
  false,
  NULL,
  '{"chiesa": "Chiesa di San Agostino", "musica": "Ave Maria di Schubert"}'::jsonb,
  'Desidero che le offerte siano devolute in beneficenza'
);

-- ============================================================================
-- 8. INSERISCI MEMBRI DEL NUCLEO DI ESEMPIO
-- ============================================================================

INSERT INTO public.nucleo (user_id, nome, relazione, comune, contatto)
VALUES 
(
  'USER_ID_PRIVATO_QUI', -- SOSTITUISCI CON UUID REALE UTENTE PRIVATO
  'Anna Neri',
  'Coniuge',
  'Modena',
  'anna.neri@email.it'
),
(
  'USER_ID_PRIVATO_QUI', -- SOSTITUISCI CON UUID REALE UTENTE PRIVATO
  'Luca Neri',
  'Figlio',
  'Modena',
  '3331112222'
),
(
  'USER_ID_PRIVATO_QUI', -- SOSTITUISCI CON UUID REALE UTENTE PRIVATO
  'Sara Neri',
  'Figlia',
  'Bologna',
  'sara.neri@email.it'
);

-- ============================================================================
-- NOTE FINALI
-- ============================================================================

-- Dopo aver eseguito questo script:
-- 1. Sostituisci tutti i placeholder (USER_ID_AGENZIA_QUI, AGENZIA_ID_QUI, ecc.)
--    con gli UUID reali presi dal dashboard Supabase
-- 2. Verifica che i dati siano stati inseriti correttamente
-- 3. Avvia l'applicazione con npm run dev
-- 4. L'applicazione ora userà i dati reali dal database Supabase

-- Per trovare gli UUID:
-- - Utenti: Authentication → Users → copia l'UID
-- - Agenzie: Table Editor → agenzie → copia l'id
-- - Manifesti: Table Editor → manifesti → copia l'id
