# 📄 Script di Prerendering Manifesti

## 🎯 Scopo

Questo script genera file HTML statici per ogni manifesto pubblicato, con meta tag Open Graph già presenti nell'HTML iniziale. Questo permette a WhatsApp, Facebook e altri social di mostrare anteprime corrette con nome del defunto, data e ora del funerale.

## 🚀 Uso

### Esecuzione Manuale
```bash
node scripts/prerender-manifesti.js
```

### Esecuzione Automatica (consigliata)
```bash
./build.sh
```

Lo script `build.sh` esegue:
1. Build Vite (compila React)
2. Prerendering manifesti (genera HTML statici)

## 📁 Output

Lo script genera file HTML nella cartella `dist/manifesto/`:
```
dist/
├── index.html
├── assets/
│   ├── index.js
│   ├── index.css
│   └── ...
└── manifesto/
    ├── 11111111-1111-1111-1111-111111111111.html
    ├── 22222222-2222-2222-2222-222222222222.html
    ├── 33333333-3333-3333-3333-333333333333.html
    └── 44444444-4444-4444-4444-444444444444.html
```

## 🔧 Configurazione

### Variabili d'Ambiente

Lo script usa le variabili d'ambiente da `.env`:
```env
VITE_SUPABASE_URL=https://fufqqwlmiqlvrxcnpekk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_CKMkgCtj_ML7eRMcbw2f7A_eA6JJGJd
```

### Template HTML

Il template HTML è definito nella funzione `generaHTMLManifesto()` e include:
- Meta tag Open Graph (og:title, og:description, og:image, og:url)
- Meta tag Twitter Card
- Canonical URL
- Script React per idratazione
- Dati del manifesto in JSON (per idratazione)

## 📊 Cosa Fa lo Script

1. **Carica manifesti da Supabase**
   - Query: `SELECT * FROM manifesti WHERE pubblicato = true`
   - Ordina per data pubblicazione (più recenti prima)

2. **Genera HTML per ogni manifesto**
   - Crea meta tag Open Graph con dati del defunto
   - Include titolo, descrizione, URL, immagine
   - Aggiunge script React per idratazione

3. **Salva file HTML**
   - Percorso: `dist/manifesto/{id}.html`
   - Crea cartella se non esiste

4. **Mostra riepilogo**
   - Numero di file generati
   - Istruzioni per testing

## 🧪 Testing

### Verifica con view-source
```bash
# Avvia server statico
serve dist -l 3000

# Apri browser su:
http://localhost:3000/manifesto/11111111-1111-1111-1111-111111111111

# Clicca destro → "Visualizza sorgente pagina"
# Cerca "og:title" → dovresti vedere:
# <meta property="og:title" content="Manifesto Funebre - Mario Rossi">
```

### Verifica con curl
```bash
curl -s http://localhost:3000/manifesto/11111111-1111-1111-1111-111111111111 | grep "og:title"
```

Output atteso:
```html
<meta property="og:title" content="Manifesto Funebre - Mario Rossi">
```

## ⚠️ Requisiti

- Node.js 18+
- Variabili d'ambiente Supabase configurate
- Cartella `dist/` generata da `npm run build`
- Manifesti pubblicati nel database Supabase

## 🔄 Quando Eseguire

Esegui lo script:
- ✅ Dopo ogni build di produzione
- ✅ Dopo aver pubblicato nuovi manifesti
- ✅ Prima del deploy su server

## 📝 Note

- Lo script legge i dati da Supabase in tempo reale
- I meta tag riflettono lo stato attuale del database
- Se un manifesto viene modificato, rigenera l'HTML
- Se un manifesto viene eliminato, il file HTML resta (puoi eliminarlo manualmente)

## 🆘 Troubleshooting

### Errore: "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Errore: "ENOENT: no such file or directory, open 'dist/manifesto/...'"
```bash
# Esegui prima la build Vite
npm run build

# Poi esegui il prerendering
node scripts/prerender-manifesti.js
```

### Nessun manifesto trovato
- Verifica che ci siano manifesti pubblicati in Supabase
- Verifica le credenziali Supabase in `.env`

## 📚 Documentazione Correlata

- `GUIDA_TESTING_VIEW_SOURCE.md` - Guida completa testing
- `CONFIGURAZIONE_OPEN_GRAPH.md` - Configurazione meta tag
- `build.sh` - Script di build completo

---

**Ultimo aggiornamento:** 2026-02-11  
**Versione:** 1.0.0
