export const CONOSCENZA = "Reperibilità Vicini: 059 203 4060.";

export async function gestisci(req, d) {
  const origine = req.headers.get('origin');
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': origine || '*' };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
  try {
    const body = await req.json();
    const messaggi = body?.messaggi || [];
    const chiaveGemini = d.env('GEMINI_API_KEY');
    if (!chiaveGemini) return new Response(JSON.stringify({ errore: 'Chiave mancante' }), { status: 503, headers: h });
    const manifestiFn = d.caricaManifesti ? await d.caricaManifesti() : '';
    const systemPrompt = `Sei l'assistente di Vicini a Modena. Usa questi manifesti attivi:
${manifestiFn}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(chiaveGemini)}`;
    const r = await d.fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: messaggi.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
      })
    });
    const j = await r.json();
    const testo = j?.candidates?.[0]?.content?.parts?.[0]?.text || 'Non disponibile al momento.';
    return new Response(JSON.stringify({ testo }), { status: 200, headers: h });
  } catch (err) {
    return new Response(JSON.stringify({ errore: err.message }), { status: 500, headers: h });
  }
}

const Deno_ = globalThis.Deno;
if (Deno_ && Deno_.serve) {
  Deno_.serve((req) => gestisci(req, {
    fetch,
    env: (k) => Deno_.env.get(k),
    budgetGiornaliero: async () => true,
    caricaManifesti: async () => {
      const url = Deno_.env.get('SUPABASE_URL');
      const key = Deno_.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!url || !key) return '';
      const res = await fetch(\`${url}/rest/v1/manifesti?pubblicato=eq.true&select=*&limit=10\`, {
        headers: { apikey: key, authorization: `Bearer ${key}` }
      });
      const data = await res.json();
      return Array.isArray(data) ? data.map(m => `- ${m.nome_defunto}, Modena. Funerale: ${m.funerale_giorno || ''} ore ${m.funerale_ora || ''}`).join('\n') : '';
    }
  }));
}