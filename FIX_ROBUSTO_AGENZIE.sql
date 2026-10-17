-- ============================================================================
-- FIX COMPLETO E ROBUSTO: Una agenzia per utente
-- ============================================================================
-- Questo script è idempotente: può essere eseguito più volte senza errori.
-- Verifica lo stato attuale e applica le correzioni necessarie.
-- ============================================================================

-- ============================================================================
-- STEP 1: Verifica stato attuale
-- ============================================================================

DO $$
DECLARE
  num_agenzie_totali integer;
  num_agenzie_pecorari integer;
  num_agenzie_duplicate integer;
BEGIN
  -- Conta agenzie totali
  SELECT COUNT(*) INTO num_agenzie_totali FROM public.agenzie;
  RAISE NOTICE 'Agenzie totali: %', num_agenzie_totali;
  
  -- Conta agenzie Pecorari
  SELECT COUNT(*) INTO num_agenzie_pecorari 
  FROM public.agenzie 
  WHERE nome LIKE '%Pecorari%';
  RAISE NOTICE 'Agenzie Pecorari: %', num_agenzie_pecorari;
  
  -- Conta utenti con più di 1 agenzia
  SELECT COUNT(*) INTO num_agenzie_duplicate
  FROM (
    SELECT user_id, COUNT(*) as count
    FROM public.agenzie
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) AS duplicati;
  RAISE NOTICE 'Utenti con agenzie duplicate: %', num_agenzie_duplicate;
END $$;

-- ============================================================================
-- STEP 2: Salva ID agenzia Pecorari (da mantenere)
-- ============================================================================

DO $$
DECLARE
  pecorari_id uuid;
BEGIN
  SELECT id INTO pecorari_id 
  FROM public.agenzie 
  WHERE nome LIKE '%Pecorari%'
  ORDER BY created_at ASC
  LIMIT 1;
  
  IF pecorari_id IS NULL THEN
    RAISE EXCEPTION 'Agenzia Pecorari non trovata!';
  END IF;
  
  RAISE NOTICE 'ID Agenzia Pecorari (da mantenere): %', pecorari_id;
END $$;

-- ============================================================================
-- STEP 3: Aggiorna manifesti che puntano ad agenzie diverse da Pecorari
-- ============================================================================

DO $$
DECLARE
  pecorari_id uuid;
  num_aggiornati integer;
BEGIN
  -- Ottieni ID Pecorari
  SELECT id INTO pecorari_id 
  FROM public.agenzie 
  WHERE nome LIKE '%Pecorari%'
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Aggiorna manifesti
  UPDATE public.manifesti
  SET agenzia_id = pecorari_id
  WHERE agenzia_id != pecorari_id;
  
  GET DIAGNOSTICS num_aggiornati = ROW_COUNT;
  RAISE NOTICE 'Manifesti aggiornati: %', num_aggiornati;
END $$;

-- ============================================================================
-- STEP 4: Aggiorna pratiche che puntano ad agenzie diverse da Pecorari
-- ============================================================================

DO $$
DECLARE
  pecorari_id uuid;
  num_aggiornati integer;
BEGIN
  -- Ottieni ID Pecorari
  SELECT id INTO pecorari_id 
  FROM public.agenzie 
  WHERE nome LIKE '%Pecorari%'
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Aggiorna pratiche
  UPDATE public.pratiche
  SET agenzia_id = pecorari_id
  WHERE agenzia_id != pecorari_id;
  
  GET DIAGNOSTICS num_aggiornati = ROW_COUNT;
  RAISE NOTICE 'Pratiche aggiornate: %', num_aggiornati;
END $$;

-- ============================================================================
-- STEP 5: Elimina tutte le agenzie tranne Pecorari
-- ============================================================================

DO $$
DECLARE
  pecorari_id uuid;
  num_eliminate integer;
BEGIN
  -- Ottieni ID Pecorari
  SELECT id INTO pecorari_id 
  FROM public.agenzie 
  WHERE nome LIKE '%Pecorari%'
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Elimina tutte le altre agenzie
  DELETE FROM public.agenzie
  WHERE id != pecorari_id;
  
  GET DIAGNOSTICS num_eliminate = ROW_COUNT;
  RAISE NOTICE 'Agenzie eliminate: %', num_eliminate;
END $$;

-- ============================================================================
-- STEP 6: Verifica che rimanga solo 1 agenzia
-- ============================================================================

