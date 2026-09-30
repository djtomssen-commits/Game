from pathlib import Path
import hashlib,json,re,urllib.request,urllib.error

base='https://gamenew.djtomssen.workers.dev'
paths=['/','/beta','/beta.html','/tester','/tester.html']
repo_beta=Path('beta.html').read_bytes()
out={'repo_beta':{
  'bytes':len(repo_beta),
  'sha256':hashlib.sha256(repo_beta).hexdigest(),
  'has_cache_include':b'v8009-s1-v6145-hall-pagination-js.js?v=8009-top3-owner3' in repo_beta,
  'has_portrait_css':b'v6145-podium-portrait' in repo_beta,
  'has_idle_login_race_fix':b'__V4136_LOGOUT_PREPARING__' in repo_beta and b'let logoutPromise=null' in repo_beta,
}}
for p in paths:
    url=base+p
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'GrowLegends-V8009-Live-Audit/1.0','Cache-Control':'no-cache'})
        with urllib.request.urlopen(req,timeout=20) as r:
            body=r.read()
            txt=body.decode('utf-8','ignore')
            title=re.search(r'<title>(.*?)</title>',txt,re.I|re.S)
            out[p]={
              'ok':True,'status':r.status,'final_url':r.geturl(),
              'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),
              'title':title.group(1).strip() if title else None,
              'cache_control':r.headers.get('Cache-Control'),
              'etag':r.headers.get('ETag'),
              'cf_cache_status':r.headers.get('CF-Cache-Status'),
              'has_beta_channel':"GROW_RELEASE_CHANNEL='beta'" in txt,
              'has_cache_include':'v8009-s1-v6145-hall-pagination-js.js?v=8009-top3-owner2' in txt,
              'has_plain_include':'v8009-s1-v6145-hall-pagination-js.js' in txt,
              'has_portrait_css':'v6145-podium-portrait' in txt,
              'has_v7230_scope':'#world .v366-avatar.v7137-frame-target' in txt,
              'has_idle_login_race_fix':'__V4136_LOGOUT_PREPARING__' in txt and 'let logoutPromise=null' in txt,
              'has_finalize_guard':'Spielstand konnte nach der Anmeldung nicht geladen werden.' in txt,
            }
    except Exception as e:
        out[p]={'ok':False,'error':repr(e)}
Path('V8009_LIVE_BETA_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
