// Funzione Vercel: serve la pagina dell'app con i meta tag Open Graph del manifesto
// già nell'HTML. WhatsApp, Facebook e Google non eseguono JavaScript, quindi i tag
// aggiunti dal browser (react-helmet) non bastano per l'anteprima del link.
// Se il manifesto non esiste o qualcosa va storto, risponde con la pagina normale.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// I dati dei manifesti arrivano dalle agenzie: vanno sempre escapati prima di finire nell'HTML.
function esc(valore) {
  return String(valore ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function leggiManifesto(id) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const chiave = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !chiave || !UUID_RE.test(id)) return null;
  const campi = 'nome_defunto,anni,comune,funerale_giorno,funerale_ora,funerale_luogo';
  const risposta = await fetch(
    `${url}/rest/v1/manifesti?id=eq.${id}&pubblicato=eq.true&select=${campi}&limit=1`,
    { headers: { apikey: chiave, Authorization: `Bearer ${chiave}` } },
  );
  if (!risposta.ok) return null;
  const righe = await risposta.json();
  return Array.isArray(righe) && righe.length > 0 ? righe[0] : null;
}

function iniettaMeta(html, m, id, origine) {
  const nome = esc(m.nome_defunto);
  const comune = esc(m.comune);
  const giorno = esc(m.funerale_giorno || 'da definire');
  const ora = esc(m.funerale_ora || 'da definire');
  const luogo = esc(m.funerale_luogo || 'luogo da definire');
  const anni = m.anni ? `${esc(m.anni)} anni. ` : '';
  const url = `${origine}/manifesto/${id}`;
  const titolo = `${nome} · Manifesto Funebre · Vicini`;
  const descrizione = `${nome} (${comune}). ${anni}Funerale: ${giorno}, ore ${ora} - ${luogo}.`;
  const immagine = `${origine}/og-manifesto-default.jpg`;

  const meta = [
    `<meta name="description" content="${descrizione}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="Manifesto Funebre - ${nome}" />`,
    `<meta property="og:description" content="${descrizione}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="Vicini - Servizi Funebri Modena" />`,
    `<meta property="og:locale" content="it_IT" />`,
    `<meta property="og:image" content="${immagine}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Vicini - Manifesto Funebre ${nome}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="Manifesto Funebre - ${nome}" />`,
    `<meta name="twitter:description" content="${descrizione}" />`,
    `<meta name="twitter:image" content="${immagine}" />`,
  ].join('\n    ');

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${titolo}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/i, '')
    .replace(/<\/head>/i, `    ${meta}\n  </head>`);
}

export default async function handler(req, res) {
  const id = String(req.query.id || '');
  const origine = `https://${req.headers['x-forwarded-host'] || req.headers.host}`;

  let html;
  try {
    const pagina = await fetch(`${origine}/index.html`);
    if (!pagina.ok) throw new Error(`index.html: ${pagina.status}`);
    html = await pagina.text();
  } catch (e) {
    console.error('manifesto: impossibile leggere index.html', e);
    res.statusCode = 302;
    res.setHeader('Location', '/bacheca');
    res.end();
    return;
  }

  try {
    const manifesto = await leggiManifesto(id);
    if (manifesto) html = iniettaMeta(html, manifesto, id, origine);
  } catch (e) {
    console.error('manifesto: meta tag non aggiunti', e);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.end(html);
}
