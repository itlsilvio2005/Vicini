-- ============================================================================
-- FUNZIONE POSTGRES PER CALCOLO PREZZI ORDINI FIORI LATO SERVER
-- ============================================================================
-- Questa funzione calcola il prezzo di un ordine fiori lato server,
-- impedendo al client di inviare importi arbitrari.
-- 
-- La funzione viene chiamata automaticamente da un trigger BEFORE INSERT
-- sulla tabella ordini_fiori.
-- ============================================================================

-- ============================================================================
-- PASSO 1: Crea tabella prezzi_fiori con i prezzi ufficiali
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.prezzi_fiori (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  composizione text NOT NULL UNIQUE,
  prezzo decimal(10, 2) NOT NULL CHECK (prezzo > 0),
  attivo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Abilita RLS
ALTER TABLE public.prezzi_fiori ENABLE ROW LEVEL SECURITY;

-- Policy: chiunque può leggere i prezzi (per il form)
CREATE POLICY "Chiunque può leggere i prezzi"
  ON public.prezzi_fiori FOR SELECT
  USING (true);

-- Policy: solo utenti autenticati possono modificare i prezzi (admin)
CREATE POLICY "Solo admin possono modificare i prezzi"
  ON public.prezzi_fiori FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profilo_utenti
      WHERE id = auth.uid() AND ruolo = 'agenzia'
    )
  );

-- ============================================================================
-- PASSO 2: Inserisci prezzi ufficiali
-- ============================================================================

INSERT INTO public.prezzi_fiori (composizione, prezzo) VALUES
  ('Composizione di gigli bianchi', 120.00),
  ('Cuscino di fiori di stagione', 90.00),
  ('Corona floreale con nastro', 180.00),
  ('Cesto bianco e verde', 70.00),
  ('Mazzo di rose chiare', 60.00)
ON CONFLICT (composizione) DO NOTHING;

-- ============================================================================
-- PASSO 3: Crea funzione per calcolo prezzo
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calcola_prezzo_ordine()
RETURNS TRIGGER AS $$
DECLARE
  prezzo_calcolato decimal(10, 2);
BEGIN
  -- Cerca il prezzo nella tabella prezzi_fiori
  SELECT prezzo INTO prezzo_calcolato
  FROM public.prezzi_fiori
  WHERE composizione = NEW.composizione
    AND attivo = true;
  
  -- Se la composizione non esiste, usa un prezzo di default
  IF prezzo_calcolato IS NULL THEN
    prezzo_calcolato := 100.00; -- Prezzo di default
    RAISE WARNING 'Composizione "%" non trovata, usato prezzo di default: %', NEW.composizione, prezzo_calcolato;
  END IF;
  
  -- Sovrascrivi l'importo con il prezzo calcolato lato server
  NEW.importo := prezzo_calcolato;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PASSO 4: Crea trigger BEFORE INSERT su ordini_fiori
-- ============================================================================

-- Elimina trigger esistente se presente
DROP TRIGGER IF EXISTS trigger_calcola_prezzo_ordine ON public.ordini_fiori;

-- Crea trigger
CREATE TRIGGER trigger_calcola_prezzo_ordine
  BEFORE INSERT ON public.ordini_fiori
  FOR EACH ROW
  EXECUTE FUNCTION public.calcola_prezzo_ordine();

-- ============================================================================
-- PASSO 5: Verifica che tutto funzioni
-- ============================================================================

-- Test: inserisci un ordine con importo sbagliato (verrà sovrascritto)
-- INSERT INTO public.ordini_fiori (
--   manifesto_id,
--   composizione,
--   importo,  -- Questo verrà ignorato e sovrascritto dal trigger
--   cliente_nome,
--   cliente_email,
--   cliente_telefono
-- )
-- VALUES (
--   '11111111-1111-1111-1111-111111111111',
--   'Corona floreale con nastro',
--   999.99,  -- Importo sbagliato, verrà sovrascritto a 180.00
--   'Mario Rossi',
--   'mario@email.it',
--   '3331234567'
-- );

-- Verifica che l'importo sia stato corretto
-- SELECT importo FROM public.ordini_fiori WHERE cliente_email = 'mario@email.it';
-- Dovrebbe restituire 180.00, non 999.99

-- ============================================================================
-- PASSO 6: Trigger per aggiornare updated_at su prezzi_fiori
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_prezzi_fiori_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_prezzi_fiori_updated_at ON public.prezzi_fiori;
CREATE TRIGGER set_prezzi_fiori_updated_at
  BEFORE UPDATE ON public.prezzi_fiori
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_prezzi_fiori_updated_at();

-- ============================================================================
-- FINE SCRIPT
-- ============================================================================

SELECT '✅ Funzione calcolo prezzi lato server creata con successo' AS status;
