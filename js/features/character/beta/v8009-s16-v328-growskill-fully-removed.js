(function(){
  const purge=(obj)=>{
    if(!obj||typeof obj!=='object')return;
    if(Object.prototype.hasOwnProperty.call(obj,'growSkill'))delete obj.growSkill;
  };

  purge(s.attrs);
  try{
    (s.inventory||[]).forEach(it=>{purge(it?.bonus);purge(it?.baseBonusV055)});
    Object.values(s.equipment||{}).forEach(it=>{purge(it?.bonus);purge(it?.baseBonusV055)});
  }catch(e){}

  /* Only the five real character attributes may be requested. */
  const allowed=new Set(['staerke','geschick','intelligenz','ausdauer','glueck']);
  const v328TotalAttr=totalAttr;
  totalAttr=function(k){
    if(!allowed.has(k))return 0;
    return Math.round(Number(v328TotalAttr(k))||0);
  };

  const v328IncAttr=incAttr;
  incAttr=function(k){
    if(!allowed.has(k))return;
    return v328IncAttr(k);
  };

  /* Remove any legacy DOM fragment even if an old renderer tries to recreate it. */
  function purgeDom(){
    document.querySelectorAll('#attrs > *').forEach(el=>{
      if(/grow[\s-]*skill/i.test(el.textContent||''))el.remove();
    });
  }
  const v328Render=render;
  render=function(){
    const r=v328Render.apply(this,arguments);
    purge(s.attrs);
    purgeDom();
    
    const line=document.querySelector('#v141VersionLine');
    return r;
  };

  try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
  try{render()}catch(e){}
})();
