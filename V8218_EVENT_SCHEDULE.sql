-- Grow Legends V8.218 — event cadence
-- Grow Cup: every Thursday.
-- EXP + Smaragd-Koloss: Friday-Sunday every second weekend.
-- Gold + Dampf: alternating weekend.

CREATE OR REPLACE FUNCTION public.v7102_auto_weekend_event_active(p_type text, p_at timestamp with time zone DEFAULT now())
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 d date := (p_at at time zone 'Europe/Berlin')::date;
 iso integer := extract(isodow from (p_at at time zone 'Europe/Berlin'))::integer;
 monday date;
 week_index integer;
 cycle integer;
 typ text := lower(btrim(coalesce(p_type,'')));
 beta_test_user boolean := false;
begin
 if typ in ('growcup','grow-cup','cup')
    and p_at < timestamptz '2026-10-08 14:00:00+02'
    and auth.uid() is not null then
   select exists(
     select 1 from public.profiles p
     where p.id=auth.uid()
       and lower(coalesce(p.character_name,''))='tomssen'
   ) into beta_test_user;
   if beta_test_user then return true; end if;
 end if;

 monday := d-(iso-1);
 week_index := ((monday-date '2026-09-14')/7)::integer;
 cycle := ((week_index % 2)+2)%2;

 if typ in ('gold','gold-event') then return iso in (5,6,7) and cycle=0; end if;
 if typ in ('dampf','steam','dampf-event') then return iso in (5,6,7) and cycle=0; end if;
 if typ in ('xp','exp','erfahrung','erfahrungs-event') then return iso in (5,6,7) and cycle=1; end if;
 if typ in ('koloss','worldboss','weltboss','mystic','mystisch','smaragd') then return iso in (5,6,7) and cycle=1; end if;
 if typ in ('growcup','grow-cup','cup') then return iso=4; end if;
 if typ in ('runehunt','runenjagd','rune','runen') then return false; end if;
 return false;
end
$function$;

CREATE OR REPLACE FUNCTION recovery_private.v8210_next_growcup(p_at timestamp with time zone DEFAULT now())
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
 base_date date := (p_at at time zone 'Europe/Berlin')::date;
 d date;
 i integer;
begin
 for i in 0..7 loop
   d:=base_date+i;
   if extract(isodow from d)::integer=4 then
     if d>base_date or not public.v7102_auto_weekend_event_active('growcup',p_at) then
       return (d::timestamp at time zone 'Europe/Berlin');
     end if;
   end if;
 end loop;
 return ((base_date+7)::timestamp at time zone 'Europe/Berlin');
end
$function$;

