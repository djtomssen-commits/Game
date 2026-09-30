from pathlib import Path
import re,json

beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
terms=[
 'serviceWorker','navigator.serviceWorker','caches.open','caches.match',
 'Cache-Control','updatefound','skipWaiting','clients.claim','fetch',
 'location.reload','Update verfügbar'
]
hits=[]
lines=beta.splitlines()
for i,line in enumerate(lines):
    if any(t in line for t in terms):
        hits.append({
          'line':i+1,
          'text':line.strip()[:2000],
          'context':'\n'.join(lines[max(0,i-8):min(len(lines),i+14)])[:12000]
        })

# service worker file references and likely cache scripts in tree
refs=sorted(set(re.findall(r'["\']([^"\']*(?:sw|service-worker|worker)[^"\']*\.js[^"\']*)["\']',beta,re.I)))

out={
 'build':'V8.009-BETA-CACHE-AUDIT',
 'hits':hits[:300],
 'service_worker_refs':refs[:100],
}
Path('V8009_BETA_CACHE_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
