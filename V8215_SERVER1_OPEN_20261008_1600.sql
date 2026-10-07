-- Grow Legends V8.215 — Server 1 public opening
-- Europe/Berlin: 2026-10-08 16:00
-- UTC:            2026-10-08 14:00

update public.game_servers
set enabled=true,
    opens_at=timestamptz '2026-10-08 14:00:00+00',
    updated_at=now()
where id='server1';
