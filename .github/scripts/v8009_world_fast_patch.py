from pathlib import Path
p=Path('beta.html')
c=p.read_text(encoding='utf-8')
old="""  const baseGo=v032Go;
  v032Go=function(id){
    const r=baseGo.apply(this,arguments);
    requestAnimationFrame(()=>{
      v357RemoveWorldDuplicateBar();
      v357Version();
    });
    return r;
  };

  v357RemoveWorldDuplicateBar();
  v357Version();
  setTimeout(()=>{v357RemoveWorldDuplicateBar();v357Version()},350);
  setTimeout(()=>{v357RemoveWorldDuplicateBar();v357Version()},1200);"""
new="""  window.addEventListener('growlegends:navigation-open-v7119',()=>{
    v357RemoveWorldDuplicateBar();
    v357Version();
  },{passive:true});

  v357RemoveWorldDuplicateBar();
  v357Version();"""
if old not in c: raise SystemExit('v357 navigation repaint block missing')
c=c.replace(old,new,1)
p.write_text(c,encoding='utf-8')
print('patched v357 world navigation repaint layer')
