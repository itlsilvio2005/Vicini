# 🚀 Guida Integrazione Completa - Vicini + Supabase

## ✅ Cosa è stato creato

### Componenti Frontend Nuovi

1. **`src/components/LoginUnificato.tsx`**
   - Login/Registrazione unificato per privati e agenzie
   - Selezione ruolo (privato/agenzia)
   - Integrazione con Supabase Auth
   - Redirect automatico dopo login

2. **`src/components/DashboardAgenzia.tsx`**
   - Contenitore principale dashboard agenzia
   - 4 sezioni navigabili con tabs
   - Caricamento dati agenzia da Supabase
   - Controllo permessi (solo ruolo agenzia)

3. **`src/components/BachecaManifestiAgenzia.tsx`**
   - Creazione nuovi manifesti
   - Modifica manifesti esistenti
   - Eliminazione manifesti
   - Toggle pubblicazione (pubblico/bozza)
   - Lista storico manifesti

4. **`src/components/ProfiloAgenzia.tsx`**
   - Modifica dati agenzia
   - Upload logo (Supabase Storage)
   - Upload foto sede (Supabase Storage)
   - Gestione servizi e aree coperte

5. **`src/components/ArchivioAgenzia.tsx`**
   - Visualizzazione pratiche archiviate
   - Gestione ordini fiori
   - Invio fatture via email
   - Filtri e ricerca

6. **`src/components/BackofficeAgenzia.tsx`**
   - Panoramica con KPI
   - Statistiche manifesti, pratiche, ordini
   - Fatturato totale
   - Attività recenti

7. **`src/components/GruppoChatPensieri.tsx`**
   - Chat in tempo reale per pensieri
   - Filtro anti-offese automatico
   - QR code per condivisione
   - Real-time updates con Supabase

### Modifiche ai File Esistenti

- **`src/App.tsx`**: Aggiunte nuove rotte (/login, /dashboard-agenzia, /area-privata)
- **`src/lib/supabase.ts`**: Configurazione client Supabase
- **`src/lib/auth.tsx`**: Sistema autenticazione completo
- **`src/lib/filtro-offese.ts`**: Filtro anti-offese per pensieri
- **`.env`**: Credenziali Supabase configurate

## 📋 Come Integrare nel Progetto

### Passo 1: Verifica Dipendenze

```bash
npm install
```

Le dipendenze necessarie sono già state installate:
- `@supabase/supabase-js`
- `qrcode.react`
- `react-router-dom`
- `lucide-react`

### Passo 2: Configura Supabase

1. **Esegui lo schema database**
   ```bash
   # Apri Supabase Dashboard
   # Vai su SQL Editor
   # Copia e incolla SUPABASE_SCHEMA.sql
   # Clicca Run
   ```

2. **Configura Storage**
   - Crea bucket `agenzie-loghi` (public)
   - Crea bucket `agenzie-foto-sede` (public)
   - Aggiungi policy SELECT, INSERT, UPDATE

3. **Crea utenti di test**
   ```
   Agenzia: agenzia@vicini.mo / test123456
   Privato: utente@vicini.mo / test123456
   ```

### Passo 3: Testa i Componenti

#### Test Login
```bash
npm run dev
```
Apri: http://localhost:5173/login

- Prova login come privato → redirect a /area-privata
- Prova login come agenzia → redirect a /dashboard-agenzia

#### Test Dashboard Agenzia
1. Login come agenzia
2. Verifica le 4 sezioni:
   - **Bacheca Manifesti**: Crea un nuovo manifesto
   - **Profilo**: Modifica dati e carica logo
   - **Archivio**: Visualizza pratiche e ordini
   - **Backoffice**: Controlla KPI e statistiche

#### Test Gruppo Chat
1. Vai su un manifesto (/manifesto/:id)
2. Verifica la sezione "Gruppo Pensieri"
3. Prova a lasciare un pensiero
4. Testa il filtro anti-offese (prova a scrivere parolacce)
5. Clicca "Condividi" per vedere il QR code

### Passo 4: Migrazione Dati (Opzionale)

Se vuoi migrare i dati esistenti da `data.ts` a Supabase:

```bash
# Esegui DATI_ESEMPIO.sql nel SQL Editor
# Sostituisci i placeholder con gli UUID reali
```

## 🔧 Struttura File

```
src/
├── components/
│   ├── LoginUnificato.tsx          # Login/Registrazione
│   ├── DashboardAgenzia.tsx        # Dashboard agenzia
│   ├── BachecaManifestiAgenzia.tsx # Gestione manifesti
│   ├── ProfiloAgenzia.tsx         # Profilo editabile
│   ├── ArchivioAgenzia.tsx        # Archivio pratiche/ordini
│   ├── BackofficeAgenzia.tsx      # Panoramica KPI
│   └── GruppoChatPensieri.tsx    # Chat pensieri + QR
├── lib/
│   ├── supabase.ts               # Client Supabase
│   ├── auth.tsx                  # Autenticazione
│   └── filtro-offese.ts         # Moderazione contenuti
├── App.tsx                       # Router principale
└── .env                          # Credenziali Supabase
```

