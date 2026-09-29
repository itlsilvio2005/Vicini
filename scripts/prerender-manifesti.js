#!/usr/bin/env node
/**
 * Script di prerendering per generare HTML statici con meta tag Open Graph
 * per ogni manifesto pubblicato.
 * 
 * Questo script viene eseguito dopo la build di Vite e genera file HTML
 * statici nella cartella dist/manifesto/ con i meta tag già presenti
 * nell'HTML iniziale (visibili con view-source).
 * 
 * Uso: node scripts/prerender-manifesti.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurazione Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fufqqwlmiqlvrxcnpekk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_CKMkgCtj_ML7eRMcbw2f7A_eA6JJGJd';

const supabase = createClient(supabaseUrl, supabaseKey);

// Template HTML per ogni manifesto
function generaHTMLManifesto(manifesto) {
  const titolo = `${manifesto.nome_defunto} · Manifesto Funebre · Vicini`;
  const descrizione = `Manifesto funebre di ${manifesto.nome_defunto} (${manifesto.comune}). Funerale: ${manifesto.funerale_giorno || 'da definire'}, ore ${manifesto.funerale_ora || 'da definire'} - ${manifesto.funerale_luogo || 'luogo da definire'}.`;
  const url = `https://vicini.mo/manifesto/${manifesto.id}`;
  
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Meta tag base -->
  <title>${titolo}</title>
  <meta name="description" content="${descrizione}">
  
  <!-- Open Graph per Facebook, LinkedIn, WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="Manifesto Funebre - ${manifesto.nome_defunto}">
  <meta property="og:description" content="${manifesto.nome_defunto}, ${manifesto.anni || '?'} anni. Funerale: ${manifesto.funerale_giorno || 'da definire'}, ore ${manifesto.funerale_ora || 'da definire'}.">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Vicini - Servizi Funebri Modena">
  <meta property="og:locale" content="it_IT">
  <meta property="og:image" content="https://vicini.mo/og-manifesto-default.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Manifesto Funebre - ${manifesto.nome_defunto}">
  <meta name="twitter:description" content="${manifesto.nome_defunto}, ${manifesto.anni || '?'} anni. Funerale: ${manifesto.funerale_giorno || 'da definire'}, ore ${manifesto.funerale_ora || 'da definire'}.">
  
  <!-- WhatsApp specifica -->
  <meta property="og:image:alt" content="Manifesto funebre di ${manifesto.nome_defunto}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${url}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  
  <!-- Script React (caricato dopo i meta tag) -->
  <script type="module" crossorigin src="/assets/index.js"></script>
  <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
  <div id="root"></div>
  
  <!-- Dati del manifesto per React (opzionale, per idratazione) -->
  <script id="manifesto-data" type="application/json">
    ${JSON.stringify(manifesto)}
  </script>
</body>
</html>`;
}

async function prerenderManifesti() {
  console.log('🚀 Avvio prerendering manifesti...\n');
  
  try {
    // Carica tutti i manifesti pubblicati da Supabase
    console.log('📋 Caricamento manifesti da Supabase...');
    const { data: manifesti, error } = await supabase
      .from('manifesti')
      .select('*')
      .eq('pubblicato', true)
      .order('pubblicato_il', { ascending: false });
    
    if (error) {
      console.error('❌ Errore caricamento manifesti:', error);
      process.exit(1);
    }
    
    console.log(`✅ Trovati ${manifesti.length} manifesti pubblicati\n`);
    
    // Crea cartella dist/manifesto se non esiste
    const manifestiDir = path.join(__dirname, '..', 'dist', 'manifesto');
    if (!fs.existsSync(manifestiDir)) {
      fs.mkdirSync(manifestiDir, { recursive: true });
      console.log(`📁 Creata cartella ${manifestiDir}\n`);
    }
    
    // Genera HTML statico per ogni manifesto
    let count = 0;
    for (const manifesto of manifesti) {
      const html = generaHTMLManifesto(manifesto);
      const filePath = path.join(manifestiDir, `${manifesto.id}.html`);
      
      fs.writeFileSync(filePath, html, 'utf-8');
      count++;
      
      console.log(`✅ Generato: ${manifesto.nome_defunto} → /manifesto/${manifesto.id}.html`);
    }
    
    console.log(`\n✅ Completato! Generati ${count} file HTML statici con meta tag Open Graph`);
    console.log(`\n📝 Per verificare con view-source:`);
    console.log(`   1. Deploy la cartella dist/ su un server`);
    console.log(`   2. Vai su https://tuodominio.it/manifesto/${manifesti[0]?.id || 'ID_MANIFESTO'}`);
    console.log(`   3. Clicca destro → "Visualizza sorgente pagina"`);
    console.log(`   4. Dovresti vedere i meta tag og: già presenti nell'HTML`);
    console.log(`\n📱 Per testare la condivisione WhatsApp:`);
    console.log(`   1. Usa https://www.whatsapp.com/`);
    console.log(`   2. Incolla il link: https://tuodominio.it/manifesto/${manifesti[0]?.id || 'ID_MANIFESTO'}`);
    console.log(`   3. WhatsApp dovrebbe mostrare l'anteprima con nome del defunto`);
    
  } catch (err) {
    console.error('❌ Errore durante il prerendering:', err);
    process.exit(1);
  }
}

// Esegui lo script
prerenderManifesti();
