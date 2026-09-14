# ✅ Soluzione Definitiva: Problema Vincolo UNIQUE Risolto

## 🎯 Problema Identificato

Il vincolo UNIQUE sulla colonna `user_id` nella tabella `agenzie` impediva di inserire più agenzie per lo stesso utente. Lo script tentava di inserire 3 agenzie (Pecorari, San Martino, Borsari) tutte con lo stesso `user_id`, causando l'errore:

```
duplicate key value violates unique constraint "agenzie_user_id_key"
```

## 🔍 Analisi del Modello Dati

### Due Possibili Soluzioni

**Opzione 1: Un utente = UNA agenzia** (modello restrittivo)
- Ogni proprietario di agenzia può avere UNA sola agenzia
- Le 3 agenzie di esempio devono avere 3 user_id diversi
- Più realistico per piccole imprese individuali

**Opzione 2: Un utente può gestire PIÙ agenzie** (modello flessibile) ✅ SCELTA
- Un amministratore può gestire più agenzie (catena, filiali, ecc.)
- Le 3 agenzie possono avere lo stesso user_id
- Più flessibile per scenari reali

## ✅ Soluzione Implementata

Abbiamo scelto l'**Opzione 2** (modello flessibile) perché:
1. Permette scenari realistici (catene di agenzie, filiali)
2. Più semplice da gestire per i dati di esempio
3. Non limita casi d'uso futuri

### Modifiche Apportate

#### 1. Schema Database (`SUPABASE_SCHEMA.sql`)
```sql
-- RIMOSSO il vincolo UNIQUE da user_id
create table public.agenzie (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profilo_utenti(id) on delete cascade,  -- NO UNIQUE
  nome text not null,
  ...
);
```

#### 2. Script Reset (`RESET_E_INSERISCI_DATI.sql`)
```sql
-- Tutte e 3 le agenzie usano lo stesso user_id
INSERT INTO public.agenzie (id, user_id, nome, ...)
VALUES 
(
  'a1111111-1111-1111-1111-111111111111',
  'eba41f64-3173-4c6a-974c-18069d000dc2',  -- Utente agenzia
  'Onoranze Funebri Pecorari',
  ...
),
(
  'a2222222-2222-2222-2222-222222222222',
  'eba41f64-3173-4c6a-974c-18069d000dc2',  -- Stesso utente
  'Onoranze Funebri San Martino',
  ...
),
(
  'a3333333-3333-3333-3333-333333333333',
  'eba41f64-3173-4c6a-974c-18069d000dc2',  -- Stesso utente
  'Onoranze Funebri Borsari',
  ...
)
ON CONFLICT (id) DO NOTHING;  -- Gestione conflitti su ID (non user_id)
```

## 🚀 Come Eseguire lo Script

### Passo 1: Ricrea lo Schema (Importante!)

Se hai già eseguito lo schema precedente, devi **ricrearlo da zero** perché il vincolo UNIQUE è già presente nel database:

```sql
-- 1. Cancella tutte le tabelle
DROP TABLE IF EXISTS public.nucleo CASCADE;
DROP TABLE IF EXISTS public.volonta CASCADE;
DROP TABLE IF EXISTS public.pensieri CASCADE;
DROP TABLE IF EXISTS public.ordini_fiori CASCADE;
DROP TABLE IF EXISTS public.pratiche CASCADE;
DROP TABLE IF EXISTS public.manifesti CASCADE;
DROP TABLE IF EXISTS public.agenzie CASCADE;
DROP TABLE IF EXISTS public.profilo_utenti CASCADE;

-- 2. Esegui lo schema aggiornato
-- Copia e incolla SUPABASE_SCHEMA.sql nel SQL Editor
-- Clicca Run
```

### Passo 2: Esegui lo Script di Reset

```sql
-- Copia e incolla RESET_E_INSERISCI_DATI.sql nel SQL Editor
-- Clicca Run
```

### Passo 3: Verifica i Dati

Dopo l'esecuzione, dovresti vedere:
```
✅ agenzie      | 3
✅ manifesti    | 4
✅ pensieri     | 3
✅ ordini_fiori | 2
✅ pratiche     | 2
✅ volonta      | 1
✅ nucleo       | 3
```

## 📊 Struttura Dati Finale

### Utenti
- **Agenzia**: `eba41f64-3173-4c6a-974c-18069d000dc2` (gestisce 3 agenzie)
- **Privato**: `9f564219-7250-4077-a50a-ebb2f2353bad`

### Agenzie (tutte gestite dallo stesso utente)
1. **Pecorari** (`a1111111-1111-1111-1111-111111111111`)
2. **San Martino** (`a2222222-2222-2222-2222-222222222222`)
3. **Borsari** (`a3333333-3333-3333-3333-333333333333`)

### Manifesti
- 2 manifesti per Pecorari
- 2 manifesti per San Martino
- 0 manifesti per Borsari (puoi aggiungerli dalla dashboard)

## 🔐 Sicurezza e RLS

Le policy RLS sono configurate correttamente:
- ✅ Chiunque può vedere le agenzie (bacheca pubblica)
- ✅ Solo il proprietario può aggiornare le proprie agenzie
- ✅ Solo utenti con ruolo 'agenzia' possono creare agenzie

## 🎯 Vantaggi del Modello Flessibile

1. **Scalabilità**: Un amministratore può gestire più agenzie senza creare nuovi utenti
2. **Flessibilità**: Ideale per catene, franchising, o agenzie con più sedi
3. **Semplicità**: Più facile da gestire per i dati di esempio e testing
4. **Realismo**: Riflette scenari aziendali reali

## 🔄 Se Preferisci il Modello Restrittivo

Se vuoi tornare al modello "un utente = una agenzia":

1. **Modifica lo schema**:
```sql
create table public.agenzie (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profilo_utenti(id) on delete cascade UNIQUE,  -- AGGIUNGI UNIQUE
  ...
);
```

2. **Crea 3 utenti diversi** in Supabase Auth:
   - Utente 1: `pecorari@vicini.mo`
   - Utente 2: `sanmartino@vicini.mo`
   - Utente 3: `borsari@vicini.mo`

3. **Aggiorna lo script** con i 3 user_id diversi

## 📝 Note Importanti

- Il vincolo UNIQUE è stato **rimosso** dallo schema
- Lo script usa `ON CONFLICT (id) DO NOTHING` (non su user_id)
- Tutte le agenzie sono gestite dallo stesso utente per semplicità
- In produzione, puoi sempre aggiungere il vincolo UNIQUE se necessario

## ✅ Checklist Finale

- [ ] Schema ricreato da zero (senza vincolo UNIQUE)
- [ ] Script `RESET_E_INSERISCI_DATI.sql` eseguito
- [ ] 3 agenzie inserite con lo stesso user_id
- [ ] 4 manifesti inseriti
- [ ] Dati verificati nel Table Editor
- [ ] Applicazione testata con `npm run dev`
- [ ] Login funzionante come agenzia e privato

## 🆘 Troubleshooting

### Errore: "relation already exists"
Le tabelle esistono già. Esegui il DROP TABLE prima di ricreare lo schema.

### Errore: "duplicate key value violates unique constraint"
Il vincolo UNIQUE è ancora presente. Ricrea lo schema da zero.

### Errore: "foreign key violation"
Gli UUID degli utenti non esistono in auth.users. Verifica che gli utenti siano stati creati correttamente.

---

**Stato**: ✅ Problema risolto definitivamente con modello dati flessibile
