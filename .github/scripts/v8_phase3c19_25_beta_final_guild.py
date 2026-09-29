from pathlib import Path
import hashlib,re,json

repo=Path('.')
stable_path=Path('index.html')
beta_path=Path('beta.html')
stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode()).hexdigest()

def read(path):
    p=Path(path)
    if not p.exists(): raise RuntimeError(f'missing source {path}')
    s=p.read_text(encoding='utf-8')
    if not s.strip(): raise RuntimeError(f'empty source {path}')
    return s.strip()

def swap_src(html,sid,old_src,new_src):
    if f'id="{sid}"' not in html and f"id='{sid}'" not in html:
        raise RuntimeError(f'{sid}: marker missing')
    n=html.count(old_src)
    if n!=1: raise RuntimeError(f'{sid}: expected {old_src} once, got {n}')
    return html.replace(old_src,new_src,1)

def replace_tag_with_call(html,sid,old_src,call):
    patterns=[
      re.compile(rf'<script[^>]*id="{re.escape(sid)}"[^>]*></script\s*>',re.I),
      re.compile(rf"<script[^>]*id='{re.escape(sid)}'[^>]*></script\s*>",re.I)
    ]
    hits=[]
    for pat in patterns: hits.extend(list(pat.finditer(html)))
    if len(hits)!=1: raise RuntimeError(f'{sid}: expected one tag, got {len(hits)}')
    m=hits[0];tag=m.group(0)
    if old_src not in tag: raise RuntimeError(f'{sid}: expected src missing')
    new=f'<script id="{sid}">{call}</script>'
    return html[:m.start()]+new+html[m.end():]

# ---- Boss runtime owner: C12 + deferred V4119 reliability + V7078 rewards ----
boss_base='js/features/guild/beta/v8008-c12-guildboss-runtime-core.js'
reliability='js/features/guild/legacy/23-v4119-guild-reliability.js'
rewards='js/features/guild/legacy/49-v7078-server-guild-reward-claims.js'
boss_out='js/features/guild/beta/v8008-c25-guildboss-runtime-owner.js'
boss=read(boss_base)
rel=read(reliability)
rew=read(rewards)
Path(boss_out).write_text(boss+f"""

/* V8.008-C25 — deferred guild boss reliability layer. */
window.v8008C25InstallReliability=function(){{
  if(window.__V8008_C25_RELIABILITY_INSTALLER__)return;
  window.__V8008_C25_RELIABILITY_INSTALLER__=true;
{rel}
}};

/* V8.008-C25 — deferred server-authoritative guild reward claim owner. */
window.v8008C25InstallRewards=function(){{
  if(window.__V8008_C25_REWARD_INSTALLER__)return;
  window.__V8008_C25_REWARD_INSTALLER__=true;
{rew}
}};
""",encoding='utf-8')
beta=swap_src(beta,'v260-real-daily-guild-boss',boss_base,boss_out)
beta=replace_tag_with_call(beta,'v4119-guild-reliability',reliability,'window.v8008C25InstallReliability?.();')
beta=replace_tag_with_call(beta,'v7078-server-guild-reward-claims',rewards,'window.v8008C25InstallRewards?.();')

# ---- War owner: V262 core + deferred authority + two visual layers ----
war_core='js/features/guild/legacy/05-v262-guild-war-core--v263-guild-war-final.js'
war_auth='js/features/guild/legacy/09-v4159-guild-war-authority.js'
war_visual='js/features/guild/legacy/10-v564-guild-war-reference-js.js'
war_lower='js/features/guild/legacy/34-v565-guild-war-lower-final-js.js'
war_out='js/features/guild/beta/v8008-c25-guildwar-owner.js'
wc,wa,wv,wl=map(read,(war_core,war_auth,war_visual,war_lower))
Path(war_out).write_text(wc+f"""

/* V8.008-C25 — deferred authoritative guild-war owner. */
window.v8008C25InstallWarAuthority=function(){{
  if(window.__V8008_C25_WAR_AUTH_INSTALLER__)return;
  window.__V8008_C25_WAR_AUTH_INSTALLER__=true;
{wa}
}};
window.v8008C25InstallWarVisual=function(){{
  if(window.__V8008_C25_WAR_VISUAL_INSTALLER__)return;
  window.__V8008_C25_WAR_VISUAL_INSTALLER__=true;
{wv}
}};
window.v8008C25InstallWarLower=function(){{
  if(window.__V8008_C25_WAR_LOWER_INSTALLER__)return;
  window.__V8008_C25_WAR_LOWER_INSTALLER__=true;
{wl}
}};
""",encoding='utf-8')
beta=swap_src(beta,'v262-guild-war-core',war_core,war_out)
beta=replace_tag_with_call(beta,'v4159-guild-war-authority',war_auth,'window.v8008C25InstallWarAuthority?.();')
beta=replace_tag_with_call(beta,'v564-guild-war-reference-js',war_visual,'window.v8008C25InstallWarVisual?.();')
beta=replace_tag_with_call(beta,'v565-guild-war-lower-final-js',war_lower,'window.v8008C25InstallWarLower?.();')

