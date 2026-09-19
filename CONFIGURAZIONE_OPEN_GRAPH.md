# 📱 Configurazione Meta Tag Open Graph e Prerendering

## ✅ Cosa è Stato Implementato

### 1. Meta Tag Open Graph Dinamici
Ho aggiunto `react-helmet-async` per generare meta tag Open Graph dinamici nella pagina del manifesto.

**File modificati:**
- `src/Bacheca.tsx` - Aggiunto Helmet con meta tag OG per ogni manifesto
- `src/App.tsx` - Aggiunto HelmetProvider come wrapper dell'app
- `vite.config.js` - Configurato plugin di prerendering

**Meta tag generati per ogni manifesto:**
```html
<title>Mario Rossi · Manifesto Funebre · Vicini</title>
<meta name="description" content="Manifesto funebre di Mario Rossi (Modena). Funerale: Giovedì 12 febbraio 2026, ore 10:30 - Chiesa di Sant'Agostino." />

<!-- Open Graph per Facebook, LinkedIn, WhatsApp -->
<meta property="og:type" content="article" />
<meta property="og:title" content="Manifesto Funebre - Mario Rossi" />
<meta property="og:description" content="Mario Rossi, 78 anni. Funerale: Giovedì 12 febbraio 2026, ore 10:30." />
<meta property="og:url" content="https://vicini.mo/manifesto/m1111111-1111-1111-1111-111111111111" />
<meta property="og:site_name" content="Vicini - Servizi Funebri Modena" />
<meta property="og:locale" content="it_IT" />
<meta property="og:image" content="https://vicini.mo/og-manifesto-default.jpg" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Manifesto Funebre - Mario Rossi" />
<meta name="twitter:description" content="Mario Rossi, 78 anni. Funerale: Giovedì 12 febbraio 2026, ore 10:30." />
```

### 2. Configurazione Prerendering
Ho configurato `vite-plugin-prerender` per generare HTML statici per le pagine dei manifesti.

**Configurazione in `vite.config.js`:**
```javascript
prerender({
  staticDir: 'dist',
  routes: [
    '/manifesto/m1111111-1111-1111-1111-111111111111',
    '/manifesto/m2222222-2222-2222-2222-222222222222',
    '/manifesto/m3333333-3333-3333-3333-333333333333',
    '/manifesto/m4444444-4444-4444-4444-444444444444'
  ],
  postProcess(renderedRoute) {
    // Rimuovi script per HTML statico
    renderedRoute.html = renderedRoute.html.replace(/<script[^>]*>.*?<\/script>/gis, '');
  }
})
```

---

## 🚀 Come Completare il Setup

### Passo 1: Crea Immagine Open Graph
Crea un'immagine `og-manifesto-default.jpg` (1200x630px) da usare come anteprima per la condivisione.

**Opzioni:**
1. Crea un'immagine generica con logo Vicini e testo "Manifesto Funebre"
2. Salvala in `public/og-manifesto-default.jpg`
3. Oppure genera immagini dinamiche per ogni manifesto (richiede script aggiuntivo)

### Passo 2: Configura Prerendering Dinamico
Il plugin attuale prerenderizza solo 4 manifesti specifici. Per prerenderizzare tutti i manifesti dinamici:

**Opzione A: Script di Build Personalizzato**
Crea `scripts/prerender-manifesti.js`:
```javascript
import { createClient } from '@supabase/supabase-js';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function prerenderManifests() {
  // Carica tutti i manifesti pubblicati
  const { data: manifesti } = await supabase
    .from('manifesti')
    .select('id')
    .eq('pubblicato', true);

  // Per ogni manifesto, genera HTML statico
  for (const m of manifesti) {
    const route = `/manifesto/${m.id}`;
    // ... logica di prerendering
  }
}

prerenderManifests();
```

**Opzione B: Usa vite-plugin-ssg**
Installa `vite-ssg` che gestisce automaticamente il prerendering di tutte le route.

### Passo 3: Configura Server per Rewrite
Per far funzionare le URL pulite, configura il server:

**Vercel/Netlify:** Automatico (crea file `_redirects` o `vercel.json`)

**nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## 📊 Stato Attuale

### ✅ Funzionante Ora
- Meta tag Open Graph dinamici (lato client)
- HelmetProvider configurato
- Plugin prerendering configurato per 4 manifesti specifici

### ⚠️ Limitazioni Attuali
- I meta tag vengono impostati dopo il caricamento della pagina (non nell'HTML iniziale)
- WhatsApp potrebbe non leggere correttamente i meta tag dinamici
- Serve prerendering completo per HTML statici con meta tag già presenti

### 🔧 Soluzione Completa
Per avere meta tag Open Graph perfetti per WhatsApp:
1. Esegui lo script di prerendering durante la build
2. Genera HTML statici per tutti i manifesti pubblicati
3. Deploy gli HTML statici insieme all'app React
4. Configura rewrite rules per le URL pulite

---

## 🎯 Risultato Atteso

Dopo il setup completo, quando condividi un link su WhatsApp:

**Prima (senza prerendering):**
```
Vicini - Servizi Funebri Modena
Piattaforma digitale per i servizi funebri della provincia di Modena
[immagine generica del sito]
```

**Dopo (con prerendering):**
```
Manifesto Funebre - Mario Rossi
Mario Rossi, 78 anni. Funerale: Giovedì 12 febbraio 2026, ore 10:30.
[immagine del manifesto o immagine generica]
```

---

## 📝 Note Tecniche

### Perché Serve il Prerendering?
WhatsApp, Facebook e altri social leggono l'HTML iniziale della pagina per generare l'anteprima. Se i meta tag vengono impostati via JavaScript (come fa React), i social non li vedono perché non eseguono JavaScript.

### Soluzioni Possibili
1. **Prerendering statico** (scelta attuale): genera HTML statici durante la build
2. **Server-Side Rendering (SSR)**: usa Next.js o Remix (richiede rewrite completo)
3. **Dynamic Rendering**: usa Puppeteer per generare HTML al volo per i bot social

La soluzione scelta (prerendering statico) è la più semplice e compatibile con l'architettura attuale.

---

## 🔗 Risorse

- [react-helmet-async](https://github.com/staylor/react-helmet-async)
- [vite-plugin-prerender](https://github.com/tribecodev/vite-plugin-prerender)
- [Open Graph Protocol](https://ogp.me/)
- [WhatsApp Link Preview](https://faq.whatsapp.com/general/links-and-previews/)
