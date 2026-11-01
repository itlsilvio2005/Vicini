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
