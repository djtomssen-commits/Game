from pathlib import Path
import json,sys,re
files={
 'v204':Path('js/features/pvp/beta/v8009-s1-v204-pvp-system.js').read_text(encoding='utf-8'),
 'v206':Path('js/features/pvp/beta/v8009-s1-v206-pvp-start-fix.js').read_text(encoding='utf-8'),
 'v248':Path('js/features/pvp/beta/v8009-s1-v248-dungeon-item-card-and-hall-fix.js').read_text(encoding='utf-8'),
 'v437':Path('js/features/pvp/beta/v8009-s1-v437-pvp-combat-power-canonical.js').read_text(encoding='utf-8'),
 'v4130':Path('js/features/pvp/beta/v8009-s1-v4130-hall-dungeon-authority.js').read_text(encoding='utf-8'),
 'v6200':Path('js/features/pvp/beta/v8009-s1-v6200-pvp-battlelog-core.js').read_text(encoding='utf-8'),
}
checks={
 'v204_shared_nav':"growlegends:navigation-open-v7119" in files['v204'],
 'v206_shared_nav':"growlegends:navigation-open-v7119" in files['v206'],
 'v206_find_bind_retained':"find.onclick=v204FindOpponent" in files['v206'],
 'v248_shared_nav':"growlegends:navigation-open-v7119" in files['v248'],
 'v248_startup_version_timer_removed':"V4.29 Stable" not in files['v248'] and "setTimeout(" not in files['v248'],
 'v437_shared_nav':"growlegends:navigation-open-v7119" in files['v437'],
 'v437_retry_train_removed':'[500,2000,5000]' not in files['v437'],
 'v4130_shared_nav':"growlegends:navigation-open-v7119" in files['v4130'],
 'v6200_shared_nav':"growlegends:navigation-open-v7119" in files['v6200'],
 'v6200_mail_poll_retained':'setInterval(' in files['v6200'],
}
for k,s in files.items():
 checks[k+'_no_v032go_assignment']=re.search(r'\bv032Go\s*=\s*function',s) is None and 'window.v032Go=' not in s
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-PVP-FAST-BATCH-A-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_PVP_FAST_BATCH_A_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
