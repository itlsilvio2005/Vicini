-- ============================================================================
-- PROPOSTA (NON APPLICATA) - Andamento della PROPRIA agenzia
-- ============================================================================
-- La pagina Backoffice dell'agenzia (src/components/BackofficeAgenzia.tsx)
-- chiama la funzione agenzia_mio_andamento(giorni), che nel repo non c'era.
-- Questo file la definisce in modo sicuro: ogni agenzia vede SOLO i propri
-- numeri (l'agenzia è trovata da auth.uid(), mai da un parametro).
-- Se l'avevi già creata a mano su Supabase, questo script la sostituisce:
-- prima di eseguirlo puoi guardare la vecchia con
--   select pg_get_functiondef('public.agenzia_mio_andamento(integer)'::regprocedure);
-- e controllare che usi auth.uid() e non un id passato dal browser.
-- Si può rieseguire.
-- ============================================================================

drop function if exists public.agenzia_mio_andamento(integer);

create function public.agenzia_mio_andamento(p_giorni integer default 30)
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
  if auth.uid() is null then
    raise exception 'Accesso riservato.';
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
  where a.user_id = auth.uid();   -- solo la propria agenzia
end;
$$;

revoke all on function public.agenzia_mio_andamento(integer) from public;
grant execute on function public.agenzia_mio_andamento(integer) to authenticated;

-- Verifica: chi può chiamarla (niente anon).
select p.proname, p.prosecdef, p.proacl from pg_proc p
 where p.proname = 'agenzia_mio_andamento';
