from pathlib import Path
import re

BUILD_OLD = "V8.003"
BUILD_NEW = "V8.005"
FILES = [Path("index.html"), Path("beta.html")]
OUT = Path("css/features/guild/legacy")
OUT.mkdir(parents=True, exist_ok=True)

style_re = re.compile(r'<style(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</style\s*>', re.I)
id_re = re.compile(r'\bid=["\']([^"\']+)["\']', re.I)

def is_guild_style(style_id: str) -> bool:
    return bool(re.search(r'(guild|gilde)', style_id or "", re.I))

def clean_extra_attrs(attrs: str, sid: str) -> str:
    rest = id_re.sub("", attrs, count=1)
    rest = re.sub(r'\btype=["\']text/css["\']', "", rest, flags=re.I)
    rest = rest.strip()
    if rest:
        raise RuntimeError(f"{sid}: unexpected <style> attributes: {rest!r}")
    return ""

extracted_by_file = {}

for file in FILES:
    text = file.read_text(encoding="utf-8")
    extracted = {}

    def repl(m):
        attrs = m.group("attrs")
        body = m.group("body")
        im = id_re.search(attrs)
        sid = im.group(1) if im else ""
        if not is_guild_style(sid):
            return m.group(0)

        clean_extra_attrs(attrs, sid)
        if sid in extracted:
            raise RuntimeError(f"{file}: duplicate guild style id {sid}")

        css = body.strip() + "\n"
        if not css.strip():
            raise RuntimeError(f"{file}: empty guild style {sid}")

        extracted[sid] = css
        rel = f"css/features/guild/legacy/{sid}.css"
        return f'<link id="{sid}" rel="stylesheet" href="{rel}">'

    new_text = style_re.sub(repl, text)
    if not extracted:
        raise RuntimeError(f"{file}: no guild styles found")

    extracted_by_file[file.name] = extracted
    file.write_text(new_text, encoding="utf-8")

# Both release channels must externalize the same guild CSS definitions.
a = extracted_by_file["index.html"]
b = extracted_by_file["beta.html"]
if set(a) != set(b):
    only_a = sorted(set(a)-set(b))
    only_b = sorted(set(b)-set(a))
    raise RuntimeError(f"index/beta guild CSS ids differ: index-only={only_a}, beta-only={only_b}")

for sid in sorted(a):
    if a[sid] != b[sid]:
        raise RuntimeError(f"index/beta guild CSS body differs for {sid}")
    (OUT / f"{sid}.css").write_text(a[sid], encoding="utf-8")

# Current visible build marker.
version = Path("js/system/version/v7283-stable-version-lock.js")
if version.exists():
    s = version.read_text(encoding="utf-8")
    s = s.replace(BUILD_OLD, BUILD_NEW).replace("8.003", "8.005")
    version.write_text(s, encoding="utf-8")

print(f"Extracted {len(a)} guild CSS blocks from index.html and beta.html")
