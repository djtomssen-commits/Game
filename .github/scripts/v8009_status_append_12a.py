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

marker2="#### Feature Extraction Batch 12B"
if marker2 not in s:
    s += """

#### Feature Extraction Batch 12B
- 8 Owner aus `beta.html` ausgelagert: v461, v6168, v6140, v115, gl-worldboss-ready-push-v2, v435, v430, v6211.
- 49.690 Bytes Inline-JS entfernt; Script-Reihenfolge unverändert.
- QA `V8009_FEATURE_EXTRACTION_BATCH12B_QA.json`: grün.
- Stable / `index.html`: unverändert.
"""
    p.write_text(s,encoding="utf-8")
