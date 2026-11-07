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
--   * massimo 30 omaggi ogni 10 minuti per manifesto
-- Si può rieseguire. Richiede la tabella public.manifesti (colonne id, pubblicato).
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
  if not exists (select 1 from public.manifesti m
                  where m.id::text = p_manifesto and m.pubblicato = true) then
    raise exception 'Manifesto non trovato.';
  end if;

  if (select count(*) from public.omaggi_virtuali o
       where o.manifesto_id = p_manifesto and o.dispositivo = v_disp
         and o.creato_il > now() - interval '1 hour') >= 3 then
    raise exception 'Hai già deposto alcuni omaggi: riprova più tardi.';
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

-- Conteggi pubblici (solo numeri, nessun nome, solo manifesti pubblicati).
create or replace function public.omaggi_conteggi()
returns table (manifesto_id text, tipo text, totale bigint)
language sql
stable
security definer
set search_path = public
as $$
  select o.manifesto_id, o.tipo, count(*)
    from public.omaggi_virtuali o
    join public.manifesti m on m.id::text = o.manifesto_id and m.pubblicato = true
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
