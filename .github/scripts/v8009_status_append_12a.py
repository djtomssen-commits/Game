from pathlib import Path
p=Path("V8_CURRENT_STATUS.md")
s=p.read_text(encoding="utf-8")
marker="#### Feature Extraction Batch 12A"
if marker not in s:
    s += """

#### Feature Extraction Batch 12A
- 8 Owner aus `beta.html` ausgelagert: v498, v6201, v438, v497, v252, v244, v117, v121.
- Zielordner: Grow / Worldboss / Hall / Dungeon / UI / Items unter `js/features/*/beta/`.
- 51.590 Bytes Inline-JS entfernt; Script-Reihenfolge unverändert.
- QA `V8009_FEATURE_EXTRACTION_BATCH12A_QA.json`: grün.
- Stable / `index.html`: unverändert.
"""
    p.write_text(s,encoding="utf-8")
print("status ok")
