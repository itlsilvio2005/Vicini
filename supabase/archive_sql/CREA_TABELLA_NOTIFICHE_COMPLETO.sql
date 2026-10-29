-- ============================================================================
-- SCRIPT COMPLETO: Crea tabella notifiche_nucleo (senza dipendenze)
-- ============================================================================
-- Questo script è autonomo e crea tutto il necessario per la tabella
-- notifiche_nucleo, inclusa la funzione helper se non esiste.
-- ============================================================================

-- ============================================================================
-- PASSO 1: Crea la funzione handle_updated_at() se non esiste
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- ============================================================================
-- PASSO 3: Abilita RLS
-- ============================================================================

ALTER TABLE public.notifiche_nucleo ENABLE ROW LEVEL SECURITY;

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

-- ============================================================================
-- PASSO 5: Crea indici per performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notifiche_nucleo_user 
  ON public.notifiche_nucleo(user_id);

CREATE INDEX IF NOT EXISTS idx_notifiche_nucleo_letta 
  ON public.notifiche_nucleo(letta);

CREATE INDEX IF NOT EXISTS idx_notifiche_nucleo_data 
  ON public.notifiche_nucleo(data_creazione DESC);

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
