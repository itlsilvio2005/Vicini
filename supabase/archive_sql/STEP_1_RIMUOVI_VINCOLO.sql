-- ============================================================================
-- STEP 1: RIMOZIONE VINCOLO UNIQUE (Eseguire da SOLO)
-- ============================================================================
-- Questo script rimuove il vincolo UNIQUE dalla colonna user_id della tabella
-- agenzie. Deve essere eseguito SEPARATAMENTE prima dello script di reset.
-- 
-- IMPORTANTE: Esegui SOLO questo script, poi verifica con STEP 2
-- ============================================================================

-- Rimuovi il vincolo UNIQUE dalla colonna user_id
ALTER TABLE public.agenzie DROP CONSTRAINT IF EXISTS agenzie_user_id_key;

-- Messaggio di conferma
SELECT '✅ Vincolo UNIQUE rimosso da agenzie.user_id' AS status;
