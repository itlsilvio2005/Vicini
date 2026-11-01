// Rigenera il blocco CONOSCENZA di supabase/functions/assistente/index.ts a
// partire da src/data.ts (agenzie, listino fiori, reperibilità).
// Uso: node scripts/genera-assistente.mjs   (rieseguilo se cambi data.ts)
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = mkdtempSync(join(tmpdir(), 'vicini-'));
const out = join(dir, 'data.mjs');
await build({ entryPoints: ['src/data.ts'], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error' });
const { AGENZIE, FIORI, REPERIBILITA, GRUPPI_IMPRESE, eur } = await import(pathToFileURL(out).href);

const gruppi = Object.fromEntries(GRUPPI_IMPRESE.map((g) => [g.id, g.nome]));
const testo = [
  `Reperibilità Vicini: ${REPERIBILITA}.`,
  '',
  'Listino fiori (ordinabili dalla pagina del manifesto, con nastro e dedica opzionali):',
  ...FIORI.map((f) => `- ${f.nome}: ${eur(f.prezzo)}`),
  '',
  'Agenzie del territorio (gruppo = zona in cui operano):',
  ...AGENZIE.map((a) => `- ${a.nome} — tel. ${a.telefono} — ${a.indirizzo} — zone: ${a.gruppi.map((g) => gruppi[g] ?? g).join(', ')}`),
  '',
  'Il sito offre: Bacheca manifesti (camera ardente, cerimonia, pensieri, ordine fiori), Imprese del luogo, Mappa e luoghi (chiese, moschee, strutture), Volontà e Nucleo (account privato gratuito per lasciare scritte le proprie volontà), Area riservata per le agenzie approvate da Vicini. Riti previsti: cattolico, civile, musulmano, ortodosso.',
].join('\n');

const file = 'supabase/functions/assistente/index.ts';
const src = readFileSync(file, 'utf8');
const nuovo = src.replace(/\/\/ <<CONOSCENZA[\s\S]*?\/\/ CONOSCENZA>>/, `// <<CONOSCENZA\nexport const CONOSCENZA = ${JSON.stringify(testo)};\n// CONOSCENZA>>`);
writeFileSync(file, nuovo);
console.log('Blocco CONOSCENZA aggiornato:', testo.length, 'caratteri');
