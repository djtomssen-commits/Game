from pathlib import Path
import re, json, hashlib

ROOT = Path(".")
BETA = ROOT / "beta.html"
STABLE = ROOT / "index.html"
OUTDIR = ROOT / "js/features/legacy-extracted/beta"
QA = ROOT / "V8009_FEATURE_EXTRACTION_MEGA28_QA.json"

src = BETA.read_text(encoding="utf-8")
stable_before = hashlib.sha256(STABLE.read_bytes()).hexdigest()

pat = re.compile(r'(<script\b[^>]*\bid="([^"]+)"[^>]*>)([\s\S]*?)(</script>)', re.I)
candidates = []
for m in pat.finditer(src):
    open_tag, sid, body = m.group(1), m.group(2), m.group(3)
    if re.search(r'\bsrc\s*=', open_tag, re.I):
        continue
    tm = re.search(r'\btype\s*=\s*["\']([^"\']+)["\']', open_tag, re.I)
    typ = (tm.group(1).strip().lower() if tm else "")
    if typ and typ not in ("text/javascript","application/javascript"):
        continue
    if len(body.encode("utf-8")) < 1000:
        continue
    candidates.append((len(body.encode("utf-8")), m.start(), m.end(), open_tag, sid, body))

# largest first, max 50
selected = sorted(candidates, key=lambda x: (-x[0], x[1]))[:50]
# replacements must happen from end to start
selected_by_pos = sorted(selected, key=lambda x: x[1], reverse=True)

OUTDIR.mkdir(parents=True, exist_ok=True)
result = []
used = set()

def safe_name(s):
    x = re.sub(r'[^A-Za-z0-9._-]+', '-', s).strip('-').lower()
    return x or "script"

for size, start, end, open_tag, sid, body in selected_by_pos:
    base = safe_name(sid)
    name = base + ".js"
    n = 2
    while name in used or (OUTDIR / name).exists():
        name = f"{base}-{n}.js"; n += 1
    used.add(name)
    out = OUTDIR / name
    out.write_text(body, encoding="utf-8")
    rel = out.as_posix()
    new_open = open_tag[:-1] + f' src="{rel}">'
    src = src[:start] + new_open + "</script>" + src[end:]
    result.append({"id": sid, "path": rel, "bytes": size})

BETA.write_text(src, encoding="utf-8")
result.sort(key=lambda x: x["id"].lower())

checks = {
    "selected_count": len(result),
    "stable_hash_unchanged": hashlib.sha256(STABLE.read_bytes()).hexdigest() == stable_before,
    "all_files_present": all((ROOT / r["path"]).exists() and (ROOT / r["path"]).stat().st_size > 0 for r in result),
    "all_includes_present": all(
        re.search(r'<script\b[^>]*\bid="' + re.escape(r["id"]) + r'"[^>]*\bsrc="' + re.escape(r["path"]) + r'"[^>]*>\s*</script>', src, re.I)
        for r in result
    ),
    "no_selected_ids_still_inline": all(
        not re.search(r'<script\b(?![^>]*\bsrc=)[^>]*\bid="' + re.escape(r["id"]) + r'"[^>]*>[\s\S]*?</script>', src, re.I)
        for r in result
    )
}

payload = {
    "build": "V8.009-FEATURE-EXTRACTION-MEGA28-QA",
    "scope": "move-only extraction of up to 50 largest remaining named classic inline JS blocks from beta.html",
    "result": result,
    "total_bytes_extracted": sum(r["bytes"] for r in result),
    "checks": checks
}
QA.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
if len(result) == 0 or not all(v for k,v in checks.items() if k != "selected_count"):
    raise SystemExit(json.dumps(payload, ensure_ascii=False))
print(json.dumps(payload, ensure_ascii=False))
