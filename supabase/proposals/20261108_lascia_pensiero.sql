-- ============================================================================
-- PROPOSTA - Pensieri di cordoglio anche per i visitatori non registrati
-- ============================================================================
-- Problema: la policy di inserimento sui pensieri richiede auth.uid() = user_id,
-- ma il sito li invia senza account (e senza user_id): ogni invio veniva
-- rifiutato. Qui il sito passa da una funzione che controlla tutto e inserisce
-- al posto del visitatore. Il filtro offese (trigger) continua a valere.
-- Limiti anti-spam: 10 pensieri ogni 10 minuti per manifesto, 100 ogni
-- 10 minuti in totale. Si può rieseguire.
-- ============================================================================

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

  insert into public.pensieri (manifesto_id, user_id, nome, relazione, testo, approvato)
  values (v_manifesto, auth.uid(), v_nome, v_rel, v_testo, true);
  return true;
end;
$$;

revoke all on function public.lascia_pensiero(text, text, text, text) from public;
grant execute on function public.lascia_pensiero(text, text, text, text) to anon, authenticated;

select proname, proacl from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and proname = 'lascia_pensiero';
