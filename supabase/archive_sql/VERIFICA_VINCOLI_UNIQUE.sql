-- ============================================================================
-- VERIFICA VINCOLI UNIQUE NEL DATABASE
-- ============================================================================
-- Questo script elenca tutti i vincoli UNIQUE nel database per identificare
-- eventuali conflitti con gli INSERT.
-- ============================================================================

-- 1. Elenca tutti i vincoli UNIQUE
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE contype = 'u'
ORDER BY conrelid::regclass::text, conname;

-- 2. Verifica specifica per la tabella agenzie
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.agenzie'::regclass;

-- 3. Verifica specifica per la tabella manifesti
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.manifesti'::regclass;

-- 4. Verifica specifica per la tabella pensieri
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.pensieri'::regclass;

-- 5. Verifica specifica per la tabella ordini_fiori
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.ordini_fiori'::regclass;

-- 6. Verifica specifica per la tabella pratiche
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.pratiche'::regclass;

-- 7. Verifica specifica per la tabella volonta
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.volonta'::regclass;

-- 8. Verifica specifica per la tabella nucleo
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.nucleo'::regclass;

-- ============================================================================
-- RIMOZIONE VINCOLI UNIQUE PROBLEMATICI (OPZIONALE)
-- ============================================================================
-- Se trovi vincoli UNIQUE che causano problemi, rimuovili con:
-- ALTER TABLE public.nome_tabella DROP CONSTRAINT IF EXISTS nome_vincolo;

-- Esempio:
-- ALTER TABLE public.manifesti DROP CONSTRAINT IF EXISTS manifesti_agenzia_id_nome_defunto_key;
