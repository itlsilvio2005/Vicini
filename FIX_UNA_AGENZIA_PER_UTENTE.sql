-- ============================================================================
-- FIX: Una agenzia per utente + vincolo UNIQUE
-- ============================================================================
-- Questo script:
-- 1. Rimuove le agenzie duplicate (mantiene solo Pecorari)
-- 2. Aggiorna manifesti e pratiche che puntavano alle agenzie rimosse
-- 3. Reinserisce il vincolo UNIQUE su agenzie.user_id
-- 4. Verifica le policy RLS
-- ============================================================================

-- ============================================================================
-- STEP 1: Verifica situazione attuale
-- ============================================================================

SELECT '=== SITUAZIONE ATTUALE ===' AS info;

-- Conta agenzie per user_id
SELECT 
  user_id,
  COUNT(*) AS num_agenzie,
  array_agg(nome) AS agenzie
FROM public.agenzie
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Mostra tutte le agenzie
SELECT 
  id,
  user_id,
  nome,
  email
FROM public.agenzie
ORDER BY user_id, nome;

-- ============================================================================
-- STEP 2: Identifica l'agenzia da mantenere (Pecorari)
-- ============================================================================

-- ID dell'agenzia Pecorari (da mantenere)
DO $$
DECLARE
  agenzia_pecorari_id uuid;
  agenzia_san_martino_id uuid;
  agenzia_borsari_id uuid;
BEGIN
  SELECT id INTO agenzia_pecorari_id 
  FROM public.agenzie 
  WHERE nome = 'Onoranze Funebri Pecorari' 
  LIMIT 1;
  
  SELECT id INTO agenzia_san_martino_id 
  FROM public.agenzie 
  WHERE nome = 'Onoranze Funebri San Martino' 
  LIMIT 1;
  
  SELECT id INTO agenzia_borsari_id 
  FROM public.agenzie 
  WHERE nome = 'Onoranze Funebri Borsari' 
  LIMIT 1;
  
  RAISE NOTICE 'Agenzia Pecorari (da mantenere): %', agenzia_pecorari_id;
  RAISE NOTICE 'Agenzia San Martino (da rimuovere): %', agenzia_san_martino_id;
  RAISE NOTICE 'Agenzia Borsari (da rimuovere): %', agenzia_borsari_id;
END $$;

-- ============================================================================
-- STEP 3: Aggiorna manifesti che puntavano alle agenzie rimosse
-- ============================================================================

-- Prima di eliminare le agenzie, aggiorna i manifesti
-- Opzione A: Assegna tutti i manifesti all'agenzia Pecorari
UPDATE public.manifesti
SET agenzia_id = (
  SELECT id FROM public.agenzie 
  WHERE nome = 'Onoranze Funebri Pecorari' 
  LIMIT 1
)
WHERE agenzia_id IN (
  SELECT id FROM public.agenzie 
  WHERE nome IN ('Onoranze Funebri San Martino', 'Onoranze Funebri Borsari')
);

SELECT '=== MANIFESTI AGGIORNATI ===' AS info;
SELECT COUNT(*) AS manifesti_aggiornati FROM public.manifesti;

-- ============================================================================
-- STEP 4: Aggiorna pratiche che puntavano alle agenzie rimosse
-- ============================================================================

UPDATE public.pratiche
SET agenzia_id = (
  SELECT id FROM public.agenzie 
  WHERE nome = 'Onoranze Funebri Pecorari' 
  LIMIT 1
)
WHERE agenzia_id IN (
  SELECT id FROM public.agenzie 
  WHERE nome IN ('Onoranze Funebri San Martino', 'Onoranze Funebri Borsari')
);

SELECT '=== PRATICHE AGGIORNATE ===' AS info;
SELECT COUNT(*) AS pratiche_aggiornate FROM public.pratiche;

-- ============================================================================
-- STEP 5: Elimina le agenzie duplicate
-- ============================================================================

DELETE FROM public.agenzie
WHERE nome IN ('Onoranze Funebri San Martino', 'Onoranze Funebri Borsari');

