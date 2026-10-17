-- ============================================================================
-- RESET COMPLETO: Tabella agenzie
-- ============================================================================
-- ATTENZIONE: Questo script elimina TUTTE le agenzie e le ricrea da zero.
-- Esegui solo se sei sicuro di voler resettare tutto.
-- ============================================================================

-- STEP 1: Elimina tutte le agenzie
DELETE FROM public.agenzie;

-- STEP 2: Elimina vincolo UNIQUE se esiste
ALTER TABLE public.agenzie DROP CONSTRAINT IF EXISTS agenzie_user_id_key;

-- STEP 3: Reinserisci vincolo UNIQUE
ALTER TABLE public.agenzie ADD CONSTRAINT agenzie_user_id_key UNIQUE (user_id);

-- STEP 4: Elimina tutte le policy RLS
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'agenzie'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.agenzie', pol.policyname);
  END LOOP;
END $$;

-- STEP 5: Crea policy RLS corrette
CREATE POLICY "Utente vede solo la propria agenzia"
  ON public.agenzie FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Utente crea solo la propria agenzia"
  ON public.agenzie FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Utente aggiorna solo la propria agenzia"
  ON public.agenzie FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Utente elimina solo la propria agenzia"
  ON public.agenzie FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- STEP 6: Crea agenzia Pecorari per l'utente agenzia
INSERT INTO public.agenzie (
  user_id,
  nome,
  indirizzo,
  descrizione,
  telefono,
  email,
  orari_apertura,
  servizi_offerti,
  aree_coperte
)
VALUES (
  'eba41f64-3173-4c6a-974c-18069d000dc2',
  'Onoranze Funebri Pecorari',
  'Via Nonantolana, 555 — 41122 Modena (MO)',
  'Opera nei comuni di Modena, Nonantola e Ravarino organizzando funerali completi con serietà e discrezione.',
  '059 364 218',
  'info@onoranzefunebripecorari.it',
  'Lunedì-Sabato: 8:00-19:00 | Domenica: 9:00-13:00 | Reperibilità 24h',
  '["Trasporto salma", "Allestimento camera ardente", "Organizzazione cerimonia", "Pratiche cimiteriali", "Cremazione"]'::jsonb,
  '["Modena", "Nonantola", "Ravarino"]'::jsonb
);

-- STEP 7: Aggiorna tutti i manifesti per puntare all'agenzia Pecorari
UPDATE public.manifesti
SET agenzia_id = (SELECT id FROM public.agenzie WHERE nome = 'Onoranze Funebri Pecorari');

-- STEP 8: Aggiorna tutte le pratiche per puntare all'agenzia Pecorari
UPDATE public.pratiche
SET agenzia_id = (SELECT id FROM public.agenzie WHERE nome = 'Onoranze Funebri Pecorari');

-- STEP 9: Verifica
SELECT '=== VERIFICA FINALE ===' AS info;

SELECT 
  'agenzie' AS tabella,
  COUNT(*) AS righe
FROM public.agenzie

UNION ALL

SELECT 'manifesti', COUNT(*) FROM public.manifesti

UNION ALL

SELECT 'pratiche', COUNT(*) FROM public.pratiche;

SELECT '✅ Reset completato!' AS status;