## 🎯 Funzionalità Implementate

### ✅ Completate

1. **Autenticazione**
   - Login email/password
   - Registrazione con ruolo
   - Sessione persistente
   - Logout

2. **Dashboard Agenzia**
   - 4 sezioni complete
   - Creazione manifesti
   - Upload foto (Storage)
   - Gestione pratiche
   - KPI e statistiche

3. **Gruppo Chat Pensieri**
   - Chat real-time
   - Filtro anti-offese
   - QR code condivisione
   - Moderazione automatica

4. **Sicurezza**
   - Row Level Security (RLS)
   - Controllo permessi
   - Validazione server-side
   - Filtro contenuti offensivi

### 🔄 Da Completare (Opzionale)

1. **Migrazione B2C.tsx**
   - Sostituire localStorage con Supabase
   - Query reali per Volontà e Nucleo

2. **Migrazione Bacheca.tsx**
   - Caricare manifesti da Supabase
   - Salvare pensieri su database

3. **Notifiche Push**
   - Implementare con Supabase Realtime
   - Notificare familiari del Nucleo

4. **Bot AI Assistente**
   - Integrare con API esterna
   - Contenuti verificati

## 🔐 Sicurezza Implementata

### Row Level Security (RLS)

Tutte le tabelle hanno policy RLS:

- **profilo_utenti**: Utenti vedono solo il proprio profilo
- **agenzie**: Chiunque può vedere, solo proprietario modifica
- **manifesti**: Chiunque vede pubblicati, solo agenzia crea/modifica
- **pensieri**: Chiunque vede approvati, solo autore crea/elimina
- **ordini_fiori**: Solo utente vede propri, agenzia vede propri manifesti
- **pratiche**: Solo agenzia vede proprie
- **volonta**: Solo proprietario vede/modifica
- **nucleo**: Solo proprietario vede/modifica

### Filtro Anti-Offese

Implementato in `src/lib/filtro-offese.ts`:
- Lista parole vietate
- Pattern detection per elusioni
- Contesti sospetti (moderazione umana)
- Controllo lunghezza e maiuscolo

## 📊 Database Schema

8 tabelle con relazioni:
- profilo_utenti (estende auth.users)
- agenzie (1:1 con profilo_utenti)
- manifesti (N:1 con agenzie)
- pensieri (N:1 con manifesti)
- ordini_fiori (N:1 con manifesti)
- pratiche (N:1 con agenzie)
- volonta (1:1 con profilo_utenti)
- nucleo (N:1 con profilo_utenti)

## 🚀 Deploy

### Vercel/Netlify

1. Configura variabili d'ambiente:
   ```
   VITE_SUPABASE_URL=https://fufqqwlmiqlvrxcnpekk.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_CKMkgCtj_ML7eRMcbw2f7A_eA6JJGJd
   ```

2. Deploy automatico da Git

### Build Produzione

```bash
npm run build
npm run preview
```

## 🆘 Troubleshooting

### Errore "Cannot find module './BachecaManifestiAgenzia'"
- Verifica che tutti i file in `src/components/` esistano
- Controlla che i nomi dei file siano corretti

### Errore "Module 'qrcode.react' has no default export"
- Usa `import { QRCodeSVG } from 'qrcode.react'` invece di default import

### Login non funziona
- Verifica credenziali in Supabase Authentication → Users
- Controlla che il metadata contenga `{"ruolo": "agenzia"}` o `{"ruolo": "privato"}`

### Foto non si caricano
- Verifica bucket Storage esistano
- Controlla policy Storage (SELECT, INSERT, UPDATE)
- Verifica permessi browser

### RLS errors
- Verifica che tutte le policy siano state create
- Controlla che l'utente abbia il ruolo corretto
- Usa SQL Editor per debug

## 📚 Risorse

- [Documentazione Supabase](https://supabase.com/docs)
- [Guida RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)
- [Auth](https://supabase.com/docs/guides/auth)
- [React Router](https://reactrouter.com/)

## ✅ Checklist Finale

- [x] Credenziali Supabase configurate (.env)
- [x] Client Supabase implementato
- [x] Sistema autenticazione completo
- [x] Dashboard agenzia con 4 sezioni
- [x] Creazione manifesti
- [x] Profilo agenzia editabile
- [x] Archivio pratiche e ordini
- [x] Backoffice con KPI
- [x] Gruppo chat pensieri
- [x] QR code condivisione
- [x] Filtro anti-offese
- [x] Integrazione routing
- [ ] Esegui SUPABASE_SCHEMA.sql
- [ ] Configura Storage bucket
- [ ] Crea utenti di test
- [ ] Testa tutte le funzionalità
- [ ] Deploy in produzione

---

**Stato**: ✅ Codice frontend completo e pronto per l'integrazione con Supabase.

**Prossimo passo**: Esegui lo schema SQL in Supabase e testa le funzionalità.
