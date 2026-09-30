from pathlib import Path
import json,re,hashlib

FILES=[
 'css/features/dungeon/beta/v8009-d11-v426-exact-reference-layout.css',
 'css/features/dungeon/beta/v8009-d11-v454-d1-feinschliff.css',
 'css/features/dungeon/beta/v8009-d11-v455-d1-feinschliff-2.css',
 'css/features/dungeon/beta/v8009-d11-v456-d1-reference-alignment-final.css',
 'css/features/dungeon/beta/v8009-d11-v457-d1-clean-overlay-final.css',
 'css/features/dungeon/beta/v8009-d11-v458-d1-clean-background-final.css',
 'css/features/dungeon/beta/v8009-d11-v459-d1-right-side-thumb-final.css',
 'css/features/dungeon/beta/v8009-d11-v460-d1-thumb-owner-fix.css',
 'css/features/dungeon/beta/v8009-d11-v461-d1-node9-collision-fix.css',
 'css/features/dungeon/beta/v8009-d11-v463-d1-screenshot-polish.css',
 'css/features/dungeon/beta/v8009-d11-v464-d1-boss-micro-position.css',
]

# Conservative longhand coverage. A file/block is called redundant only when every
# covered property unit is superseded later for the same selector + at-rule context.
SHORTHANDS={
 'margin':['margin-top','margin-right','margin-bottom','margin-left'],
 'padding':['padding-top','padding-right','padding-bottom','padding-left'],
 'inset':['top','right','bottom','left'],
 'overflow':['overflow-x','overflow-y'],
 'border-radius':['border-top-left-radius','border-top-right-radius','border-bottom-right-radius','border-bottom-left-radius'],
 'border-color':['border-top-color','border-right-color','border-bottom-color','border-left-color'],
 'border-width':['border-top-width','border-right-width','border-bottom-width','border-left-width'],
 'border-style':['border-top-style','border-right-style','border-bottom-style','border-left-style'],
 'border':['border-top-width','border-right-width','border-bottom-width','border-left-width',
           'border-top-style','border-right-style','border-bottom-style','border-left-style',
           'border-top-color','border-right-color','border-bottom-color','border-left-color'],
 'background':['background-color','background-image','background-position','background-size',
               'background-repeat','background-origin','background-clip','background-attachment'],
 'font':['font-style','font-variant','font-weight','font-stretch','font-size','line-height','font-family'],
 'flex':['flex-grow','flex-shrink','flex-basis'],
 'place-items':['align-items','justify-items'],
 'place-content':['align-content','justify-content'],
 'place-self':['align-self','justify-self'],
 'gap':['row-gap','column-gap'],
}

def units(prop):
    p=prop.strip().lower()
    return SHORTHANDS.get(p,[p])

def strip_comments(s):
    return re.sub(r'/\*.*?\*/','',s,flags=re.S)

def norm_ws(s):
    return re.sub(r'\s+',' ',s.strip())

def split_top(text,sep):
    out=[];buf=[];depth=0;quote=None;esc=False
    for ch in text:
        if esc:
            buf.append(ch);esc=False;continue
        if ch=='\\':
            buf.append(ch);esc=True;continue
        if quote:
            buf.append(ch)
            if ch==quote: quote=None
            continue
        if ch in ('"',"'"):
            quote=ch;buf.append(ch);continue
        if ch in '([': depth+=1
        elif ch in ')]' and depth>0: depth-=1
        if ch==sep and depth==0:
            out.append(''.join(buf));buf=[]
        else: buf.append(ch)
    out.append(''.join(buf))
    return out

def parse_decls(body):
    decls=[]
    for chunk in split_top(body,';'):
        if ':' not in chunk: continue
        prop,val=chunk.split(':',1)
        prop=prop.strip().lower()
        if not re.match(r'^--?[a-zA-Z_][\w-]*$',prop) and not re.match(r'^[a-zA-Z][\w-]*$',prop):
            continue
        val=val.strip()
        important=bool(re.search(r'!important\s*$',val,re.I))
        val=re.sub(r'!important\s*$','',val,flags=re.I).strip()
        decls.append((prop,val,important))
    return decls

