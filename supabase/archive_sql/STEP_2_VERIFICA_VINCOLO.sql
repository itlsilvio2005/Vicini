-- ============================================================================
-- STEP 2: VERIFICA RIMOZIONE VINCOLO (Eseguire DOPO Step 1)
-- ============================================================================
-- Questo script verifica che il vincolo UNIQUE sia stato effettivamente rimosso.
-- Se vedi ancora "agenzie_user_id_key", il vincolo è ancora presente.
-- ============================================================================

-- Verifica che il vincolo UNIQUE su user_id non esista più
SELECT 
    conname AS vincolo,
    conrelid::regclass AS tabella,
    pg_get_constraintdef(oid) AS definizione
FROM pg_constraint 
WHERE conrelid = 'public.agenzie'::regclass 
  AND contype = 'u';

-- Se il risultato è vuoto (0 rows), il vincolo è stato rimosso correttamente
-- Se vedi ancora "agenzie_user_id_key", ripeti lo Step 1

SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Nessun vincolo UNIQUE trovato - puoi procedere con STEP 3'
        ELSE '❌ Vincoli UNIQUE ancora presenti - ripeti STEP 1'
    END AS status
FROM pg_constraint 
WHERE conrelid = 'public.agenzie'::regclass 
  AND contype = 'u';
