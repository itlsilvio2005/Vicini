// Scarica in public/images/ le fotografie usate dal sito (prima erano prese da Unsplash e da un
// servizio di generazione immagini, ora sono file del nostro sito).
// Uso, dalla radice del progetto:   node scripts/fetch-images.mjs
// Poi: git add public/images && commit. Con --force riscarica anche i file esistenti.
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cartella = path.join(root, 'public', 'images');
const forza = process.argv.includes('--force');

const immagini = [
  // Unsplash (licenza Unsplash: uso gratuito, attribuzione non obbligatoria)
  { nome: 'nucleo.jpg', url: 'https://images.unsplash.com/photo-1583311652391-72921cc26c48?q=80&w=2000&auto=format&fit=crop' },
  { nome: 'imprese.jpg', url: 'https://images.unsplash.com/photo-1572947645840-c59ce1121d51?q=80&w=2000&auto=format&fit=crop' },
  { nome: 'luoghi.jpg', url: 'https://images.unsplash.com/photo-1548625361-9c60e0a5cc08?q=80&w=2000&auto=format&fit=crop' },
  // Immagine generata (può scadere: se il download fallisce, sostituiscila con un file tuo)
  { nome: 'bacheca-hero.png', url: 'https://image.qwenlm.ai/generated-images/ddb71b0c-1804-4b23-a5c3-fdf4dcef67eb/_result.png' },
];

await mkdir(cartella, { recursive: true });
let fatti = 0;
let errori = 0;
for (const { nome, url } of immagini) {
  const dove = path.join(cartella, nome);
  if (existsSync(dove) && !forza) {
    console.log(`= ${nome} (già presente)`);
    continue;
  }
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const tipo = r.headers.get('content-type') || '';
    if (!tipo.startsWith('image/')) throw new Error(`risposta non immagine (${tipo})`);
    await writeFile(dove, Buffer.from(await r.arrayBuffer()));
    console.log(`✓ ${nome}`);
    fatti++;
  } catch (e) {
    console.error(`✗ ${nome}: ${e.message}`);
    errori++;
  }
}
console.log(`\nScaricate: ${fatti}, errori: ${errori}`);
process.exitCode = errori ? 1 : 0;
