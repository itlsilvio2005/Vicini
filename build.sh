#!/bin/bash
# ============================================================================
# Script di build completo per Vicini
# ============================================================================
# Questo script esegue:
# 1. Build Vite (compila React)
# 2. Prerendering manifesti (genera HTML statici con meta tag Open Graph)
# 
# Uso: ./build.sh
# ============================================================================

set -e  # Esce se c'è un errore

echo "🚀 Avvio build completa Vicini..."
echo ""

# Passo 1: Build Vite
echo "📦 Passo 1/2: Build Vite (compilazione React)..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Errore durante la build Vite"
  exit 1
fi

echo "✅ Build Vite completata"
echo ""

# Passo 2: Prerendering manifesti
echo "📄 Passo 2/2: Prerendering manifesti (generazione HTML statici)..."
node scripts/prerender-manifesti.js

if [ $? -ne 0 ]; then
  echo "❌ Errore durante il prerendering"
  exit 1
fi

echo "✅ Prerendering completato"
echo ""

# Riepilogo
echo "=========================================="
echo "✅ BUILD COMPLETATA CON SUCCESSO!"
echo "=========================================="
echo ""
echo "📁 File generati:"
echo "   - dist/index.html (app React)"
echo "   - dist/assets/* (JS, CSS)"
echo "   - dist/manifesto/*.html (HTML statici con meta tag OG)"
echo ""
echo "🚀 Per deploy:"
echo "   1. Carica la cartella dist/ sul tuo server"
echo "   2. Configura rewrite rules per URL pulite"
echo "   3. Verifica con view-source che i meta tag OG siano presenti"
echo ""
echo "📱 Per testare condivisione WhatsApp:"
echo "   1. Deploy su dominio reale (es. https://vicini.mo)"
echo "   2. Condividi link: https://vicini.mo/manifesto/ID_MANIFESTO"
echo "   3. WhatsApp mostrerà anteprima con nome del defunto"
echo ""
