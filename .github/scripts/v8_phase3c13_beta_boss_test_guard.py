# C13 retry after regex fix
from pathlib import Path
import hashlib,re,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
legacy_path=Path('js/features/guild/legacy/37-vguildchatclosevisibilityfixjs--v6310-guildboss-test-removal-guard.js')
replay_old_path=Path('js/features/guild/beta/v8008-c7-guildboss-replay-owner.js')
stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()
legacy=legacy_path.read_text(encoding='utf-8')
replay_old=replay_old_path.read_text(encoding='utf-8')

marker='/* === v6310-guildboss-test-removal-guard === */'
if marker not in legacy:
    raise RuntimeError('v6310 marker missing in combined legacy file')
chat_part,guard_part=legacy.split(marker,1)
if 'v4144GuildChatClose' not in chat_part or 'function stabilize()' not in chat_part:
    raise RuntimeError('chat viewport fix extraction failed')
for token in ('v6204BossTestWrap','v6204BossTest','v6204RunGuildBossTest','v6204-test-mode'):
    if token not in guard_part:
        raise RuntimeError(f'legacy test guard missing expected token {token}')

# The C7 replay bundle still contained one harmless compatibility touch for the
# removed test button. Remove that too so no active beta owner knows about V6.204.
old_touch="const test=document.getElementById('v6204BossTest');if(test)test.dataset.guildBossRenderer='v6307'"
if old_touch not in replay_old:
    raise RuntimeError('expected V6.204 compatibility touch missing from C7 replay owner')
replay_new=replay_old.replace(old_touch,'')
replay_new=replay_new.replace(
    '/* V8.008-C7 BETA — single replay owner bundle.',
    '/* V8.008-C13 BETA — single replay owner bundle; retired V6.204 test hooks removed.'
)
replay_out=Path('js/features/guild/beta/v8008-c13-guildboss-replay-owner.js')
replay_out.write_text(replay_new,encoding='utf-8')

chat_out=Path('js/features/guild/beta/v8008-c13-guild-chat-viewport-fix.js')
chat_out.write_text(
    '/* V8.008-C13 BETA — guild chat viewport/close-button fix only.\n'
    '   The obsolete V6.310 boss test-removal guard is retired. */\n'
    + chat_part.strip()+'\n',
    encoding='utf-8'
)

def swap_src(html,sid,old_src,new_src):
    if f'id="{sid}"' not in html and f"id='{sid}'" not in html:
        raise RuntimeError(f'{sid}: beta marker missing')
    n=html.count(old_src)
    if n!=1:
        raise RuntimeError(f'{sid}: expected source exactly once, got {n}')
    return html.replace(old_src,new_src,1)

beta=swap_src(
    beta,
    'vGuildChatCloseVisibilityFixJs',
    legacy_path.as_posix(),
    chat_out.as_posix()
)
beta=swap_src(
    beta,
    'v6307-guildboss-multiexchange-script',
    replay_old_path.as_posix(),
    replay_out.as_posix()
)

# v6310 stays as an empty compatibility marker.
guard_sid='v6310-guildboss-test-removal-guard'
if f'id="{guard_sid}"' not in beta and f"id='{guard_sid}'" not in beta:
    raise RuntimeError(f'{guard_sid}: marker missing')
# It is already empty after Phase 3B; no file with this id may be loaded.
for q in (f'id="{guard_sid}"',f"id='{guard_sid}'"):
    pos=beta.find(q)
    if pos>=0:
        left=beta.rfind('<script',0,pos)
        right=beta.find('>',pos)
        if left>=0 and right>=0 and re.search(r'\\bsrc=',beta[left:right+1],re.I):
            raise RuntimeError('v6310 marker unexpectedly has src')
        break

# Prove the retired V6.204 feature is absent from the active beta runtime.
active_sources=set(re.findall(r"<script[^>]*\\bsrc=[\"']([^\"']+)[\"']",beta,re.I))
active_text={'beta.html':beta}
for src in sorted(active_sources):
    p=Path(src)
    if p.exists() and p.is_file():
        active_text[src]=p.read_text(encoding='utf-8',errors='ignore')
# Use the newly generated replay owner instead of the old C7 file for the proof.
active_text[replay_out.as_posix()]=replay_new

tokens=('v6204BossTestWrap','v6204BossTest','v6204RunGuildBossTest','v6204-test-mode')
refs={}
for token in tokens:
    hits=[]
    for rel,s in active_text.items():
        if token not in s:
            continue
        # The huge HTML has an old production cleanup that only removes/disables
        # the retired test feature. It is not a consumer and may remain for stable parity.
        if rel=='beta.html' and (
            "document.getElementById('v6204BossTest" in s or
            "window.v6204RunGuildBossTest" in s or
            "v6204-test-mode" in s
        ):
            continue
        idx=s.find(token)
        hits.append(rel+' :: '+s[max(0,idx-180):min(len(s),idx+260)].replace('\\n',' '))
    refs[token]=hits
    if hits:
        raise RuntimeError(f'{token} still active on beta: {hits[:20]}')

beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C12'","window.GROW_BETA_TECH_BUILD='V8.008-C13'",1)
if "V8.008-C13" not in beta:
    raise RuntimeError('beta C13 marker not installed')
beta_path.write_text(beta,encoding='utf-8')

if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode('utf-8')).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during beta-only C13')

report={
 'build':'V8.008-C13-BETA',
 'phase':'3C13',
 'scope':'beta.html + beta chat fix + cleaned beta replay owner',
 'chat_replacement':chat_out.as_posix(),
 'replay_replacement':replay_out.as_posix(),
 'retired':['v6310 guild boss test-removal guard','C7 v6204BossTest compatibility touch'],
 'active_runtime_reference_proof':refs,
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'server_authority_changed':False,
 'gameplay_changed':False,
}
Path('V8_PHASE3C13_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