SELECT '=== AGENZIE RIMANENTI ===' AS info;
SELECT 
  id,
  user_id,
  nome,
  email
FROM public.agenzie;

-- ============================================================================
-- STEP 6: Reinserisci il vincolo UNIQUE su user_id
-- ============================================================================

-- Rimuovi il vincolo se esiste già
ALTER TABLE public.agenzie 
DROP CONSTRAINT IF EXISTS agenzie_user_id_key;

-- Reinserisci il vincolo UNIQUE
ALTER TABLE public.agenzie 
ADD CONSTRAINT agenzie_user_id_key UNIQUE (user_id);

SELECT '=== VINCOLO UNIQUE REINSERITO ===' AS info;

-- Verifica che il vincolo esista
SELECT 
  conname AS vincolo,
  contype AS tipo,
  pg_get_constraintdef(oid) AS definizione
FROM pg_constraint
WHERE conrelid = 'public.agenzie'::regclass
  AND contype = 'u';

-- ============================================================================
-- STEP 7: Verifica e correggi policy RLS per agenzie
-- ============================================================================

-- Rimuovi policy vecchie se esistono
DROP POLICY IF EXISTS "Chiunque può vedere le agenzie" ON public.agenzie;
DROP POLICY IF EXISTS "Solo il proprietario può aggiornare l'agenzia" ON public.agenzie;
DROP POLICY IF EXISTS "Solo agenzie possono creare il profilo agenzia" ON public.agenzie;

-- Crea policy corrette

-- SELECT: un utente autenticato può vedere solo la propria agenzia
CREATE POLICY "Utente vede solo la propria agenzia"
  ON public.agenzie FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: un utente autenticato può creare solo la propria agenzia
CREATE POLICY "Utente crea solo la propria agenzia"
  ON public.agenzie FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: un utente autenticato può aggiornare solo la propria agenzia
CREATE POLICY "Utente aggiorna solo la propria agenzia"
  ON public.agenzie FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- DELETE: un utente autenticato può eliminare solo la propria agenzia
CREATE POLICY "Utente elimina solo la propria agenzia"
  ON public.agenzie FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

SELECT '=== POLICY RLS AGENZIE CREATE ===' AS info;

-- Verifica policy
SELECT 
  policyname AS policy,
  cmd AS operazione,
  roles AS ruoli
FROM pg_policies
WHERE tablename = 'agenzie'
ORDER BY policyname;

-- ============================================================================
-- STEP 8: Test - Verifica che tutto funzioni
-- ============================================================================

-- Test 1: Verifica che ci sia solo 1 agenzia per user_id
SELECT '=== TEST 1: UNA AGENZIA PER UTENTE ===' AS info;
SELECT 
  user_id,
  COUNT(*) AS num_agenzie
FROM public.agenzie
GROUP BY user_id
HAVING COUNT(*) > 1;
-- Dovrebbe restituire 0 righe

-- Test 2: Verifica che l'agenzia Pecorari esista
SELECT '=== TEST 2: AGENZIA PECORARI ESISTE ===' AS info;
SELECT 
  id,
  user_id,
  nome,
  email
FROM public.agenzie
WHERE nome = 'Onoranze Funebri Pecorari';

-- Test 3: Verifica che tutti i manifesti abbiano un'agenzia valida
SELECT '=== TEST 3: MANIFESTI CON AGENZIA VALIDA ===' AS info;
SELECT COUNT(*) AS manifesti_orfani
FROM public.manifesti m
LEFT JOIN public.agenzie a ON m.agenzia_id = a.id
WHERE a.id IS NULL;
-- Dovrebbe restituire 0

-- Test 4: Verifica che tutte le pratiche abbiano un'agenzia valida
SELECT '=== TEST 4: PRATICHE CON AGENZIA VALIDA ===' AS info;
SELECT COUNT(*) AS pratiche_orfane
FROM public.pratiche p
LEFT JOIN public.agenzie a ON p.agenzia_id = a.id
WHERE a.id IS NULL;
-- Dovrebbe restituire 0

-- ============================================================================
-- STEP 9: Riepilogo finale
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
