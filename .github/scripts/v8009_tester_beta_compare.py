from pathlib import Path
import re,json
out={}
for name in ('beta.html','tester.html','index.html'):
    txt=Path(name).read_text(encoding='utf-8',errors='ignore')
    out[name]={
      'bytes':len(txt.encode()),
      'title':(re.search(r'<title>(.*?)</title>',txt,re.I|re.S).group(1).strip() if re.search(r'<title>(.*?)</title>',txt,re.I|re.S) else None),
      'versions':sorted(set(re.findall(r'V\d+\.\d+(?:\.\d+)?',txt)))[:100],
      'hall_ids':[x for x in ('v072HallRanking','v6145-podium','v6145HallRefresh','v7053RunServerPvp') if x in txt],
      'login_ids':[x for x in ('login','serverSelect','server1','beta') if x in txt.lower()],
      'first_2k':txt[:2000],
    }
Path('V8009_TESTER_BETA_COMPARE.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
