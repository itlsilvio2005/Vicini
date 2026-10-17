# 🚨 FIX URGENTE: Agenzie Duplicate

## Problema
Il login come agenzia fallisce perché ci sono 3 agenzie con lo stesso user_id nel database.

## Soluzione Rapida (5 minuti)

### Passo 1: Apri Supabase SQL Editor
1. Vai su https://supabase.com/dashboard/project/fufqqwlmiqlvrxcnpekk/sql-editor
2. Clicca "New Query"

### Passo 2: Esegui lo Script di Fix
1. Apri il file `RESET_COMPLETO_AGENZIE.sql` dal tuo progetto
2. Copia TUTTO il contenuto
3. Incolla in Supabase SQL Editor
4. Clicca "Run"

### Passo 3: Verifica il Fix
Esegui questa query:
```sql
SELECT COUNT(*) FROM public.agenzie;
```
**Risultato atteso:** `1` (una sola agenzia)

### Passo 4: Testa il Login
1. Vai su http://localhost:3001/login
2. Login come agenzia:
   - Email: `agenzia@vicini.mo`
   - Password: `test123456`
3. La dashboard deve caricarsi senza errori

## Se il Problema Persiste

Esegui questa query diagnostica:
```sql
SELECT 
  id,
  user_id,
  nome,
  email
FROM public.agenzie;
```

E inviami il risultato per aiutarti ulteriormente.
