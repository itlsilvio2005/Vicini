-- ============================================================================
-- PROPOSTA DI SICUREZZA (NON APPLICATA) - Vicini
-- ============================================================================
-- Questo file è in supabase/proposals/ apposta: NON è una migration attiva e
-- non è stato eseguito su nessun database. Rivedilo, provalo prima su un
-- progetto Supabase di prova e poi applicalo a mano dal SQL Editor.
--
-- Non modifica né richiama i file RESET_*.sql / STEP_3_RESET_*.sql.
--
-- Struttura:
--   PARTE A - hardening senza impatto sul funzionamento (consigliata)
--   PARTE B - restrizione degli ordini fiori anonimi (consigliata)
--   PARTE C - agenzie: solo quelle del territorio approvate dal titolare
--   PARTE D - query di verifica e approvazione agenzie
-- ============================================================================


-- ============================================================================
-- PARTE A - Hardening delle funzioni
-- ============================================================================

-- A1. handle_new_user è SECURITY DEFINER ma non fissa il search_path: una
--     funzione definer senza search_path può essere dirottata creando oggetti
--     con lo stesso nome in uno schema che compare prima nel percorso.
--     (Supabase la segnala come "function_search_path_mutable".)
--     La funzione viene poi riscritta nella PARTE C con la regola di approvazione;
--     qui basta fissare il search_path, così A funziona anche da sola.
alter function public.handle_new_user() set search_path = public;

-- A2. check_contenuto_offensivo (migration 20261029) usa solo NEW: non ha
--     bisogno dei privilegi del proprietario. Meglio SECURITY INVOKER, con
--     search_path fisso.
alter function public.check_contenuto_offensivo() security invoker;
alter function public.check_contenuto_offensivo() set search_path = public;


-- ============================================================================
-- PARTE B - ordini_fiori: inserimento anonimo con limiti
-- ============================================================================
-- Situazione: lo script CORREZIONE_RLS_ORDINI_ANONIMI.sql crea la policy
-- "Chiunque può creare ordini fiori" con WITH CHECK (true). Chiunque, con la
-- sola chiave pubblica, può quindi inserire righe con QUALSIASI valore:
-- user_id di un altro utente, stato 'Completato', fattura_inviata true,
-- importi arbitrari, testi enormi, manifesti non pubblicati.
-- L'ordine anonimo è una funzione voluta del sito, quindi resta possibile, ma
-- solo con i valori che il client legittimo invia davvero.

drop policy if exists "Chiunque può creare ordini fiori" on public.ordini_fiori;
drop policy if exists "Utenti possono creare ordini" on public.ordini_fiori;

create policy "Ordini fiori: inserimento controllato"
  on public.ordini_fiori for insert
  to anon, authenticated
  with check (
    -- nessuno può attribuire l'ordine a un altro utente
    (user_id is null or user_id = auth.uid())
    -- un ordine nasce sempre "da evadere" e non fatturato
    and stato = 'Da evadere'
    and coalesce(fattura_inviata, false) = false
    -- importo plausibile (il listino reale è molto sotto questa soglia)
    and importo > 0 and importo <= 2000
    -- lunghezze ragionevoli
    and char_length(composizione) between 1 and 200
    and char_length(coalesce(nastro, '')) <= 300
    and char_length(cliente_nome) between 1 and 120
    and char_length(cliente_email) between 3 and 254
    and char_length(cliente_telefono) between 5 and 30
    -- solo manifesti pubblicati
    and exists (
      select 1 from public.manifesti m
      where m.id = manifesto_id and m.pubblicato = true
    )
  );

-- Limite residuo, da gestire fuori dal database: questa policy non impedisce
-- lo spam in volume (serve rate limiting, es. Edge Function o captcha) né
-- calcola l'importo dal listino lato server (prezzi_fiori esiste già: un
-- trigger BEFORE INSERT potrebbe sovrascrivere importo con il prezzo ufficiale).


