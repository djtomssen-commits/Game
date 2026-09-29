from pathlib import Path
import re,json
root=Path('css/features/guild/legacy')
rows=[]
for p in sorted(root.glob('*.css')):
    s=p.read_text(encoding='utf-8',errors='ignore')
    for m in re.finditer(r'url\(([^)]+)\)',s,re.I):
        raw=m.group(1).strip().strip('"\'')
        if not raw or raw.startswith(('data:','http://','https://','/','#')):
            continue
        resolved=(p.parent/raw).resolve()
        repo=Path('.').resolve()
        try:
            rel=resolved.relative_to(repo).as_posix()
        except Exception:
            rel=str(resolved)
        rows.append({
          'css':p.as_posix(),
          'url':raw,
          'resolved_relative_to_css':rel,
          'resolved_exists':resolved.exists(),
          'root_candidate':raw,
          'root_candidate_exists':Path(raw).exists(),
        })
Path('V8_BETA_GUILD_ASSET_URL_AUDIT.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(rows,ensure_ascii=False,indent=2))
