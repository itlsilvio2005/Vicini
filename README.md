# 🕯️ Vicini — Piattaforma Servizi Funebri Modena

Piattaforma web B2B2C per i servizi funebri della provincia di Modena, con autenticazione, database sicuro e funzionalità avanzate.

## ✨ Caratteristiche principali

### Per i cittadini (privati)
- **Bacheca Manifesti**: consulta manifesti funebri per comune
- **Invia Fiori**: ordina composizioni floreali con fatturazione
- **Lascia un Pensiero**: cordogli con filtro anti-offese
- **Le Mie Volontà**: registra disposizioni anticipate
- **Il Nucleo**: notifica automatica ai familiari
- **Mappa interattiva**: chiese, cimiteri, moschee, ospedali

### Per le agenzie funebri
- **Dashboard completa**: gestione manifesti, pratiche, ordini
- **Profilo agenzia**: foto, descrizione, servizi offerti
- **Archivio fatture**: storico completo con export
- **Gestione ordini fiori**: con fatturazione automatica
- **KPI anonimi**: pianificazioni ricevute (GDPR-compliant)

## 🛠️ Stack tecnologico

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (foto agenzie)
- **Sicurezza**: Row Level Security (RLS)
- **Mappe**: Leaflet + OpenStreetMap

## 📦 Installazione

### 1. Clona il repository
```bash
git clone <repository-url>
cd Vicini-main
```

### 2. Installa dipendenze
```bash
npm install
```

### 3. Configura Supabase
Segui la guida completa in `SETUP_SUPABASE.md`:

