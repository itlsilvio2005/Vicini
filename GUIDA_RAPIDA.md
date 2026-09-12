# 🚀 Guida Rapida - Setup Completo Vicini

## ✅ Cosa hai già fatto

- [x] Progetto Supabase creato: `fufqqwlmiqlvrxcnpekk.supabase.co`
- [x] File `.env` creato con le tue credenziali
- [x] Schema SQL pronto: `SUPABASE_SCHEMA.sql`
- [x] Dati di esempio pronti: `DATI_ESEMPIO.sql`

## 📋 Passaggi per completare il setup

### 1️⃣ Esegui lo schema database

1. Apri il tuo progetto Supabase: https://supabase.com/dashboard/project/fufqqwlmiqlvrxcnpekk
2. Vai su **SQL Editor** (icona nel menu laterale)
3. Clicca **New Query**
4. Copia tutto il contenuto di `SUPABASE_SCHEMA.sql`
5. Incolla nell'editor e clicca **Run** (o premi Ctrl+Enter)
6. ✅ Dovresti vedere: "Success. No rows returned"

### 2️⃣ Crea gli utenti di test

1. Vai su **Authentication** → **Users**
2. Clicca **Add User** → **Create New User**
3. Crea questi due utenti:

**Utente Agenzia:**
- Email: `agenzia@vicini.mo`
- Password: `test123456`
- Spunta "Auto Confirm User"
- Clicca **Create User**
- Dopo la creazione, clicca sui tre puntini → **Edit User**
- Nel campo **Metadata**, incolla: `{"ruolo": "agenzia"}`
- Salva
- **Copia l'UID** (es: `123e4567-e89b-12d3-a456-426614174000`)

**Utente Privato:**
- Email: `utente@vicini.mo`
- Password: `test123456`
- Spunta "Auto Confirm User"
- Clicca **Create User**
- Dopo la creazione, clicca sui tre puntini → **Edit User**
- Nel campo **Metadata**, incolla: `{"ruolo": "privato"}`
- Salva
- **Copia l'UID** (es: `987fcdeb-51a2-43d7-9012-3456789abcde`)

### 3️⃣ Configura Storage per le foto

1. Vai su **Storage**
2. Clicca **New Bucket**
3. Crea due bucket:
   - Nome: `agenzie-loghi` → Spunta **Public bucket** → **Create**
   - Nome: `agenzie-foto-sede` → Spunta **Public bucket** → **Create**

4. Per ogni bucket, vai su **Policies** e crea queste policy:

**Policy SELECT (per entrambi i bucket):**
- Clicca **New Policy** → **For full customization**
- Policy name: `Allow public read`
- Allowed operation: **SELECT**
- Target roles: `anon`, `authenticated`
- Policy definition: `true`
- Clicca **Save**

**Policy INSERT (per entrambi i bucket):**
- Clicca **New Policy** → **For full customization**
- Policy name: `Allow authenticated upload`
- Allowed operation: **INSERT**
- Target roles: `authenticated`
- Policy definition: `true`
- Clicca **Save**

**Policy UPDATE (per entrambi i bucket):**
- Clicca **New Policy** → **For full customization**
- Policy name: `Allow authenticated update`
- Allowed operation: **UPDATE**
- Target roles: `authenticated`
- Policy definition: `true`
- Clicca **Save**

### 4️⃣ Popola il database con dati di esempio

1. Vai su **SQL Editor** → **New Query**
2. Copia tutto il contenuto di `DATI_ESEMPIO.sql`
3. **Sostituisci i placeholder** con gli UUID reali:

```sql
-- Sostituisci questi placeholder:
'USER_ID_AGENZIA_QUI' → con l'UID dell'utente agenzia (es: '123e4567-e89b-12d3-a456-426614174000')
'AGENZIA_ID_QUI' → con l'ID dell'agenzia (lo otterrai dopo il primo INSERT)
'MANIFESTO_ID_QUI' → con l'ID del manifesto (lo otterrai dopo il primo INSERT)
'USER_ID_PRIVATO_QUI' → con l'UID dell'utente privato (es: '987fcdeb-51a2-43d7-9012-3456789abcde')
```

**Procedura dettagliata:**

a) Prima esegui solo gli INSERT delle **agenzie** (sezione 2), sostituendo solo `'USER_ID_AGENZIA_QUI'` con l'UID reale

b) Vai su **Table Editor** → **agenzie** → copia il valore della colonna `id` della prima agenzia (es: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

c) Torna al SQL Editor e sostituisci tutti i `'AGENZIA_ID_QUI'` con quell'ID

d) Esegui gli INSERT dei **manifesti** (sezione 3)

e) Vai su **Table Editor** → **manifesti** → copia l'ID del primo manifesto

f) Sostituisci tutti i `'MANIFESTO_ID_QUI'` con quell'ID

