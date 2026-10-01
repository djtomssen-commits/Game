from pathlib import Path
import json,re,hashlib
root=Path(".")
beta=(root/"beta.html").read_text(encoding="utf-8")
remove=[
"v8009-extracted-v7145-final-version-css.css",
"v8009-extracted-v7165-final-version-css.css",
]
removed=[]
for name in remove:
    p=root/name
    if p.exists():
        p.unlink()
        removed.append(name)
# verify no href references point to removed files
dangling=[n for n in remove if f'href="{n}"' in beta]
# expected canonical targets
expected=[
"v8009-extracted-v7127-final-version-css.css",
"v8009-extracted-v7164-final-version-css.css",
]
checks={
 "removed_now":removed,
 "dangling_removed_hrefs":dangling,
 "canonical_targets_present":all((root/n).exists() for n in expected),
 "beta_uses_canonical_7127":beta.count('href="v8009-extracted-v7127-final-version-css.css"')>=3,
 "beta_uses_canonical_7164":beta.count('href="v8009-extracted-v7164-final-version-css.css"')>=2,
}
payload={"build":"V8.009-CSS-DEDUP-FINAL-QA","checks":checks}
(root/"V8009_CSS_DEDUP_FINAL_QA.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if dangling or not checks["canonical_targets_present"] or not checks["beta_uses_canonical_7127"] or not checks["beta_uses_canonical_7164"]:
    raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
