from pathlib import Path
import urllib.request,urllib.error,hashlib,json,re

base='https://gamenew.djtomssen.workers.dev'
beta_url=base+'/beta'
asset_rel='js/features/pvp/beta/v8009-s1-v6145-hall-pagination-js.js?v=8009-top3-owner3'
asset_url=base+'/'+asset_rel
out={}

def fetch(url):
    req=urllib.request.Request(url,headers={'User-Agent':'GrowLegends-V8009-Live-Asset-Audit/1.0','Cache-Control':'no-cache'})
    with urllib.request.urlopen(req,timeout=20) as r:
        body=r.read()
        return {
          'status':r.status,
          'final_url':r.geturl(),
          'bytes':len(body),
          'sha256':hashlib.sha256(body).hexdigest(),
          'content_type':r.headers.get('Content-Type'),
          'cache_control':r.headers.get('Cache-Control'),
          'cf_cache_status':r.headers.get('CF-Cache-Status'),
          'body':body.decode('utf-8','ignore')
        }

try:
    b=fetch(beta_url)
    out['beta']={k:v for k,v in b.items() if k!='body'}
    html=b['body']
    out['beta']['has_owner3']=asset_rel in html
    out['beta']['has_loading']='Hall of Haze wird geladen' in html
    m=re.search(r'<script[^>]+src=["\']([^"\']*v8009-s1-v6145-hall-pagination-js\.js[^"\']*)["\']',html,re.I)
    out['beta']['matched_src']=m.group(1) if m else None
except Exception as e:
    out['beta']={'error':repr(e)}

try:
    a=fetch(asset_url)
    body=a.pop('body')
    out['asset']=a
    out['asset']['has_podiumAvatar']='function podiumAvatar(p)' in body
    out['asset']['has_frame_assets']='const FRAME_ASSETS=Object.freeze({' in body
    out['asset']['has_loadPage']='async function loadPage' in body
    out['asset']['prefix']=body[:500]
except Exception as e:
    out['asset']={'error':repr(e)}

repo_js=Path('js/features/pvp/beta/v8009-s1-v6145-hall-pagination-js.js').read_bytes()
out['repo_asset']={
 'bytes':len(repo_js),
 'sha256':hashlib.sha256(repo_js).hexdigest(),
}

Path('V8009_LIVE_V6145_ASSET_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
