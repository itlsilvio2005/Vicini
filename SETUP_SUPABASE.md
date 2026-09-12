# Configurazione Supabase per Vicini

## Passo 1: Crea progetto Supabase

1. Vai su https://supabase.com
2. Clicca "New Project"
3. Scegli nome, password database e regione
4. Attendi il completamento (circa 2 minuti)

## Passo 2: Esegui lo schema SQL

1. Nel dashboard Supabase, vai su **SQL Editor** (icona nel menu laterale)
2. Clicca "New Query"
3. Copia tutto il contenuto di `SUPABASE_SCHEMA.sql`
4. Incolla nell'editor e clicca **Run**
5. Verifica che tutte le tabelle siano state create (dovresti vedere 8 tabelle)

## Passo 3: Configura Storage per le foto

1. Vai su **Storage** nel menu laterale
2. Clicca "New Bucket"
3. Crea due bucket:
   - `agenzie-loghi` (public)
   - `agenzie-foto-sede` (public)
4. Per ogni bucket, vai su **Policies** e crea:
   - **SELECT**: Allow public access (chiunque può leggere)
   - **INSERT**: Allow authenticated users only (solo utenti loggati)
   - **UPDATE**: Allow authenticated users only
   - **DELETE**: Allow authenticated users only

## Passo 4: Ottieni le credenziali

1. Vai su **Settings** → **API**
2. Copia:
   - **Project URL** (es: `https://abcdefg.supabase.co`)
   - **anon public key** (una stringa lunga)

## Passo 5: Configura l'app

1. Nella root del progetto, crea un file `.env` (se non esiste)
2. Aggiungi:

```env
VITE_SUPABASE_URL=https://tuoprogetto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Sostituisci con i tuoi valori reali

## Passo 6: Avvia l'app

```bash
npm install
npm run dev
```

L'app ora userà Supabase per:
- Autenticazione utenti (email/password)
- Database per manifesti, pensieri, ordini, ecc.
- Storage per foto agenzie
- RLS per la sicurezza dei dati

## Note importanti

### Ruoli utente

Il sistema supporta due ruoli:
- **privato**: può accedere a "Le Mie Volontà" e "Il Nucleo"
- **agenzia**: può accedere alla dashboard agenzia completa

Per assegnare il ruolo agenzia a un utente:
1. Vai su **Authentication** → **Users**
2. Trova l'utente e clicca sui tre puntini
3. Modifica il metadata: `{"ruolo": "agenzia"}`

Oppure esegui direttamente nel SQL Editor:
```sql
UPDATE public.profilo_utenti 
SET ruolo = 'agenzia' 
WHERE email = 'tua-agenzia@email.com';
```

### Sicurezza RLS

Tutte le tabelle hanno **Row Level Security** abilitato. Le policy garantiscono che:
- Gli utenti privati vedono solo i propri dati
- Le agenzie vedono solo i dati della propria agenzia
- I manifesti pubblicati sono visibili a tutti
- I pensieri offensivi possono essere bloccati

### Dati di esempio

Se vuoi popolare il database con dati di esempio, esegui nel SQL Editor:

```sql
-- Esempio: inserisci un'agenzia
INSERT INTO public.agenzie (user_id, nome, indirizzo, descrizione, telefono, email)
VALUES (
  'USER_ID_QUI',
  'Onoranze Funebri Pecorari',
  'Via Nonantolana, 555 — 41122 Modena (MO)',
  'Opera nei comuni di Modena, Nonantola e Ravarino organizzando funerali completi con serietà e discrezione.',
  '059 364 218',
  'info@onoranzefunebripecorari.it'
);
```

Sostituisci `USER_ID_QUI` con l'ID dell'utente agenzia (lo trovi in Authentication → Users).

## Troubleshooting

### Errore "relation already exists"
Le tabelle esistono già. Puoi ignorare l'errore o droppare le tabelle prima di rieseguire lo schema.

### Errore "permission denied"
Verifica che RLS sia abilitato su tutte le tabelle e che le policy siano state create correttamente.

### Le foto non si caricano
Controlla che i bucket Storage esistano e che le policy siano configurate correttamente.

### L'app dice "Supabase non configurato"
Verifica che il file `.env` esista e contenga le credenziali corrette. Riavvia il server di sviluppo dopo aver modificato `.env`.

## Prossimi passi

Una volta configurato Supabase:
1. Testa la registrazione di un utente privato
2. Testa la registrazione di un'agenzia
3. Prova a creare un manifesto dall'area agenzia
4. Verifica che appaia nella bacheca pubblica
5. Testa l'invio di fiori e pensieri
6. Carica foto profilo agenzia

Se incontri problemi, controlla la console del browser per errori dettagliati.
