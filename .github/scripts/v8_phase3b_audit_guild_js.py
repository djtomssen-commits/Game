from pathlib import Path
import re, json, hashlib

files = [Path("index.html"), Path("beta.html")]
script_re = re.compile(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>', re.I)
id_re = re.compile(r'\bid=["\']([^"\']+)["\']', re.I)

def scan(path):
    text = path.read_text(encoding="utf-8")
    all_scripts = []
    selected = []
    last_selected_script_index = None
    group = -1
    for idx,m in enumerate(script_re.finditer(text)):
        attrs = m.group("attrs")
        body = m.group("body")
        im = id_re.search(attrs)
        sid = im.group(1) if im else ""
        srcm = re.search(r'\bsrc=["\']([^"\']+)["\']', attrs, re.I)
        src = srcm.group(1) if srcm else None
        rec = {
            "script_index": idx,
            "id": sid,
            "src": src,
            "inline": src is None,
            "bytes": len(body.encode("utf-8")),
            "sha256": hashlib.sha256(body.encode("utf-8")).hexdigest(),
            "line": text.count("\n", 0, m.start()) + 1,
        }
        all_scripts.append(rec)

        # Only inline scripts with explicit guild/gilde ownership in the id.
        if src is None and re.search(r'(guild|gilde)', sid or "", re.I):
            if last_selected_script_index is None or idx != last_selected_script_index + 1:
                group += 1
            rec2 = dict(rec)
            rec2["group"] = group
            selected.append(rec2)
            last_selected_script_index = idx

    return {
        "chars": len(text),
        "script_count": len(all_scripts),
        "selected": selected,
    }

data = {p.name: scan(p) for p in files}
a = data["index.html"]["selected"]
b = data["beta.html"]["selected"]

a_ids = [x["id"] for x in a]
b_ids = [x["id"] for x in b]
same_ids = a_ids == b_ids

mismatches = []
if same_ids:
    bmap = {x["id"]:x for x in b}
    for x in a:
        y=bmap[x["id"]]
        if x["sha256"] != y["sha256"]:
            mismatches.append(x["id"])

groups = {}
for x in a:
    g=str(x["group"])
    groups.setdefault(g,[]).append(x["id"])

report = {
    "build":"V8.006",
    "phase":"3B audit",
    "index_chars":data["index.html"]["chars"],
    "beta_chars":data["beta.html"]["chars"],
    "index_script_count":data["index.html"]["script_count"],
    "beta_script_count":data["beta.html"]["script_count"],
    "guild_inline_script_count":len(a),
    "guild_inline_total_bytes":sum(x["bytes"] for x in a),
    "same_id_order_index_beta":same_ids,
    "body_mismatches":mismatches,
    "contiguous_groups":groups,
    "scripts":a,
    "largest":sorted(a,key=lambda x:x["bytes"],reverse=True)[:30],
}
Path("V8_PHASE3B_GUILD_JS_AUDIT.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")

lines = [
    "# V8 Phase 3B · Guild JavaScript Audit",
    "",
    f"- Inline guild scripts: **{len(a)}**",
    f"- Total inline guild JS: **{sum(x['bytes'] for x in a):,} bytes**",
    f"- Contiguous groups: **{len(groups)}**",
    f"- Same ID order index/beta: **{same_ids}**",
    f"- Body mismatches index/beta: **{len(mismatches)}**",
    "",
    "## Largest scripts",
    "",
    "| ID | Bytes | Line | Group |",
    "|---|---:|---:|---:|",
]
for x in report["largest"]:
    lines.append(f"| {x['id']} | {x['bytes']:,} | {x['line']} | {x['group']} |")
lines += ["","## Contiguous groups",""]
for g,ids in groups.items():
    lines.append(f"- Group {g}: {len(ids)} scripts — " + ", ".join(ids))
Path("V8_PHASE3B_GUILD_JS_AUDIT.md").write_text("\n".join(lines)+"\n",encoding="utf-8")

if not same_ids:
    raise SystemExit("index/beta guild script ID order differs")
if mismatches:
    raise SystemExit("index/beta guild script bodies differ: "+", ".join(mismatches[:10]))

print(json.dumps({
    "guild_inline_script_count": len(a),
    "guild_inline_total_bytes": sum(x["bytes"] for x in a),
    "contiguous_groups": len(groups),
    "largest": [(x["id"],x["bytes"],x["group"]) for x in report["largest"][:10]]
},ensure_ascii=False,indent=2))
