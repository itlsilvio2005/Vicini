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
