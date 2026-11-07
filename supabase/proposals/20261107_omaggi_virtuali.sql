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
