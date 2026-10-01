from pathlib import Path
import re,json,collections
s=Path("beta.html").read_text(encoding="utf-8")
entries=[]
for i,m in enumerate(re.finditer(r'<script\b([^>]*)></script>',s,re.I),1):
    attrs=m.group(1)
    srcm=re.search(r'\bsrc=["\']([^"\']+)["\']',attrs,re.I)
    idm=re.search(r'\bid=["\']([^"\']+)["\']',attrs,re.I)
    if not srcm: continue
    src=srcm.group(1)
    sid=idm.group(1) if idm else None
    entries.append({"index":i,"id":sid,"src":src})

def stem_tokens(x):
    base=Path(x).stem.lower()
    base=re.sub(r'^v8009-s\d+-','',base)
    base=re.sub(r'^v\d+-','',base)
    toks=[t for t in re.split(r'[-_]+',base) if t and t not in {"js","script","css","fix","final","stable","live","owner","authority","marker"}]
    return toks

groups=collections.defaultdict(list)
for e in entries:
    toks=stem_tokens(e["src"])
    if not toks: continue
    key="-".join(toks[:2])
    groups[key].append(e)

candidates=[]
for key,vals in groups.items():
    if len(vals)>=3:
        candidates.append({"key":key,"count":len(vals),"items":vals})
candidates.sort(key=lambda x:(-x["count"],x["key"]))

payload={
 "build":"V8.009-LEGACY-OWNER-OVERLAP-AUDIT",
 "external_script_count":len(entries),
 "candidate_groups":candidates[:100],
 "candidate_group_count":len(candidates)
}
Path("V8009_LEGACY_OWNER_OVERLAP_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"external_script_count":len(entries),"candidate_group_count":len(candidates),"top":[{"key":x["key"],"count":x["count"]} for x in candidates[:30]]},ensure_ascii=False))
