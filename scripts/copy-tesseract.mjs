// Copia i file dell'OCR (worker, motore WebAssembly, lingua italiana) da node_modules
// in public/tesseract/, così il riconoscimento del testo non dipende da CDN esterni.
// Eseguito automaticamente prima di `npm run dev` e `npm run build`.
import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destinazione = path.join(root, 'public', 'tesseract');
const lang = path.join(destinazione, 'lang');

const daCopiare = [
  [path.join(root, 'node_modules/tesseract.js/dist/worker.min.js'), path.join(destinazione, 'worker.min.js')],
  [path.join(root, 'node_modules/@tesseract.js-data/ita/4.0.0/ita.traineddata.gz'), path.join(lang, 'ita.traineddata.gz')],
];

// Motore: solo le varianti LSTM (quelle usate da tesseract.js v5), con e senza SIMD.
const coreDir = path.join(root, 'node_modules/tesseract.js-core');
for (const f of await readdir(coreDir)) {
  if (/^tesseract-core(-simd)?-lstm\.wasm(\.js)?$/.test(f)) {
    daCopiare.push([path.join(coreDir, f), path.join(destinazione, f)]);
  }
}

await mkdir(lang, { recursive: true });
for (const [src, dst] of daCopiare) {
  await stat(src); // errore chiaro se manca un pacchetto
  await copyFile(src, dst);
}
console.log(`OCR: ${daCopiare.length} file copiati in public/tesseract/`);
