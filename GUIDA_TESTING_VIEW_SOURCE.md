# 📱 Guida Testing Meta Tag Open Graph con View-Source

## 🎯 Obiettivo

Verificare che i meta tag Open Graph siano presenti nell'HTML iniziale (visibili con view-source), non solo dopo l'esecuzione di JavaScript.

---

## 🔧 Setup Iniziale

### 1. Esegui lo Script di Correzione RLS
```bash
# Apri Supabase SQL Editor
# Copia e incolla il contenuto di CORREZIONE_RLS_ORDINI_ANONIMI.sql
# Clicca Run
```

### 2. Crea Immagine Open Graph
L'immagine placeholder è già stata creata: `public/og-manifesto-default.svg`

Per convertirla in JPG (richiesto da alcuni social):
```bash
# Usa un tool online come https://convertio.co/svg-jpg/
# Oppure usa ImageMagick se installato:
convert public/og-manifesto-default.svg public/og-manifesto-default.jpg
```

Carica l'immagine su Supabase Storage nel bucket `agenzie-loghi` o su un CDN.

### 3. Esegui la Build Completa
```bash
# Rendi eseguibile lo script
chmod +x build.sh

# Esegui la build completa (Vite + Prerendering)
./build.sh
```

Lo script eseguirà:
1. ✅ Build Vite (compila React)
2. ✅ Prerendering manifesti (genera HTML statici con meta tag OG)

---

## 🧪 Testing con View-Source

### Metodo 1: Test Locale con Server Statico

```bash
# Installa un server statico globale
npm install -g serve

# Avvia il server sulla cartella dist
serve dist -l 3000
```

Apri il browser su: `http://localhost:3000/manifesto/11111111-1111-1111-1111-111111111111`

**Verifica con view-source:**
1. Clicca destro sulla pagina → "Visualizza sorgente pagina" (o Ctrl+U)
2. Cerca i meta tag Open Graph (Ctrl+F → "og:")
3. Dovresti vedere:

```html
<!-- Open Graph per Facebook, LinkedIn, WhatsApp -->
<meta property="og:type" content="article">
<meta property="og:title" content="Manifesto Funebre - Mario Rossi">
<meta property="og:description" content="Mario Rossi, 78 anni. Funerale: Giovedì 12 febbraio 2026, ore 10:30.">
<meta property="og:url" content="https://vicini.mo/manifesto/11111111-1111-1111-1111-111111111111">
<meta property="og:site_name" content="Vicini - Servizi Funebri Modena">
<meta property="og:locale" content="it_IT">
<meta property="og:image" content="https://vicini.mo/og-manifesto-default.jpg">
```

✅ **Se vedi questi tag nell'HTML iniziale, il prerendering funziona!**

### Metodo 2: Test con curl

```bash
# Verifica che i meta tag siano presenti nell'HTML
curl -s http://localhost:3000/manifesto/11111111-1111-1111-1111-111111111111 | grep "og:title"
```

Dovresti vedere:
```html
<meta property="og:title" content="Manifesto Funebre - Mario Rossi">
```

### Metodo 3: Test con WhatsApp Debug Tool

1. Vai su: https://developers.facebook.com/tools/debug/
2. Incolla l'URL: `http://localhost:3000/manifesto/11111111-1111-1111-1111-111111111111`
3. Clicca "Debug"
4. Verifica che Facebook legga correttamente i meta tag

**Nota:** WhatsApp usa lo stesso crawler di Facebook, quindi se funziona per Facebook, funzionerà per WhatsApp.

---

## 🌐 Testing su Dominio Reale

### Deploy su Vercel

```bash
# Installa Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Vercel configurerà automaticamente le rewrite rules per le URL pulite.

### Deploy su Netlify

```bash
# Installa Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

Crea un file `netlify.toml` nella root:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deploy su Server Personalizzato (nginx)

Configura nginx:
```nginx
server {
    listen 80;
    server_name vicini.mo;
    root /var/www/vicini/dist;
    index index.html;

    # Rewrite per URL pulite
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }

    # Cache per HTML statici
    location ~* \.html$ {
        add_header Cache-Control "public, max-age=3600";
    }
}
```

---

## 📱 Testing Condivisione WhatsApp

### Passo 1: Condividi il Link

1. Apri WhatsApp
2. Invia un messaggio a te stesso
3. Incolla l'URL: `https://vicini.mo/manifesto/11111111-1111-1111-1111-111111111111`
4. Attendi 2-3 secondi

