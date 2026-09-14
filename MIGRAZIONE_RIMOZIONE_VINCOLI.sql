-- ============================================================================
-- MIGRAZIONE: RIMOZIONE VINCOLO UNIQUE DA AGENZIE.USER_ID
-- ============================================================================
-- Questo script rimuove il vincolo UNIQUE dalla colonna user_id della tabella
-- agenzie, permettendo a un singolo utente di avere più agenzie.
-- 
-- ESEGUI PRIMA DI RESET_E_INSERISCI_DATI.sql
-- ============================================================================

-- 1. Rimuovi il vincolo UNIQUE dalla colonna user_id
ALTER TABLE public.agenzie 
DROP CONSTRAINT IF EXISTS agenzie_user_id_key;

-- 2. Verifica che il vincolo sia stato rimosso
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.agenzie'::regclass 
  AND contype = 'u';

-- Dovrebbe restituire 0 righe (nessun vincolo UNIQUE)

-- 3. Controlla tutti i vincoli UNIQUE in tutte le tabelle
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE contype = 'u'
ORDER BY conrelid::regclass::text, conname;

-- 4. Se ci sono altri vincoli UNIQUE problematici, rimuovili
-- Esempio: se manifesti ha un vincolo UNIQUE su agenzia_id + nome_defunto
-- ALTER TABLE public.manifesti DROP CONSTRAINT IF EXISTS manifesti_agenzia_id_nome_defunto_key;

-- ============================================================================
-- VERIFICA FINALE
-- ============================================================================
SELECT '✅ Vincolo UNIQUE rimosso da agenzie.user_id' AS status;
