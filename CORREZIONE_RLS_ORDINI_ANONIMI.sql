-- ============================================================================
-- CORREZIONE RLS E POLICY PER ORDINI ANONIMI
-- ============================================================================
-- Questo script corregge due problemi critici:
-- 1. Verifica che tutte le tabelle abbiano RLS abilitato
-- 2. Aggiunge policy per INSERT anonimo su ordini_fiori (form "Invia Fiori")
-- ============================================================================

-- ============================================================================
-- PASSO 1: Verifica e abilita RLS su tutte le tabelle
-- ============================================================================

-- Abilita RLS su tutte le tabelle (se non già abilitato)
ALTER TABLE public.profilo_utenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenzie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifesti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pensieri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordini_fiori ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pratiche ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volonta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nucleo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifiche_nucleo ENABLE ROW LEVEL SECURITY;

-- Verifica che RLS sia abilitato
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- PASSO 2: Corregge policy per ordini_fiori anonimi
-- ============================================================================

-- Elimina la policy vecchia che richiede autenticazione
DROP POLICY IF EXISTS "Utenti possono creare ordini" ON public.ordini_fiori;

-- Crea nuova policy che permette INSERT sia anonimo che autenticato
CREATE POLICY "Chiunque può creare ordini fiori"
  ON public.ordini_fiori FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- PASSO 3: Verifica tutte le policy
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- PASSO 4: Test - Verifica che un utente anonimo possa inserire un ordine
-- ============================================================================

-- Questo test dovrebbe funzionare ora (utente anonimo, user_id NULL)
-- INSERT INTO public.ordini_fiori (manifesto_id, user_id, composizione, importo, cliente_nome, cliente_email, cliente_telefono)
-- VALUES (
--   '11111111-1111-1111-1111-111111111111',  -- manifesto esistente
--   NULL,  -- utente anonimo
--   'Corona di fiori',
--   120.00,
--   'Mario Rossi',
--   'mario@email.it',
--   '3331234567'
-- );

-- ============================================================================
-- FINE SCRIPT
-- ============================================================================

SELECT '✅ RLS abilitato su tutte le tabelle e policy per ordini anonimi creata' AS status;
