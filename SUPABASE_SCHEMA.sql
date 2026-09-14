-- ============================================================================
-- VICINI — Schema database Supabase con RLS (Row Level Security)
-- ============================================================================

-- Abilita estensioni
create extension if not exists "uuid-ossp";

-- ============================================================================
-- TABELLA: profili_utenti (estende auth.users)
-- ============================================================================
create table public.profilo_utenti (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  ruolo text check (ruolo in ('privato', 'agenzia')) not null default 'privato',
  nome_completo text,
  telefono text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Abilita RLS
alter table public.profilo_utenti enable row level security;

-- Policy: gli utenti possono vedere solo il proprio profilo
create policy "Utenti vedono solo il proprio profilo"
  on public.profilo_utenti for select
  using (auth.uid() = id);

-- Policy: gli utenti possono aggiornare solo il proprio profilo
create policy "Utenti aggiornano solo il proprio profilo"
  on public.profilo_utenti for update
  using (auth.uid() = id);

-- Policy: solo gli utenti autenticati possono creare il proprio profilo
create policy "Utenti creano solo il proprio profilo"
  on public.profilo_utenti for insert
  with check (auth.uid() = id);

-- ============================================================================
-- TABELLA: agenzie
-- ============================================================================
create table public.agenzie (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profilo_utenti(id) on delete cascade,
  nome text not null,
  indirizzo text not null,
  descrizione text,
  telefono text not null,
  email text not null,
  logo_url text,
  foto_sede_url text,
  orari_apertura text,
  servizi_offerti jsonb,
  aree_coperte jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.agenzie enable row level security;

-- Policy: chiunque può vedere le agenzie (per la bacheca pubblica)
create policy "Chiunque può vedere le agenzie"
  on public.agenzie for select
  using (true);

-- Policy: solo l'agenzia proprietaria può aggiornare il proprio profilo
create policy "Solo il proprietario può aggiornare l'agenzia"
  on public.agenzie for update
  using (auth.uid() = user_id);

-- Policy: solo utenti con ruolo 'agenzia' possono creare agenzie
create policy "Solo agenzie possono creare il profilo agenzia"
  on public.agenzie for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.profilo_utenti
      where id = auth.uid() and ruolo = 'agenzia'
    )
  );

