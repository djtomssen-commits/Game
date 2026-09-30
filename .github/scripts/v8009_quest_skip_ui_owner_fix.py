from pathlib import Path
import re,json

p=Path('beta.html')
s=p.read_text(encoding='utf-8')
before=len(s)

# v393: obsolete skip UI owner; v4127 is canonical.
pat393=re.compile(r'<script id="v393-quest-skip-restored">[\s\S]*?</script>\s*',re.I)
if not pat393.search(s):
    raise SystemExit('v393 script missing')
s=pat393.sub('''<script id="v393-quest-skip-restored">
/* V8.009 retired: v4127 is the only Quest skip UI owner. */
</script>
''',s,count=1)

# v394: keep currency/payment/reward logic; retire only duplicate UI painter/render wrapper/startup paint.
pat394=re.compile(r'(<script id="v394-time-seeds-currency">)([\s\S]*?)(</script>)',re.I)
m=pat394.search(s)
if not m:
    raise SystemExit('v394 script missing')
body=m.group(2)
start=body.find('  function paintSkipCurrency(){')
end=body.find('  ensureTimeSeeds();',start)
if start<0 or end<0:
    raise SystemExit('v394 UI block missing')
body=body[:start]+'''  /* V8.009: skip UI painting retired here.
     v4127 owns the only .v394-skip-row/.v393-skip render lifecycle. */

'''+body[end:]
body=re.sub(r'  setTimeout\(\(\)=>\{[\s\S]*?\},750\);\s*','',body,count=1)
s=s[:m.start()]+m.group(1)+body+m.group(3)+s[m.end():]

p.write_text(s,encoding='utf-8')

m394=pat394.search(s)
b394=m394.group(2) if m394 else ''
checks={
 'v393_retired':'v4127 is the only Quest skip UI owner' in s,
 'v393_no_bind':'function bindSkip()' not in s,
 'v394_no_ui_painter':'function paintSkipCurrency()' not in b394,
 'v394_no_render_wrapper':'paintSkipCurrency' not in b394 and 'requestAnimationFrame(()=>requestAnimationFrame(paintSkipCurrency))' not in b394,
 'v394_currency_kept':'window.v316SkipActiveQuest=async function()' in b394,
 'v394_reward_roll_kept':'__V394_LAST_QUEST_SEED_ROLL__' in b394,
 'v4127_external_kept':'js/features/quest/beta/v4127-quest-skip-stable.js' in s,
}
failed=[k for k,v in checks.items() if not v]
report={'build':'V8.009-QUEST-SKIP-UI-OWNER-FIX','before_bytes':before,'after_bytes':len(s),'checks':checks,'failed':failed,'passed':not failed}
Path('V8009_QUEST_SKIP_UI_OWNER_FIX.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
if failed: raise SystemExit(1)

# trigger after workflow install

# retrigger after duplicate-seed repro 2026-09-30T19:57Z

# retrigger after narrowing UI-wrapper QA 2026-09-30T20:00Z
