-- ============================================================================
-- VICINI - SICUREZZA DEL DATABASE, FILE UNICO (13 novembre 2026)
-- ============================================================================
-- Sostituisce, in ordine, le proposte sparse in supabase/proposals/ e le
-- migrazioni "NON APPLICATA". Si esegue dal SQL Editor di Supabase e si puo'
-- rieseguire senza danni (create or replace / if not exists).
--
-- PRIMA di eseguirlo
--   1. Provalo su un progetto Supabase di prova (o fai un backup dal Dashboard).
--   2. Esegui le query di VERIFICA in fondo e salva il risultato "prima".
--
-- Cosa fa
--   * i nuovi account nascono sempre "privato" (il ruolo "agenzia" lo assegna
--     solo l'admin) e nessun utente puo' cambiarsi il ruolo da solo;
--   * il nome scritto in registrazione finisce in profilo_utenti.nome_completo;
--   * filtro offese a parole intere, valido anche su nome e legame;
--   * funzioni RPC con search_path fisso e diritti di esecuzione ristretti;
--   * omaggi virtuali, pulizia dati a 30 giorni, pensieri con approvazione e
--     link privato per la famiglia;
--   * chiude l'inserimento di ordini fiori dal sito.
--
-- NON tocca i dati di manifesti, agenzie, pratiche, nucleo, volonta.
-- Per rendere admin il TUO account, dopo l'esecuzione, una volta sola:
--   update public.profilo_utenti set ruolo = 'admin' where email = 'LA-TUA-EMAIL';
-- ============================================================================


-- ############################################################################
-- 1. Contatore giornaliero dell'assistente
-- ############################################################################

-- ============================================================================
-- PROPOSTA (NON APPLICATA) - Tetto giornaliero per l'assistente con IA
-- ============================================================================
-- La Edge Function "assistente" chiama un servizio a pagamento. Questo
-- contatore fissa un tetto di chiamate al giorno (default 150, cambiabile con
-- il segreto ASSISTENTE_MAX_GIORNO): superato il tetto l'assistente smette di
-- rispondere con l'IA e il sito torna alle risposte rapide. Così una raffica di
-- richieste non può trasformarsi in un conto imprevisto.
-- Si può rieseguire. Non contiene dati personali: solo "giorno -> numero".
-- ============================================================================

create table if not exists public.assistente_uso (
  giorno date primary key,
  chiamate integer not null default 0
);

alter table public.assistente_uso enable row level security;
-- Nessuna policy: anon e authenticated non vedono né scrivono la tabella.
revoke all on public.assistente_uso from anon, authenticated;

create or replace function public.assistente_conta(p_max integer default 150)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  insert into public.assistente_uso as u (giorno, chiamate)
  values ((now() at time zone 'Europe/Rome')::date, 1)
  on conflict (giorno) do update set chiamate = u.chiamate + 1
  returning u.chiamate into n;
  return n <= greatest(1, coalesce(p_max, 150));
end;
$$;

-- Solo la chiave di servizio (usata dalla Edge Function) può chiamarla.
revoke all on function public.assistente_conta(integer) from public, anon, authenticated;
grant execute on function public.assistente_conta(integer) to service_role;

-- Verifica: uso degli ultimi giorni.
select * from public.assistente_uso order by giorno desc limit 7;


-- ############################################################################
-- 3. Filtro offese a parole intere (20261031)
-- ############################################################################

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


-- ############################################################################
-- 2. Funzioni di base e ruoli (parti A e C di 20261030)
-- ############################################################################

-- ============================================================================
-- PARTE A - Hardening delle funzioni
-- ============================================================================

-- A1. handle_new_user è SECURITY DEFINER ma non fissa il search_path: una
--     funzione definer senza search_path può essere dirottata creando oggetti
--     con lo stesso nome in uno schema che compare prima nel percorso.
--     (Supabase la segnala come "function_search_path_mutable".)
--     La funzione viene poi riscritta nella PARTE C con la regola di approvazione;
--     qui basta fissare il search_path, così A funziona anche da sola.
alter function public.handle_new_user() set search_path = public;

-- A2. check_contenuto_offensivo (migration 20261029) usa solo NEW: non ha
--     bisogno dei privilegi del proprietario. Meglio SECURITY INVOKER, con
--     search_path fisso.
alter function public.check_contenuto_offensivo() security invoker;
alter function public.check_contenuto_offensivo() set search_path = public;


-- ============================================================================
-- PARTE C - Agenzie: solo quelle del territorio approvate dal titolare
-- ============================================================================
-- Regola (decisa dal titolare): può diventare "agenzia" solo un'agenzia del
-- territorio accettata da lui.
--
-- Problema: handle_new_user leggeva il ruolo da raw_user_meta_data->>'ruolo',
-- cioè da ciò che il client scrive in signUp(). Chiunque, anche senza usare il
-- sito, poteva chiamare l'API di Supabase con { data: { ruolo: 'agenzia' } },
-- diventare agenzia e PUBBLICARE MANIFESTI FUNEBRI (falsi annunci di decesso).
--
-- Soluzione:
--   C1. ogni nuovo utente nasce "privato", qualunque cosa dichiari il client;
--       il sito continua a inviare 'agenzia' come RICHIESTA (resta in
--       raw_user_meta_data e serve solo a farti vedere chi ha chiesto);
--   C2. il passaggio ad "agenzia" lo fai solo tu (query D5/D6 più sotto);
--   C3. un utente non può cambiarsi il ruolo da solo.
-- Gli account già esistenti non vengono toccati.

-- C1. Nuovi utenti: sempre 'privato'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profilo_utenti (id, email, ruolo, nome_completo)
  values (new.id, new.email, 'privato', nullif(left(btrim(coalesce(new.raw_user_meta_data->>'nome', '')), 120), ''));
  return new;
end;
$$;

-- C3. Il ruolo non è modificabile da un utente loggato. Le chiamate fatte da
--     SQL Editor o con la chiave di servizio non hanno auth.uid(), quindi la
--     tua approvazione manuale (D6) passa.
create or replace function public.blocca_cambio_ruolo()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.ruolo is distinct from old.ruolo and auth.uid() is not null then
    raise exception 'Il ruolo non può essere modificato dall''utente.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_blocca_cambio_ruolo on public.profilo_utenti;
create trigger trg_blocca_cambio_ruolo
  before update on public.profilo_utenti
  for each row execute function public.blocca_cambio_ruolo();




-- ############################################################################
-- 2b. Un utente modifica solo il proprio profilo, non il proprio ruolo
-- ############################################################################

drop policy if exists "Utenti aggiornano solo il proprio profilo" on public.profilo_utenti;
create policy "Utenti aggiornano solo il proprio profilo"
  on public.profilo_utenti for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ############################################################################
-- 4. Ruolo admin e funzioni riservate all'admin (20261102)
-- ############################################################################

-- ============================================================================
-- PROPOSTA (NON APPLICATA) - Account amministratore e andamento delle agenzie
-- ============================================================================
-- File in supabase/proposals/: NON è una migration attiva. Provalo su un
-- progetto di prova, poi eseguilo dal SQL Editor (si può rieseguire).
-- Va eseguito DOPO 20261030_security_followup.sql (usa blocca_cambio_ruolo).
--
-- Cosa aggiunge
--  1. Il ruolo 'admin'. Nessuno può diventarlo dal sito: si assegna a mano dal
--     SQL Editor (vedi PARTE 5).
--  2. Tre funzioni riservate all'admin, chiamabili dal sito:
--       admin_andamento_agenzie(giorni)  -> numeri per agenzia nel periodo
--       admin_richieste_agenzia()        -> chi si è registrato come agenzia
--                                           ed è ancora in attesa
--       admin_approva_agenzia(utente)    -> abilita quell'account come agenzia
--     Per chiunque non sia admin ogni funzione risponde "Accesso riservato".
--
-- Cosa NON c'è: le visite alle pagine. Il sito oggi non le registra da nessuna
-- parte, quindi non possono essere mostrate (servirebbe un contatore a parte).
-- ============================================================================


-- ============================================================================
-- PARTE 1 - Il ruolo 'admin' è ammesso
-- ============================================================================

do $$
declare
  c record;
begin
  for c in
    select conname from pg_constraint
     where conrelid = 'public.profilo_utenti'::regclass
       and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%ruolo%'
  loop
    execute format('alter table public.profilo_utenti drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.profilo_utenti
  add constraint profilo_utenti_ruolo_check
  check (ruolo in ('privato', 'agenzia', 'admin'));


-- ============================================================================
-- PARTE 2 - Chi è admin
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profilo_utenti
     where id = auth.uid() and ruolo = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;


-- ============================================================================
-- PARTE 3 - Il trigger sul ruolo lascia passare solo l'admin
-- ============================================================================
-- Prima: ruolo modificabile solo senza auth.uid() (SQL Editor / chiave di
-- servizio). Ora anche l'admin, ma soltanto attraverso le funzioni qui sotto
-- (le policy RLS impediscono comunque a chiunque di modificare profili altrui
-- con una UPDATE diretta).

create or replace function public.blocca_cambio_ruolo()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.ruolo is distinct from old.ruolo
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Il ruolo non può essere modificato dall''utente.';
  end if;
  return new;
end;
$$;


-- ============================================================================
-- PARTE 4 - Funzioni riservate all'admin
-- ============================================================================

-- 4a. Andamento per agenzia nel periodo richiesto (1 = oggi, 7, 30...).
create or replace function public.admin_andamento_agenzie(p_giorni integer default 30)
returns table (
  agenzia_id uuid,
  nome text,
  email text,
  iscritta_il timestamptz,
  manifesti_periodo bigint,
  manifesti_totali bigint,
  pensieri_periodo bigint,
  ordini_periodo bigint,
  importo_ordini_periodo numeric,
  ultimo_manifesto timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  dal timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Accesso riservato.';
  end if;

  p_giorni := greatest(1, least(coalesce(p_giorni, 30), 365));
  -- "oggi" = dalla mezzanotte; gli altri periodi = ultimi N giorni pieni.
  -- Stessa convenzione di created_at (timezone('utc', now())) per non
  -- spostare la finestra se il fuso del database non è UTC.
  dal := case when p_giorni = 1
              then date_trunc('day', timezone('utc', now()))::timestamptz
              else timezone('utc', now())::timestamptz - make_interval(days => p_giorni)
         end;

  return query
  select
    a.id,
    a.nome,
    a.email,
    a.created_at,
    (select count(*) from public.manifesti m
      where m.agenzia_id = a.id and m.created_at >= dal),
    (select count(*) from public.manifesti m where m.agenzia_id = a.id),
    (select count(*) from public.pensieri p
       join public.manifesti m on m.id = p.manifesto_id
      where m.agenzia_id = a.id and p.creato_il >= dal),
    (select count(*) from public.ordini_fiori o
       join public.manifesti m on m.id = o.manifesto_id
      where m.agenzia_id = a.id and o.created_at >= dal),
    (select coalesce(sum(o.importo), 0) from public.ordini_fiori o
       join public.manifesti m on m.id = o.manifesto_id
      where m.agenzia_id = a.id and o.created_at >= dal),
    (select max(m.created_at) from public.manifesti m where m.agenzia_id = a.id)
  from public.agenzie a
  order by 5 desc, a.nome;
end;
$$;

-- 4b. Account che si sono registrati come agenzia e aspettano l'approvazione.
--     handle_new_user (20261030) crea sempre 'privato': la scelta "agenzia"
--     fatta nel modulo resta solo nei metadati dell'account.
create or replace function public.admin_richieste_agenzia()
returns table (
  utente_id uuid,
  email text,
  nome_completo text,
  richiesta_il timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Accesso riservato.';
  end if;

  return query
  select p.id, p.email, p.nome_completo, p.created_at
    from public.profilo_utenti p
    join auth.users u on u.id = p.id
   where p.ruolo = 'privato'
     and u.raw_user_meta_data ->> 'ruolo' = 'agenzia'
   order by p.created_at desc;
end;
$$;

-- 4c. Approva una richiesta: da 'privato' ad 'agenzia'. Accetta solo account
--     che hanno davvero chiesto di essere agenzia, mai altri.
create or replace function public.admin_approva_agenzia(p_utente uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Accesso riservato.';
  end if;

  update public.profilo_utenti p
     set ruolo = 'agenzia', updated_at = timezone('utc', now())
   where p.id = p_utente
     and p.ruolo = 'privato'
     and exists (
       select 1 from auth.users u
        where u.id = p.id and u.raw_user_meta_data ->> 'ruolo' = 'agenzia'
     );

  if not found then
    raise exception 'Nessuna richiesta di agenzia in attesa per questo account.';
  end if;
end;
$$;

revoke all on function public.admin_andamento_agenzie(integer) from public;
revoke all on function public.admin_richieste_agenzia() from public;
revoke all on function public.admin_approva_agenzia(uuid) from public;
grant execute on function public.admin_andamento_agenzie(integer) to authenticated;
grant execute on function public.admin_richieste_agenzia() to authenticated;
grant execute on function public.admin_approva_agenzia(uuid) to authenticated;


-- ============================================================================
-- PARTE 5 - Creare l'account amministratore (a mano, una volta)
-- ============================================================================
-- 1. Registrati dal sito (scheda "Privato") con l'email che userai come admin.
-- 2. Esegui QUI, sostituendo l'email:
--
--    update public.profilo_utenti set ruolo = 'admin'
--     where email = 'LA-TUA-EMAIL@esempio.it';
--
-- 3. Esci e rientra dal sito: compare la sezione "Admin" (/admin).
-- Usa una password lunga e unica per questo account: può approvare agenzie e
-- vede i numeri di tutte.


-- ============================================================================
-- VERIFICHE (solo SELECT)
-- ============================================================================

-- V1. Account admin esistenti (deve esserci solo il tuo).
select email, ruolo from public.profilo_utenti where ruolo = 'admin';

-- V2. Constraint sul ruolo.
select conname, pg_get_constraintdef(oid) from pg_constraint
 where conrelid = 'public.profilo_utenti'::regclass and contype = 'c';

-- V3. Funzioni admin e chi le può chiamare (niente "public"/anon).
select p.proname, p.prosecdef as security_definer, p.proacl
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and (p.proname like 'admin\_%' or p.proname = 'is_admin');


-- ############################################################################
-- 4b. Foto dei manifesti e gestione manifesti da parte dell'admin
-- ############################################################################

alter table public.manifesti
  add column if not exists foto_url text,
  add column if not exists immagine_manifesto_url text;


-- Permette all'admin di inserire, modificare ed eliminare manifesti per qualsiasi agenzia
drop policy if exists "Admin gestisce tutti i manifesti" on public.manifesti;

create policy "Admin gestisce tutti i manifesti"
  on public.manifesti
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());



-- ############################################################################
-- 5. Funzioni RPC messe in sicurezza (20261107)
-- ############################################################################

-- ============================================================================
-- PROPOSTA (NON APPLICATA) - Messa in sicurezza delle funzioni RPC (20261105)
-- ============================================================================
-- Rilegge e corregge le funzioni esportate in migrations/20261105_funzioni_rpc.sql.
-- Si può rieseguire. Da eseguire nel SQL Editor DOPO aver controllato la parte 1.
--
-- Cosa sistema
--  1. registra_interazione: accettava QUALSIASI testo (fino a 64 caratteri) da
--     chiunque: bastava un ciclo per riempire la tabella di righe e falsare le
--     statistiche. Ora conta solo gli eventi previsti dal sito.
--  2. admin_statistiche_sito: non controllava che chi chiama fosse admin.
--  3. cerca_codice_nucleo: anche un visitatore anonimo poteva provare codici e
--     leggere nome, comune e anno di nascita di chi lo possedeva, senza limiti.
--     Ora serve l'accesso, il formato è controllato e ci sono massimo 20
--     tentativi all'ora per utente.
--  4. ottieni_mio_codice_nucleo: usava random() (prevedibile); ora usa il
--     generatore casuale sicuro di Postgres (gen_random_uuid).
--  5. agenzia_mio_andamento: riconosceva l'agenzia anche per email uguale, così
--     due agenzie con la stessa email si vedevano i numeri a vicenda. Ora solo
--     per user_id.
--  6. Diritti di esecuzione: in Postgres ogni funzione nuova è eseguibile da
--     tutti, anche da anonimi. Qui ogni funzione ha solo i diritti che servono.
--     assistente_conta, in particolare, è chiamabile solo dalla chiave di
--     servizio (altrimenti chiunque poteva esaurire il tetto del bot).
--  7. Tutte le funzioni hanno search_path fisso.
--
-- ATTENZIONE: is_admin() resta eseguibile da anonimi di proposito: è usata
-- dalle regole di sicurezza (policy) sui manifesti, e toglierla romperebbe la
-- lettura pubblica della Bacheca.
-- ============================================================================


-- ============================================================================
-- PARTE 1 - Tabelle usate dalle funzioni ma assenti dal repo
-- ============================================================================
-- Ricostruite DALL'USO nelle funzioni. Se esistono già nel tuo database con
-- altre colonne, "if not exists" non le tocca: confronta con
--   select column_name, data_type from information_schema.columns
--    where table_name in ('codici_nucleo','statistiche_giornaliere');

create table if not exists public.codici_nucleo (
  user_id uuid primary key references auth.users(id) on delete cascade,
  codice text not null unique,
  nome_completo text,
  comune text,
  anno_nascita integer,
  created_at timestamptz not null default now()
);

create table if not exists public.statistiche_giornaliere (
  giorno date not null,
  evento text not null,
  conteggio integer not null default 0,
  primary key (giorno, evento)
);

create table if not exists public.tentativi_codice_nucleo (
  user_id uuid not null,
  creato_il timestamptz not null default now()
);
create index if not exists tentativi_codice_nucleo_idx
  on public.tentativi_codice_nucleo (user_id, creato_il desc);

-- Si accede solo attraverso le funzioni qui sotto (SECURITY DEFINER).
alter table public.codici_nucleo enable row level security;
alter table public.statistiche_giornaliere enable row level security;
alter table public.tentativi_codice_nucleo enable row level security;
revoke all on public.codici_nucleo, public.statistiche_giornaliere, public.tentativi_codice_nucleo
  from anon, authenticated;


-- ============================================================================
-- PARTE 2 - Funzioni
-- ============================================================================

-- 2a. Conteggio anonimo: solo eventi previsti.
create or replace function public.registra_interazione(p_evento text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v text := lower(trim(coalesce(p_evento, '')));
begin
  if v not in ('apertura_manifesto', 'click_fiori', 'filtro_mappa', 'domanda_bot')
     and v !~ '^visita_(bacheca|imprese|mappa|volonta-nucleo|login|area-privata|area-riservata|dashboard-agenzia)$' then
    return;   -- evento non previsto: ignorato in silenzio
  end if;

  insert into public.statistiche_giornaliere (giorno, evento, conteggio)
  values ((now() at time zone 'Europe/Rome')::date, v, 1)
  on conflict (giorno, evento)
  do update set conteggio = public.statistiche_giornaliere.conteggio + 1;
end;
$$;

-- 2b. Statistiche per l'admin.
create or replace function public.admin_statistiche_sito(p_giorni integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inizio date;
  v_visite int;
  v_aperture_manifesti int;
  v_ricerche_mappa int;
  v_click_fiori int;
  v_domande_bot int;
  v_utenti_nucleo int;
  v_volonta_attive int;
begin
  if not public.is_admin() then
    raise exception 'Accesso riservato.';
  end if;

  p_giorni := greatest(1, least(coalesce(p_giorni, 30), 365));
  v_inizio := (now() at time zone 'Europe/Rome')::date - (p_giorni - 1);

  select coalesce(sum(conteggio), 0) into v_visite
    from public.statistiche_giornaliere where giorno >= v_inizio and evento like 'visita\_%';
  select coalesce(sum(conteggio), 0) into v_aperture_manifesti
    from public.statistiche_giornaliere where giorno >= v_inizio and evento = 'apertura_manifesto';
  select coalesce(sum(conteggio), 0) into v_ricerche_mappa
    from public.statistiche_giornaliere where giorno >= v_inizio and evento = 'filtro_mappa';
  select coalesce(sum(conteggio), 0) into v_click_fiori
    from public.statistiche_giornaliere where giorno >= v_inizio and evento = 'click_fiori';
  select coalesce(sum(conteggio), 0) into v_domande_bot
    from public.statistiche_giornaliere where giorno >= v_inizio and evento = 'domanda_bot';
  select count(*) into v_utenti_nucleo from public.nucleo;
  select count(*) into v_volonta_attive from public.volonta;

  return jsonb_build_object(
    'visite_sito', v_visite,
    'aperture_manifesti', v_aperture_manifesti,
    'ricerche_mappa', v_ricerche_mappa,
    'click_fiori', v_click_fiori,
    'domande_bot', v_domande_bot,
    'membri_nucleo_totali', v_utenti_nucleo,
    'volonta_registrate', v_volonta_attive
  );
end;
$$;

-- 2c. Il mio codice nucleo (creato al primo uso, casuale sicuro).
create or replace function public.ottieni_mio_codice_nucleo(p_nome text default null)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_codice text;
  v_chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- 32 simboli
  v_b bytea;
  v_i integer;
begin
  if v_uid is null then return null; end if;

  select codice into v_codice from public.codici_nucleo where user_id = v_uid;
  if v_codice is not null then return v_codice; end if;

  loop
    -- gen_random_uuid() usa il generatore casuale sicuro; 256 è multiplo di 32, quindi nessun sbilanciamento
    v_b := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    v_codice := 'VCN-';
    for v_i in 0..3 loop
      v_codice := v_codice || substr(v_chars, (get_byte(v_b, v_i) % 32) + 1, 1);
    end loop;
    v_codice := v_codice || '-';
    for v_i in 4..5 loop
      v_codice := v_codice || substr(v_chars, (get_byte(v_b, v_i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.codici_nucleo c where c.codice = v_codice);
  end loop;

  insert into public.codici_nucleo (user_id, codice, nome_completo)
  values (v_uid, v_codice, left(p_nome, 120))
  on conflict (user_id) do nothing;

  -- se due richieste sono arrivate insieme, vale quella già salvata
  select codice into v_codice from public.codici_nucleo where user_id = v_uid;
  return v_codice;
end;
$$;

-- 2d. Cerca un codice altrui: solo utenti collegati, formato controllato, 20 tentativi/ora.
create or replace function public.cerca_codice_nucleo(p_codice text)
returns table (user_id uuid, codice text, nome_completo text, comune text, anno_nascita integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_cod text := upper(trim(coalesce(p_codice, '')));
  v_n integer;
begin
  if v_uid is null then
    raise exception 'Accesso riservato.';
  end if;

  select count(*) into v_n from public.tentativi_codice_nucleo t
   where t.user_id = v_uid and t.creato_il > now() - interval '1 hour';
  if v_n >= 20 then
    raise exception 'Troppi tentativi. Riprova tra un po'' di tempo.';
  end if;

  insert into public.tentativi_codice_nucleo (user_id) values (v_uid);
  delete from public.tentativi_codice_nucleo t where t.creato_il < now() - interval '1 day';

  if v_cod !~ '^VCN-[A-Z0-9]{4}-[A-Z0-9]{2}$' then
    return;   -- formato sbagliato: nessun risultato
  end if;

  return query
  select c.user_id, c.codice, c.nome_completo, coalesce(c.comune, 'Modena'), c.anno_nascita
    from public.codici_nucleo c
   where c.codice = v_cod
   limit 1;
end;
$$;

-- 2e. Andamento della PROPRIA agenzia: solo per user_id.
create or replace function public.agenzia_mio_andamento(p_giorni integer default 30)
returns table (
  agenzia_id uuid, nome text, email text, iscritta_il timestamptz,
  manifesti_periodo bigint, manifesti_totali bigint, pensieri_periodo bigint,
  ordini_periodo bigint, importo_ordini_periodo numeric, ultimo_manifesto timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_ruolo text;
  dal timestamptz;
begin
  if v_uid is null then
    raise exception 'Accesso riservato alle agenzie autenticate.';
  end if;

  select p.ruolo into v_ruolo from public.profilo_utenti p where p.id = v_uid;
  if v_ruolo is distinct from 'agenzia' and v_ruolo is distinct from 'admin' then
    raise exception 'Accesso riservato alle agenzie.';
  end if;

  p_giorni := greatest(1, least(coalesce(p_giorni, 30), 365));
  dal := case when p_giorni = 1
              then date_trunc('day', timezone('utc', now()))::timestamptz
              else timezone('utc', now())::timestamptz - make_interval(days => p_giorni)
         end;

  return query
  select
    a.id, a.nome, a.email, a.created_at,
    (select count(*) from public.manifesti m where m.agenzia_id = a.id and m.created_at >= dal),
    (select count(*) from public.manifesti m where m.agenzia_id = a.id),
    (select count(*) from public.pensieri p join public.manifesti m on m.id = p.manifesto_id
      where m.agenzia_id = a.id and p.creato_il >= dal),
    (select count(*) from public.ordini_fiori o join public.manifesti m on m.id = o.manifesto_id
      where m.agenzia_id = a.id and o.created_at >= dal),
    (select coalesce(sum(o.importo), 0) from public.ordini_fiori o join public.manifesti m on m.id = o.manifesto_id
      where m.agenzia_id = a.id and o.created_at >= dal),
    (select max(m.created_at) from public.manifesti m where m.agenzia_id = a.id)
  from public.agenzie a
  where a.user_id = v_uid          -- solo la propria agenzia (mai per email)
  order by a.created_at
  limit 1;
end;
$$;

-- 2f. Contatore giornaliero del bot (come in 20261104_assistente_limiti.sql).
create or replace function public.assistente_conta(p_max integer default 150)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  insert into public.assistente_uso as u (giorno, chiamate)
  values ((now() at time zone 'Europe/Rome')::date, 1)
  on conflict (giorno) do update set chiamate = u.chiamate + 1
  returning u.chiamate into n;
  return n <= greatest(1, coalesce(p_max, 150));
end;
$$;


-- ============================================================================
-- PARTE 3 - Chi può eseguire cosa
-- ============================================================================
-- Su Supabase ogni funzione creata in "public" riceve in automatico il diritto
-- di esecuzione per anon, authenticated e service_role: per questo qui si
-- toglie esplicitamente "anon" (non basta togliere "public").

revoke all on function public.registra_interazione(text) from public;
grant execute on function public.registra_interazione(text) to anon, authenticated;

revoke all on function public.admin_statistiche_sito(integer) from public, anon;
revoke all on function public.admin_andamento_agenzie(integer) from public, anon;
revoke all on function public.admin_richieste_agenzia() from public, anon;
revoke all on function public.admin_approva_agenzia(uuid) from public, anon;
grant execute on function public.admin_statistiche_sito(integer) to authenticated;
grant execute on function public.admin_andamento_agenzie(integer) to authenticated;
grant execute on function public.admin_richieste_agenzia() to authenticated;
grant execute on function public.admin_approva_agenzia(uuid) to authenticated;

revoke all on function public.agenzia_mio_andamento(integer) from public, anon;
grant execute on function public.agenzia_mio_andamento(integer) to authenticated;

revoke all on function public.ottieni_mio_codice_nucleo(text) from public, anon;
revoke all on function public.cerca_codice_nucleo(text) from public, anon;
grant execute on function public.ottieni_mio_codice_nucleo(text) to authenticated;
grant execute on function public.cerca_codice_nucleo(text) to authenticated;

revoke all on function public.assistente_conta(integer) from public, anon, authenticated;
grant execute on function public.assistente_conta(integer) to service_role;

-- is_admin(): resta eseguibile da tutti (serve alle policy). Restituisce false per gli anonimi.
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;


-- ============================================================================
-- VERIFICHE (solo SELECT)
-- ============================================================================

-- V1. Chi può eseguire le funzioni: nessuna riga deve avere "=X" (cioè "tutti")
--     tranne nessuna; assistente_conta solo service_role.
select p.proname, p.proacl
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('registra_interazione','admin_statistiche_sito','admin_andamento_agenzie',
                     'admin_richieste_agenzia','admin_approva_agenzia','agenzia_mio_andamento',
                     'ottieni_mio_codice_nucleo','cerca_codice_nucleo','assistente_conta','is_admin')
 order by p.proname;

-- V2. Eventi registrati (devono essere solo quelli previsti).
select evento, sum(conteggio) from public.statistiche_giornaliere group by evento order by 2 desc;

-- V3. Tabelle protette (rowsecurity = true su tutte e tre).
select tablename, rowsecurity from pg_tables
 where schemaname = 'public' and tablename in ('codici_nucleo','statistiche_giornaliere','tentativi_codice_nucleo');


-- ############################################################################
-- 6. Omaggi virtuali
-- ############################################################################

-- ============================================================================
-- PROPOSTA - Omaggi virtuali gratuiti sui manifesti ("Deponi un fiore")
-- ============================================================================
-- Tre omaggi simbolici: fiore bianco, rosa, candela. Nessun pagamento, nessun
-- dato personale obbligatorio (il nome è facoltativo e non viene mostrato).
-- Il browser non tocca la tabella: passa solo dalle due funzioni qui sotto.
-- Limiti anti-abuso (il database non vede l'IP, quindi si usa un codice casuale
-- generato dal browser, che un malintenzionato può cambiare: per questo c'è
-- anche un tetto per manifesto):
--   * massimo 3 omaggi all'ora per dispositivo e per manifesto
--   * massimo 30 omaggi ogni 10 minuti per manifesto, 10 all'ora per dispositivo
--     su tutti i manifesti e 200 ogni 10 minuti in totale
-- Si può rieseguire.
-- ============================================================================

create table if not exists public.omaggi_virtuali (
  id bigint generated always as identity primary key,
  manifesto_id text not null,
  tipo text not null check (tipo in ('fiore','rosa','candela')),
  nome text check (nome is null or char_length(nome) <= 60),
  dispositivo text not null check (char_length(dispositivo) between 16 and 64),
  creato_il timestamptz not null default now()
);

create index if not exists omaggi_virtuali_manifesto_idx
  on public.omaggi_virtuali (manifesto_id, creato_il desc);
create index if not exists omaggi_virtuali_dispositivo_idx
  on public.omaggi_virtuali (manifesto_id, dispositivo, creato_il desc);

alter table public.omaggi_virtuali enable row level security;
revoke all on public.omaggi_virtuali from anon, authenticated;

-- Deporre un omaggio.
create or replace function public.deponi_omaggio(
  p_manifesto text, p_tipo text, p_dispositivo text, p_nome text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tipo text := lower(trim(coalesce(p_tipo, '')));
  v_disp text := trim(coalesce(p_dispositivo, ''));
  v_nome text := nullif(left(trim(coalesce(p_nome, '')), 60), '');
begin
  if v_tipo not in ('fiore','rosa','candela') then
    raise exception 'Omaggio non valido.';
  end if;
  if char_length(v_disp) < 16 or char_length(v_disp) > 64 then
    raise exception 'Richiesta non valida.';
  end if;
  -- I manifesti del sito sono ancora dati di esempio nel codice, non righe del
  -- database: si controlla solo la forma dell'identificativo. Quando i manifesti
  -- arriveranno da public.manifesti si potrà tornare a verificarne l'esistenza.
  if coalesce(p_manifesto, '') !~ '^[A-Za-z0-9_-]{1,64}$' then
    raise exception 'Manifesto non valido.';
  end if;

  if (select count(*) from public.omaggi_virtuali o
       where o.manifesto_id = p_manifesto and o.dispositivo = v_disp
         and o.creato_il > now() - interval '1 hour') >= 3 then
    raise exception 'Hai già deposto alcuni omaggi: riprova più tardi.';
  end if;
  -- tetto per dispositivo su tutti i manifesti e tetto globale
  if (select count(*) from public.omaggi_virtuali o
       where o.dispositivo = v_disp and o.creato_il > now() - interval '1 hour') >= 10 then
    raise exception 'Hai già deposto alcuni omaggi: riprova più tardi.';
  end if;
  if (select count(*) from public.omaggi_virtuali o
       where o.creato_il > now() - interval '10 minutes') >= 200 then
    raise exception 'Troppi omaggi in poco tempo: riprova tra qualche minuto.';
  end if;
  if (select count(*) from public.omaggi_virtuali o
       where o.manifesto_id = p_manifesto
         and o.creato_il > now() - interval '10 minutes') >= 30 then
    raise exception 'Troppi omaggi in poco tempo: riprova tra qualche minuto.';
  end if;

  insert into public.omaggi_virtuali (manifesto_id, tipo, nome, dispositivo)
  values (p_manifesto, v_tipo, v_nome, v_disp);
  return true;
end;
$$;

-- Conteggi pubblici (solo numeri, nessun nome).
create or replace function public.omaggi_conteggi()
returns table (manifesto_id text, tipo text, totale bigint)
language sql
stable
security definer
set search_path = public
as $$
  select o.manifesto_id, o.tipo, count(*)
    from public.omaggi_virtuali o
   group by o.manifesto_id, o.tipo;
$$;

revoke all on function public.deponi_omaggio(text, text, text, text) from public;
revoke all on function public.omaggi_conteggi() from public;
grant execute on function public.deponi_omaggio(text, text, text, text) to anon, authenticated;
grant execute on function public.omaggi_conteggi() to anon, authenticated;

-- Verifica: tabella protetta e permessi delle due funzioni.
select tablename, rowsecurity from pg_tables
 where schemaname = 'public' and tablename = 'omaggi_virtuali';
select proname, proacl from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and proname in ('deponi_omaggio', 'omaggi_conteggi');


-- ############################################################################
-- 7. Pulizia dati dopo 30 giorni
-- ############################################################################

-- ============================================================================
-- PROPOSTA - Pulizia automatica dei dati dopo 30 giorni
-- ============================================================================
-- Coerente con l'informativa privacy del sito:
--  * il codice del dispositivo degli omaggi virtuali viene cancellato dopo
--    30 giorni (resta la riga, quindi il conteggio dei partecipanti non cambia);
--  * i tentativi di ricerca codice nucleo più vecchi di 1 giorno vengono tolti.
-- Richiede 20261107_omaggi_virtuali.sql e 20261107_sicurezza_funzioni_rpc.sql.
-- Si può rieseguire.
-- ============================================================================

create or replace function public.pulizia_dati_30_giorni()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.omaggi_virtuali
     set dispositivo = 'anonimizzato-' || lpad(id::text, 8, '0')
   where creato_il < now() - interval '30 days'
     and dispositivo not like 'anonimizzato-%';

  delete from public.tentativi_codice_nucleo
   where creato_il < now() - interval '1 day';
end;
$$;

revoke all on function public.pulizia_dati_30_giorni() from public, anon, authenticated;
grant execute on function public.pulizia_dati_30_giorni() to service_role;

-- Esecuzione automatica ogni notte alle 03:15 con pg_cron.
-- Se l'estensione non è attiva: Dashboard -> Database -> Extensions -> pg_cron.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.unschedule(jobid) from cron.job where jobname = 'vicini-pulizia-30-giorni';
    perform cron.schedule('vicini-pulizia-30-giorni', '15 3 * * *', 'select public.pulizia_dati_30_giorni()');
    raise notice 'Pulizia notturna programmata.';
  else
    raise notice 'pg_cron non disponibile: attivalo dalle Extensions e riesegui questo script.';
  end if;
end $$;

-- Verifica: nessun omaggio con codice dispositivo più vecchio di 30 giorni.
select count(*) as codici_da_ripulire
  from public.omaggi_virtuali
 where creato_il < now() - interval '30 days' and dispositivo not like 'anonimizzato-%';


-- ############################################################################
-- 8. Pensieri con approvazione (sostituisce 20261108_lascia_pensiero)
-- ############################################################################

-- ============================================================================
-- PROPOSTA - Pensieri di cordoglio con approvazione prima della pubblicazione
-- ============================================================================
-- Regole
--  * Un pensiero nuovo NON è pubblico: resta "in attesa" (approvato = false).
--  * Lo possono approvare o eliminare: la famiglia (con un link privato per
--    manifesto, senza account), l'agenzia che ha creato il manifesto e
--    l'amministratore.
--  * Il filtro offese (trigger trg_moderazione_pensieri) continua a bloccare
--    il testo già all'invio, prima ancora che arrivi in coda.
--  * I pensieri già presenti restano pubblicati.
-- Sostituisce lascia_pensiero (20261108_lascia_pensiero.sql). Si può rieseguire.
-- ============================================================================

-- Link privato della famiglia: tabella a parte, perché "manifesti" è leggibile
-- da tutti e il token non deve mai comparire lì.
create table if not exists public.famiglia_accessi (
  manifesto_id uuid primary key references public.manifesti(id) on delete cascade,
  token text not null unique,
  creato_il timestamptz not null default now()
);
alter table public.famiglia_accessi enable row level security;
revoke all on public.famiglia_accessi from anon, authenticated;

-- Chi può moderare un manifesto: admin, oppure l'agenzia proprietaria.
create or replace function public.puo_moderare_manifesto(p_manifesto uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then return false; end if;
  if public.is_admin() then return true; end if;
  return exists (
    select 1
      from public.manifesti m
      join public.agenzie a on a.id = m.agenzia_id
      join public.profilo_utenti u on u.id = v_uid and u.ruolo = 'agenzia'
     where m.id = p_manifesto and a.user_id = v_uid);
end;
$$;
-- Risponde solo per chi la chiama (usa auth.uid()): sicura da esporre, serve alla regola sui pensieri.
revoke all on function public.puo_moderare_manifesto(uuid) from public;
grant execute on function public.puo_moderare_manifesto(uuid) to anon, authenticated;

-- 1. Invio: il pensiero nasce "in attesa".
create or replace function public.lascia_pensiero(
  p_manifesto text, p_nome text, p_relazione text, p_testo text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_manifesto uuid;
  v_nome text := left(trim(coalesce(p_nome, '')), 80);
  v_rel text := nullif(left(trim(coalesce(p_relazione, '')), 80), '');
  v_testo text := left(trim(coalesce(p_testo, '')), 400);
begin
  begin
    v_manifesto := p_manifesto::uuid;
  exception when others then
    raise exception 'Manifesto non trovato.';
  end;
  if not exists (select 1 from public.manifesti m where m.id = v_manifesto and m.pubblicato = true) then
    raise exception 'Manifesto non trovato.';
  end if;
  if char_length(v_nome) < 2 or char_length(v_testo) < 5 then
    raise exception 'Indica il tuo nome e scrivi qualche parola.';
  end if;

  if (select count(*) from public.pensieri p
       where p.manifesto_id = v_manifesto and p.creato_il > timezone('utc', now()) - interval '10 minutes') >= 10 then
    raise exception 'Troppi pensieri in poco tempo: riprova tra qualche minuto.';
  end if;
  if (select count(*) from public.pensieri p
       where p.creato_il > timezone('utc', now()) - interval '10 minutes') >= 100 then
    raise exception 'Troppi pensieri in poco tempo: riprova tra qualche minuto.';
  end if;
  if (select count(*) from public.pensieri p
       where p.manifesto_id = v_manifesto and p.approvato = false) >= 50 then
    raise exception 'Ci sono già molti pensieri in attesa di approvazione: riprova più tardi.';
  end if;

  insert into public.pensieri (manifesto_id, user_id, nome, relazione, testo, approvato)
  values (v_manifesto, auth.uid(), v_nome, v_rel, v_testo, false);
  return true;
end;
$$;
revoke all on function public.lascia_pensiero(text, text, text, text) from public;
grant execute on function public.lascia_pensiero(text, text, text, text) to anon, authenticated;

-- 2. Pensieri pubblici (solo approvati, senza dati dell'autore oltre al nome).
create or replace function public.pensieri_pubblici()
returns table (manifesto_id uuid, nome text, relazione text, testo text, creato_il timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select p.manifesto_id, p.nome, p.relazione, p.testo, p.creato_il
    from public.pensieri p
    join public.manifesti m on m.id = p.manifesto_id and m.pubblicato = true
   where p.approvato = true
   order by p.creato_il desc
   limit 2000;
$$;
revoke all on function public.pensieri_pubblici() from public;
grant execute on function public.pensieri_pubblici() to anon, authenticated;

-- 3. Famiglia (link privato).
create or replace function public.famiglia_pensieri(p_token text)
returns table (pensiero_id uuid, nome_defunto text, nome text, relazione text, testo text,
               approvato boolean, creato_il timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_manifesto uuid;
begin
  select f.manifesto_id into v_manifesto from public.famiglia_accessi f
   where f.token = coalesce(p_token, '');
  if v_manifesto is null then
    raise exception 'Link non valido.';
  end if;
  return query
  select p.id, m.nome_defunto, p.nome, p.relazione, p.testo, coalesce(p.approvato, false), p.creato_il
    from public.pensieri p join public.manifesti m on m.id = p.manifesto_id
   where p.manifesto_id = v_manifesto
   order by coalesce(p.approvato, false), p.creato_il desc
   limit 300;
end;
$$;

create or replace function public.famiglia_modera(p_token text, p_pensiero uuid, p_azione text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_manifesto uuid;
begin
  select f.manifesto_id into v_manifesto from public.famiglia_accessi f
   where f.token = coalesce(p_token, '');
  if v_manifesto is null then
    raise exception 'Link non valido.';
  end if;
  if p_azione = 'approva' then
    update public.pensieri set approvato = true where id = p_pensiero and manifesto_id = v_manifesto;
  elsif p_azione = 'elimina' then
    delete from public.pensieri where id = p_pensiero and manifesto_id = v_manifesto;
  else
    raise exception 'Azione non valida.';
  end if;
  return found;
end;
$$;
revoke all on function public.famiglia_pensieri(text), public.famiglia_modera(text, uuid, text) from public;
grant execute on function public.famiglia_pensieri(text), public.famiglia_modera(text, uuid, text) to anon, authenticated;

-- 4. Agenzia e amministratore.
create or replace function public.agenzia_pensieri()
returns table (pensiero_id uuid, manifesto_id uuid, nome_defunto text, nome text, relazione text,
               testo text, approvato boolean, creato_il timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Accesso riservato.';
  end if;
  return query
  select p.id, p.manifesto_id, m.nome_defunto, p.nome, p.relazione, p.testo,
         coalesce(p.approvato, false), p.creato_il
    from public.pensieri p join public.manifesti m on m.id = p.manifesto_id
   where public.puo_moderare_manifesto(p.manifesto_id)
   order by coalesce(p.approvato, false), p.creato_il desc
   limit 300;
end;
$$;

create or replace function public.agenzia_modera_pensiero(p_pensiero uuid, p_azione text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_manifesto uuid;
begin
  select p.manifesto_id into v_manifesto from public.pensieri p where p.id = p_pensiero;
  if v_manifesto is null or not public.puo_moderare_manifesto(v_manifesto) then
    raise exception 'Accesso riservato.';
  end if;
  if p_azione = 'approva' then
    update public.pensieri set approvato = true where id = p_pensiero;
  elsif p_azione = 'elimina' then
    delete from public.pensieri where id = p_pensiero;
  else
    raise exception 'Azione non valida.';
  end if;
  return true;
end;
$$;

-- Link privato da consegnare alla famiglia (si crea al primo uso).
-- Con p_nuovo = true il vecchio link smette di funzionare.
create or replace function public.agenzia_link_famiglia(p_manifesto uuid, p_nuovo boolean default false)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
begin
  if not public.puo_moderare_manifesto(p_manifesto) then
    raise exception 'Accesso riservato.';
  end if;
  if p_nuovo then
    delete from public.famiglia_accessi where manifesto_id = p_manifesto;
  end if;
  select f.token into v_token from public.famiglia_accessi f where f.manifesto_id = p_manifesto;
  if v_token is null then
    v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
    insert into public.famiglia_accessi (manifesto_id, token) values (p_manifesto, v_token);
  end if;
  return v_token;
end;
$$;

revoke all on function public.agenzia_pensieri(), public.agenzia_modera_pensiero(uuid, text),
  public.agenzia_link_famiglia(uuid, boolean) from public, anon;
grant execute on function public.agenzia_pensieri(), public.agenzia_modera_pensiero(uuid, text),
  public.agenzia_link_famiglia(uuid, boolean) to authenticated;

-- 5. Regola nel database: chi non è moderatore non può pubblicare né
--    approvare da solo (nemmeno un utente collegato che scrive direttamente
--    sulla tabella). Gli inserimenti fatti da funzioni del database o dalla
--    chiave di servizio non sono toccati.
create or replace function public.pensieri_forza_approvazione()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return NEW;
  end if;
  if tg_op = 'INSERT' then
    if not public.puo_moderare_manifesto(NEW.manifesto_id) then
      NEW.approvato := false;
    end if;
  elsif NEW.approvato is distinct from OLD.approvato then
    if not public.puo_moderare_manifesto(NEW.manifesto_id) then
      raise exception 'Solo la famiglia, l''agenzia o l''amministratore possono approvare un pensiero.';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_pensieri_approvazione on public.pensieri;
create trigger trg_pensieri_approvazione
  before insert or update on public.pensieri
  for each row execute function public.pensieri_forza_approvazione();

-- Verifica: chi può eseguire cosa.
select p.proname, p.proacl
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('lascia_pensiero','pensieri_pubblici','famiglia_pensieri','famiglia_modera',
                     'agenzia_pensieri','agenzia_modera_pensiero','agenzia_link_famiglia','puo_moderare_manifesto')
 order by p.proname;


-- ############################################################################
-- 9. Niente ordini fiori dal sito
-- ############################################################################

-- ============================================================================
-- PROPOSTA - Chiude l'invio di ordini fiori dal sito
-- ============================================================================
-- Il sito non mostra più "Invia Fiori". Questo script toglie anche il permesso
-- nel database, così nessuno può inserire ordini chiamando direttamente l'API.
-- Gli ordini già presenti restano e le agenzie continuano a vederli.
-- Si può rieseguire. Per riaprire gli ordini basta rieseguire la parte
-- "inserimento controllato" di 20261030_security_followup.sql.
-- ============================================================================

drop policy if exists "Ordini fiori: inserimento controllato" on public.ordini_fiori;
drop policy if exists "Chiunque può creare ordini fiori" on public.ordini_fiori;
drop policy if exists "Utenti possono creare ordini" on public.ordini_fiori;

-- Verifica: non deve comparire nessuna policy con cmd = INSERT.
select policyname, cmd, roles from pg_policies
 where schemaname = 'public' and tablename = 'ordini_fiori'
 order by policyname;


-- ############################################################################
-- VERIFICA (esegui prima e dopo, confronta i risultati)
-- ############################################################################
-- 1) Un utente può cambiarsi il ruolo? Dopo il file deve esistere il trigger.
--    select tgname from pg_trigger where tgrelid = 'public.profilo_utenti'::regclass and not tgisinternal;
-- 2) Funzioni eseguibili da anon (devono restare solo quelle pubbliche volute):
--    select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute') order by 1;
-- 3) Policy della tabella ordini_fiori (nessun INSERT per anon):
--    select policyname, cmd, roles from pg_policies where tablename = 'ordini_fiori';
-- 4) Ruoli presenti: nessun 'agenzia' o 'admin' inatteso.
--    select ruolo, count(*) from public.profilo_utenti group by 1;
