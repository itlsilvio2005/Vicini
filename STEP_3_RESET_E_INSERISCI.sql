-- ============================================================================
-- STEP 3: RESET + INSERIMENTO DATI (Eseguire DOPO Step 1 e Step 2)
-- ============================================================================
-- Questo script cancella tutti i dati esistenti e inserisce i dati di esempio.
-- IMPORTANTE: Il vincolo UNIQUE deve essere già stato rimosso con STEP 1
-- ============================================================================

-- ============================================================================
-- FASE 1: RESET (cancella tutti i dati in ordine corretto)
-- ============================================================================
-- Disabilita RLS per le operazioni di cancellazione
ALTER TABLE public.nucleo DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.volonta DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordini_fiori DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pensieri DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pratiche DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifesti DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenzie DISABLE ROW LEVEL SECURITY;

-- Tabelle figlie (dipendono da manifesti, agenzie, utenti)
DELETE FROM public.nucleo;           -- dipende da profilo_utenti
DELETE FROM public.volonta;          -- dipende da profilo_utenti, agenzie
DELETE FROM public.ordini_fiori;     -- dipende da manifesti, profilo_utenti
DELETE FROM public.pensieri;         -- dipende da manifesti, profilo_utenti
DELETE FROM public.pratiche;         -- dipende da agenzie, manifesti

-- Tabelle intermedie
DELETE FROM public.manifesti;        -- dipende da agenzie

-- Tabelle padri
DELETE FROM public.agenzie;          -- dipende da profilo_utenti

-- Verifica che tutte le tabelle siano vuote
SELECT 'nucleo' AS tabella, COUNT(*) AS righe FROM public.nucleo
UNION ALL SELECT 'volonta', COUNT(*) FROM public.volonta
UNION ALL SELECT 'ordini_fiori', COUNT(*) FROM public.ordini_fiori
UNION ALL SELECT 'pensieri', COUNT(*) FROM public.pensieri
UNION ALL SELECT 'pratiche', COUNT(*) FROM public.pratiche
UNION ALL SELECT 'manifesti', COUNT(*) FROM public.manifesti
UNION ALL SELECT 'agenzie', COUNT(*) FROM public.agenzie;

-- ============================================================================
-- FASE 2: INSERIMENTO DATI
-- ============================================================================

