-- Permette all'admin di inserire, modificare ed eliminare manifesti per qualsiasi agenzia
drop policy if exists "Admin gestisce tutti i manifesti" on public.manifesti;

create policy "Admin gestisce tutti i manifesti"
  on public.manifesti
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

