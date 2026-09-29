#!/usr/bin/env node
/**
 * Script per convertire og-manifesto-default.svg in JPG
 * Usa sharp per la conversione
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertSvgToJpg() {
  const svgPath = path.join(__dirname, '..', 'public', 'og-manifesto-default.svg');
  const jpgPath = path.join(__dirname, '..', 'public', 'og-manifesto-default.jpg');

  console.log('🔄 Conversione SVG in JPG...');
  console.log(`📁 Input: ${svgPath}`);
  console.log(`📁 Output: ${jpgPath}`);

  try {
    // Verifica che l'SVG esista
    if (!fs.existsSync(svgPath)) {
      console.error('❌ File SVG non trovato:', svgPath);
      process.exit(1);
    }

    // Converti SVG in JPG
    await sharp(svgPath)
      .resize(1200, 630) // Dimensioni standard Open Graph
      .jpeg({ quality: 90 })
      .toFile(jpgPath);

    console.log('✅ Conversione completata!');
    console.log(`📊 Dimensione file: ${(fs.statSync(jpgPath).size / 1024).toFixed(2)} KB`);
    
    // Copia anche nella cartella dist per il deploy
    const distJpgPath = path.join(__dirname, '..', 'dist', 'og-manifesto-default.jpg');
    const distDir = path.dirname(distJpgPath);
    
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    fs.copyFileSync(jpgPath, distJpgPath);
    console.log(`📋 Copiato in: ${distJpgPath}`);
    
  } catch (error) {
    console.error('❌ Errore durante la conversione:', error.message);
    process.exit(1);
  }
}

convertSvgToJpg();