1. Crea progetto su [Supabase](https://supabase.com)
2. Esegui `SUPABASE_SCHEMA.sql` nel SQL Editor
3. Configura Storage bucket per foto
4. Copia credenziali in `.env`:

```env
VITE_SUPABASE_URL=https://tuoprogetto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Avvia l'app
```bash
npm run dev
```

Apri http://localhost:5173

## 🚀 Modalità demo (senza Supabase)

L'app funziona anche senza configurare Supabase:
- Autenticazione simulata con localStorage
- Dati statici da `src/data.ts`
- Tutte le funzionalità UI disponibili

**Per usare la demo:**
1. Salta la configurazione Supabase
2. Avvia `npm run dev`
3. L'app mostrerà un warning in console ma funzionerà

## 📁 Struttura progetto

```
Vicini-main/
├── src/
│   ├── lib/
│   │   ├── supabase.ts       # Client Supabase + tipi
│   │   ├── auth.tsx          # Autenticazione (AuthProvider)
│   │   ├── filtro-offese.ts  # Moderazione contenuti
│   │   └── index.tsx         # Componenti UI condivisi
│   ├── App.tsx               # Router principale
│   ├── Bacheca.tsx           # Tab 1: Manifesti
│   ├── Imprese.tsx           # Tab 2: Agenzie
│   ├── Luoghi.tsx            # Tab 3: Mappa
│   ├── B2C.tsx               # Tab 4: Volontà & Nucleo
│   ├── Backoffice.tsx        # Tab 5: Area agenzia
│   ├── data.ts               # Dati statici (fallback)
│   └── geo.ts                # Coordinate luoghi
├── SUPABASE_SCHEMA.sql       # Schema database completo
├── SETUP_SUPABASE.md         # Guida setup Supabase
├── INTEGRAZIONE_SUPABASE.md  # Documentazione integrazione
├── .env.example              # Template variabili ambiente
└── README.md                 # Questo file
```

## 🔐 Sicurezza

### Row Level Security (RLS)
Tutte le tabelle hanno policy RLS che garantiscono:
- **Utenti privati**: vedono solo i propri dati
- **Agenzie**: vedono solo i dati della propria agenzia
- **Manifesti pubblicati**: visibili a tutti
- **Pensieri**: moderabili, non eliminabili da altri

### Autenticazione
- Email/password con Supabase Auth
- Sessioni persistenti
- Ruoli separati (privato vs agenzia)
- Logout sicuro

### Moderazione contenuti
- Filtro automatico parole offensive
- Pattern detection per elusioni
- Moderazione umana per casi sospetti
- Messaggi user-friendly

## 🎨 Design system

### Palette colori
- **Blu notte**: `#0b1424`, `#101d33`, `#172a4a`
- **Grigio ardesia**: `#1c2b45`, `#4a5871`, `#6d7890`
- **Bianco caldo**: `#f5f1e7`, `#fbf8f0`
- **Bronzo/oro**: `#c7a262`, `#b08a45`, `#ddc38d`

### Tipografia
- **Display**: Cormorant Garamond (serif, istituzionale)
- **Body**: Archivo (sans-serif, leggibile)

### Componenti
- Card con animazioni hover
- Modal accessibili
- Form con validazione
- Toast notifications
- Ticker animato
- QR code generator

## 📊 Database schema

### Tabelle principali
1. **profilo_utenti** - estende auth.users con ruolo
2. **agenzie** - profilo agenzia completo
3. **manifesti** - manifesti funebri
4. **pensieri** - cordogli moderati
5. **ordini_fiori** - ordini con fatturazione
6. **pratiche** - archivio agenzia
7. **volonta** - disposizioni anticipate
8. **nucleo** - familiari per notifiche

### Relazioni
- Utente → Profilo (1:1)
- Profilo → Agenzia (1:1, se ruolo=agenzia)
- Agenzia → Manifesti (1:N)
- Manifesto → Pensieri (1:N)
- Manifesto → Ordini fiori (1:N)
- Utente → Volontà (1:1)
- Utente → Nucleo (1:N)

## 🧪 Testing

### Test locali
```bash
npm run dev
```

### Build produzione
```bash
npm run build
npm run preview
```

### Linting
```bash
npm run lint
```

## 📱 Responsive design

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Tutte le sezioni sono ottimizzate per tutti i dispositivi.

## 🌐 SEO

- Routing con URL puliti (React Router)
- Meta tag dinamici per ogni pagina
- Sitemap generabile
- Open Graph ready

## 🚀 Deploy

### Vercel
```bash
npm install -g vercel
vercel
```

Configura variabili d'ambiente nel dashboard Vercel.

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

Configura variabili d'ambiente nel dashboard Netlify.

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "preview"]
```

## 📈 Prossime funzionalità

### In sviluppo
- [ ] Gruppo chat pensieri (stile thread)
- [ ] Bot AI assistente funerale
- [ ] Notifiche push per familiari
- [ ] Export PDF fatture
- [ ] Integrazione pagamenti online

### Pianificate
- [ ] App mobile (React Native)
- [ ] Integrazione CRM agenzie
- [ ] Analytics dashboard
- [ ] Multi-lingua (EN, AR, FR)
- [ ] API pubblica per terze parti

## 🤝 Contribuire

1. Fork del repository
2. Crea branch feature (`git checkout -b feature/nuova-funzionalita`)
3. Commit modifiche (`git commit -m 'Aggiungi nuova funzionalità'`)
4. Push branch (`git push origin feature/nuova-funzionalita`)
5. Apri Pull Request

## 📄 Licenza

Questo progetto è proprietà di Vicini S.r.l.

## 📞 Contatti

- **Email**: segreteria@vicini.mo
- **PEC**: vicinimodena@pec.it
- **Telefono**: 059 203 4060 (reperibilità 24h)
- **Indirizzo**: Via Nonantolana 555, 41122 Modena (MO)

## 🙏 Ringraziamenti

- **Supabase** per il backend open-source
- **Leaflet** per le mappe
- **OpenStreetMap** per i dati geografici
- **Tailwind CSS** per il design system
- **React** e **Vite** per il framework

## 📚 Documentazione aggiuntiva

- [Setup Supabase](SETUP_SUPABASE.md)
- [Integrazione Supabase](INTEGRAZIONE_SUPABASE.md)
- [Schema database](SUPABASE_SCHEMA.sql)

---

**Sviluppato con ❤️ per la comunità di Modena**

*Vicini — Nel momento del distacco, nessuno resta solo.*
