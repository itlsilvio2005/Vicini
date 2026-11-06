CREATE OR REPLACE FUNCTION public.admin_andamento_agenzie(p_giorni integer DEFAULT 30)
 RETURNS TABLE(agenzia_id uuid, nome text, email text, iscritta_il timestamp with time zone, manifesti_periodo bigint, manifesti_totali bigint, pensieri_periodo bigint, ordini_periodo bigint, importo_ordini_periodo numeric, ultimo_manifesto timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  dal timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Accesso riservato.';
  end if;

  p_giorni := greatest(1, least(coalesce(p_giorni, 30), 365));
  -- "oggi" = dalla mezzanotte; gli altri periodi = ultimi N giorni pieni.
  -- Stessa convenzione di created_at (timezone('utc', now())) per non
  -- spostare la finestra se il fuso del database non è UTC.
  dal := case when p_giorni = 1
              then date_trunc('day', timezone('utc', now()))::timestamptz
              else timezone('utc', now())::timestamptz - make_interval(days => p_giorni)
         end;

  return query
  select
    a.id,
    a.nome,
    a.email,
    a.created_at,
    (select count(*) from public.manifesti m
      where m.agenzia_id = a.id and m.created_at >= dal),
    (select count(*) from public.manifesti m where m.agenzia_id = a.id),
    (select count(*) from public.pensieri p
       join public.manifesti m on m.id = p.manifesto_id
      where m.agenzia_id = a.id and p.creato_il >= dal),
    (select count(*) from public.ordini_fiori o
       join public.manifesti m on m.id = o.manifesto_id
      where m.agenzia_id = a.id and o.created_at >= dal),
    (select coalesce(sum(o.importo), 0) from public.ordini_fiori o
       join public.manifesti m on m.id = o.manifesto_id
      where m.agenzia_id = a.id and o.created_at >= dal),
    (select max(m.created_at) from public.manifesti m where m.agenzia_id = a.id)
  from public.agenzie a
  order by 5 desc, a.nome;
end;
$function$

CREATE OR REPLACE FUNCTION public.admin_approva_agenzia(p_utente uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then
    raise exception 'Accesso riservato.';
  end if;

  update public.profilo_utenti p
     set ruolo = 'agenzia', updated_at = timezone('utc', now())
   where p.id = p_utente
     and p.ruolo = 'privato'
     and exists (
       select 1 from auth.users u
        where u.id = p.id and u.raw_user_meta_data ->> 'ruolo' = 'agenzia'
     );

  if not found then
    raise exception 'Nessuna richiesta di agenzia in attesa per questo account.';
  end if;
end;
$function$

CREATE OR REPLACE FUNCTION public.admin_richieste_agenzia()
 RETURNS TABLE(utente_id uuid, email text, nome_completo text, richiesta_il timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if not public.is_admin() then
    raise exception 'Accesso riservato.';
  end if;

  return query
  select p.id, p.email, p.nome_completo, p.created_at
    from public.profilo_utenti p
    join auth.users u on u.id = p.id
   where p.ruolo = 'privato'
     and u.raw_user_meta_data ->> 'ruolo' = 'agenzia'
   order by p.created_at desc;
end;
$function$

CREATE OR REPLACE FUNCTION public.admin_statistiche_sito(p_giorni integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_inizio DATE := CURRENT_DATE - (GREATEST(p_giorni, 1) - 1);
  v_visite INT;
  v_aperture_manifesti INT;
  v_ricerche_mappa INT;
  v_click_fiori INT;
  v_domande_bot INT;
  v_utenti_nucleo INT;
  v_volonta_attive INT;
BEGIN
  SELECT COALESCE(SUM(conteggio), 0) INTO v_visite
    FROM public.statistiche_giornaliere WHERE giorno >= v_inizio AND evento LIKE 'visita_%';

  SELECT COALESCE(SUM(conteggio), 0) INTO v_aperture_manifesti
    FROM public.statistiche_giornaliere WHERE giorno >= v_inizio AND evento = 'apertura_manifesto';

  SELECT COALESCE(SUM(conteggio), 0) INTO v_ricerche_mappa
    FROM public.statistiche_giornaliere WHERE giorno >= v_inizio AND evento = 'filtro_mappa';

  SELECT COALESCE(SUM(conteggio), 0) INTO v_click_fiori
    FROM public.statistiche_giornaliere WHERE giorno >= v_inizio AND evento = 'click_fiori';

  SELECT COALESCE(SUM(conteggio), 0) INTO v_domande_bot
    FROM public.statistiche_giornaliere WHERE giorno >= v_inizio AND evento = 'domanda_bot';

  SELECT COUNT(*) INTO v_utenti_nucleo FROM public.nucleo;
  SELECT COUNT(*) INTO v_volonta_attive FROM public.volonta;

  RETURN jsonb_build_object(
    'visite_sito', v_visite,
    'aperture_manifesti', v_aperture_manifesti,
    'ricerche_mappa', v_ricerche_mappa,
    'click_fiori', v_click_fiori,
    'domande_bot', v_domande_bot,
    'membri_nucleo_totali', v_utenti_nucleo,
    'volonta_registrate', v_volonta_attive
  );
END;
$function$

CREATE OR REPLACE FUNCTION public.agenzia_mio_andamento(p_giorni integer DEFAULT 30)
 RETURNS TABLE(agenzia_id uuid, nome text, email text, iscritta_il timestamp with time zone, manifesti_periodo bigint, manifesti_totali bigint, pensieri_periodo bigint, ordini_periodo bigint, importo_ordini_periodo numeric, ultimo_manifesto timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_ruolo text;
  dal timestamptz;
begin
  if v_uid is null then
    raise exception 'Accesso riservato alle agenzie autenticate.';
  end if;

  select p.email, p.ruolo
    into v_email, v_ruolo
    from public.profilo_utenti p
   where p.id = v_uid;

  if v_ruolo is distinct from 'agenzia' and v_ruolo is distinct from 'admin' then
    raise exception 'Accesso riservato alle agenzie.';
  end if;

  p_giorni := greatest(1, least(coalesce(p_giorni, 30), 365));
  dal := case when p_giorni = 1
              then date_trunc('day', timezone('utc', now()))::timestamptz
              else timezone('utc', now())::timestamptz - make_interval(days => p_giorni)
         end;

  return query
  select
    a.id,
    a.nome,
    a.email,
    a.created_at,
    (select count(*) from public.manifesti m
      where m.agenzia_id = a.id and m.created_at >= dal),
    (select count(*) from public.manifesti m
      where m.agenzia_id = a.id),
    (select count(*) from public.pensieri p
       join public.manifesti m on m.id = p.manifesto_id
      where m.agenzia_id = a.id and p.creato_il >= dal),
    (select count(*) from public.ordini_fiori o
       join public.manifesti m on m.id = o.manifesto_id
      where m.agenzia_id = a.id and o.created_at >= dal),
    (select coalesce(sum(o.importo), 0) from public.ordini_fiori o
       join public.manifesti m on m.id = o.manifesto_id
      where m.agenzia_id = a.id and o.created_at >= dal),
    (select max(m.created_at) from public.manifesti m
      where m.agenzia_id = a.id)
  from public.agenzie a
  where a.id = v_uid
     or (to_jsonb(a) ->> 'user_id') = v_uid::text
     or lower(a.email) = lower(v_email)
  limit 1;
end;
$function$

CREATE OR REPLACE FUNCTION public.assistente_conta(p_max integer DEFAULT 300)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  n integer;
begin
  insert into public.assistente_uso as u (giorno, chiamate)
  values ((now() at time zone 'Europe/Rome')::date, 1)
  on conflict (giorno) do update set chiamate = u.chiamate + 1
  returning u.chiamate into n;
  return n <= greatest(1, coalesce(p_max, 300));
end;
$function$

CREATE OR REPLACE FUNCTION public.cerca_codice_nucleo(p_codice text)
 RETURNS TABLE(user_id uuid, codice text, nome_completo text, comune text, anno_nascita integer)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT user_id, codice, nome_completo, COALESCE(comune, 'Modena'), anno_nascita
  FROM public.codici_nucleo
  WHERE upper(trim(codice)) = upper(trim(p_codice))
  LIMIT 1;
$function$

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.profilo_utenti
     where id = auth.uid() and ruolo = 'admin'
  );
$function$

CREATE OR REPLACE FUNCTION public.ottieni_mio_codice_nucleo(p_nome text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_uid UUID := auth.uid();
  v_codice TEXT;
  v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
BEGIN
  IF v_uid IS NULL THEN RETURN NULL; END IF;

  SELECT codice INTO v_codice FROM public.codici_nucleo WHERE user_id = v_uid;
  IF v_codice IS NOT NULL THEN RETURN v_codice; END IF;

  LOOP
    v_codice := 'VCN-' ||
      substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1) ||
      substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1) ||
      substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1) ||
      substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1) || '-' ||
      substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1) ||
      substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.codici_nucleo WHERE codice = v_codice);
  END LOOP;

  INSERT INTO public.codici_nucleo (user_id, codice, nome_completo)
  VALUES (v_uid, v_codice, p_nome)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN v_codice;
END;
$function$

CREATE OR REPLACE FUNCTION public.registra_interazione(p_evento text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF p_evento IS NULL OR length(trim(p_evento)) = 0 OR length(p_evento) > 64 THEN
    RETURN;
  END IF;
  INSERT INTO public.statistiche_giornaliere (giorno, evento, conteggio)
  VALUES (CURRENT_DATE, trim(p_evento), 1)
  ON CONFLICT (giorno, evento)
  DO UPDATE SET conteggio = public.statistiche_giornaliere.conteggio + 1;
END;
$function$
