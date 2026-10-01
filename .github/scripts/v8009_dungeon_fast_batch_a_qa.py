from pathlib import Path
import json,sys
mf=Path('js/features/dungeon/beta/v8009-d2-map-finalizer.js').read_text(encoding='utf-8')
lock=Path('js/features/dungeon/beta/v8009-d2-detail-render-lock.js').read_text(encoding='utf-8')
seal=Path('js/features/dungeon/beta/v8009-d5-final-detail-seal.js').read_text(encoding='utf-8')
checks={
 'map_finalizer_retired':'__V8009_D2_MAP_FINALIZER_RETIRED__' in mf,
 'map_finalizer_no_runtime':all(x not in mf for x in ['setTimeout(','requestAnimationFrame(','addEventListener(']),
 'v7166_helper_export':'window.v7166DungeonDetailRepair=repair' in lock and 'window.v7166EnforceCanonicalDetail=enforceCanonicalDetail' in lock,
 'v7166_no_lifecycle_listeners':'addEventListener(' not in lock,
 'v7166_no_timers':'setTimeout(' not in lock and 'requestAnimationFrame(' not in lock,
 'd5_final_owner':'__V8009_DUNGEON_D5_FINAL_DETAIL_SEAL__' in seal,
 'd5_shared_nav_id':"e?.detail?.id||e?.detail?.screen" in seal,
 'd5_calls_v7166_helper':'v7166DungeonDetailRepair?.' in seal,
 'd5_observer_retained':'new MutationObserver' in seal,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-DUNGEON-FAST-BATCH-A-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_DUNGEON_FAST_BATCH_A_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
