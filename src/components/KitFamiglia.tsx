import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ChevronDown, Copy, Download, Printer, Send } from 'lucide-react';
import { URL_BASE } from '../data';

interface Props {
  manifestoId: string;
  nomeDefunto: string;
  pubblicato: boolean;
}

function esc(valore: string) {
  return valore
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Kit per la famiglia: link, QR code scansionabile, messaggio WhatsApp già scritto
 * e locandina A5 da stampare. Serve all'agenzia per far arrivare parenti e conoscenti
 * sul manifesto senza dover spiegare nulla.
 */
export function KitFamiglia({ manifestoId, nomeDefunto, pubblicato }: Props) {
  const [aperto, setAperto] = useState(false);
  const [copiato, setCopiato] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const url = `https://${URL_BASE}/manifesto/${manifestoId}`;

  const svgQr = () => qrRef.current?.querySelector('svg')?.outerHTML ?? '';

  const copia = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2500);
    } catch {
      window.prompt('Copia il link:', url);
    }
  };

  const whatsapp = () => {
    const testo =
      `Gentile famiglia, il manifesto di ${nomeDefunto} è online. ` +
      `Qui potete consultarlo, condividerlo con parenti e amici e leggere i pensieri di cordoglio: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(testo)}`, '_blank', 'noopener');
  };

  const scaricaSvg = () => {
    const blob = new Blob([svgQr()], { type: 'image/svg+xml' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `qr-manifesto-${manifestoId.slice(0, 8)}.svg`;
    a.click();
    URL.revokeObjectURL(href);
  };

  const stampa = () => {
    const finestra = window.open('', '_blank');
    if (!finestra) {
      window.alert('Il browser ha bloccato la finestra di stampa. Consenti i popup per questo sito e riprova.');
      return;
    }
    finestra.document.write(`<!doctype html><html lang="it"><head><meta charset="utf-8">
<title>Locandina ${esc(nomeDefunto)}</title>
<style>
  @page { size: A5; margin: 14mm; }
  body { font-family: Georgia, serif; color: #1c2b45; text-align: center; margin: 0; }
  h1 { font-size: 26pt; margin: 18mm 0 4mm; }
  p { font-size: 13pt; margin: 3mm 0; }
  svg { width: 70mm; height: 70mm; margin: 8mm 0; }
  small { font-size: 10pt; color: #555; word-break: break-all; }
</style></head><body>
<h1>${esc(nomeDefunto)}</h1>
<p>Inquadra il codice con la fotocamera del telefono<br>per leggere il manifesto e lasciare un pensiero.</p>
${svgQr()}
<p><small>${esc(url)}</small></p>
<script>window.onload = function () { window.print(); };</script>
</body></html>`);
    finestra.document.close();
  };

  return (
    <div className="mt-3 border-t border-line-soft pt-3">
      <button
        onClick={() => setAperto((v) => !v)}
        aria-expanded={aperto}
        className="flex items-center gap-2 text-sm font-medium text-bronze-700 hover:text-bronze-600"
      >
        Link e QR code per la famiglia
        <ChevronDown className={`h-4 w-4 transition-transform ${aperto ? 'rotate-180' : ''}`} />
      </button>

      {aperto && (
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div ref={qrRef} className="shrink-0 rounded-md border border-stone-200 bg-white p-2">
            <QRCodeSVG value={url} size={132} level="M" marginSize={0} />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            {!pubblicato && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Questo manifesto è ancora una bozza: il link funzionerà dopo la pubblicazione.
              </p>
            )}
            <p className="break-all font-mono text-xs text-gray-500">{url}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={copia} className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-bronze-500">
                <Copy className="h-4 w-4" /> {copiato ? 'Copiato' : 'Copia link'}
              </button>
              <button onClick={whatsapp} className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-bronze-500">
                <Send className="h-4 w-4" /> Invia alla famiglia
              </button>
              <button onClick={stampa} className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-bronze-500">
                <Printer className="h-4 w-4" /> Stampa locandina A5
              </button>
              <button onClick={scaricaSvg} className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:border-bronze-500">
                <Download className="h-4 w-4" /> Scarica QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