g) Sostituisci tutti i `'USER_ID_PRIVATO_QUI'` con l'UID dell'utente privato

h) Esegui il resto degli INSERT (pensieri, ordini, pratiche, volontà, nucleo)

4. Clicca **Run**
5. ✅ Dovresti vedere: "Success. No rows returned"

### 5️⃣ Verifica i dati

1. Vai su **Table Editor**
2. Controlla che queste tabelle abbiano dati:
   - `profilo_utenti` → 2 righe
   - `agenzie` → 3 righe
   - `manifesti` → 4 righe
   - `pensieri` → 3 righe
   - `ordini_fiori` → 2 righe
   - `pratiche` → 2 righe
   - `volonta` → 1 riga
   - `nucleo` → 3 righe

### 6️⃣ Avvia l'applicazione

```bash
# Assicurati di essere nella directory del progetto
npm install
npm run dev
```

Apri il browser su: http://localhost:5173

### 7️⃣ Testa l'applicazione

**Test 1: Login come utente privato**
1. Clicca su **Area Riservata** nel menu
2. Inserisci:
   - Email: `utente@vicini.mo`
   - Password: `test123456`
3. Dovresti vedere la dashboard privata con:
   - Le Mie Volontà (con i dati salvati)
   - Il Nucleo (con i 3 familiari)

**Test 2: Login come agenzia**
1. Esci dall'area riservata
2. Clicca su **Area Riservata**
3. Inserisci:
   - Email: `agenzia@vicini.mo`
   - Password: `test123456`
4. Dovresti vedere la dashboard agenzia con:
   - Bacheca manifesti (4 manifesti)
   - Archivio pratiche (2 pratiche)
   - Gestione ordini fiori (2 ordini)

**Test 3: Bacheca pubblica**
1. Vai su **Bacheca Manifesti**
2. Dovresti vedere i 4 manifesti di esempio
3. Clicca su un manifesto per vedere i dettagli
4. Prova a lasciare un pensiero (verrà filtrato dal sistema anti-offese)
5. Prova a inviare fiori

**Test 4: Mappa interattiva**
1. Vai su **Mappa & Luoghi**
2. Dovresti vedere la mappa di Modena con i marker
3. Clicca su un marker per vedere i dettagli del luogo

## 🔧 Risoluzione problemi

### Problema: "Supabase non configurato"
- Verifica che il file `.env` esista e contenga le credenziali corrette
- Riavvia il server: `Ctrl+C` poi `npm run dev`

### Problema: "relation already exists"
- Le tabelle esistono già, puoi ignorare l'errore
- Oppure droppa le tabelle e riesegui lo schema

### Problema: "permission denied for table"
- Verifica che RLS sia abilitato su tutte le tabelle
- Controlla che le policy siano state create correttamente

### Problema: Login non funziona
- Verifica che l'utente esista in Authentication → Users
- Controlla che il metadata contenga `{"ruolo": "agenzia"}` o `{"ruolo": "privato"}`
- Verifica che l'utente sia confermato (spunta "Auto Confirm User")

### Problema: I manifesti non appaiono
- Verifica che il campo `pubblicato` sia `true`
- Controlla che l'`agenzia_id` sia corretto
- Verifica nel Table Editor che i dati esistano

## 📊 Credenziali di test

**Utente Privato:**
- Email: `utente@vicini.mo`
- Password: `test123456`
- Ruolo: privato
- Accesso: Le Mie Volontà, Il Nucleo

**Utente Agenzia:**
- Email: `agenzia@vicini.mo`
- Password: `test123456`
- Ruolo: agenzia
- Accesso: Dashboard completa agenzia

## 🎯 Prossimi passi

Una volta che tutto funziona:

1. **Migra i componenti** per usare i dati reali da Supabase invece di `data.ts`
2. **Crea il form** per la creazione di nuovi manifesti da parte delle agenzie
3. **Implementa il profilo agenzia** editabile con upload foto
4. **Aggiungi il filtro anti-offese** nei pensieri (già pronto in `src/lib/filtro-offese.ts`)
5. **Crea il gruppo chat** per i pensieri (stile thread)

## 📚 Documentazione completa

- `SETUP_SUPABASE.md` - Guida dettagliata setup Supabase
- `INTEGRAZIONE_SUPABASE.md` - Documentazione tecnica integrazione
- `README.md` - Panoramica progetto
- `SUPABASE_SCHEMA.sql` - Schema database completo
- `DATI_ESEMPIO.sql` - Dati di esempio

## 🆘 Supporto

Se incontri problemi:
1. Controlla la console del browser (F12) per errori
2. Verifica i log nel dashboard Supabase
3. Controlla che tutte le policy RLS siano corrette
4. Verifica che gli UUID siano stati sostituiti correttamente

---

**Buon lavoro! 🚀**
