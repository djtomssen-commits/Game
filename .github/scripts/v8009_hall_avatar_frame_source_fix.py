from pathlib import Path
import hashlib,json

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8',errors='ignore')
stable=stable_path.read_text(encoding='utf-8',errors='ignore')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before=len(beta.encode())

def replace_once(old,new,label):
    global beta
    count=beta.count(old)
    if count!=1:
        raise RuntimeError(f'{label}: expected 1 match, got {count}')
    beta=beta.replace(old,new,1)

# Top-3: edit the existing canonical v6145 stylesheet itself.
replace_once(
"#hall .v6145-podium-avatar{position:relative;width:100%;height:86px;display:grid;place-items:center;margin:0 0 7px;overflow:visible;background:#08100a}",
"#hall .v6145-podium-avatar{position:relative;width:100%;aspect-ratio:1/1;min-height:92px;height:auto;display:grid;place-items:center;margin:0 0 7px;overflow:hidden;isolation:isolate;background:#08100a}",
'podium avatar container'
)
replace_once(
"#hall .v6145-podium-avatar>img:not(.v7139-frame-art){display:block;width:100%;height:100%;max-width:none;max-height:none;object-fit:cover;object-position:center 24%;filter:drop-shadow(0 5px 5px #0008)}",
"#hall .v6145-podium-avatar>img:not(.v7139-frame-art){position:absolute;inset:0;z-index:1;display:block;width:100%;height:100%;max-width:none;max-height:none;object-fit:cover;object-position:center 22%;transform:scale(2.55);transform-origin:center 28%;filter:drop-shadow(0 5px 5px #0008)}",
'podium avatar crop'
)
replace_once(
"#hall .v6145-podium-avatar>.v7139-frame-art{pointer-events:none}",
"#hall .v6145-podium-avatar>.v7139-frame-art{position:absolute!important;inset:0!important;z-index:4!important;display:block!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:fill!important;transform:none!important;filter:none!important;pointer-events:none!important}",
'podium frame overlay'
)

# Ranking rows: the canonical v6145 renderer emits v646-row-avatar + frame in one DOM write.
# Ensure the frame art is not constrained by generic avatar-image rules.
anchor="#hall .v6145-list-title b{color:#e5ebdf;font-size:8px}"
addition="""#hall .v6145-list-title b{color:#e5ebdf;font-size:8px}
#hall .v6145-list .v646-row-avatar.v7137-frame-target{position:relative;overflow:visible;isolation:isolate}
#hall .v6145-list .v646-row-avatar.v7137-frame-target>.v7139-frame-art{position:absolute!important;inset:-10%!important;z-index:5!important;display:block!important;width:120%!important;height:120%!important;max-width:none!important;max-height:none!important;object-fit:fill!important;transform:none!important;filter:none!important;border-radius:0!important;pointer-events:none!important}"""
replace_once(anchor,addition,'ranking frame overlay CSS')

# Mobile: keep the avatar square/full-width instead of shrinking it back to a narrow fixed height.
replace_once(
"#hall .v6145-podium-body{padding:0 0 6px}#hall .v6145-podium-avatar{height:72px}#hall .v6145-podium-avatar>img:not(.v7139-frame-art){width:100%;height:100%;max-width:none;max-height:none}",
"#hall .v6145-podium-body{padding:0 0 6px}#hall .v6145-podium-avatar{min-height:0;height:auto;aspect-ratio:1/1}#hall .v6145-podium-avatar>img:not(.v7139-frame-art){width:100%;height:100%;max-width:none;max-height:none}",
'mobile podium avatar'
)

# Retire Hall ranking from the old v7137 post-render frame wrapper.
replace_once(
"['v073LoadRanking','v073SearchPlayer','v073LoadFriends'].forEach(name=>",
"['v073SearchPlayer','v073LoadFriends'].forEach(name=>",
'v7137 Hall ranking wrapper removal'
)

# Frame changes must refresh Hall through the canonical renderer, not repaint it afterwards.
replace_once(
"renderFrameShop();renderFrameSelector();await decorateHallFrames();toast(",
"renderFrameShop();renderFrameSelector();try{if(document.getElementById('hall')?.classList.contains('active'))await window.v6145HallRefresh?.()}catch(_){}toast(",
'v7137 setFrame Hall refresh'
)

# Structural no-patch assertions.
if "['v073LoadRanking','v073SearchPlayer','v073LoadFriends'].forEach" in beta:
    raise RuntimeError('legacy Hall ranking post-render frame wrapper still active')
if "renderFrameSelector();await decorateHallFrames();toast(" in beta:
    raise RuntimeError('setFrame still post-paints Hall frames')
for required in (
    "['v073SearchPlayer','v073LoadFriends'].forEach",
    "await window.v6145HallRefresh?.()",
    "transform:scale(2.55)",
    ".v6145-list .v646-row-avatar.v7137-frame-target>.v7139-frame-art",
):
    if required not in beta:
        raise RuntimeError('required direct Hall integration missing: '+required)

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8',errors='ignore').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
  'build':'V8.009-HALL-AVATAR-FRAME-SOURCE-FIX',
  'scope':'beta only',
  'stable_unchanged':True,
  'changes':[
    'edited existing v6145 podium CSS directly',
    'cropped/scaled class avatar inside Top-3 card at source',
    'added explicit frame overlay rules inside existing v6145 CSS',
    'removed v073LoadRanking from old v7137 frame repaint wrapper',
    'frame changes now call canonical v6145 Hall refresh'
  ],
  'new_renderer_added':False,
  'new_render_wrapper_added':False,
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
Path('V8009_HALL_AVATAR_FRAME_SOURCE_FIX.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