SELECT '=== VERIFICA: AGENZIE RIMANENTI ===' AS info;
SELECT 
  id,
  user_id,
  nome,
  email,
  created_at
FROM public.agenzie;

-- ============================================================================
-- STEP 7: Rimuovi vincolo UNIQUE se esiste (per evitare errori)
-- ============================================================================

DO $$
BEGIN
  -- Rimuovi vincolo se esiste
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'agenzie_user_id_key' 
      AND conrelid = 'public.agenzie'::regclass
  ) THEN
    ALTER TABLE public.agenzie DROP CONSTRAINT agenzie_user_id_key;
    RAISE NOTICE 'Vincolo UNIQUE rimosso';
  ELSE
    RAISE NOTICE 'Vincolo UNIQUE non esisteva';
  END IF;
END $$;

-- ============================================================================
-- STEP 8: Reinserisci vincolo UNIQUE
-- ============================================================================

ALTER TABLE public.agenzie 
ADD CONSTRAINT agenzie_user_id_key UNIQUE (user_id);

SELECT '=== VINCOLO UNIQUE REINSERITO ===' AS info;

-- Verifica
SELECT 
  conname AS vincolo,
  contype AS tipo,
  pg_get_constraintdef(oid) AS definizione
FROM pg_constraint
WHERE conrelid = 'public.agenzie'::regclass
  AND contype = 'u';

-- ============================================================================
-- STEP 9: Rimuovi policy RLS vecchie
-- ============================================================================

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'agenzie'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.agenzie', pol.policyname);
    RAISE NOTICE 'Policy rimossa: %', pol.policyname;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 10: Crea policy RLS corrette
-- ============================================================================

-- SELECT: utente autenticato vede solo la propria agenzia
CREATE POLICY "Utente vede solo la propria agenzia"
  ON public.agenzie FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: utente autenticato crea solo la propria agenzia
CREATE POLICY "Utente crea solo la propria agenzia"
  ON public.agenzie FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: utente autenticato aggiorna solo la propria agenzia
CREATE POLICY "Utente aggiorna solo la propria agenzia"
  ON public.agenzie FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- DELETE: utente autenticato elimina solo la propria agenzia
CREATE POLICY "Utente elimina solo la propria agenzia"
  ON public.agenzie FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

SELECT '=== POLICY RLS CREATE ===' AS info;

-- Verifica policy
SELECT 
  policyname AS policy,
  cmd AS operazione,
  roles AS ruoli
FROM pg_policies
WHERE tablename = 'agenzie'
ORDER BY policyname;

-- ============================================================================
-- STEP 11: Test finali
-- ============================================================================

-- Test 1: Verifica che ci sia solo 1 agenzia
SELECT '=== TEST 1: UNA SOLA AGENZIA ===' AS info;
SELECT COUNT(*) AS num_agenzie FROM public.agenzie;
-- Dovrebbe essere 1

-- Test 2: Verifica che non ci siano duplicati per user_id
SELECT '=== TEST 2: NESSUN DUPLICATO ===' AS info;
SELECT 
  user_id,
  COUNT(*) AS count
FROM public.agenzie
GROUP BY user_id
HAVING COUNT(*) > 1;
-- Dovrebbe restituire 0 righe

-- Test 3: Verifica che tutti i manifesti abbiano un'agenzia valida
SELECT '=== TEST 3: MANIFESTI VALIDI ===' AS info;
SELECT COUNT(*) AS manifesti_orfani
FROM public.manifesti m
LEFT JOIN public.agenzie a ON m.agenzia_id = a.id
WHERE a.id IS NULL;
-- Dovrebbe essere 0

-- Test 4: Verifica che tutte le pratiche abbiano un'agenzia valida
SELECT '=== TEST 4: PRATICHE VALIDE ===' AS info;
SELECT COUNT(*) AS pratiche_orfane
FROM public.pratiche p
LEFT JOIN public.agenzie a ON p.agenzia_id = a.id
WHERE a.id IS NULL;
-- Dovrebbe essere 0

-- ============================================================================
-- STEP 12: Riepilogo finale
-- ============================================================================

SELECT '=== RIEPILOGO FINALE ===' AS info;

SELECT 
  'agenzie' AS tabella,
  COUNT(*) AS righe
FROM public.agenzie

UNION ALL

SELECT 
  'manifesti',
  COUNT(*)
FROM public.manifesti

UNION ALL

SELECT 
  'pratiche',
  COUNT(*)
FROM public.pratiche;

SELECT '✅ Fix completato con successo!' AS status;