### Passo 2: Verifica l'Anteprima

Dovresti vedere:
```
┌─────────────────────────────────┐
│ [Immagine 1200x630]             │
│                                 │
│ Vicini                          │
│ Servizi Funebri Modena          │
│                                 │
│ Manifesto Funebre - Mario Rossi │
│ Mario Rossi, 78 anni. Funerale: │
│ Giovedì 12 febbraio 2026,       │
│ ore 10:30.                      │
│                                 │
│ vicini.mo                       │
└─────────────────────────────────┘
```

✅ **Se vedi l'anteprima con nome del defunto, il prerendering funziona!**

❌ **Se vedi solo "Vicini - Servizi Funebri Modena" senza dettagli:**
- Verifica che i meta tag siano presenti con view-source
- Verifica che l'immagine OG sia accessibile
- Attendi 5 minuti (WhatsApp fa cache)

---

## 🔍 Troubleshooting

### Problema: Meta tag non visibili con view-source

**Causa:** Lo script di prerendering non è stato eseguito.

**Soluzione:**
```bash
# Esegui manualmente lo script
node scripts/prerender-manifesti.js

# Verifica che i file HTML siano stati generati
ls -la dist/manifesto/
```

### Problema: WhatsApp non mostra l'anteprima

**Causa 1:** L'immagine OG non è accessibile.

**Soluzione:**
```bash
# Verifica che l'immagine sia accessibile
curl -I https://vicini.mo/og-manifesto-default.jpg
```

Dovresti vedere `HTTP/2 200 OK`.

**Causa 2:** WhatsApp ha cached la vecchia versione.

**Soluzione:**
- Aggiungi un parametro query all'URL: `?v=2`
- Oppure attendi 24 ore (cache WhatsApp)

### Problema: Facebook Debug Tool mostra errori

**Causa:** Meta tag mancanti o malformati.

**Soluzione:**
1. Vai su: https://developers.facebook.com/tools/debug/
2. Incolla l'URL
3. Clicca "Scrapes again"
4. Verifica gli errori segnalati

---

## 📊 Risultato Atteso

### Prima (senza prerendering)
```html
<!DOCTYPE html>
<html>
<head>
  <title>Vicini</title>
  <!-- Nessun meta tag specifico per il manifesto -->
</head>
<body>
  <div id="root"></div>
  <script src="/assets/index.js"></script>
</body>
</html>
```

**Condivisione WhatsApp:**
```
Vicini - Servizi Funebri Modena
Piattaforma digitale per i servizi funebri
[immagine generica]
```

### Dopo (con prerendering)
```html
<!DOCTYPE html>
<html>
<head>
  <title>Mario Rossi · Manifesto Funebre · Vicini</title>
  <meta property="og:title" content="Manifesto Funebre - Mario Rossi">
  <meta property="og:description" content="Mario Rossi, 78 anni. Funerale: Giovedì 12 febbraio 2026, ore 10:30.">
  <meta property="og:image" content="https://vicini.mo/og-manifesto-default.jpg">
  <!-- Altri meta tag -->
</head>
<body>
  <div id="root"></div>
  <script src="/assets/index.js"></script>
</body>
</html>
```

**Condivisione WhatsApp:**
```
Manifesto Funebre - Mario Rossi
Mario Rossi, 78 anni. Funerale: Giovedì 12 febbraio 2026, ore 10:30.
[immagine del manifesto]
```

---

## ✅ Checklist Finale

- [ ] Script `CORREZIONE_RLS_ORDINI_ANONIMI.sql` eseguito in Supabase
- [ ] Immagine `og-manifesto-default.jpg` creata e caricata
- [ ] Script `build.sh` eseguito con successo
- [ ] File HTML generati in `dist/manifesto/`
- [ ] View-source mostra meta tag Open Graph
- [ ] curl verifica presenza meta tag
- [ ] Facebook Debug Tool mostra anteprima corretta
- [ ] WhatsApp mostra anteprima con nome del defunto
- [ ] Deploy su dominio reale completato

---

## 🎯 Conclusione

Con questo setup:
- ✅ Meta tag Open Graph presenti nell'HTML iniziale
- ✅ WhatsApp legge correttamente i dati del manifesto
- ✅ Anteprima mostra nome del defunto, data e ora funerale
- ✅ Immagine personalizzata per ogni condivisione

**Il problema della condivisione WhatsApp è risolto!** 🎉
