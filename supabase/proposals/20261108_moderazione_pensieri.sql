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