-- Agenzie (stesso utente gestisce più agenzie - modello flessibile)
INSERT INTO public.agenzie (id, user_id, nome, indirizzo, descrizione, telefono, email, orari_apertura, servizi_offerti, aree_coperte)
VALUES 
(
  'a1111111-1111-1111-1111-111111111111',
  'eba41f64-3173-4c6a-974c-18069d000dc2', -- Utente agenzia
  'Onoranze Funebri Pecorari',
  'Via Nonantolana, 555 — 41122 Modena (MO)',
  'Opera nei comuni di Modena, Nonantola e Ravarino organizzando funerali completi con serietà e discrezione.',
  '059 364 218',
  'info@onoranzefunebripecorari.it',
  'Lunedì-Sabato: 8:00-19:00 | Domenica: 9:00-13:00 | Reperibilità 24h',
  '["Trasporto salma", "Allestimento camera ardente", "Organizzazione cerimonia", "Pratiche cimiteriali", "Cremazione"]'::jsonb,
  '["Modena", "Nonantola", "Ravarino"]'::jsonb
),
(
  'a2222222-2222-2222-2222-222222222222',
  'eba41f64-3173-4c6a-974c-18069d000dc2', -- Stesso utente (gestisce più agenzie)
  'Onoranze Funebri San Martino',
  'Via Don Adelmo Martinelli, 23 — 41043 Formigine (MO)',
  'Servizio 24h per cerimonie complete dalla preparazione e vestizione al trasporto.',
  '059 512 340',
  'info@onoranzesanmartino.it',
  'Reperibilità 24h su 24',
  '["Trasporto salma", "Vestizione defunto", "Allestimento camera ardente", "Cerimonia religiosa"]'::jsonb,
  '["Formigine", "Modena", "Sassuolo"]'::jsonb
),
(
  'a3333333-3333-3333-3333-333333333333',
  'eba41f64-3173-4c6a-974c-18069d000dc2', -- Stesso utente (gestisce più agenzie)
  'Onoranze Funebri Borsari',
  'Strada Cimitero San Cataldo, 131 — 41123 Modena (MO)',
  'Servizio discreto e professionale h24 con sede a San Cataldo.',
  '059 826 115',
  'segreteria@onoranziborsari.it',
  'Reperibilità 24h su 24',
  '["Trasporto salma", "Allestimento camera ardente", "Pratiche cimiteriali", "Tumulazione"]'::jsonb,
  '["Modena"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Manifesti
INSERT INTO public.manifesti (
  id, agenzia_id, nome_defunto, anni, data_nascita, data_morte, comune, rito,
  camera_ardente_luogo, camera_ardente_indirizzo, camera_ardente_orari, camera_ardente_indicazioni,
  funerale_giorno, funerale_ora, funerale_luogo, funerale_indirizzo, funerale_dettagli,
  commiato_tipo, commiato_luogo, commiato_cimitero, pubblicato
)
VALUES 
(
  'm1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  'Mario Rossi',
  78,
  '15 marzo 1946',
  '10 febbraio 2026',
  'Modena',
  'Cattolico',
  'Camera Ardente Comunale',
  'Via Emilia Centro, 100 — Modena',
  'Oggi 9:00-19:00, domani 8:00-12:00',
  'Parcheggio disponibile',
  'Giovedì 12 febbraio 2026',
  '10:30',
  'Chiesa di Sant''Agostino',
  'Via Emilia Centro, 315 — Modena',
  'Santa Messa esequiale',
  'Cremazione',
  'Tempio Crematorio',
  'Cimitero di San Cataldo, Modena',
  true
),
(
  'm2222222-2222-2222-2222-222222222222',
  'a1111111-1111-1111-1111-111111111111',
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
  'm3333333-3333-3333-3333-333333333333',
  'a2222222-2222-2222-2222-222222222222',
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
  'Via Sgarzeria — Modena',
  'Preghiera funebre islamica',
  'Inumazione',
  'Reparto Islamico',
  'Cimitero di San Cataldo, Modena',
  true
),
(
  'm4444444-4444-4444-4444-444444444444',
  'a2222222-2222-2222-2222-222222222222',
  'Maria Bianchi',
  91,
  '3 gennaio 1935',
  '8 febbraio 2026',
  'Formigine',
  'Cattolico',
  'Casa Funeraria San Martino',
  'Via Don Adelmo Martinelli, 23 — Formigine',
  'Oggi 9:00-19:00, domani 8:00-11:00',
  'Sala rinfreschi disponibile',
  'Giovedì 12 febbraio 2026',
  '11:00',
  'Chiesa di San Bartolomeo',
  'Piazza Calcagnini — Formigine',
  'Concelebrazione con Don Marco',
  'Cremazione',
  'Tempio Crematorio',
  'Cimitero di Formigine',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Pensieri
INSERT INTO public.pensieri (manifesto_id, user_id, nome, relazione, testo, approvato)
VALUES 
(
  'm1111111-1111-1111-1111-111111111111',
  '9f564219-7250-4077-a50a-ebb2f2353bad',
  'Laura Neri',
  'Amica di famiglia',
  'Caro Mario, ci mancherai tanto. La tua gentilezza illuminava le nostre giornate.',
  true
),
(
  'm1111111-1111-1111-1111-111111111111',
  '9f564219-7250-4077-a50a-ebb2f2353bad',
  'Famiglia Colombo',
  'Vicini di casa',
  'Alla famiglia Rossi le nostre più sentite condoglianze.',
  true
),
(
  'm2222222-2222-2222-2222-222222222222',
  '9f564219-7250-4077-a50a-ebb2f2353bad',
  'Comunità di Nonantola',
  'Concittadini',
  'Nonantola perde un uomo di grande valore.',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Ordini Fiori
INSERT INTO public.ordini_fiori (
  manifesto_id, user_id, composizione, importo, nastro,
  cliente_nome, cliente_email, cliente_telefono, stato, fattura_inviata
)
VALUES 
(
  'm1111111-1111-1111-1111-111111111111',
  '9f564219-7250-4077-a50a-ebb2f2353bad',
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
  'm1111111-1111-1111-1111-111111111111',
  '9f564219-7250-4077-a50a-ebb2f2353bad',
  'Cuscino di rose rosse',
  95.00,
  'Per sempre nel nostro cuore',
  'Marco Ferrari',
  'marco.ferrari@email.it',
  '3399876543',
  'Da evadere',
  false
)
ON CONFLICT (id) DO NOTHING;

-- Pratiche
INSERT INTO public.pratiche (
  agenzia_id, manifesto_id, num_fattura, defunto, comune, data_cerimonia,
  rito, stato, imponibile, famiglia
)
VALUES 
(
  'a1111111-1111-1111-1111-111111111111',
  'm1111111-1111-1111-1111-111111111111',
  'FT-2026-001',
  'Mario Rossi',
  'Modena',
  '12/02/2026',
  'Cattolico',
  'In corso',
  2850.00,
  'Famiglia Rossi - Modena'
),
(
  'a1111111-1111-1111-1111-111111111111',
  'm2222222-2222-2222-2222-222222222222',
  'FT-2026-002',
  'Giuseppe Verdi',
  'Nonantola',
  '11/02/2026',
  'Cattolico',
  'In corso',
  2650.00,
  'Famiglia Verdi - Nonantola'
)
ON CONFLICT (id) DO NOTHING;

-- Volontà
INSERT INTO public.volonta (
  user_id, agenzia_id, rito, destinazione,
  trasporto_fuori_comune, rimpatrio_estero,
  dettagli_rito, note
)
VALUES 
(
  '9f564219-7250-4077-a50a-ebb2f2353bad',
  'a1111111-1111-1111-1111-111111111111',
  'Cattolico',
  'Cremazione',
  false,
  false,
  '{"chiesa": "Chiesa di Sant''Agostino", "musica": "Ave Maria"}'::jsonb,
  'Desidero che le offerte siano devolute in beneficenza'
)
ON CONFLICT (id) DO NOTHING;

-- Nucleo
INSERT INTO public.nucleo (user_id, nome, relazione, comune, contatto)
VALUES 
(
  '9f564219-7250-4077-a50a-ebb2f2353bad',
  'Anna Neri',
  'Coniuge',
  'Modena',
  'anna.neri@email.it'
),
(
  '9f564219-7250-4077-a50a-ebb2f2353bad',
  'Luca Neri',
  'Figlio',
  'Modena',
  '3331112222'
),
(
  '9f564219-7250-4077-a50a-ebb2f2353bad',
  'Sara Neri',
  'Figlia',
  'Bologna',
  'sara.neri@email.it'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICA
-- ============================================================================

SELECT '✅ agenzie' as tabella, count(*) as righe FROM public.agenzie
UNION ALL
SELECT '✅ manifesti', count(*) FROM public.manifesti
UNION ALL
SELECT '✅ pensieri', count(*) FROM public.pensieri
UNION ALL
SELECT '✅ ordini_fiori', count(*) FROM public.ordini_fiori
UNION ALL
SELECT '✅ pratiche', count(*) FROM public.pratiche
UNION ALL
SELECT '✅ volonta', count(*) FROM public.volonta
UNION ALL
SELECT '✅ nucleo', count(*) FROM public.nucleo;

-- ============================================================================
-- FASE 3: RIABILITA RLS
-- ============================================================================

ALTER TABLE public.nucleo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volonta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordini_fiori ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pensieri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pratiche ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifesti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenzie ENABLE ROW LEVEL SECURITY;

SELECT '✅ RLS riabilitato su tutte le tabelle' AS status;

-- ============================================================================
-- FINE
-- ============================================================================
