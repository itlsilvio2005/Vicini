// Campo "trappola" (honeypot): invisibile alle persone, lo riempiono i bot che compilano
// tutti i campi. Se è compilato, il modulo finge l'invio riuscito e non salva nulla.
// Non è una protezione completa: taglia i bot più semplici, senza costi né account esterni.

export function CampoTrappola() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
    >
      <label>
        Non compilare questo campo
        <input type="text" name="sito_web" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

/** true se il campo trappola è stato compilato (quindi, quasi certamente, da un bot). */
export function bersaglioBot(form: HTMLFormElement | null): boolean {
  if (!form) return false;
  const valore = new FormData(form).get('sito_web');
  return typeof valore === 'string' && valore.trim() !== '';
}
