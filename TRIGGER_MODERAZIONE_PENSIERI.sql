-- ============================================================================
-- TRIGGER POSTGRES: Moderazione automatica pensieri (fallback server-side)
-- ============================================================================
-- Questo trigger viene eseguito quando un nuovo pensiero viene inserito.
-- Se l'Edge Function non è disponibile, questo trigger fornisce un fallback.
-- ============================================================================

-- ============================================================================
-- PASSO 1: Crea funzione di moderazione
-- ============================================================================

CREATE OR REPLACE FUNCTION public.modera_pensiero_trigger()
RETURNS TRIGGER AS $$
DECLARE
  testo_lower text;
  parola_vietata text;
  pattern_elusione text[];
  contesto_sospetto text;
BEGIN
  -- Converti in lowercase per il confronto
  testo_lower := LOWER(NEW.testo);
  
  -- Lista di parole vietate
  DECLARE
    parole_vietate text[] := ARRAY[
      'cazzo', 'cazz', 'stronzo', 'stronz', 'merda', 'merd',
      'vaffanculo', 'vaffan', 'fanculo', 'culo',
      'puttana', 'puttan', 'troia', 'troi', 'bastardo', 'bastard',
      'idiota', 'cretino', 'deficiente', 'ritardato', 'coglione', 'coglion',
      'imbecille', 'imbecil', 'stupido', 'stupid',
      'ti odio', 'ti ammazzo', 'ti ammazz', 'muori',
      'vergognati', 'vergogn', 'schifo',
      'porn', 'sex', 'drog', 'alcol',
      'kazzo', 'caz', 'strnz', 'vaff'
    ];
  BEGIN
    -- Controllo 1: parole vietate
    FOREACH parola_vietata IN ARRAY parole_vietate LOOP
      IF testo_lower LIKE '%' || parola_vietata || '%' THEN
        NEW.approvato := false;
        RETURN NEW;
      END IF;
    END LOOP;
  END;
  
  -- Controllo 2: contesti sospetti (marca come non approvato per moderazione umana)
  DECLARE
    contesti_sospetti text[] := ARRAY[
      'non merita', 'se ne va', 'finalmente', 'meno male', 'era ora', 'meglio così'
    ];
  BEGIN
    FOREACH contesto_sospetto IN ARRAY contesti_sospetti LOOP
      IF testo_lower LIKE '%' || contesto_sospetto || '%' THEN
        NEW.approvato := false;
        RETURN NEW;
      END IF;
    END LOOP;
  END;
  
  -- Controllo 3: lunghezza minima
  IF LENGTH(TRIM(NEW.testo)) < 5 THEN
    NEW.approvato := false;
    RETURN NEW;
  END IF;
  
  -- Controllo 4: troppo maiuscolo
  DECLARE
    maiuscole_count integer;
    totale_count integer;
  BEGIN
    SELECT COUNT(*) INTO maiuscole_count
    FROM regexp_matches(NEW.testo, '[A-ZÀ-Ú]', 'g');
    
    SELECT LENGTH(REGEXP_REPLACE(NEW.testo, '\s', '', 'g')) INTO totale_count;
    
    IF totale_count > 10 AND (maiuscole_count::float / totale_count) > 0.7 THEN
      NEW.approvato := false;
      RETURN NEW;
    END IF;
  END;
  
  -- Se passa tutti i controlli, approva automaticamente
  NEW.approvato := true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PASSO 2: Crea trigger
-- ============================================================================

-- Elimina trigger se esiste già
DROP TRIGGER IF EXISTS trigger_modera_pensiero ON public.pensieri;

-- Crea trigger BEFORE INSERT
CREATE TRIGGER trigger_modera_pensiero
  BEFORE INSERT ON public.pensieri
  FOR EACH ROW
  EXECUTE FUNCTION public.modera_pensiero_trigger();

-- ============================================================================
-- PASSO 3: Test
-- ============================================================================

-- Test 1: Messaggio normale (dovrebbe essere approvato)
-- INSERT INTO public.pensieri (manifesto_id, user_id, nome, testo, approvato)
-- VALUES (
--   '11111111-1111-1111-1111-111111111111',
--   '9f564219-7250-4077-a50a-ebb2f2353bad',
--   'Mario Rossi',
--   'Condoglianze alla famiglia. Una persona splendida.',
--   NULL  -- Verrà impostato dal trigger
-- );
-- SELECT approvato FROM public.pensieri WHERE nome = 'Mario Rossi';
-- Dovrebbe restituire: true

-- Test 2: Messaggio offensivo (dovrebbe essere bloccato)
-- INSERT INTO public.pensieri (manifesto_id, user_id, nome, testo, approvato)
-- VALUES (
--   '11111111-1111-1111-1111-111111111111',
--   '9f564219-7250-4077-a50a-ebb2f2353bad',
--   'Test Utente',
--   'Questo messaggio contiene parolacce cazzo',
--   NULL  -- Verrà impostato dal trigger
-- );
-- SELECT approvato FROM public.pensieri WHERE nome = 'Test Utente';
-- Dovrebbe restituire: false

-- Test 3: Messaggio sospetto (dovrebbe essere bloccato per moderazione)
-- INSERT INTO public.pensieri (manifesto_id, user_id, nome, testo, approvato)
-- VALUES (
--   '11111111-1111-1111-1111-111111111111',
--   '9f564219-7250-4077-a50a-ebb2f2353bad',
--   'Test Utente 2',
--   'Finalmente se ne va',
--   NULL  -- Verrà impostato dal trigger
-- );
-- SELECT approvato FROM public.pensieri WHERE nome = 'Test Utente 2';
-- Dovrebbe restituire: false

SELECT '✅ Trigger di moderazione creato con successo' AS status;
