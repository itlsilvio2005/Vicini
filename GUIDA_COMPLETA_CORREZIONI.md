# ✅ Correzioni Critiche Applicate - Guida Completa

## 🎯 Problemi Risolti

### 1. Bug Script Prerendering - ✅ CORRETTO
**File:** `scripts/prerender-manifesti.js`

**Problema:**
```javascript
// ERRATO
const {  manifesti, error } = await supabase.from('manifesti')...
```

**Correzione:**
```javascript
// CORRETTO
const { data: manifesti, error } = await supabase.from('manifesti')...
```

**Stato:** ✅ Applicata

---

### 2. Conversione SVG in JPG - ⚠️ DA ESEGUIRE
**File:** `scripts/convert-svg-to-jpg.js`

**Problema:**
Open Graph richiede JPG/PNG, non SVG. WhatsApp/Facebook non renderizzano SVG.

**Soluzione:**
Script di conversione creato con sharp.

**Esecuzione:**
```bash
node scripts/convert-svg-to-jpg.js
```

**Output atteso:**
```
🔄 Conversione SVG in JPG...
📁 Input: /path/to/public/og-manifesto-default.svg
📁 Output: /path/to/public/og-manifesto-default.jpg
✅ Conversione completata!
📊 Dimensione file: XX.XX KB
📋 Copiato in: /path/to/dist/og-manifesto-default.jpg
```

**Nota:** Se sharp non è installato:
```bash
npm install sharp
```

---

### 3. Policy Ordini Fiori - ✅ CORRETTA
**File:** `FUNZIONE_CALCOLO_PREZZI.sql`

**Problema:**
Policy `WITH CHECK (true)` permetteva al client di inviare importi arbitrari.

**Soluzione:**
Funzione Postgres + trigger che calcola il prezzo lato server.

**Esecuzione:**
```sql
-- Apri Supabase SQL Editor
-- Copia e incolla FUNZIONE_CALCOLO_PREZZI.sql
-- Clicca Run
```

**Cosa fa:**
1. Crea tabella `prezzi_fiori` con prezzi ufficiali
2. Crea funzione `calcola_prezzo_ordine()` che cerca il prezzo nella tabella
3. Crea trigger `BEFORE INSERT` che sovrascrive l'importo con il prezzo calcolato
4. Se la composizione non esiste, usa prezzo di default (100.00)

**Test:**
```sql
-- Inserisci ordine con importo sbagliato
INSERT INTO public.ordini_fiori (
  manifesto_id,
  composizione,
  importo,  -- Questo verrà ignorato
  cliente_nome,
  cliente_email,
  cliente_telefono
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Corona floreale con nastro',
  999.99,  -- Importo sbagliato
  'Mario Rossi',
  'mario@email.it',
  '3331234567'
);

-- Verifica che l'importo sia stato corretto
SELECT importo FROM public.ordini_fiori WHERE cliente_email = 'mario@email.it';
-- Dovrebbe restituire 180.00, non 999.99
```

---

## 📋 Checklist Esecuzione Completa

### Passo 1: Esegui Script SQL Correzione RLS
```bash
# Apri Supabase SQL Editor
# Copia e incolla CORREZIONE_RLS_ORDINI_ANONIMI.sql
# Clicca Run
```

**Output atteso:**
```
✅ RLS abilitato su tutte le tabelle e policy per ordini anonimi creata
```

### Passo 2: Esegui Script SQL Funzione Prezzi
```bash
# Apri Supabase SQL Editor
# Copia e incolla FUNZIONE_CALCOLO_PREZZI.sql
# Clicca Run
```

**Output atteso:**
```
✅ Funzione calcolo prezzi lato server creata con successo
```

### Passo 3: Converti SVG in JPG
```bash
# Installa sharp se necessario
npm install sharp

# Esegui conversione
node scripts/convert-svg-to-jpg.js
```

**Output atteso:**
```
🔄 Conversione SVG in JPG...
📁 Input: /path/to/public/og-manifesto-default.svg
📁 Output: /path/to/public/og-manifesto-default.jpg
✅ Conversione completata!
📊 Dimensione file: XX.XX KB
📋 Copiato in: /path/to/dist/og-manifesto-default.jpg
```

### Passo 4: Esegui Build Completa
```bash
# Rendi eseguibile lo script
chmod +x build.sh

# Esegui build
./build.sh
```

