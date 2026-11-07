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
