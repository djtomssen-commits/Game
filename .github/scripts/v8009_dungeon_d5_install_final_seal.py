from pathlib import Path
import hashlib, json

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_sha=hashlib.sha256(beta.encode()).hexdigest()

src='js/features/dungeon/beta/v8009-d5-final-detail-seal.js'
tag=f'<script id="v8009-dungeon-d5-final-detail-seal" src="{src}"></script>'

if beta.count(src)>1:
    raise RuntimeError('final seal included more than once')
if src not in beta:
    pos=beta.lower().rfind('</body>')
    if pos<0:
        raise RuntimeError('no </body> found')
    beta=beta[:pos]+'\n'+tag+'\n'+beta[pos:]

if beta.count(src)!=1:
    raise RuntimeError('final seal include count != 1')

# It must be the last external script before </body>, after every legacy inline layer.
seal_pos=beta.index(src)
last_script_pos=beta.lower().rfind('<script',0,beta.lower().rfind('</body>'))
seal_tag_pos=beta.rfind('<script',0,seal_pos+1)
if seal_tag_pos!=last_script_pos:
    raise RuntimeError('final seal is not the last script before </body>')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('stable changed')

report={
  'build':'V8.009-DUNGEON-D5-FINAL-DETAIL-SEAL',
  'scope':'beta only',
  'stable_unchanged':True,
  'beta_before_sha256':before_sha,
  'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
  'seal_file':src,
  'seal_is_last_script':True,
  'purpose':'Final post-legacy canonical guard for 10-room Dungeon map DOM and assets',
  'gameplay_changed':False,
  'combat_math_changed':False,
  'rewards_changed':False,
  'server_authority_changed':False
}
Path('V8009_DUNGEON_D5_FINAL_DETAIL_SEAL.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
