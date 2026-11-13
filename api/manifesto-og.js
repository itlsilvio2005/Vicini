// ============================================================================
// Anteprima social dei manifesti (WhatsApp, Facebook, Telegram, X, LinkedIn…)
// ----------------------------------------------------------------------------
// I programmi che generano le anteprime non eseguono JavaScript: leggono solo
// l'HTML. Per queste richieste (vedi vercel.json) /manifesto/<id> viene servito
// da questa funzione, che legge il manifesto da Supabase AL MOMENTO e restituisce
// una pagina con i tag Open Graph. Niente rebuild quando si pubblica un manifesto.
// Le persone con un browser normale ricevono invece l'app React.
// ============================================================================

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function pagina({ titolo, descrizione, url, immagine }) {
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>${esc(titolo)}</title>
<meta name="description" content="${esc(descrizione)}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Vicini">
<meta property="og:locale" content="it_IT">
<meta property="og:title" content="${esc(titolo)}">
<meta property="og:description" content="${esc(descrizione)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(immagine)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(titolo)}">
<meta name="twitter:description" content="${esc(descrizione)}">
<meta name="twitter:image" content="${esc(immagine)}">
</head>
<body><p>${esc(titolo)}</p><p>${esc(descrizione)}</p></body>
</html>`;
}

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const base = /^[a-z0-9.-]+(:\d+)?$/i.test(host) ? `https://${host}` : '';
  const id = String(req.query?.id ?? '');
  const immagine = `${base}/og-manifesto-default.png`;
  const url = `${base}/manifesto/${encodeURIComponent(id)}`;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const chiave = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  const generica = { titolo: 'Vicini · Manifesti funebri', descrizione: 'La bacheca dei manifesti funebri di Modena e provincia.', url, immagine };
  const rispondi = (stato, dati, cache) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', cache);
    res.status(stato).send(pagina(dati));
  };

  if (!UUID.test(id) || !supabaseUrl || !chiave) {
    return rispondi(404, generica, 'public, s-maxage=60');
  }

  try {
    const q = new URLSearchParams({
      id: `eq.${id}`,
      pubblicato: 'eq.true',
      select: 'nome_defunto,anni,comune,funerale_giorno,funerale_ora,funerale_luogo',
      limit: '1',
    });
    const r = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/manifesti?${q}`, {
      headers: { apikey: chiave, Authorization: `Bearer ${chiave}` },
      signal: AbortSignal.timeout(4000),
    });
    const righe = r.ok ? await r.json() : [];
    const m = Array.isArray(righe) ? righe[0] : null;
    if (!m) return rispondi(404, generica, 'public, s-maxage=60');

    const eta = m.anni ? `, ${m.anni} anni` : '';
    const funerale = [m.funerale_giorno, m.funerale_ora && `ore ${m.funerale_ora}`, m.funerale_luogo].filter(Boolean).join(' · ');
    return rispondi(
      200,
      {
        titolo: `${m.nome_defunto}${eta} · Vicini`,
        descrizione: [m.comune && `Manifesto funebre — ${m.comune}.`, funerale && `Funerale: ${funerale}.`, 'Lascia un pensiero per la famiglia.']
          .filter(Boolean)
          .join(' '),
        url,
        immagine,
      },
      'public, s-maxage=300, stale-while-revalidate=3600',
    );
  } catch {
    return rispondi(200, generica, 'public, s-maxage=30');
  }
}
