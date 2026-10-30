-- ============================================================================
-- PROPOSTA (NON APPLICATA) - Filtro offese a parole intere per i pensieri
-- ============================================================================
-- Sostituisce il corpo di public.check_contenuto_offensivo(), creata dalla
-- migration 20261029_security_hardening.sql. Il trigger trg_moderazione_pensieri
-- resta com'è: basta rieseguire questo file.
--
-- Perché: la versione attuale usa  \y(radice1|radice2|...)\y  cioè richiede un
-- confine di parola SUBITO DOPO la radice. Quindi blocca "merd" ma NON
-- "merda", "stronzo", "vaffanculo" o "cazzo" (provato su PostgreSQL 16).
--
-- Scelte, pensate per un sito di necrologi dove i cognomi contano:
--  * si confrontano PAROLE INTERE da un elenco di forme (nessun prefisso):
--    "Cazzola", "Cazzaniga", "Troisi" non vengono mai toccati;
--  * "troia" è volutamente FUORI dall'elenco: è anche un cognome diffuso e un
--    toponimo; bloccarlo impedirebbe di scrivere a una famiglia Troia;
--  * si controllano testo, nome e relazione (prima solo testo);
--  * anti-aggiramento di base: maiuscole, cifre al posto di lettere
--    (str0nzo), lettere ripetute (stronzooo), spazi o simboli tra le lettere
--    delle bestemmie ("porco   dio").
-- Limiti noti (provati): è un filtro per le offese più comuni, non un sistema
-- di moderazione. Chi vuole aggirarlo ci riesce: "str-onzo" e "s t r o n z o"
-- passano. "bastardo/bastardi" sono bloccati anche come cognome (raro).
-- Il filtro lato sito (src/lib/filtro-offese.ts) e una revisione manuale
-- restano necessari.
--
-- Per aggiungere o togliere parole modifica l'elenco nella funzione sotto.
-- ============================================================================

create or replace function public.check_contenuto_offensivo()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  grezzo text;
  testo  text;
begin
  -- Campi di testo scritti dall'utente (le chiavi assenti valgono stringa vuota)
  grezzo := concat_ws(' ',
    to_jsonb(NEW)->>'testo',
    to_jsonb(NEW)->>'messaggio',
    to_jsonb(NEW)->>'nome',
    to_jsonb(NEW)->>'relazione',
    to_jsonb(NEW)->>'autore_nome',
    to_jsonb(NEW)->>'nome_autore'
  );

  -- Limite anti-spam (sul testo reale, prima delle normalizzazioni)
  if length(grezzo) > 2000 then
    raise exception 'Il testo supera il limite massimo consentito di 2000 caratteri.';
  end if;

  -- Normalizzazione: minuscolo, cifre/simboli al posto di lettere, lettere
  -- ripetute 3+ volte ridotte a 2; la punteggiatura di fine frase diventa un
  -- separatore ("| "), così "...di Dio. Cane..." non conta come "dio cane";
  -- tutto il resto che non è lettera diventa spazio.
  testo := lower(grezzo);
  testo := translate(testo, '01345$@', 'oieassa');
  testo := regexp_replace(testo, '(.)\1{2,}', '\1\1', 'g');
  testo := regexp_replace(testo, '[.,;:!?()"\n\r]+', ' | ', 'g');   -- la punteggiatura separa le frasi
  testo := regexp_replace(testo, '[^a-zàèéìòù|]+', ' ', 'g');
  testo := ' ' || btrim(testo) || ' ';

  -- Parole intere (confini = spazi). Le doppie sono tollerate: cazz+o+, ecc.
  -- (?x) = modalità estesa: spazi e a-capo nell'elenco sono ignorati.
  if testo ~ '(?x) \s (
        caz+(o+|i+|ata+|ate+)
      | mer+d(a+|e+|oso+|osa+)
      | stron+z(o+|a+|i+|e+)
      | va+f+(a+)?n+culo+
      | f+a+n+culo+
      | putt+an(a+|e+|ata+|ate+)
      | figli[oa]\s+di\s+putt+an(a+|e+)
      | bastard(o+|a+|i+|e+)
      | porc[oa]\s*d(io|ddio)
      | porcodio
      | d(io|ddio)\s*can(e+|i+)
      | diocane
      | d(io|ddio)\s*boia
      | dioboia
      | madonna\s+putt+an(a+|e+)
    ) \s' then
    raise exception 'Contenuto bloccato dal filtro di moderazione: linguaggio non consentito.';
  end if;

  return NEW;
end;
$$;

-- Il trigger esiste già (migration 20261029). Per sicurezza lo si ricrea uguale.
drop trigger if exists trg_moderazione_pensieri on public.pensieri;
create trigger trg_moderazione_pensieri
  before insert or update on public.pensieri
  for each row execute function public.check_contenuto_offensivo();
