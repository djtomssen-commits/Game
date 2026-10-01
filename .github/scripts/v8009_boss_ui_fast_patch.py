from pathlib import Path
p=Path('beta.html')
c=p.read_text(encoding='utf-8')
old="""document.addEventListener('click',e=>{
  if(e.target?.closest?.('#v110Fight')){
    setTimeout(()=>{const scene=document.getElementById('v111BossScene');if(scene){scene.classList.remove('v6201-dead','v6201-victory');install()}},30);
  }
  if(e.target?.closest?.('[data-v111-openboss],#v110WorldBossBtn,[data-v6118-open-worldboss]'))setTimeout(install,120);
},true);"""
new="""document.addEventListener('click',e=>{
  if(e.target?.closest?.('#v110Fight')){
    setTimeout(()=>{const scene=document.getElementById('v111BossScene');if(scene){scene.classList.remove('v6201-dead','v6201-victory');install()}},30);
  }
},true);"""
if old not in c: raise SystemExit('worldboss open retry block missing')
c=c.replace(old,new,1)
p.write_text(c,encoding='utf-8')
print('patched worldboss duplicate open repaint')
