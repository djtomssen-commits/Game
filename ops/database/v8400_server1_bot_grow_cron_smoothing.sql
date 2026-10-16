-- 2026-10-16: SERVER 1 bot Growroom cron smoothing (operational configuration only).
-- Investigated 2026-10-16 02:52 UTC: a 16.938s scheduled bot-grow transaction
-- overlapped 4-8s shop/VIP/profile RPCs. Coincidence supports a contention
-- hypothesis, but does not prove that this worker caused every slow request.
-- Keep the same theoretical throughput: 16 actions/min -> 4 every 15 seconds.
-- No changes to rewards, inventory, bot identities, cron ownership or SQL functions.
DO $$
DECLARE j record;
BEGIN
  SELECT jobid,schedule,command,active INTO j
    FROM cron.job WHERE jobname='v8275-bot-growroom';
  IF NOT FOUND OR j.active IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'v8275-bot-growroom missing or inactive';
  END IF;
  IF j.schedule='15 seconds'
     AND j.command='select server1_private.v8275_bot_grow_batch(4)' THEN
    RETURN;
  END IF;
  IF j.schedule<>'* * * * *'
     OR j.command<>'select server1_private.v8275_bot_grow_batch(16)' THEN
    RAISE EXCEPTION 'Unexpected job configuration, do not overwrite';
  END IF;
  PERFORM cron.alter_job(
    job_id := j.jobid,
    schedule := '15 seconds',
    command := 'select server1_private.v8275_bot_grow_batch(4)'
  );
END;
$$;
-- Verify:
-- SELECT jobid,jobname,schedule,command,active FROM cron.job
-- WHERE jobname='v8275-bot-growroom';
-- SELECT start_time,end_time,status FROM cron.job_run_details
-- WHERE jobid=(SELECT jobid FROM cron.job WHERE jobname='v8275-bot-growroom')
-- ORDER BY start_time DESC LIMIT 12;
-- Rollback (only after reviewing current state):
-- SELECT cron.alter_job(job_id:=(SELECT jobid FROM cron.job
-- WHERE jobname='v8275-bot-growroom'),schedule:='* * * * *',
-- command:='select server1_private.v8275_bot_grow_batch(16)');