def parse_rules(text,context=()):
    text=strip_comments(text)
    rules=[]
    i=0;n=len(text)
    while i<n:
        while i<n and text[i].isspace(): i+=1
        if i>=n: break
        # find next top-level opening brace / stray semicolon
        quote=None;depth=0;j=i
        while j<n:
            ch=text[j]
            if quote:
                if ch=='\\': j+=2; continue
                if ch==quote: quote=None
            else:
                if ch in ('"',"'"): quote=ch
                elif ch=='{': break
                elif ch==';' and depth==0:
                    # at-rule without block
                    i=j+1;break
            j+=1
        else:
            break
        if i>j: continue
        if j>=n or text[j]!='{':
            continue
        pre=norm_ws(text[i:j])
        # matching brace
        k=j+1;level=1;quote=None
        while k<n and level:
            ch=text[k]
            if quote:
                if ch=='\\': k+=2; continue
                if ch==quote: quote=None
            else:
                if ch in ('"',"'"): quote=ch
                elif ch=='{': level+=1
                elif ch=='}': level-=1
            k+=1
        body=text[j+1:k-1]
        if pre.startswith('@'):
            head=norm_ws(pre)
            # recurse into block at-rules; key context exactly to avoid unsafe cross-media conclusions
            rules.extend(parse_rules(body,context+(head,)))
        else:
            selectors=[norm_ws(x) for x in split_top(pre,',') if norm_ws(x)]
            decls=parse_decls(body)
            for sel in selectors:
                rules.append({'context':context,'selector':sel,'decls':decls})
        i=k
    return rules

records=[]
order=0
file_meta=[]
for fi,path in enumerate(FILES):
    txt=Path(path).read_text(encoding='utf-8')
    rules=parse_rules(txt)
    count=0
    for rule in rules:
        for prop,val,important in rule['decls']:
            records.append({
              'order':order,'file_index':fi,'file':path,'context':list(rule['context']),
              'selector':rule['selector'],'property':prop,'value':val,'important':important,
              'units':units(prop)
            })
            order+=1;count+=1
    file_meta.append({'file':path,'bytes':len(txt.encode()),'sha256':hashlib.sha256(txt.encode()).hexdigest(),'declarations':count})

# Build later coverage indexes keyed by exact selector + exact at-rule context + unit.
later={}
for rec in records:
    keybase=(tuple(rec['context']),rec['selector'])
    for unit in rec['units']:
        later.setdefault((keybase,unit),[]).append(rec)

def superseded(rec):
    keybase=(tuple(rec['context']),rec['selector'])
    witnesses=[]
    for unit in rec['units']:
        candidates=[
          x for x in later.get((keybase,unit),[])
          if x['order']>rec['order'] and (x['important'] or not rec['important'])
        ]
        if not candidates:
            return False,[]
        witnesses.append(min(candidates,key=lambda x:x['order']))
    return True,witnesses

redundant=[]
live=[]
for rec in records:
    ok,w=superseded(rec)
    out={k:v for k,v in rec.items() if k!='units'}
    out['units']=rec['units']
    if ok:
        out['overridden_by']=[
          {'file':x['file'],'selector':x['selector'],'property':x['property'],'important':x['important'],'order':x['order']}
          for x in w
        ]
        redundant.append(out)
    else:
        live.append(out)

stats=[]
for meta in file_meta:
    path=meta['file']
    rs=[x for x in redundant if x['file']==path]
    ls=[x for x in live if x['file']==path]
    stats.append({
      **meta,
      'proven_redundant_declarations':len(rs),
      'still_effective_or_unproven_declarations':len(ls),
      'proven_redundant_percent':round((len(rs)/meta['declarations']*100),2) if meta['declarations'] else 0,
      'fully_redundant':bool(meta['declarations']) and not ls,
      'effective_examples':[
        {'context':x['context'],'selector':x['selector'],'property':x['property'],'value':x['value'],'important':x['important']}
        for x in ls[:20]
      ]
    })

report={
 'build':'V8.009-DUNGEON-D12-CSS-CASCADE-AUDIT',
 'method':'Conservative exact-selector + exact-at-rule-context cascade audit with !important and common shorthand expansion. Cross-media and specificity-variant overrides are intentionally not treated as proof.',
 'source_order':FILES,
 'file_stats':stats,
 'fully_redundant_files':[x['file'] for x in stats if x['fully_redundant']],
 'proven_redundant_declaration_count':len(redundant),
 'still_effective_or_unproven_count':len(live),
 'redundant_declarations':redundant,
}
Path('V8009_DUNGEON_D12_CSS_CASCADE_AUDIT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'file_stats':stats,'fully_redundant_files':report['fully_redundant_files'],'proven_redundant_declaration_count':len(redundant),'still_effective_or_unproven_count':len(live)},ensure_ascii=False,indent=2))
