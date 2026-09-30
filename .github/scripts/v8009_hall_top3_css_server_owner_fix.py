from pathlib import Path
import hashlib,json,re

beta_path=Path('beta.html')
stable_path=Path('index.html')
hall_path=Path('js/features/pvp/beta/v8009-s1-v6145-hall-pagination-js.js')

beta=beta_path.read_text(encoding='utf-8',errors='ignore')
stable=stable_path.read_text(encoding='utf-8',errors='ignore')
hall=hall_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before=len(beta.encode())

def replace_once(old,new,label):
    global beta
    count=beta.count(old)
    if count!=1:
        raise RuntimeError(f'{label}: expected 1 match, got {count}')
    beta=beta.replace(old,new,1)

# Canonical v6145 Top-3 CSS: portrait is now a background layer, not a generic IMG.
replace_once(
"#hall .v6145-podium-avatar>img:not(.v7139-frame-art){position:absolute;inset:0;z-index:1;display:block;width:100%;height:100%;max-width:none;max-height:none;object-fit:cover;object-position:center 22%;transform:scale(2.55);transform-origin:center 28%;filter:drop-shadow(0 5px 5px #0008)}",
"#hall .v6145-podium-portrait{position:absolute;inset:0;z-index:1;display:block;background-repeat:no-repeat;background-size:cover;background-position:center 18%;filter:drop-shadow(0 5px 5px #0008)}\n#hall .v6145-podium-fallback{position:absolute;inset:0;z-index:1;display:grid;place-items:center;font-size:38px;line-height:1}",
'v6145 podium portrait CSS'
)

replace_once(
"#hall .v6145-podium-avatar span{font-size:38px;line-height:1}",
"#hall .v6145-podium-avatar>span:not(.v6145-podium-portrait){font-size:38px;line-height:1}",
'v6145 podium fallback CSS'
)

replace_once(
"#hall .v6145-podium-body{padding:0 0 6px}#hall .v6145-podium-avatar{min-height:0;height:auto;aspect-ratio:1/1}#hall .v6145-podium-avatar>img:not(.v7139-frame-art){width:100%;height:100%;max-width:none;max-height:none}",
"#hall .v6145-podium-body{padding:0 0 6px}#hall .v6145-podium-avatar{min-height:0;height:auto;aspect-ratio:1/1}",
'v6145 mobile portrait CSS'
)

# v7230 may protect local Server-1 frame state, but must not delete public Hall frames.
replace_once(
"html.v7230-frame-server-sync .v7137-frame-target>.v7139-frame-art{display:none!important}",
"html.v7230-frame-server-sync #world .v366-avatar.v7137-frame-target>.v7139-frame-art,html.v7230-frame-server-sync #character .avatar-scene.v7137-frame-target>.v7139-frame-art,html.v7230-frame-server-sync #v072OwnProfile .v646-own-avatar.v7137-frame-target>.v7139-frame-art{display:none!important}",
'v7230 CSS scope'
)

replace_once(
"document.querySelectorAll('.v7137-frame-target').forEach(el=>{",
"document.querySelectorAll('#world .v366-avatar.v7137-frame-target,#character .avatar-scene.v7137-frame-target,#v072OwnProfile .v646-own-avatar.v7137-frame-target').forEach(el=>{",
'v7230 strip scope'
)

# Cache-bust the SAME canonical v6145 file. This is not an additional renderer.
old_src='src="js/features/pvp/beta/v8009-s1-v6145-hall-pagination-js.js"'
new_src='src="js/features/pvp/beta/v8009-s1-v6145-hall-pagination-js.js?v=8009-top3-owner2"'
if old_src in beta:
    replace_once(old_src,new_src,'v6145 cache version')
elif new_src not in beta:
    raise RuntimeError('v6145 script include not found')

# Contract: direct renderer must already contain the new podium source.
for required in (
    'function podiumAvatar(p)',
    'class="v6145-podium-portrait"',
    'podiumAvatar(p)',
):
    if required not in hall:
        raise RuntimeError('v6145 direct podium renderer missing: '+required)

for forbidden in (
    "document.querySelectorAll('.v7137-frame-target').forEach",
    "html.v7230-frame-server-sync .v7137-frame-target>.v7139-frame-art",
    "#hall .v6145-podium-avatar>img:not(.v7139-frame-art)",
):
    if forbidden in beta:
        raise RuntimeError('obsolete Hall owner path remains: '+forbidden)

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8',errors='ignore').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
 'build':'V8.009-HALL-TOP3-CSS-SERVER-OWNER-FIX',
 'scope':'beta only',
 'stable_unchanged':True,
 'changes':[
   'existing v6145 CSS now styles direct podium portrait layer',
   'v7230 Server-1 frame isolation no longer strips public Hall frame targets',
   'same canonical v6145 external JS include cache-versioned'
 ],
 'new_renderer_added':False,
 'new_wrapper_added':False,
 'new_timer_added':False,
 'new_observer_added':False,
 'beta_before_bytes':before,
 'beta_after_bytes':len(beta.encode()),
 'gameplay_changed':False,
 'matchmaking_changed':False,
 'combat_math_changed':False,
 'cooldown_changed':False,
 'rewards_changed':False,
 'server_authority_changed':False
}
Path('V8009_HALL_TOP3_CSS_SERVER_OWNER_FIX.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
