-- ============================================================================
-- PROPOSTA (NON APPLICATA) - Tetto giornaliero per l'assistente con IA
-- ============================================================================
-- La Edge Function "assistente" chiama un servizio a pagamento. Questo
-- contatore fissa un tetto di chiamate al giorno (default 300, cambiabile con
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

create or replace function public.assistente_conta(p_max integer default 300)
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
  return n <= greatest(1, coalesce(p_max, 300));
end;
$$;

-- Solo la chiave di servizio (usata dalla Edge Function) può chiamarla.
revoke all on function public.assistente_conta(integer) from public, anon, authenticated;
grant execute on function public.assistente_conta(integer) to service_role;

-- Verifica: uso degli ultimi giorni.
select * from public.assistente_uso order by giorno desc limit 7;