**Output atteso:**
```
🚀 Avvio build completa Vicini...

📦 Passo 1/2: Build Vite (compilazione React)...
✓ built in X.XXs
✅ Build Vite completata

📄 Passo 2/2: Prerendering manifesti (generazione HTML statici)...
🚀 Avvio prerendering manifesti...

📋 Caricamento manifesti da Supabase...
✅ Trovati X manifesti pubblicati

✅ Generato: Mario Rossi → /manifesto/11111111-1111-1111-1111-111111111111.html
✅ Generato: Giuseppe Verdi → /manifesto/22222222-2222-2222-2222-222222222222.html
✅ Generato: Ahmed Hassan → /manifesto/33333333-3333-3333-3333-333333333333.html
✅ Generato: Maria Bianchi → /manifesto/44444444-4444-4444-4444-444444444444.html

✅ Completato! Generati X file HTML statici con meta tag Open Graph

==========================================
✅ BUILD COMPLETATA CON SUCCESSO!
==========================================
```

### Passo 5: Verifica File HTML Generati
```bash
# Lista file generati
ls -la dist/manifesto/
```

**Output atteso:**
```
total XX
drwxr-xr-x  X user  staff   XXXX XX XXX XX:XX .
drwxr-xr-X  X user  staff   XXXX XX XXX XX:XX ..
-rw-r--r--  1 user  staff   XXXX XX XXX XX:XX 11111111-1111-1111-1111-111111111111.html
-rw-r--r--  1 user  staff   XXXX XX XXX XX:XX 22222222-2222-2222-2222-222222222222.html
-rw-r--r--  1 user  staff   XXXX XX XXX XX:XX 33333333-3333-3333-3333-333333333333.html
-rw-r--r--  1 user  staff   XXXX XX XXX XX:XX 44444444-4444-4444-4444-444444444444.html
```

### Passo 6: Verifica Meta Tag con View-Source
```bash
# Avvia server statico
npm install -g serve
serve dist -l 3000

# Apri browser su:
http://localhost:3000/manifesto/11111111-1111-1111-1111-111111111111

# Clicca destro → "Visualizza sorgente pagina"
# Cerca "og:title"
```

**Output atteso nel view-source:**
```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Mario Rossi · Manifesto Funebre · Vicini</title>
  
  <!-- Open Graph per Facebook, LinkedIn, WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="Manifesto Funebre - Mario Rossi">
  <meta property="og:description" content="Mario Rossi, 78 anni. Funerale: Giovedì 12 febbraio 2026, ore 10:30.">
  <meta property="og:url" content="https://vicini.mo/manifesto/11111111-1111-1111-1111-111111111111">
  <meta property="og:site_name" content="Vicini - Servizi Funebri Modena">
  <meta property="og:locale" content="it_IT">
  <meta property="og:image" content="https://vicini.mo/og-manifesto-default.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Vicini - Manifesto Funebre Mario Rossi">
</head>
<body>
  <div id="root"></div>
  <script id="manifesto-data" type="application/json">
    {"id":"11111111-1111-1111-1111-111111111111","nome_defunto":"Mario Rossi",...}
  </script>
  <script type="module" crossorigin src="/assets/index.js"></script>
</body>
</html>
```

### Passo 7: Verifica con curl
```bash
curl -s http://localhost:3000/manifesto/11111111-1111-1111-1111-111111111111 | grep "og:title"
```

**Output atteso:**
```html
<meta property="og:title" content="Manifesto Funebre - Mario Rossi">
```

---

## 📊 Riepilogo File Creati/Modificati

### Script SQL
1. ✅ `CORREZIONE_RLS_ORDINI_ANONIMI.sql` - Abilita RLS + policy ordini anonimi
2. ✅ `FUNZIONE_CALCOLO_PREZZI.sql` - Funzione Postgres per calcolo prezzi

### Script Node.js
3. ✅ `scripts/prerender-manifesti.js` - Genera HTML statici con meta tag OG (CORRETTO)
4. ✅ `scripts/convert-svg-to-jpg.js` - Converte SVG in JPG
5. ✅ `build.sh` - Script build completo

### Codice Modificato
6. ✅ `src/Bacheca.tsx` - Aggiunto og:image:alt + caricamento dati da JSON

