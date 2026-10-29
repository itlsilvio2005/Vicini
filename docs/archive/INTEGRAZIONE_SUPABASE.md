# Vicini — Integrazione Supabase

## ✅ Cosa è stato creato

### 1. Schema database completo (`SUPABASE_SCHEMA.sql`)
- 8 tabelle con Row Level Security (RLS)
- Policy di sicurezza per ogni tabella
- Trigger automatici per timestamp
- Indici per performance
- Funzioni helper per gestione utenti

**Tabelle create:**
- `profilo_utenti` - estende auth.users con ruolo (privato/agenzia)
- `agenzie` - profilo agenzia con foto, descrizione, servizi
- `manifesti` - manifesti funebri completi
- `pensieri` - cordogli con moderazione
- `ordini_fiori` - ordini con fatturazione
- `pratiche` - archivio agenzia
- `volonta` - Le Mie Volontà
- `nucleo` - Il Nucleo (familiari)

### 2. Client Supabase (`src/lib/supabase.ts`)
- Configurazione client con variabili d'ambiente
- Tipi TypeScript per tutte le entità
- Helper per verificare configurazione
- Messaggio di warning se non configurato

### 3. Sistema autenticazione (`src/lib/auth.tsx`)
- AuthProvider con contesto React
- Hook `useAuth()` per accesso a stato auth
- Login/signup con email/password
- Supporto ruoli (privato/agenzia)
- **Fallback mock** se Supabase non configurato (per demo)

### 4. Filtro anti-offese (`src/lib/filtro-offese.ts`)
- Lista parole vietate (italiano)
- Pattern regex per elusioni
- Contesti sospetti (moderazione umana)
- Controllo lunghezza e maiuscolo
- Messaggi user-friendly

### 5. Documentazione setup
- `SETUP_SUPABASE.md` - guida passo-passo completa
- `.env.example` - template variabili d'ambiente

### 6. Integrazione App
- AuthProvider avvolge l'intera app
- Tab rinominata: "Area Riservata Agenzia" → "Area Riservata"
- Route aggiornata: `/area-agenzia` → `/area-riservata`

## 📋 Prossimi passi per completare l'integrazione

### Fase 1: Setup Supabase (obbligatorio)
Segui `SETUP_SUPABASE.md` per:
1. Creare progetto Supabase
2. Eseguire schema SQL
3. Configurare Storage bucket
4. Copiare credenziali in `.env`

### Fase 2: Migrare componenti (consigliato)
I componenti attuali usano ancora `data.ts` (dati statici). Per usare Supabase:

**Priorità alta:**
1. **Backoffice.tsx** - sostituire dati con query Supabase
2. **B2C.tsx** - migrare Volontà e Nucleo su database
3. **Bacheca.tsx** - caricare manifesti da Supabase

**Priorità media:**
4. **Imprese.tsx** - caricare agenzie da Supabase
5. **Nuovo componente** - form creazione manifesti per agenzie
6. **Nuovo componente** - profilo agenzia editabile

**Priorità bassa:**
7. **Nuovo componente** - gruppo chat pensieri
8. **Nuovo componente** - bot AI assistente

### Fase 3: Nuove funzionalità
Una volta migrati i componenti:

1. **Area Riservata unificata**
   - Schermata login con scelta ruolo (privato/agenzia)
   - Privati: accesso solo a Volontà e Nucleo
   - Agenzie: accesso a dashboard completa

2. **Filtro anti-offese nei pensieri**
   - Integrare `filtraTesto()` in `CordoglioModal`
   - Mostrare messaggi di errore appropriati

3. **Gruppo chat pensieri**
   - Nuova tabella `gruppi_pensieri`
   - Interfaccia stile chat/thread
   - QR code per accesso gruppo

4. **Profilo agenzia**
   - Upload foto (logo + sede)
   - Edit descrizione, orari, servizi
   - Aree coperte

5. **Creazione manifesti**
   - Form per agenzie
   - Storico manifesti pubblicati
   - Confluiscono in bacheca pubblica

6. **Riorganizzazione area agenzia**
   - 4 sezioni: Bacheca, Profilo, Archivio, Backoffice
   - Separazione chiara tra creazione e gestione

7. **Bot AI assistente**
   - Chatbot per domande su funerali
   - Contenuti verificati (cremazione, esumazione, ecc.)
   - Rimando a agenzie/enti per casi specifici

## 🔐 Sicurezza implementata

### Row Level Security (RLS)
Ogni tabella ha policy che garantiscono:
- **Utenti privati**: vedono solo i propri dati
- **Agenzie**: vedono solo i dati della propria agenzia
- **Manifesti pubblicati**: visibili a tutti
- **Pensieri**: moderabili, non eliminabili da altri

### Autenticazione
- Email/password con Supabase Auth
- Sessioni persistenti (localStorage per mock, cookies per Supabase)
- Ruoli separati (privato vs agenzia)
- Logout sicuro

### Validazione
- Filtro anti-offese automatico
- Controllo lunghezza testi
- Pattern detection per elusioni
- Moderazione umana per casi sospetti

## 🧪 Testing

### Senza Supabase (demo)
L'app funziona in modalità mock:
- Login/signup simulati con localStorage
- Dati statici da `data.ts`
- Tutte le UI funzionano

### Con Supabase (produzione)
Dopo setup:
- Autenticazione reale
- Database persistente
- Storage per foto
- RLS attivo

## 📦 Dipendenze aggiunte

```json
{
  "@supabase/supabase-js": "^2.x.x"
}
```

## 🚀 Deploy

### Vercel/Netlify
1. Configura variabili d'ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Deploy automatico da Git

### Ambiente locale
```bash
npm install
npm run dev
```

## 📝 Note importanti

### Dati di esempio
Per popolare il database con dati di esempio, esegui nel SQL Editor di Supabase:

```sql
-- Inserisci agenzia di esempio
INSERT INTO public.agenzie (user_id, nome, indirizzo, descrizione, telefono, email)
VALUES (
  'USER_ID_AGENZIA',
  'Onoranze Funebri Pecorari',
  'Via Nonantolana, 555 — 41122 Modena (MO)',
  'Opera nei comuni di Modena, Nonantola e Ravarino...',
  '059 364 218',
  'info@onoranzefunebripecorari.it'
);

-- Inserisci manifesti di esempio
INSERT INTO public.manifesti (agenzia_id, nome_defunto, comune, rito, ...)
VALUES (...);
```

### Performance
- Indici creati su colonne frequentemente interrogate
- Query ottimizzate con join
- Cache client-side per dati statici

### Manutenzione
- Backup automatici Supabase (piano Pro)
- Monitoraggio query lente
- Log errori console browser

## 🆘 Troubleshooting

### "Supabase non configurato"
- Verifica file `.env` esista
- Controlla che URL e key siano corretti
- Riavvia `npm run dev`

### Errori RLS
- Verifica che tutte le policy siano state create
- Controlla che l'utente abbia il ruolo corretto
- Usa SQL Editor per debug

### Foto non caricano
- Verifica bucket Storage esistano
- Controlla policy Storage
- Verifica permessi browser

## 📚 Risorse

- [Documentazione Supabase](https://supabase.com/docs)
- [Guida RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)
- [Auth](https://supabase.com/docs/guides/auth)

---

**Stato attuale:** ✅ Fondamenta pronte, pronto per setup Supabase e migrazione componenti.
