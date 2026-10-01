from pathlib import Path
import re,json
beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
files=[
'js/features/guild/beta/v8008-c4-guild-overview-owner.js',
'js/features/guild/beta/v8008-c5-guild-overview-owner.js',
'js/features/guild/beta/v8008-c6-guild-overview-owner.js',
'js/features/guild/beta/v8008-c25-guildoverview-owner.js',
'js/features/guild/beta/v8008-c7-guildboss-replay-owner.js',
'js/features/guild/beta/v8008-c13-guildboss-replay-owner.js',
'js/features/guild/beta/v8008-c18-guildboss-replay-owner.js',
'js/features/guild/beta/v8008-c25-guildboss-runtime-owner.js',
'js/features/guild/beta/v8008-c25-guildchat-owner.js',
'js/features/guild/beta/v8008-c25-guildwar-owner.js'
]
items=[]
for f in files:
    pos=beta.find(f)
    items.append({'file':f,'loaded':pos>=0,'pos':pos})
items.sort(key=lambda x:(x['pos']<0,x['pos']))
Path('V8009_GUILD_LOAD_ORDER_AUDIT.json').write_text(json.dumps({'build':'V8.009-GUILD-LOAD-ORDER-AUDIT','items':items},indent=2)+'\n',encoding='utf-8')
print(json.dumps({'items':items},indent=2))
