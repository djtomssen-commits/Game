from pathlib import Path
import json,sys,re
ov=Path('js/features/guild/beta/v8008-c25-guildoverview-owner.js').read_text(encoding='utf-8')
war=Path('js/features/guild/beta/v8008-c25-guildwar-owner.js').read_text(encoding='utf-8')
chat=Path('js/features/guild/beta/v8008-c25-guildchat-owner.js').read_text(encoding='utf-8')
checks={
 'overview_shared_nav':"growlegends:navigation-open-v7119" in ov,
 'overview_no_v032go_wrap':"const wrappedGo=function" not in ov and "__v561GuildGoGate" in ov,
 'overview_render_direct':'try{paint()}finally{paintQueued=false}' in ov,
 'overview_requests_direct':'syncEmptyRequests();' in ov,
 'war_shared_nav':"growlegends:navigation-open-v7119" in war,
 'war_no_v032go_wrap':"if(typeof v032Go==='function'&&!window.__v4159Go)" not in war,
 'war_polish_burst_removed':'[100,450,1000,2200]' not in war,
 'war_render_polish_direct':'v254RenderGuild=function(){const r=base.apply(this,arguments);polish();return r}' in war,
 'war_lower_pageshow_direct':"window.addEventListener('pageshow',polishWarLower" in war,
 'chat_scroll_direct':'box.scrollTop=box.scrollHeight;' in chat,
 'chat_postload_no_raf':"requestAnimationFrame(later)" not in chat,
 'chat_watch_retained':'scheduleWatch' in chat and 'setTimeout' in chat,
}
failed=[k for k,v in checks.items() if not v]
r={'build':'V8.009-GUILD-FAST-BATCH-A-QA','checks':checks,'failed':failed,'passed':not failed}
Path('V8009_GUILD_FAST_BATCH_A_QA.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
print(json.dumps(r,indent=2))
if failed: sys.exit(1)
