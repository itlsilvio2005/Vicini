-- ============================================================================
-- MIGRAZIONE DI SICUREZZA: Moderazione Server-Side & Hardening RLS (Vicini)
-- ============================================================================

-- 1. Funzione e Trigger PostgreSQL per bloccare linguaggio offensivo lato database
CREATE OR REPLACE FUNCTION public.check_contenuto_offensivo()
RETURNS TRIGGER AS $$
DECLARE
  testo_da_controllare TEXT;
BEGIN
  -- Concatena i possibili campi testuali inviati dall'utente
  testo_da_controllare := lower(coalesce(to_jsonb(NEW)->>'testo', '') || ' ' || coalesce(to_jsonb(NEW)->>'messaggio', '') || ' ' || coalesce(to_jsonb(NEW)->>'autore_nome', '') || ' ' || coalesce(to_jsonb(NEW)->>'nome_autore', ''));

  -- Controllo regex su radici di parole offensive / bestemmie / spam link
  IF testo_da_controllare ~* '\y(cazz|merd|stronz|vaffancul|puttan|troi|bastard|fancul|porco\s*dio|dio\s*can|dio\s*boia|madonna\s*puttan)\y' THEN
    RAISE EXCEPTION 'Contenuto bloccato dal filtro di moderazione: linguaggio non consentito.';
  END IF;

  -- Limite anti-spam lunghezza testo
  IF length(testo_da_controllare) > 2000 THEN
    RAISE EXCEPTION 'Il testo supera il limite massimo consentito di 2000 caratteri.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Applica il trigger alla tabella public.pensieri prima di ogni INSERT o UPDATE
DROP TRIGGER IF EXISTS trg_moderazione_pensieri ON public.pensieri;
CREATE TRIGGER trg_moderazione_pensieri
  BEFORE INSERT OR UPDATE ON public.pensieri
  FOR EACH ROW
  EXECUTE FUNCTION public.check_contenuto_offensivo();

-- 2. Blindatura RLS: Assicura che RLS sia forzato su tutte le tabelle sensibili
ALTER TABLE IF EXISTS public.profilo_utenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agenzie ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.manifesti ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pensieri ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ordini_fiori ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pratiche ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.volonta ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.nucleo ENABLE ROW LEVEL SECURITY;
