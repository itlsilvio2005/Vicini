# Assistente con IA — messa in funzione

1. **Contatore giornaliero**: esegui `supabase/proposals/20261104_assistente_limiti.sql` nel SQL Editor.
2. **Chiave API**: crea una chiave su console.anthropic.com (imposta lì un limite di spesa mensile).
3. **Segreti** (Supabase → Edge Functions → Secrets):
   - `ANTHROPIC_API_KEY` = la chiave (obbligatorio)
   - `ORIGINI_AMMESSE` = `https://IL-TUO-DOMINIO` (consigliato; più indirizzi separati da virgola)
   - `ASSISTENTE_MAX_GIORNO` = `300` (tetto di domande al giorno; opzionale)
   - `ASSISTENTE_MODELLO` = `claude-haiku-5-5` (opzionale)
4. **Funzione**: Edge Functions → Create → nome esatto `assistente` → incolla `index.ts` → Deploy.
   Lascia attiva la verifica JWT (il sito invia la chiave pubblica).
5. Se cambi agenzie o listino in `src/data.ts`: `node scripts/genera-assistente.mjs` e ridistribuisci la funzione.

Senza questi passi il sito funziona lo stesso con le risposte rapide: l'IA parte solo se la funzione risponde
e il visitatore ha dato il consenso. Prima di attivarla aggiorna l'informativa privacy (le domande vanno ad Anthropic).
