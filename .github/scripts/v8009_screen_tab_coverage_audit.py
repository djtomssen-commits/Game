from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")

# screens
screens=[]
for m in re.finditer(r'<section[^>]*class="[^"]*\bscreen\b[^"]*"[^>]*id="([^"]+)"|<section[^>]*id="([^"]+)"[^>]*class="[^"]*\bscreen\b[^"]*"',src,re.I):
    sid=m.group(1) or m.group(2)
    if sid and sid not in screens: screens.append(sid)

# tab-like controls
tabs=[]
for m in re.finditer(r'data-tab=["\']([^"\']+)["\']',src,re.I):
    t=m.group(1)
    if t not in tabs: tabs.append(t)

# navigation targets / screens from data-go
go=[]
for m in re.finditer(r'data-go=["\']([^"\']+)["\']',src,re.I):
    x=m.group(1)
    if x not in go: go.append(x)

# external beta feature includes
includes=[]
for m in re.finditer(r'<script[^>]+src=["\']([^"\']+)["\']',src,re.I):
    p=m.group(1)
    if '/beta/' in p or 'v8009' in p:
        includes.append(p)

# rough inline script ownership by ids
inline_scripts=[]
for m in re.finditer(r'<script([^>]*)>([\s\S]*?)</script>',src,re.I):
    attrs,body=m.group(1),m.group(2)
    if 'src=' in attrs.lower(): continue
    mid=re.search(r'id=["\']([^"\']+)["\']',attrs,re.I)
    sid=mid.group(1) if mid else ''
    low=(sid+' '+body).lower()
    refs=[]
    for s in screens:
        if re.search(r'["\']'+re.escape(s.lower())+r'["\']',low) or ('#'+s.lower()) in low:
            refs.append(s)
    tref=[]
    for t in tabs:
        if ('data-tab="'+t.lower()+'"') in low or ("data-tab='"+t.lower()+"'") in low or re.search(r'["\']'+re.escape(t.lower())+r'["\']',low):
            tref.append(t)
    if refs or tref:
        inline_scripts.append({"id":sid or "(no-id)","screens":refs[:20],"tabs":tref[:20],"bytes":len(body)})

status=Path("V8_CURRENT_STATUS.md").read_text(encoding="utf-8") if Path("V8_CURRENT_STATUS.md").exists() else ""
coverage={}
for s in screens:
    mentions=sum(1 for x in inline_scripts if s in x["screens"])
    ext=[p for p in includes if s.lower() in p.lower()]
    coverage[s]={
        "inline_script_refs":mentions,
        "external_includes":ext[:20],
        "status_mentioned":s.lower() in status.lower()
    }

tabcov={}
for t in tabs:
    mentions=sum(1 for x in inline_scripts if t in x["tabs"])
    tabcov[t]={
        "inline_script_refs":mentions,
        "status_mentioned":t.lower() in status.lower()
    }

out={
  "build":"V8.009-SCREEN-TAB-COVERAGE-AUDIT",
  "screen_count":len(screens),
  "tab_count":len(tabs),
  "go_target_count":len(go),
  "screens":screens,
  "tabs":tabs,
  "go_targets":go,
  "external_beta_includes":len(includes),
  "coverage":coverage,
  "tab_coverage":tabcov,
  "inline_script_ref_count":len(inline_scripts),
  "inline_scripts":sorted(inline_scripts,key=lambda x:x["bytes"],reverse=True)[:250]
}
Path("V8009_SCREEN_TAB_COVERAGE_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("screens",len(screens),"tabs",len(tabs),"go",len(go),"beta includes",len(includes),"inline refs",len(inline_scripts))
print("SCREENS",screens)
print("TABS",tabs)