# ---- Chat owner: V4144 + deferred bootstrap + mobile viewport fix ----
chat_core='js/features/guild/legacy/24-v4144-guild-chat.js'
chat_boot='js/features/guild/legacy/25-v4146-guild-chat-bootstrap-authority.js'
chat_view='js/features/guild/beta/v8008-c13-guild-chat-viewport-fix.js'
chat_out='js/features/guild/beta/v8008-c25-guildchat-owner.js'
cc,cb,cv=map(read,(chat_core,chat_boot,chat_view))
Path(chat_out).write_text(cc+f"""

/* V8.008-C25 — deferred chat identity/bootstrap owner. */
window.v8008C25InstallChatBootstrap=function(){{
  if(window.__V8008_C25_CHAT_BOOT_INSTALLER__)return;
  window.__V8008_C25_CHAT_BOOT_INSTALLER__=true;
{cb}
}};
window.v8008C25InstallChatViewport=function(){{
  if(window.__V8008_C25_CHAT_VIEW_INSTALLER__)return;
  window.__V8008_C25_CHAT_VIEW_INSTALLER__=true;
{cv}
}};
""",encoding='utf-8')
beta=swap_src(beta,'v4144-guild-chat',chat_core,chat_out)
beta=replace_tag_with_call(beta,'v4146-guild-chat-bootstrap-authority',chat_boot,'window.v8008C25InstallChatBootstrap?.();')
beta=replace_tag_with_call(beta,'vGuildChatCloseVisibilityFixJs',chat_view,'window.v8008C25InstallChatViewport?.();')

# ---- Overview owner + deferred leave-lock marker ----
overview_base='js/features/guild/beta/v8008-c6-guild-overview-owner.js'
lock_src='js/features/guild/legacy/36-v6124-guild-lock-marker.js'
overview_out='js/features/guild/beta/v8008-c25-guildoverview-owner.js'
ov,lk=map(read,(overview_base,lock_src))
Path(overview_out).write_text(ov+f"""

/* V8.008-C25 — deferred guild leave-lock UI/QA owner. */
window.v8008C25InstallGuildLock=function(){{
  if(window.__V8008_C25_GUILD_LOCK_INSTALLER__)return;
  window.__V8008_C25_GUILD_LOCK_INSTALLER__=true;
{lk}
}};
""",encoding='utf-8')
beta=swap_src(beta,'v554-guild-reference-owner-js',overview_base,overview_out)
beta=replace_tag_with_call(beta,'v6124-guild-lock-marker',lock_src,'window.v8008C25InstallGuildLock?.();')

# Keep invites and grow as independent single-owner guild subfeatures.
# Keep cross-system Guild-XP bridges with Dungeon/Quest/Shop until those systems are cleaned.
beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C18'","window.GROW_BETA_TECH_BUILD='V8.008-C25'",1)
if "V8.008-C25" not in beta: raise RuntimeError('beta C25 marker not installed')
beta_path.write_text(beta,encoding='utf-8')

if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during final beta guild batch')

retired=[reliability,rewards,war_auth,war_visual,war_lower,chat_boot,chat_view,lock_src]
report={
 'build':'V8.008-C25-BETA',
 'phase':'3C19-25 final guild batch',
 'scope':'beta only',
 'owners':{
   'overview':overview_out,
   'boss_runtime':boss_out,
   'boss_screen_visual':'js/features/guild/beta/v8008-c18-guildboss-screen-visual-owner.js',
   'boss_replay_signup':'js/features/guild/beta/v8008-c18-guildboss-replay-owner.js',
   'war':war_out,
   'chat':chat_out,
   'invites':'js/features/guild/legacy/48-v6245-guild-invites.js',
   'grow':'js/features/guild/legacy/50-v7273-guild-grow-core.js'
 },
 'retired_separate_loads':retired,
 'preserved_late_positions':[
   'v4119 reliability','v7078 reward claims','v4159 war authority','v564 war visual',
   'v565 war lower polish','v4146 chat bootstrap','chat viewport fix','v6124 guild lock'
 ],
 'left_for_other_system_phases':[
   'v415 dungeon guild-xp guard','v440 quest guild-xp owner','v473 shop guild-xp bridge'
 ],
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
 'server_authority_changed':False,
 'gameplay_changed':False
}
Path('V8_PHASE3C19_25_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
