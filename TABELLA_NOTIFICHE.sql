-- ============================================================================
-- TABELLA: notifiche_nucleo (Notifiche per familiari del Nucleo)
-- ============================================================================

create table public.notifiche_nucleo (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profilo_utenti(id) on delete cascade not null,
  titolo text not null,
  messaggio text not null,
  manifesto_id uuid references public.manifesti(id) on delete cascade not null,
  defunto_nome text not null,
  comune text not null,
  data_pubblicazione timestamp with time zone,
  letta boolean default false,
  data_creazione timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifiche_nucleo enable row level security;

-- Policy: solo il proprietario può vedere le proprie notifiche
create policy "Utente vede solo le proprie notifiche"
  on public.notifiche_nucleo for select
  using (auth.uid() = user_id);

-- Policy: solo il sistema può creare notifiche (tramite trigger o funzione)
create policy "Sistema crea notifiche"
  on public.notifiche_nucleo for insert
  with check (auth.uid() = user_id);

-- Policy: solo il proprietario può aggiornare le proprie notifiche
create policy "Utente aggiorna solo le proprie notifiche"
  on public.notifiche_nucleo for update
  using (auth.uid() = user_id);

-- Policy: solo il proprietario può eliminare le proprie notifiche
create policy "Utente elimina solo le proprie notifiche"
  on public.notifiche_nucleo for delete
  using (auth.uid() = user_id);

-- Indici per performance
create index idx_notifiche_nucleo_user on public.notifiche_nucleo(user_id);
create index idx_notifiche_nucleo_letta on public.notifiche_nucleo(letta);
create index idx_notifiche_nucleo_data on public.notifiche_nucleo(data_creazione desc);

-- Trigger per aggiornare automaticamente data_creazione
drop trigger if exists set_data_creazione on public.notifiche_nucleo;
create trigger set_data_creazione
  before insert on public.notifiche_nucleo
  for each row
  execute procedure public.handle_updated_at();
