from pathlib import Path
import hashlib,json

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8',errors='ignore')
stable=stable_path.read_text(encoding='utf-8',errors='ignore')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before=len(beta.encode())

# 1) Expose the already-existing canonical frame markup helper.
old="function frameArtMarkup(id){const src=frameAssetUrl(id);return src?`<img class=\"v7139-frame-art\" src=\"${esc(src)}\" alt=\"\" aria-hidden=\"true\" decoding=\"async\">`:''}\nfunction applyFrame(el,id){"
new="function frameArtMarkup(id){const src=frameAssetUrl(id);return src?`<img class=\"v7139-frame-art\" src=\"${esc(src)}\" alt=\"\" aria-hidden=\"true\" decoding=\"async\">`:''}\nwindow.v7137FrameArtMarkup=frameArtMarkup;\nfunction applyFrame(el,id){"
if beta.count(old)!=1:
    raise RuntimeError(f'frame helper insertion point count={beta.count(old)}')
beta=beta.replace(old,new,1)

# 2) Stop wrapping the final Hall ranking owner. Search/friends keep their historical
# frame refresh because those renderers are outside v6145.
old_list="['v073LoadRanking','v073SearchPlayer','v073LoadFriends'].forEach(name=>"
new_list="['v073SearchPlayer','v073LoadFriends'].forEach(name=>"
if beta.count(old_list)!=1:
    raise RuntimeError(f'v7137 social wrapper list count={beta.count(old_list)}')
beta=beta.replace(old_list,new_list,1)

# 3) Make Top-3 avatar occupy the card width in the existing v6145 stylesheet.
old_body="#hall .v6145-podium-body{padding:8px;text-align:center}\n#hall .v6145-podium-avatar{height:48px;display:flex;align-items:flex-end;justify-content:center;margin-bottom:5px}\n#hall .v6145-podium-avatar img{display:block;max-width:52px;max-height:48px;object-fit:contain;filter:drop-shadow(0 5px 5px #0008)}\n#hall .v6145-podium-avatar span{font-size:27px;line-height:1}\n#hall .v6145-podium-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f2f5ee;font-size:8px;font-weight:1000}\n#hall .v6145-podium-meta{margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#879489;font-size:5.5px}\n#hall .v6145-podium-power{margin-top:6px;color:#d8bd69;font-size:6px;font-weight:900}"
new_body="#hall .v6145-podium-body{padding:0 0 7px;text-align:center}\n#hall .v6145-podium-avatar{position:relative;width:100%;height:86px;display:grid;place-items:center;margin:0 0 7px;overflow:visible;background:#08100a}\n#hall .v6145-podium-avatar>img:not(.v7139-frame-art){display:block;width:100%;height:100%;max-width:none;max-height:none;object-fit:cover;object-position:center 24%;filter:drop-shadow(0 5px 5px #0008)}\n#hall .v6145-podium-avatar>.v7139-frame-art{pointer-events:none}\n#hall .v6145-podium-avatar span{font-size:38px;line-height:1}\n#hall .v6145-podium-name{padding:0 6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f2f5ee;font-size:8px;font-weight:1000}\n#hall .v6145-podium-meta{padding:0 6px;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#879489;font-size:5.5px}\n#hall .v6145-podium-power{padding:0 6px;margin-top:6px;color:#d8bd69;font-size:6px;font-weight:900}"
if beta.count(old_body)!=1:
    raise RuntimeError(f'v6145 podium CSS block count={beta.count(old_body)}')
beta=beta.replace(old_body,new_body,1)

old_mobile="#hall .v6145-podium-body{padding:7px 5px}.v6145-podium-avatar{height:43px}.v6145-podium-avatar img{max-width:47px;max-height:43px}"
new_mobile="#hall .v6145-podium-body{padding:0 0 6px}#hall .v6145-podium-avatar{height:72px}#hall .v6145-podium-avatar>img:not(.v7139-frame-art){width:100%;height:100%;max-width:none;max-height:none}"
if beta.count(old_mobile)!=1:
    raise RuntimeError(f'v6145 mobile CSS block count={beta.count(old_mobile)}')
beta=beta.replace(old_mobile,new_mobile,1)

# 4) Ensure frame assets still exist.
assets=[
 'assets/avatar_frames/ironwood.png',
 'assets/avatar_frames/silver_vine.png',
 'assets/avatar_frames/gold_crown.png',
 'assets/avatar_frames/emerald_aura.png',
 'assets/avatar_frames/haze_ring.png',
 'assets/avatar_frames/resin_flame.png',
 'assets/avatar_frames/prismatic_myth.png',
 'assets/avatar_frames/referral_legend.png',
]
missing=[p for p in assets if not Path(p).exists()]
if missing:
    raise RuntimeError('missing frame assets: '+', '.join(missing))

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8',errors='ignore').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
 'build':'V8.009-HALL-AVATAR-FRAME-DIRECT',
 'scope':'beta only',
 'stable_unchanged':True,
 'changes':[
   'exposed existing v7137FrameArtMarkup helper',
   'removed v073LoadRanking from v7137 post-render frame wrapper',
   'enlarged Top-3 avatars in existing v6145 Hall stylesheet',
   'kept search/friends frame refresh wrapper only'
 ],
 'new_render_wrapper_added':False,
 'new_timer_added':False,
 'new_observer_added':False,
 'beta_before_bytes':before,
 'beta_after_bytes':len(beta.encode()),
 'gameplay_changed':False,
 'matchmaking_changed':False,
 'combat_math_changed':False,
 'rewards_changed':False,
 'server_authority_changed':False
}
Path('V8009_HALL_AVATAR_FRAME_DIRECT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