-- ============================================================================
-- TABELLA: manifesti
-- ============================================================================
create table public.manifesti (
  id uuid default uuid_generate_v4() primary key,
  agenzia_id uuid references public.agenzie(id) on delete cascade not null,
  nome_defunto text not null,
  anni integer,
  data_nascita text,
  data_morte text,
  comune text not null,
  rito text check (rito in ('Cattolico', 'Musulmano', 'Civile', 'Ortodosso')) not null,
  
  -- Camera ardente
  camera_ardente_luogo text,
  camera_ardente_indirizzo text,
  camera_ardente_orari text,
  camera_ardente_indicazioni text,
  
  -- Funerale
  funerale_giorno text,
  funerale_ora text,
  funerale_luogo text,
  funerale_indirizzo text,
  funerale_dettagli text,
  
  -- Commiato
  commiato_tipo text check (commiato_tipo in ('Tumulazione', 'Cremazione', 'Inumazione')),
  commiato_luogo text,
  commiato_cimitero text,
  
  -- Metadata
  pubblicato boolean default true,
  pubblicato_il timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.manifesti enable row level security;

-- Policy: chiunque può vedere i manifesti pubblicati
create policy "Chiunque può vedere i manifesti pubblicati"
  on public.manifesti for select
  using (pubblicato = true);

-- Policy: solo l'agenzia proprietaria può creare manifesti
create policy "Solo il proprietario può creare manifesti"
  on public.manifesti for insert
  with check (
    exists (
      select 1 from public.agenzie
      where id = agenzia_id and user_id = auth.uid()
    )
  );

-- Policy: solo l'agenzia proprietaria può aggiornare i propri manifesti
create policy "Solo il proprietario può aggiornare i propri manifesti"
  on public.manifesti for update
  using (
    exists (
      select 1 from public.agenzie
      where id = agenzia_id and user_id = auth.uid()
    )
  );

-- Policy: solo l'agenzia proprietaria può eliminare i propri manifesti
create policy "Solo il proprietario può eliminare i propri manifesti"
  on public.manifesti for delete
  using (
    exists (
      select 1 from public.agenzie
      where id = agenzia_id and user_id = auth.uid()
    )
  );

-- ============================================================================
-- TABELLA: pensieri (cordogli)
-- ============================================================================
create table public.pensieri (
  id uuid default uuid_generate_v4() primary key,
  manifesto_id uuid references public.manifesti(id) on delete cascade not null,
  user_id uuid references public.profilo_utenti(id) on delete set null,
  nome text not null,
  relazione text,
  testo text not null,
  approvato boolean default true,
  creato_il timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pensieri enable row level security;

-- Policy: chiunque può vedere i pensieri approvati
create policy "Chiunque può vedere i pensieri approvati"
  on public.pensieri for select
  using (approvato = true);

-- Policy: gli utenti autenticati possono creare pensieri
create policy "Utenti autenticati possono creare pensieri"
  on public.pensieri for insert
  with check (auth.uid() = user_id);

-- Policy: gli utenti possono eliminare solo i propri pensieri
create policy "Utenti possono eliminare solo i propri pensieri"
  on public.pensieri for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- TABELLA: ordini_fiori
-- ============================================================================
create table public.ordini_fiori (
  id uuid default uuid_generate_v4() primary key,
  manifesto_id uuid references public.manifesti(id) on delete cascade not null,
  user_id uuid references public.profilo_utenti(id) on delete set null,
  composizione text not null,
  importo decimal(10, 2) not null,
  nastro text,
  cliente_nome text not null,
  cliente_email text not null,
  cliente_telefono text not null,
  stato text check (stato in ('Da evadere', 'Confermato', 'Completato')) default 'Da evadere',
  fattura_inviata boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ordini_fiori enable row level security;

-- Policy: gli utenti possono vedere solo i propri ordini
create policy "Utenti vedono solo i propri ordini"
  on public.ordini_fiori for select
  using (auth.uid() = user_id);

-- Policy: gli utenti possono creare ordini
create policy "Utenti possono creare ordini"
  on public.ordini_fiori for insert
  with check (auth.uid() = user_id);

-- Policy: solo l'agenzia del manifesto può vedere gli ordini relativi
create policy "Agenzia vede ordini dei propri manifesti"
  on public.ordini_fiori for select
  using (
    exists (
      select 1 from public.manifesti m
      join public.agenzie a on a.id = m.agenzia_id
      where m.id = manifesto_id and a.user_id = auth.uid()
    )
  );

-- Policy: solo l'agenzia può aggiornare gli ordini dei propri manifesti
create policy "Agenzia aggiorna ordini dei propri manifesti"
  on public.ordini_fiori for update
  using (
    exists (
      select 1 from public.manifesti m
      join public.agenzie a on a.id = m.agenzia_id
      where m.id = manifesto_id and a.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TABELLA: pratiche (archivio agenzia)
-- ============================================================================
create table public.pratiche (
  id uuid default uuid_generate_v4() primary key,
  agenzia_id uuid references public.agenzie(id) on delete cascade not null,
  manifesto_id uuid references public.manifesti(id) on delete set null,
  num_fattura text not null,
  defunto text not null,
  comune text not null,
  data_cerimonia text not null,
  rito text not null,
  stato text check (stato in ('In corso', 'Completata')) default 'In corso',
  imponibile decimal(10, 2) not null,
  famiglia text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pratiche enable row level security;

-- Policy: solo l'agenzia proprietaria può vedere le proprie pratiche
create policy "Agenzia vede solo le proprie pratiche"
  on public.pratiche for select
  using (
    exists (
      select 1 from public.agenzie
      where id = agenzia_id and user_id = auth.uid()
    )
  );

-- Policy: solo l'agenzia proprietaria può creare pratiche
create policy "Agenzia crea solo le proprie pratiche"
  on public.pratiche for insert
  with check (
    exists (
      select 1 from public.agenzie
      where id = agenzia_id and user_id = auth.uid()
    )
  );

-- Policy: solo l'agenzia proprietaria può aggiornare le proprie pratiche
create policy "Agenzia aggiorna solo le proprie pratiche"
  on public.pratiche for update
  using (
    exists (
      select 1 from public.agenzie
      where id = agenzia_id and user_id = auth.uid()
    )
  );

-- ============================================================================
-- TABELLA: volonta (Le Mie Volontà)
-- ============================================================================
create table public.volonta (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profilo_utenti(id) on delete cascade not null unique,
  agenzia_id uuid references public.agenzie(id) on delete set null,
  rito text,
  destinazione text,
  trasporto_fuori_comune boolean default false,
  trasporto_comune text,
  trasporto_citta text,
  rimpatrio_estero boolean default false,
  rimpatrio_paese text,
  dettagli_rito jsonb,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.volonta enable row level security;

-- Policy: solo il proprietario può vedere le proprie volontà
create policy "Utente vede solo le proprie volontà"
  on public.volonta for select
  using (auth.uid() = user_id);

-- Policy: solo il proprietario può creare le proprie volontà
create policy "Utente crea solo le proprie volontà"
  on public.volonta for insert
  with check (auth.uid() = user_id);

-- Policy: solo il proprietario può aggiornare le proprie volontà
create policy "Utente aggiorna solo le proprie volontà"
  on public.volonta for update
  using (auth.uid() = user_id);

-- Policy: solo il proprietario può eliminare le proprie volontà
create policy "Utente elimina solo le proprie volontà"
  on public.volonta for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- TABELLA: nucleo (Il Nucleo - familiari)
-- ============================================================================
create table public.nucleo (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profilo_utenti(id) on delete cascade not null,
  nome text not null,
  relazione text not null,
  comune text not null,
  contatto text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.nucleo enable row level security;

-- Policy: solo il proprietario può vedere i propri familiari
create policy "Utente vede solo i propri familiari"
  on public.nucleo for select
  using (auth.uid() = user_id);

-- Policy: solo il proprietario può aggiungere familiari
create policy "Utente aggiunge solo i propri familiari"
  on public.nucleo for insert
  with check (auth.uid() = user_id);

-- Policy: solo il proprietario può aggiornare i propri familiari
create policy "Utente aggiorna solo i propri familiari"
  on public.nucleo for update
  using (auth.uid() = user_id);

-- Policy: solo il proprietario può eliminare i propri familiari
create policy "Utente elimina solo i propri familiari"
  on public.nucleo for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- FUNZIONI HELPER
-- ============================================================================

-- Funzione per creare automaticamente il profilo quando un utente si registra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profilo_utenti (id, email, ruolo)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'ruolo', 'privato'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger per creare automaticamente il profilo
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Funzione per aggiornare il timestamp updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger per aggiornare automaticamente updated_at
drop trigger if exists set_updated_at on public.profilo_utenti;
create trigger set_updated_at
  before update on public.profilo_utenti
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.agenzie;
create trigger set_updated_at
  before update on public.agenzie
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.manifesti;
create trigger set_updated_at
  before update on public.manifesti
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.ordini_fiori;
create trigger set_updated_at
  before update on public.ordini_fiori
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.pratiche;
create trigger set_updated_at
  before update on public.pratiche
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.volonta;
create trigger set_updated_at
  before update on public.volonta
  for each row execute procedure public.handle_updated_at();

-- ============================================================================
-- INDICI per performance
-- ============================================================================
create index idx_manifesti_agenzia on public.manifesti(agenzia_id);
create index idx_manifesti_comune on public.manifesti(comune);
create index idx_manifesti_pubblicato on public.manifesti(pubblicato);
create index idx_pensieri_manifesto on public.pensieri(manifesto_id);
create index idx_ordini_fiori_manifesto on public.ordini_fiori(manifesto_id);
create index idx_pratiche_agenzia on public.pratiche(agenzia_id);
create index idx_nucleo_user on public.nucleo(user_id);
create index idx_volonta_user on public.volonta(user_id);

-- ============================================================================
-- STORAGE BUCKETS (da creare nel dashboard Supabase)
-- ============================================================================
-- Bucket: agenzie-loghi
-- Bucket: agenzie-foto-sede
-- Policy: solo le agenzie possono caricare nella propria cartella
-- Policy: chiunque può leggere le immagini pubbliche
