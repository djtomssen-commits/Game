from pathlib import Path
import json,re
root=Path(".")
beta=(root/"beta.html").read_text(encoding="utf-8")
owner=(root/"js/features/character/beta/v8009-s1-v4140-attribute-display-owner.js").read_text(encoding="utf-8")
paths=[
"js/features/legacy-extracted/beta/v419-attribute-points-display.js",
"js/features/legacy-extracted/beta/v426-attribute-points-live-update.js",
"js/features/character/beta/v8009-s12-v434-attribute-points-final-live-sync.js",
"js/features/legacy-extracted/beta/v671-attribute-points-duplicate-remove-js.js"
]
payload={
 "build":"V8.009-ATTRIBUTE-OWNER-CONSOLIDATION-QA",
 "checks":{
   "v4140_loaded": "js/features/character/beta/v8009-s1-v4140-attribute-display-owner.js" in beta,
   "v4140_persist_sync_present":"__v4140PersistWrapped" in owner and "requestAnimationFrame(paint)" in owner,
   "old_layers_not_loaded":all(p not in beta for p in paths),
   "old_files_absent":all(not (root/p).exists() for p in paths),
   "canonical_diagnostics_present":"v4140AttributeDiagnostics" in owner
 }
}
(root/"V8009_ATTRIBUTE_OWNER_CONSOLIDATION_QA.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if not all(payload["checks"].values()):
 raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