### Documentazione
7. ✅ `GUIDA_TESTING_VIEW_SOURCE.md` - Guida testing view-source
8. ✅ `scripts/README.md` - Documentazione script
9. ✅ `CORREZIONI_CRITICHE_APPLICATE.md` - Riepilogo correzioni
10. ✅ `GUIDA_COMPLETA_CORREZIONI.md` - Questo documento

---

## 🧪 Testing Completo

### Test 1: Ordini Anonimi
```sql
-- Inserisci ordine senza login (user_id = NULL)
INSERT INTO public.ordini_fiori (
  manifesto_id,
  user_id,
  composizione,
  importo,
  cliente_nome,
  cliente_email,
  cliente_telefono
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  NULL,  -- Utente anonimo
  'Corona floreale con nastro',
  999.99,  -- Importo sbagliato (verrà sovrascritto)
  'Mario Rossi',
  'mario@email.it',
  '3331234567'
);

-- Verifica che l'importo sia stato corretto dal trigger
SELECT importo FROM public.ordini_fiori WHERE cliente_email = 'mario@email.it';
-- Dovrebbe restituire 180.00, non 999.99
```

### Test 2: Prerendering
```bash
# Esegui build
./build.sh

# Verifica file generati
ls -la dist/manifesto/

# Verifica meta tag con view-source
serve dist -l 3000
# Apri http://localhost:3000/manifesto/11111111-1111-1111-1111-111111111111
# Ctrl+U per view-source
# Cerca "og:title"
```

### Test 3: Condivisione WhatsApp
1. Deploy su dominio reale (es. https://vicini.mo)
2. Condividi link: `https://vicini.mo/manifesto/11111111-1111-1111-1111-111111111111`
3. WhatsApp dovrebbe mostrare:
   ```
   Manifesto Funebre - Mario Rossi
   Mario Rossi, 78 anni. Funerale: Giovedì 12 febbraio 2026, ore 10:30.
   [immagine JPG]
   ```

---

## 🚀 Deploy Checklist

- [ ] Script `CORREZIONE_RLS_ORDINI_ANONIMI.sql` eseguito
- [ ] Script `FUNZIONE_CALCOLO_PREZZI.sql` eseguito
- [ ] Script `convert-svg-to-jpg.js` eseguito
- [ ] File `og-manifesto-default.jpg` creato
- [ ] Script `build.sh` eseguito con successo
- [ ] File HTML generati in `dist/manifesto/`
- [ ] View-source mostra meta tag Open Graph
- [ ] curl verifica presenza meta tag
- [ ] Test ordine anonimo funziona
- [ ] Test trigger calcolo prezzi funziona
- [ ] Deploy su dominio reale completato
- [ ] Test condivisione WhatsApp funziona

---

## 📝 Note Importanti

### Sicurezza Prezzi
Il trigger `calcola_prezzo_ordine()` garantisce che:
- ✅ Il prezzo viene calcolato lato server
- ✅ Il client non può inviare importi arbitrari
- ✅ Se la composizione non esiste, viene usato un prezzo di default
- ✅ I prezzi sono gestibili dalla tabella `prezzi_fiori`

### Prerendering
Lo script di prerendering:
- ✅ Genera HTML statici con meta tag già presenti
- ✅ WhatsApp/Facebook leggono i meta tag dall'HTML iniziale
- ✅ I dati del manifesto sono inclusi in un tag JSON per idratazione
- ✅ React si idrata correttamente dopo il caricamento

### RLS
Le policy RLS garantiscono:
- ✅ Ogni agenzia vede solo i propri dati
- ✅ Ogni utente vede solo i propri dati
- ✅ Gli ordini anonimi possono essere creati (user_id = NULL)
- ✅ Le agenzie vedono solo gli ordini dei propri manifesti

---

## 🔗 Link Utili

### Testing
- Facebook Debug Tool: https://developers.facebook.com/tools/debug/
- WhatsApp: https://www.whatsapp.com/
- View-Source: Clicca destro → "Visualizza sorgente pagina"

### Deploy
- Vercel: https://vercel.com/
- Netlify: https://www.netlify.com/
- nginx rewrite: https://nginx.org/en/docs/http/ngx_http_rewrite_module.html

### Documentazione
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Open Graph: https://ogp.me/
- react-helmet-async: https://github.com/staylor/react-helmet-async

---

**Data:** 2026-02-11  
**Versione:** 1.0.0-rc4  
**Stato:** ✅ Tutti i problemi critici risolti, pronto per esecuzione script