-- ============================================================================
-- PARTE C - Agenzie: solo quelle del territorio approvate dal titolare
-- ============================================================================
-- Regola (decisa dal titolare): può diventare "agenzia" solo un'agenzia del
-- territorio accettata da lui.
--
-- Problema: handle_new_user leggeva il ruolo da raw_user_meta_data->>'ruolo',
-- cioè da ciò che il client scrive in signUp(). Chiunque, anche senza usare il
-- sito, poteva chiamare l'API di Supabase con { data: { ruolo: 'agenzia' } },
-- diventare agenzia e PUBBLICARE MANIFESTI FUNEBRI (falsi annunci di decesso).
--
-- Soluzione:
--   C1. ogni nuovo utente nasce "privato", qualunque cosa dichiari il client;
--       il sito continua a inviare 'agenzia' come RICHIESTA (resta in
--       raw_user_meta_data e serve solo a farti vedere chi ha chiesto);
--   C2. il passaggio ad "agenzia" lo fai solo tu (query D5/D6 più sotto);
--   C3. un utente non può cambiarsi il ruolo da solo.
-- Gli account già esistenti non vengono toccati.

-- C1. Nuovi utenti: sempre 'privato'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profilo_utenti (id, email, ruolo)
  values (new.id, new.email, 'privato');
  return new;
end;
$$;

-- C3. Il ruolo non è modificabile da un utente loggato. Le chiamate fatte da
--     SQL Editor o con la chiave di servizio non hanno auth.uid(), quindi la
--     tua approvazione manuale (D6) passa.
create or replace function public.blocca_cambio_ruolo()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.ruolo is distinct from old.ruolo and auth.uid() is not null then
    raise exception 'Il ruolo non può essere modificato dall''utente.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_blocca_cambio_ruolo on public.profilo_utenti;
create trigger trg_blocca_cambio_ruolo
  before update on public.profilo_utenti
  for each row execute function public.blocca_cambio_ruolo();


-- ============================================================================
-- PARTE D - Verifiche (solo SELECT) e approvazione agenzie
-- ============================================================================

-- D1. Tabelle con RLS spenta. Se in passato è stato eseguito uno degli script
--     RESET_*.sql / STEP_3_RESET_*.sql su questo progetto, qui compariranno
--     tabelle con rls_attiva = false (quegli script fanno DISABLE ROW LEVEL
--     SECURITY): finché non la riattivi, chiunque con la chiave pubblica può
--     leggere e scrivere quelle tabelle.
select tablename, rowsecurity as rls_attiva
from pg_tables
where schemaname = 'public'
order by rowsecurity, tablename;

-- D2. Policy permissive (WITH CHECK / USING (true)) da riesaminare.
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and (coalesce(qual, '') = 'true' or coalesce(with_check, '') = 'true')
order by tablename, policyname;

-- D3. Policy di UPDATE su profilo_utenti (per capire se il ruolo è modificabile).
select policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'profilo_utenti' and cmd in ('UPDATE', 'ALL');

-- D4. Quanti account "agenzia" esistono (controlla che siano tutti noti).
select ruolo, count(*) from public.profilo_utenti group by ruolo;

-- D5. Richieste di account agenzia in attesa di approvazione (solo SELECT).
--     Controlla che l'agenzia sia davvero del territorio prima di approvare.
select u.email,
       u.raw_user_meta_data->>'nome' as nome_dichiarato,
       u.created_at as richiesta_il
from auth.users u
join public.profilo_utenti p on p.id = u.id
where u.raw_user_meta_data->>'ruolo' = 'agenzia'
  and p.ruolo = 'privato'
order by u.created_at desc;

-- D6. APPROVAZIONE di un'agenzia: da lanciare a mano, una per volta, solo dopo
--     aver verificato. Sostituisci l'email. (Non è una SELECT: modifica un ruolo.)
--
--   update public.profilo_utenti
--      set ruolo = 'agenzia'
--    where email = 'agenzia@esempio.it';
--
-- Per revocare un'agenzia: stesso comando con ruolo = 'privato'.
