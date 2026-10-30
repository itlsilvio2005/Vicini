-- ============================================================================
-- PROPOSTA (NON APPLICATA) - Ordini fiori: prezzo dal listino e limiti di volume
-- ============================================================================
-- File in supabase/proposals/: NON è una migration attiva e non è stato
-- eseguito su nessun database Supabase. Rivedilo, provalo prima su un progetto
-- di prova, poi applicalo a mano dal SQL Editor (si può rieseguire: è
-- idempotente). Non tocca i file RESET_*.sql.
--
-- Problemi che risolve
--  1. L'importo di un ordine lo manda il browser. La policy del 20261030 lo
--     limita a 0-2000 €, ma un ordine da 1 € per una corona da 180 € passa.
--     Qui l'importo viene SEMPRE preso dal listino lato server.
--  2. Un ordine con una composizione che non esiste nel listino viene
--     rifiutato (lo script archiviato FUNZIONE_CALCOLO_PREZZI.sql, se è stato
--     eseguito, invece inventa un prezzo di 100 €: qui viene sostituito).
--  3. Nello stesso script la policy "Solo admin possono modificare i prezzi"
--     lascia cambiare il listino A QUALUNQUE AGENZIA (basta ruolo = 'agenzia').
--     Qui il listino è modificabile solo da SQL Editor / chiave di servizio.
--  4. Nessun limite al volume degli ordini anonimi: ora massimo 15 ordini ogni
--     10 minuti per manifesto e 5 ordini all'ora per indirizzo email.
--
-- Limiti noti (da non sottovalutare)
--  * Il limite per manifesto frena il volume ma non identifica chi spamma: chi
--    cambia email ogni volta arriva comunque a 15 ordini ogni 10 minuti per
--    manifesto. Un limite per indirizzo IP o un captcha richiedono una Edge
--    Function (il database non vede l'IP in modo affidabile).
--  * Il listino è scritto due volte: qui e in src/data.ts (FIORI). Se cambi un
--    prezzo, cambialo in entrambi, altrimenti il sito mostra un importo e
--    l'ordine viene registrato con l'altro. Il passo successivo è far leggere
--    il listino al sito da prezzi_fiori.
--  * I limiti valgono per le chiamate dal sito (ruoli anon e authenticated).
--    Gli inserimenti da SQL Editor o con chiave di servizio non sono limitati.
--  * Il sito, in caso di rifiuto, mostra il messaggio generico "Errore nel
--    salvataggio dell'ordine. Riprova.".
-- ============================================================================


-- ============================================================================
-- PARTE 1 - Listino: tabella, lettura pubblica, scrittura solo da admin
-- ============================================================================

create table if not exists public.prezzi_fiori (
  id uuid default gen_random_uuid() primary key,
  composizione text not null unique,
  prezzo numeric(10, 2) not null check (prezzo > 0),
  attivo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prezzi_fiori enable row level security;

-- Via la vecchia policy che permetteva a ogni agenzia di cambiare i prezzi
-- (esiste solo se è stato eseguito FUNZIONE_CALCOLO_PREZZI.sql).
drop policy if exists "Solo admin possono modificare i prezzi" on public.prezzi_fiori;
drop policy if exists "Chiunque può leggere i prezzi" on public.prezzi_fiori;
drop policy if exists "Listino: lettura pubblica" on public.prezzi_fiori;

create policy "Listino: lettura pubblica"
  on public.prezzi_fiori for select
  to anon, authenticated
  using (true);

-- Nessuna policy di insert/update/delete: il listino si cambia solo da
-- SQL Editor o con la chiave di servizio. Esempio:
--   update public.prezzi_fiori set prezzo = 130, updated_at = now()
--    where composizione = 'Composizione di gigli bianchi';

-- Stesso listino di src/data.ts (FIORI). Non sovrascrive prezzi già presenti.
insert into public.prezzi_fiori (composizione, prezzo) values
  ('Composizione di gigli bianchi', 120.00),
  ('Cuscino di fiori di stagione',   90.00),
  ('Corona floreale con nastro',    180.00),
  ('Cesto bianco e verde',           70.00),
  ('Mazzo di rose chiare',           60.00)
on conflict (composizione) do nothing;


-- ============================================================================
-- PARTE 2 - L'importo viene sempre dal listino
-- ============================================================================

-- Sostituisce il trigger e la funzione dello script archiviato, se presenti.
drop trigger if exists trigger_calcola_prezzo_ordine on public.ordini_fiori;
drop function if exists public.calcola_prezzo_ordine();

create or replace function public.imposta_prezzo_ordine()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  prezzo_listino numeric(10, 2);
begin
  -- SQL Editor e chiave di servizio (ruolo diverso da anon/authenticated)
  -- possono inserire dati di prova o storici senza passare dal listino.
  if current_user not in ('anon', 'authenticated') then
    return NEW;
  end if;

  select prezzo into prezzo_listino
    from public.prezzi_fiori
   where composizione = NEW.composizione and attivo;

  if prezzo_listino is null then
    raise exception 'Composizione non presente nel listino.';
  end if;

  NEW.importo := prezzo_listino;   -- l'importo inviato dal browser viene ignorato
  return NEW;
end;
$$;


-- ============================================================================
-- PARTE 3 - Limiti di volume per gli ordini inviati dal sito
-- ============================================================================

create index if not exists ordini_fiori_manifesto_creato_idx
  on public.ordini_fiori (manifesto_id, created_at desc);
create index if not exists ordini_fiori_email_creato_idx
  on public.ordini_fiori (lower(cliente_email), created_at desc);

-- SECURITY DEFINER perché deve CONTARE tutti gli ordini, mentre la RLS ai
-- chiamanti anonimi ne mostra zero. Legge soltanto: restituisce un conteggio.
create or replace function public.limita_ordini_fiori()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ruolo_api text;
  n_manifesto integer;
  n_email integer;
  -- Lo schema salva created_at con default timezone('utc', now()), valore che
  -- Postgres legge poi come ora LOCALE della sessione. Con il fuso del database
  -- diverso da UTC, confrontare con now() sposterebbe la finestra e il limite
  -- non scatterebbe mai (successo nella prova con fuso CET). Usando la stessa
  -- espressione del default il confronto resta coerente in qualunque fuso.
  adesso timestamptz := timezone('utc', now())::timestamptz;
begin
  -- Ruolo con cui PostgREST ha autenticato la chiamata (anon, authenticated,
  -- service_role). Da SQL Editor non c'è: nessun limite.
  ruolo_api := coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    nullif(current_setting('request.jwt.claim.role', true), '')
  );
  if coalesce(ruolo_api, '') not in ('anon', 'authenticated') then
    return NEW;
  end if;

  select count(*) into n_manifesto
    from public.ordini_fiori
   where manifesto_id = NEW.manifesto_id
     and created_at > adesso - interval '10 minutes';
  if n_manifesto >= 15 then
    raise exception 'Troppi ordini ravvicinati per questo manifesto. Riprova tra qualche minuto.';
  end if;

  select count(*) into n_email
    from public.ordini_fiori
   where lower(cliente_email) = lower(NEW.cliente_email)
     and created_at > adesso - interval '1 hour';
  if n_email >= 5 then
    raise exception 'Troppi ordini da questo indirizzo email. Riprova più tardi.';
  end if;

  return NEW;
end;
$$;

-- I trigger BEFORE di una tabella partono in ordine alfabetico di nome.
drop trigger if exists trg_ordini_fiori_1_limiti on public.ordini_fiori;
create trigger trg_ordini_fiori_1_limiti
  before insert on public.ordini_fiori
  for each row execute function public.limita_ordini_fiori();

drop trigger if exists trg_ordini_fiori_2_prezzo on public.ordini_fiori;
create trigger trg_ordini_fiori_2_prezzo
  before insert on public.ordini_fiori
  for each row execute function public.imposta_prezzo_ordine();


-- ============================================================================
-- VERIFICHE (solo SELECT)
-- ============================================================================

-- V1. Listino attuale.
select composizione, prezzo, attivo from public.prezzi_fiori order by composizione;

-- V2. Trigger attivi su ordini_fiori (devono comparire i due nuovi e NON
--     trigger_calcola_prezzo_ordine).
select tgname, tgenabled
  from pg_trigger
 where tgrelid = 'public.ordini_fiori'::regclass and not tgisinternal
 order by tgname;

-- V3. Policy sul listino (deve esserci solo la lettura pubblica).
select policyname, cmd, roles from pg_policies
 where schemaname = 'public' and tablename = 'prezzi_fiori';

-- V4. Fuso orario del database (su Supabase di solito UTC). Il limite funziona
--     in ogni caso, ma è utile saperlo.
show timezone;
