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
