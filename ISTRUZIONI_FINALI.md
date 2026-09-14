# 🚀 Istruzioni Finali - Esecuzione Script SQL

## ✅ Problema Risolto

Il vincolo UNIQUE sulla colonna `user_id` è stato **rimosso** dallo schema, permettendo a un singolo utente di gestire più agenzie. Lo script ora funziona correttamente.

## 📋 Cosa Fare Ora

### Passo 1: Ricrea lo Schema da Zero

**IMPORTANTE**: Devi eliminare le tabelle esistenti perché il vincolo UNIQUE è già presente nel database.

1. Apri **Supabase SQL Editor**
2. Copia e incolla questo script di pulizia:

```sql
-- Elimina tutte le tabelle
DROP TABLE IF EXISTS public.nucleo CASCADE;
DROP TABLE IF EXISTS public.volonta CASCADE;
DROP TABLE IF EXISTS public.pensieri CASCADE;
DROP TABLE IF EXISTS public.ordini_fiori CASCADE;
DROP TABLE IF EXISTS public.pratiche CASCADE;
DROP TABLE IF EXISTS public.manifesti CASCADE;
DROP TABLE IF EXISTS public.agenzie CASCADE;
DROP TABLE IF EXISTS public.profilo_utenti CASCADE;

-- Verifica che le tabelle siano state eliminate
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

3. Clicca **Run**
4. Dovresti vedere una lista vuota (nessuna tabella)

### Passo 2: Esegui lo Schema Aggiornato

1. Apri il file **`SUPABASE_SCHEMA.sql`**
3. Copia tutto il contenuto
4. Incolla nel SQL Editor di Supabase
5. Clicca **Run**
6. Dovresti vedere: "Success. No rows returned"

### Passo 3: Esegui lo Script di Reset

1. Apri il file **`RESET_E_INSERISCI_DATI.sql`**
3. Copia tutto il contenuto
4. Incolla nel SQL Editor di Supabase
6. Clicca **Run**
7. Dovresti vedere:

```
tabella    | righe
-----------|--------
nucleo     | 0
volonta    | 0
ordini_fiori | 0
pensieri   | 0
pratiche   | 0
manifesti  | 0
agenzie    | 0

✅ agenzie      | 3
✅ manifesti    | 4
✅ pensieri     | 3
✅ ordini_fiori | 2
✅ pratiche     | 2
✅ volonta      | 1
✅ nucleo       | 3
✅ RLS riabilitato su tutte le tabelle
```

## 🎯 Verifica Finale

### 1. Controlla i Dati nel Table Editor

1. Vai su **Table Editor** nel menu laterale di Supabase
3. Verifica che ci siano:
   - **3 righe** in `agenzie` (Pecorari, San Martino, Borsari)
   - **4 righe** in `manifesti`
   - **3 righe** in `pensieri`
   - **2 righe** in `ordini_fiori`
   - **2 righe** in `pratiche`
   - **1 riga** in `volonta`
   - **3 righe** in `nucleo`

### 2. Verifica gli UUID

Nella tabella `agenzie`, tutte e 3 le righe devono avere lo stesso `user_id`:
```
eba41f64-3173-4c6a-974c-18069d000dc2
```

### 3. Testa l'Applicazione

```bash
npm run dev
```

Apri http://localhost:5173 e testa:

**Login come Agenzia:**
- Email: `agenzia@vicini.mo`
- Password: `test123456`
- Dovresti vedere la dashboard con 3 agenzie gestibili

**Login come Utente Privato:**
- Email: `utente@vicini.mo`
- Password: `test123456`
- Dovresti vedere l'area privata con volontà e nucleo

## 📊 Struttura Dati Finale

### Utenti
- **Agenzia**: `eba41f64-3173-4c6a-974c-18069d000dc2` (gestisce 3 agenzie)
- **Privato**: `9f564219-7250-4077-a50a-ebb2f2353bad`

### Agenzie (tutte gestite dallo stesso utente)
1. **Pecorari** - ID: `a1111111-1111-1111-1111-111111111111`
2. **San Martino** - ID: `a2222222-2222-2222-2222-222222222222`
3. **Borsari** - ID: `a3333333-3333-3333-3333-333333333333`

### Manifesti
- 2 manifesti per Pecorari (Mario Rossi, Giuseppe Verdi)
- 2 manifesti per San Martino (Ahmed Hassan, Maria Bianchi)
- 0 manifesti per Borsari (puoi aggiungerli dalla dashboard)

## 🔍 Se Incontri Problemi

### Errore: "relation already exists"
Le tabelle esistono ancora. Esegui di nuovo lo script di pulizia (Passo 1).

### Errore: "duplicate key value violates unique constraint"
Il vincolo UNIQUE è ancora presente. Assicurati di aver eseguito il Passo 1 (DROP TABLE) prima di ricreare lo schema.

### Errore: "foreign key violation"
Gli UUID degli utenti non esistono in `auth.users`. Verifica che gli utenti siano stati creati correttamente in Supabase Authentication.

### L'app non si connette a Supabase
Verifica il file `.env`:
```env
VITE_SUPABASE_URL=https://fufqqwlmiqlvrxcnpekk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_CKMkgCtj_ML7eRMcbw2f7A_eA6JJGJd
```

## 📚 Documentazione Correlata

- **`SOLUZIONE_DEFINITIVA.md`** - Spiegazione dettagliata della soluzione
- **`SUPABASE_SCHEMA.sql`** - Schema database aggiornato (senza vincolo UNIQUE)
- **`RESET_E_INSERISCI_DATI.sql`** - Script di reset aggiornato
- **`GUIDA_RISOLUZIONE_VINCOLI.md`** - Troubleshooting avanzato

## 🎉 Risultato Atteso

Dopo aver completato tutti i passaggi:
- ✅ 3 agenzie inserite (tutte gestite dallo stesso utente)
- ✅ 4 manifesti inseriti
- ✅ Dati verificati nel Table Editor
- ✅ Applicazione funzionante
- ✅ Login funzionante per entrambi i ruoli

## 🔄 Prossimi Passi

Una volta che tutto funziona:
1. Testa la dashboard agenzia (crea/modifica manifesti)
2. Testa l'area privata (gestisci volontà e nucleo)
4. Prova il gruppo chat pensieri
5. Testa il filtro anti-offese

---

**Stato**: ✅ Pronto per l'esecuzione. Segui i 3 passaggi nell'ordine indicato.
