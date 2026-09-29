-- ============================================================================
-- SCRIPT COMPLETO: Crea tabella notifiche_nucleo (senza dipendenze)
-- ============================================================================
-- Questo script è autonomo e crea tutto il necessario per la tabella
-- notifiche_nucleo, inclusa la funzione helper se non esiste.
-- ============================================================================

-- ============================================================================
-- PASSO 1: Verifica e crea la funzione handle_updated_at() se non esiste
-- ============================================================================

-- Controlla se la funzione esiste già
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_updated_at'
  ) THEN
    -- Crea la funzione
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    RAISE NOTICE '✅ Funzione handle_updated_at() creata';
  ELSE
    RAISE NOTICE '✅ Funzione handle_updated_at() già esistente';
  END IF;
END $$;

-- ============================================================================
-- PASSO 2: Crea la tabella notifiche_nucleo
-- ============================================================================

-- Elimina la tabella se esiste già (per evitare conflitti)
DROP TABLE IF EXISTS public.notifiche_nucleo CASCADE;

-- Crea la tabella
CREATE TABLE public.notifiche_nucleo (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profilo_utenti(id) ON DELETE CASCADE NOT NULL,
  titolo text NOT NULL,
  messaggio text NOT NULL,
  manifesto_id uuid REFERENCES public.manifesti(id) ON DELETE CASCADE NOT NULL,
  defunto_nome text NOT NULL,
  comune text NOT NULL,
  data_pubblicazione timestamp WITH TIME ZONE,
  letta boolean DEFAULT false,
  data_creazione timestamp WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

RAISE NOTICE '✅ Tabella notifiche_nucleo creata';

-- ============================================================================
-- PASSO 3: Abilita RLS
-- ============================================================================

ALTER TABLE public.notifiche_nucleo ENABLE ROW LEVEL SECURITY;

RAISE NOTICE '✅ RLS abilitato su notifiche_nucleo';

-- ============================================================================
-- PASSO 4: Crea policy RLS
-- ============================================================================

-- Policy: solo il proprietario può vedere le proprie notifiche
CREATE POLICY "Utente vede solo le proprie notifiche"
  ON public.notifiche_nucleo FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: solo il sistema può creare notifiche
CREATE POLICY "Sistema crea notifiche"
  ON public.notifiche_nucleo FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: solo il proprietario può aggiornare le proprie notifiche
CREATE POLICY "Utente aggiorna solo le proprie notifiche"
  ON public.notifiche_nucleo FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: solo il proprietario può eliminare le proprie notifiche
CREATE POLICY "Utente elimina solo le proprie notifiche"
  ON public.notifiche_nucleo FOR DELETE
  USING (auth.uid() = user_id);

RAISE NOTICE '✅ Policy RLS create';

-- ============================================================================
-- PASSO 5: Crea indici per performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notifiche_nucleo_user 
  ON public.notifiche_nucleo(user_id);

CREATE INDEX IF NOT EXISTS idx_notifiche_nucleo_letta 
  ON public.notifiche_nucleo(letta);

CREATE INDEX IF NOT EXISTS idx_notifiche_nucleo_data 
  ON public.notifiche_nucleo(data_creazione DESC);

RAISE NOTICE '✅ Indici creati';

-- ============================================================================
-- PASSO 6: Crea trigger per data_creazione
-- ============================================================================

-- Elimina trigger se esiste già
DROP TRIGGER IF EXISTS set_data_creazione ON public.notifiche_nucleo;

-- Crea trigger
CREATE TRIGGER set_data_creazione
  BEFORE INSERT ON public.notifiche_nucleo
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

RAISE NOTICE '✅ Trigger creato';

-- ============================================================================
-- PASSO 7: Verifica che tutto sia stato creato correttamente
-- ============================================================================

-- Verifica tabella
SELECT 
  'notifiche_nucleo' AS tabella,
  COUNT(*) AS righe
FROM public.notifiche_nucleo;

-- Verifica policy
SELECT 
  policyname AS policy,
  tablename AS tabella
FROM pg_policies
WHERE tablename = 'notifiche_nucleo';

-- Verifica indici
SELECT 
  indexname AS indice,
  tablename AS tabella
FROM pg_indexes
WHERE tablename = 'notifiche_nucleo';

-- ============================================================================
-- FINE SCRIPT
-- ============================================================================

SELECT '✅ Tabella notifiche_nucleo creata con successo!' AS status;
