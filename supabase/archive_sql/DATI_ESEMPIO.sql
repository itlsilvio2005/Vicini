-- ============================================================================
-- DATI DI ESEMPIO PER VICINI
-- ============================================================================
-- Script pronto all'uso: esegui direttamente nel SQL Editor di Supabase.
-- Tutti gli UUID sono fissi, quindi puoi eseguire tutto in un colpo solo.
--
-- UID UTENTI (dal tuo progetto Supabase):
--   Agenzia:      eba41f64-3173-4c6a-974c-18069d000dc2
--   Utente Privato: 9f564219-7250-4077-a50a-ebb2f2353bad
-- ============================================================================

-- ============================================================================
-- 1. INSERISCI AGENZIE DI ESEMPIO
-- ============================================================================
-- UUID predefiniti per le 3 agenzie (così puoi referenziarli nei passi successivi)

INSERT INTO public.agenzie (id, user_id, nome, indirizzo, descrizione, telefono, email, orari_apertura, servizi_offerti, aree_coperte)
VALUES 
(
  'a1111111-1111-1111-1111-111111111111', -- UUID fisso agenzia Pecorari
  'eba41f64-3173-4c6a-974c-18069d000dc2', -- UID utente agenzia
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
  'a2222222-2222-2222-2222-222222222222', -- UUID fisso agenzia San Martino
  'eba41f64-3173-4c6a-974c-18069d000dc2', -- stesso utente agenzia (demo)
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
  'a3333333-3333-3333-3333-333333333333', -- UUID fisso agenzia Borsari
  'eba41f64-3173-4c6a-974c-18069d000dc2', -- stesso utente agenzia (demo)
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
-- 2. INSERISCI MANIFESTI DI ESEMPIO
-- ============================================================================
-- UUID predefiniti per i 4 manifesti

INSERT INTO public.manifesti (
  id, agenzia_id, nome_defunto, anni, data_nascita, data_morte, comune, rito,
  camera_ardente_luogo, camera_ardente_indirizzo, camera_ardente_orari, camera_ardente_indicazioni,
  funerale_giorno, funerale_ora, funerale_luogo, funerale_indirizzo, funerale_dettagli,
  commiato_tipo, commiato_luogo, commiato_cimitero, pubblicato
)
VALUES 
(
  'm1111111-1111-1111-1111-111111111111', -- UUID fisso manifesto 1
  'a1111111-1111-1111-1111-111111111111', -- agenzia Pecorari
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
  'Chiesa di Sant''Agostino',
  'Via Emilia Centro, 315 — Modena',
  'Santa Messa esequiale celebrata da Don Giovanni',
  'Cremazione',
  'Tempio Crematorio',
  'Cimitero di San Cataldo, Modena',
  true
),
(
  'm2222222-2222-2222-2222-222222222222', -- UUID fisso manifesto 2
  'a1111111-1111-1111-1111-111111111111', -- agenzia Pecorari
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
  'Abbazia di San Silvestro',
  'Piazza Abbazia — Nonantola',
  'Funerale religioso con coro parrocchiale',
  'Tumulazione',
  'Tomba di famiglia',
  'Cimitero di Nonantola',
  true
),
(
  'm3333333-3333-3333-3333-333333333333', -- UUID fisso manifesto 3
  'a2222222-2222-2222-2222-222222222222', -- agenzia San Martino
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
  'Moschea La Misericordia',
  'Via Sgarzeria / Via delle Suore — Modena',
  'Preghiera funebre islamica (Salat al-Janazah)',
  'Inumazione',
  'Reparto Islamico',
  'Cimitero di San Cataldo, Modena',
  true
),
(
  'm4444444-4444-4444-4444-444444444444', -- UUID fisso manifesto 4
  'a2222222-2222-2222-2222-222222222222', -- agenzia San Martino
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
-- 3. INSERISCI PENSIERI DI ESEMPIO
-- ============================================================================

INSERT INTO public.pensieri (manifesto_id, user_id, nome, relazione, testo, approvato)
VALUES 
(
  'm1111111-1111-1111-1111-111111111111', -- manifesto Mario Rossi
  '9f564219-7250-4077-a50a-ebb2f2353bad', -- utente privato
  'Laura Neri',
  'Amica di famiglia',
  'Caro Mario, ci mancherai tanto. La tua gentilezza e il tuo sorriso illuminavano le nostre giornate. Riposa in pace.',
  true
),
(
  'm1111111-1111-1111-1111-111111111111', -- manifesto Mario Rossi
  '9f564219-7250-4077-a50a-ebb2f2353bad', -- utente privato
  'Famiglia Colombo',
  'Vicini di casa',
  'Alla famiglia Rossi le nostre più sentite condoglianze. Mario era una persona speciale.',
  true
),
(
  'm1111111-1111-1111-1111-111111111111', -- manifesto Mario Rossi
  '9f564219-7250-4077-a50a-ebb2f2353bad', -- utente privato
  'Giuseppe Ferrari',
  'Collega di lavoro',
  'Condoglianze alla famiglia. Mario è stato un collega stimato e un amico prezioso.',
  true
),
(
  'm2222222-2222-2222-2222-222222222222', -- manifesto Giuseppe Verdi
  '9f564219-7250-4077-a50a-ebb2f2353bad', -- utente privato
  'Comunità di Nonantola',
  'Concittadini',
  'Nonantola perde un uomo di grande valore. La sua memoria resterà viva tra noi.',
  true
);

-- ============================================================================
-- 4. INSERISCI ORDINI FIORI DI ESEMPIO
-- ============================================================================

INSERT INTO public.ordini_fiori (
  manifesto_id, user_id, composizione, importo, nastro,
  cliente_nome, cliente_email, cliente_telefono, stato, fattura_inviata
)
VALUES 
(
  'm1111111-1111-1111-1111-111111111111', -- manifesto Mario Rossi
  '9f564219-7250-4077-a50a-ebb2f2353bad', -- utente privato
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
  'm1111111-1111-1111-1111-111111111111', -- manifesto Mario Rossi
  '9f564219-7250-4077-a50a-ebb2f2353bad', -- utente privato
  'Cuscino di rose rosse',
  95.00,
  'Per sempre nel nostro cuore - I colleghi',
  'Marco Ferrari',
  'marco.ferrari@email.it',
  '3399876543',
  'Da evadere',
  false
),
(
  'm2222222-2222-2222-2222-222222222222', -- manifesto Giuseppe Verdi
  '9f564219-7250-4077-a50a-ebb2f2353bad', -- utente privato
  'Composizione di gigli',
  110.00,
  'Addio Giuseppe - I vicini di casa',
  'Paola Ricci',
  'paola.ricci@email.it',
  '3471122334',
  'Confermato',
  false
);

-- ============================================================================
-- 5. INSERISCI PRATICHE DI ESEMPIO
-- ============================================================================

INSERT INTO public.pratiche (
  agenzia_id, manifesto_id, num_fattura, defunto, comune, data_cerimonia,
  rito, stato, imponibile, famiglia
)
VALUES 
(
  'a1111111-1111-1111-1111-111111111111', -- agenzia Pecorari
  'm1111111-1111-1111-1111-111111111111', -- manifesto Mario Rossi
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
  'a1111111-1111-1111-1111-111111111111', -- agenzia Pecorari
  'm2222222-2222-2222-2222-222222222222', -- manifesto Giuseppe Verdi
  'FT-2026-002',
  'Giuseppe Verdi',
  'Nonantola',
  '11/02/2026',
  'Cattolico',
  'In corso',
  2650.00,
  'Famiglia Verdi - Via Roma 45, Nonantola'
),
(
  'a2222222-2222-2222-2222-222222222222', -- agenzia San Martino
  'm3333333-3333-3333-3333-333333333333', -- manifesto Ahmed Hassan
  'FT-2026-003',
  'Ahmed Hassan',
  'Modena',
  '11/02/2026',
  'Musulmano',
  'In corso',
  2400.00,
  'Famiglia Hassan - Via Canaletto 50, Modena'
),
(
  'a2222222-2222-2222-2222-222222222222', -- agenzia San Martino
  'm4444444-4444-4444-4444-444444444444', -- manifesto Maria Bianchi
  'FT-2026-004',
  'Maria Bianchi',
  'Formigine',
  '12/02/2026',
  'Cattolico',
  'Completata',
  2750.00,
  'Famiglia Bianchi - Via Roma 12, Formigine'
);

-- ============================================================================
-- 6. INSERISCI VOLONTÀ DI ESEMPIO
-- ============================================================================

INSERT INTO public.volonta (
  user_id, agenzia_id, rito, destinazione,
  trasporto_fuori_comune, trasporto_comune, trasporto_citta,
  rimpatrio_estero, rimpatrio_paese,
  dettagli_rito, note
)
VALUES 
(
  '9f564219-7250-4077-a50a-ebb2f2353bad', -- utente privato
  'a1111111-1111-1111-1111-111111111111', -- agenzia Pecorari
  'Cattolico',
  'Cremazione',
  false,
  NULL,
  NULL,
  false,
  NULL,
  '{"chiesa": "Chiesa di Sant''Agostino", "musica": "Ave Maria di Schubert"}'::jsonb,
  'Desidero che le offerte siano devolute in beneficenza'
);

-- ============================================================================
-- 7. INSERISCI MEMBRI DEL NUCLEO DI ESEMPIO
-- ============================================================================

INSERT INTO public.nucleo (user_id, nome, relazione, comune, contatto)
VALUES 
(
  '9f564219-7250-4077-a50a-ebb2f2353bad', -- utente privato
  'Anna Neri',
  'Coniuge',
  'Modena',
  'anna.neri@email.it'
),
(
  '9f564219-7250-4077-a50a-ebb2f2353bad', -- utente privato
  'Luca Neri',
  'Figlio',
  'Modena',
  '3331112222'
),
(
  '9f564219-7250-4077-a50a-ebb2f2353bad', -- utente privato
  'Sara Neri',
  'Figlia',
  'Bologna',
  'sara.neri@email.it'
);

-- ============================================================================
-- ✅ FINE SCRIPT
-- ============================================================================
-- Dopo aver eseguito questo script, verifica i dati nel Table Editor di Supabase:
--   - agenzie: 3 righe
--   - manifesti: 4 righe
--   - pensieri: 4 righe
--   - ordini_fiori: 3 righe
--   - pratiche: 4 righe
--   - volonta: 1 riga
--   - nucleo: 3 righe
--
-- Riepilogo UUID utilizzati (per riferimento futuro):
--   Agenzia Pecorari:      a1111111-1111-1111-1111-111111111111
--   Agenzia San Martino:   a2222222-2222-2222-2222-222222222222
--   Agenzia Borsari:       a3333333-3333-3333-3333-333333333333
--   Manifesto Mario Rossi: m1111111-1111-1111-1111-111111111111
--   Manifesto Giuseppe V.: m2222222-2222-2222-2222-222222222222
--   Manifesto Ahmed H.:    m3333333-3333-3333-3333-333333333333
--   Manifesto Maria B.:    m4444444-4444-4444-4444-444444444444
-- ============================================================================
