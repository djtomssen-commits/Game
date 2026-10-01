from pathlib import Path
import json,sys,re
q=Path('js/features/quest/beta/v7045-atomic-quest-receipt-client.js').read_text(encoding='utf-8')
checks={
 'epoch_declared':'questStateEpoch=0' in q,
 'force_bypasses_inflight':'if(!force&&questStateFlight)return questStateFlight;' in q,
 'epoch_captured':'const epoch=questStateEpoch;' in q,
 'stale_flight_guarded':'q?.ok&&epoch===questStateEpoch' in q,
 'invalidate_bumps_epoch':'questStateEpoch++;' in q,
 'invalidate_clears_flight':'questStateFlight=null;' in q.split('function invalidateQuestState()',1)[1].split('}',1)[0],
 'claim_invalidates_before_rpc':'invalidateQuestState();C.lastRunId=runId;' in q,
 'claim_forces_fresh_state':'await canonicalQuestState(true)' in q,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-QUEST-FIRST-CLAIM-LOGIN-RACE-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_FIRST_CLAIM_LOGIN_RACE_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
