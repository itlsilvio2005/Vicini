-- ============================================================================
-- SCRIPT SEMPLIFICATO: Crea tabella notifiche_nucleo
-- ============================================================================

-- PASSO 1: Crea la funzione handle_updated_at()
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- PASSO 2: Elimina la tabella se esiste
DROP TABLE IF EXISTS public.notifiche_nucleo CASCADE;

-- PASSO 3: Crea la tabella
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

-- PASSO 4: Abilita RLS
ALTER TABLE public.notifiche_nucleo ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Crea policy RLS
CREATE POLICY "Utente vede solo le proprie notifiche"
  ON public.notifiche_nucleo FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema crea notifiche"
  ON public.notifiche_nucleo FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utente aggiorna solo le proprie notifiche"
  ON public.notifiche_nucleo FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Utente elimina solo le proprie notifiche"
  ON public.notifiche_nucleo FOR DELETE
  USING (auth.uid() = user_id);

-- PASSO 6: Crea indici
CREATE INDEX IF NOT EXISTS idx_notifiche_nucleo_user 
  ON public.notifiche_nucleo(user_id);

CREATE INDEX IF NOT EXISTS idx_notifiche_nucleo_letta 
  ON public.notifiche_nucleo(letta);

CREATE INDEX IF NOT EXISTS idx_notifiche_nucleo_data 
  ON public.notifiche_nucleo(data_creazione DESC);

-- PASSO 7: Crea trigger
DROP TRIGGER IF EXISTS set_data_creazione ON public.notifiche_nucleo;

CREATE TRIGGER set_data_creazione
  BEFORE INSERT ON public.notifiche_nucleo
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- PASSO 8: Verifica
SELECT '✅ Tabella notifiche_nucleo creata con successo!' AS status;
