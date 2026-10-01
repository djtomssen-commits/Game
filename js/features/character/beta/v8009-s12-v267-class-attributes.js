/* One canonical class-stat ownership layer:
   Barbar=grower -> Stärke, Schütze=scout -> Geschick, Magier=bruiser -> Intelligenz.
   Ausdauer=HP for all, Glück=crit for all. */
function v267PrimaryKey(cls=s.playerClass){
  return cls==='scout'?'geschick':(cls==='bruiser'||cls==='summoner')?'intelligenz':'staerke';
}
function v267PrimaryStat(){
  return Number(totalAttr(v267PrimaryKey()))||0;
}
function v267CritChance(){
  return Math.min(60,5+(Number(totalAttr('glueck'))||0)*0.35);
}
function v267CritMultiplier(){
  return 1.5+Math.min(.75,(Number(totalAttr('glueck'))||0)*0.004);
}

/* Canonical combat power and HP used by current combat systems that call these globals. */
combatPower=function(){
  return Math.round(
    v267PrimaryStat()*6 +
    (Number(totalAttr('ausdauer'))||0)*2 +
    (Number(totalAttr('glueck'))||0) +
    (Number(s.level)||1)*6
  );
};
maxHp=function(){
  const base=80+(Number(totalAttr('ausdauer'))||0)*8+(Number(s.level)||1)*5;
  return Math.round(base*(1+(typeof setBonusValue==='function'?Number(setBonusValue('hpPct'))||0:0)));
};

/* Preserve old helper name so Dungeon/PvP/Guild systems relying on it get the same primary stat. */
try{window.v029PrimaryStat=v267PrimaryStat}catch(e){}

/* Attribute UI: add intelligence if an older renderer did not create it and explain roles. */
const v267RenderBase=render;
render=function(){
  v267RenderBase();
  const box=document.querySelector('#attrs');
  if(box){
    const labels={staerke:'Stärke',geschick:'Geschick',intelligenz:'Intelligenz',ausdauer:'Ausdauer',glueck:'Glück'};
    const notes={
      staerke:(s.playerClass==='grower'||s.playerClass==='frost')?'Hauptattribut · Schaden/Kampfkraft':'Nebenattribut',
      geschick:s.playerClass==='scout'?'Hauptattribut · Schaden/Kampfkraft':'Nebenattribut',
      intelligenz:(s.playerClass==='bruiser'||s.playerClass==='summoner')?'Hauptattribut · Schaden/Kampfkraft':'Nebenattribut',
      ausdauer:'Lebenspunkte',
      glueck:`Crit · ${v267CritChance().toFixed(1)} %`
    };
    if(!box.querySelector('[data-v267-int]')){
      const current=[...box.children];
      const tpl=current.find(x=>/geschick/i.test(x.textContent||''))||current[0];
      if(tpl){
        const el=tpl.cloneNode(true);el.dataset.v267Int='1';
        const span=el.querySelector('span')||el;
        span.childNodes[0]&&(span.childNodes[0].textContent='🧠 Intelligenz ');
        const b=el.querySelector('b');if(b)b.textContent=String(Math.round(totalAttr('intelligenz')));
        const btn=el.querySelector('button');if(btn){btn.onclick=()=>{if((Number(s.points)||0)<=0)return;s.points--;s.attrs.intelligenz=(Number(s.attrs.intelligenz)||0)+1;persist();render()}}
        box.insertBefore(el,box.children[2]||null);
      }
    }
    [...box.children].forEach(el=>{
      const txt=(el.textContent||'').toLowerCase();
      const key=Object.keys(labels).find(k=>txt.includes(labels[k].toLowerCase()));
      if(!key)return;
      el.classList.toggle('v267-primary',key===v267PrimaryKey());
      let n=el.querySelector('.v267-attr-note');if(!n){n=document.createElement('small');n.className='v267-attr-note';el.appendChild(n)}
      n.textContent=notes[key]||'';
      const b=el.querySelector('b');if(b)b.textContent=String(Math.round(totalAttr(key)));
    });
  }
};

/* Update profile sync before its existing upload path reads combatPower(). */
setTimeout(()=>{try{render()}catch(e){}},300);
