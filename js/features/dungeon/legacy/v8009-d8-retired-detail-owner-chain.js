/* RETIRED FROM ACTIVE BETA IN V8.009-DUNGEON-D8. DO NOT LOAD.
   Original D1/D6/D7 detail-owner chain retained for rollback/reference. */

/* ===== RETIRED v426-reference-owner ===== */
(function(){
  const D1_BG=`assets/v7198-base64/29f985c0f598ee45e47a.webp`;
  const base=window.v261RenderDetail;
  if(typeof base!=='function')return;

  function balancedTitle(text){
    const words=String(text||'').trim().split(/\s+/).filter(Boolean);
    if(words.length<3)return words.map(w=>w.toUpperCase()).join(' ');
    let best=1,score=Infinity;
    for(let i=1;i<words.length;i++){
      const a=words.slice(0,i).join(' ').length,b=words.slice(i).join(' ').length;
      const s=Math.abs(a-b)+(Math.max(a,b)>18?8:0);
      if(s<score){score=s;best=i;}
    }
    return `${words.slice(0,best).join(' ').toUpperCase()}<br>${words.slice(best).join(' ').toUpperCase()}`;
  }

  function applyReferenceVisuals(){
    const di=typeof v048DungeonIndex==='function'?v048DungeonIndex():Math.max(0,Math.min(19,Number(s?.dungeon?.selected||0)||0));
    const card=document.getElementById('dungeonMapCard');
    if(!card)return;
    card.classList.toggle('v426-ref-d1',di===0);
    const title=card.querySelector('.v261-title');
    if(title)title.innerHTML=balancedTitle(dungeons?.[di]?.name||title.textContent);
    if(di===0){
      const bg=card.querySelector('.v261-bg');
      if(bg)bg.style.backgroundImage=`url("${D1_BG}")`;
    }
  }

  window.v426RenderDetail=function(){
    const ok=base();
    if(ok!==false)applyReferenceVisuals();
    return ok;
  };

  try{window.v251RenderDetail=window.v426RenderDetail;v251RenderDetail=window.v426RenderDetail}catch(e){}
  try{window.v244RenderSelectedDungeonMap=window.v426RenderDetail;v244RenderSelectedDungeonMap=window.v426RenderDetail}catch(e){}
  try{window.v064RenderMap=window.v426RenderDetail;v064RenderMap=window.v426RenderDetail}catch(e){}

  try{
    const prev=window.renderDungeon||renderDungeon;
    if(typeof prev==='function'&&!prev.__v426Owner){
      const wrap=function(){
        try{if(s?.dungeon?.layer==='dungeon'&&s?.dungeon?.view==='map')return window.v426RenderDetail();}catch(e){}
        return prev.apply(this,arguments);
      };
      wrap.__v426Owner=true;
      window.renderDungeon=wrap;
      try{renderDungeon=wrap}catch(e){}
    }
  }catch(e){}
})();

/* ===== RETIRED v427-d6-clean-script ===== */
(function(){
  const base=window.v426RenderDetail || window.v261RenderDetail || window.v251RenderDetail;
  if(typeof base!=='function')return;
  function cleanName(s){
    return String(s||'')
      .replace(/\s+\d+\.\d+\s*$/,'')
      .replace(/\s*[–—-]\s*BOSS\s*$/i,'')
      .trim();
  }
  function applyD6(){
    const card=document.getElementById('dungeonMapCard');
    if(!card)return;
    const di=Number(s?.dungeon?.selected||0);
    card.classList.toggle('v427-d6',di===5);
    if(di!==5)return;
    const title=card.querySelector('.v261-title');
    if(title)title.innerHTML='DIE<br>SCHIMMELMINEN';
    card.querySelectorAll('.v261-name').forEach(el=>{el.textContent=cleanName(el.textContent)});
    const line1=card.querySelector('.v261-line1');
    if(line1){
      let t=line1.textContent.replace(/\s*[–—-]\s*BOSS\s*[–—-]\s*BOSS\s*$/i,' – BOSS');
      t=t.replace(/(\d+\s*·\s*)(.*?)(\s*[–—-]\s*BOSS)?$/i,(m,a,b,c)=>a+cleanName(b)+(c?' – BOSS':''));
      line1.textContent=t;
    }
    const sign=card.querySelector('.v261-signboard');
    if(sign)sign.innerHTML='ACHTUNG<br>SCHIMMELGEFAHR<br>BETRETEN AUF<br>EIGENE GEFAHR!<small>☠</small>';
  }
  window.v427RenderDetail=function(){
    const ok=base.apply(this,arguments);
    if(ok!==false)applyD6();
    return ok;
  };
  try{window.v251RenderDetail=window.v427RenderDetail;v251RenderDetail=window.v427RenderDetail}catch(e){}
  try{window.v244RenderSelectedDungeonMap=window.v427RenderDetail;v244RenderSelectedDungeonMap=window.v427RenderDetail}catch(e){}
  try{window.v064RenderMap=window.v427RenderDetail;v064RenderMap=window.v427RenderDetail}catch(e){}
  try{
    const prev=window.renderDungeon||renderDungeon;
    if(typeof prev==='function'&&!prev.__v427Owner){
      const wrap=function(){
        try{if(s?.dungeon?.layer==='dungeon'&&s?.dungeon?.view==='map')return window.v427RenderDetail();}catch(e){}
        return prev.apply(this,arguments);
      };
      wrap.__v427Owner=true;
      window.renderDungeon=wrap;renderDungeon=wrap;
    }
  }catch(e){}
  try{if(document.getElementById('dungeon')?.classList.contains('active')&&s?.dungeon?.layer==='dungeon'&&s?.dungeon?.view==='map')window.v427RenderDetail()}catch(e){}
})();

/* ===== RETIRED v428-d6-final-owner ===== */
(function(){
  function install(){
    const detail = window.v427RenderDetail;
    if(typeof detail!=='function'){
      console.error('V4.228: v427RenderDetail fehlt');
      return false;
    }

    /* Direkte Detail-Einstiegspunkte immer auf D6-Clean-Renderer. */
    try{window.v251RenderDetail=detail}catch(e){}
    try{v251RenderDetail=detail}catch(e){}
    try{window.v244RenderSelectedDungeonMap=detail}catch(e){}
    try{v244RenderSelectedDungeonMap=detail}catch(e){}
    try{window.v064RenderMap=detail}catch(e){}
    try{v064RenderMap=detail}catch(e){}

    /* Neueste Render-Schicht bekommt absolute Priorität im Detail-Kartenmodus. */
    try{
      const current = window.renderDungeon || renderDungeon;
      if(typeof current==='function' && !current.__v428D6FinalOwner){
        const base=current;
        const wrapped=function(){
          try{
            if(s?.dungeon?.layer==='dungeon' && s?.dungeon?.view==='map'){
              return detail();
            }
          }catch(e){}
          return base.apply(this,arguments);
        };
        wrapped.__v428D6FinalOwner=true;
        /* Verhindert, dass der ältere V4.225-Installer uns später nochmal umwickelt. */
        wrapped.__v4225DetailOwner=true;
        wrapped.__v428Base=base;
        try{window.renderDungeon=wrapped}catch(e){}
        try{renderDungeon=wrapped}catch(e){}
      }
    }catch(e){console.error('V4.228 render owner',e)}

    /* Falls Dungeon 6 gerade offen ist, sofort neu zeichnen. */
    try{
      const sec=document.getElementById('dungeon');
      if(sec?.classList.contains('active') &&
         s?.dungeon?.layer==='dungeon' &&
         s?.dungeon?.view==='map'){
        requestAnimationFrame(()=>{try{detail()}catch(e){console.error('V4.228 repaint',e)}});
      }
    }catch(e){}

    return true;
  }

  install();

  /* Ältere Listener laufen zuerst; danach setzen wir den finalen Owner erneut. */
  window.addEventListener('pageshow',()=>setTimeout(install,20),{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)setTimeout(install,20);
  },{passive:true});
})();

/* ===== RETIRED v429-d6-scenic-owner ===== */
(function(){
  function apply(){
    const card=document.getElementById('dungeonMapCard');
    if(!card)return;
    const di=Number(s?.dungeon?.selected||0);
    if(di!==5)return;
    card.classList.add('v427-d6');

    const title=card.querySelector('.v261-title');
    if(title) title.innerHTML='DIE<br>SCHIMMELMINEN';

    const line1=card.querySelector('.v261-line1');
    if(line1) line1.textContent=String(line1.textContent||'').replace(/\s*[–—-]\s*BOSS\s*[–—-]\s*BOSS\s*$/i,' – BOSS');
  }
  const prev=window.v427RenderDetail || window.v426RenderDetail || window.v261RenderDetail;
  if(typeof prev==='function' && !prev.__v429D6Scenic){
    const wrap=function(){ const ok=prev.apply(this,arguments); try{apply()}catch(e){} return ok; };
    wrap.__v429D6Scenic=true;
    window.v427RenderDetail=wrap;
    try{v427RenderDetail=wrap}catch(e){}
    try{window.v251RenderDetail=wrap;v251RenderDetail=wrap}catch(e){}
    try{window.v244RenderSelectedDungeonMap=wrap;v244RenderSelectedDungeonMap=wrap}catch(e){}
    try{window.v064RenderMap=wrap;v064RenderMap=wrap}catch(e){}
  } else {
    try{apply()}catch(e){}
  }
  try{
    const sec=document.getElementById('dungeon');
    if(sec?.classList.contains('active') && s?.dungeon?.layer==='dungeon' && s?.dungeon?.view==='map'){
      requestAnimationFrame(()=>{try{apply()}catch(e){}});
    }
  }catch(e){}
})();

/* ===== RETIRED v430-d6-10er-final-script ===== */
(function(){
  const POS=[[12,17],[37,21],[63,25],[86,31],[12,45],[34,58],[53,68],[71,59],[88,47],[83,80]];

  function cleanName(s){
    return String(s||'').replace(/\s+\d+\.\d+\s*$/,'').replace(/\s*[–—-]\s*BOSS\s*$/i,'').trim();
  }

  function applyD6(){
    const card=document.getElementById('dungeonMapCard');
    if(!card || Number(s?.dungeon?.selected||0)!==5) return;
    card.classList.add('v427-d6');

    const title=card.querySelector('.v261-title');
    if(title) title.textContent='DIE SCHIMMELMINEN';

    card.querySelectorAll('[data-v261-room]').forEach((node,i)=>{
      const p=POS[i]; if(!p)return;
      node.style.setProperty('--x',String(p[0]));
      node.style.setProperty('--y',String(p[1]));
      const name=node.querySelector('.v261-name');
      if(name) name.textContent=cleanName(name.textContent);
    });

    const line1=card.querySelector('.v261-line1');
    if(line1){
      let t=String(line1.textContent||'').replace(/\s*[–—-]\s*BOSS\s*[–—-]\s*BOSS\s*$/i,' – BOSS');
      line1.textContent=t;
    }

    const sign=card.querySelector('.v261-signboard');
    if(sign) sign.innerHTML='ACHTUNG<br>SCHIMMELGEFAHR<br>BETRETEN AUF<br>EIGENE GEFAHR!<small>☠</small>';
  }

  /* Wichtig: Der allerletzte Detail-Renderer wird hier erneut Besitzer.
     Dadurch kann kein älterer v428-Owner mehr die neue Darstellung umgehen. */
  const latest=window.v427RenderDetail || window.v429RenderDetail || window.v426RenderDetail || window.v261RenderDetail;
  if(typeof latest==='function'){
    const detail=function(){
      const ok=latest.apply(this,arguments);
      try{applyD6()}catch(e){console.error('V4.230 D6 apply',e)}
      return ok;
    };
    detail.__v430Final=true;

    window.v430RenderDetail=detail;
    try{window.v251RenderDetail=detail;v251RenderDetail=detail}catch(e){}
    try{window.v244RenderSelectedDungeonMap=detail;v244RenderSelectedDungeonMap=detail}catch(e){}
    try{window.v064RenderMap=detail;v064RenderMap=detail}catch(e){}

    try{
      const base=window.renderDungeon || renderDungeon;
      const wrapped=function(){
        try{
          if(s?.dungeon?.layer==='dungeon' && s?.dungeon?.view==='map') return detail();
        }catch(e){}
        return base.apply(this,arguments);
      };
      wrapped.__v430Final=true;
      wrapped.__v428D6FinalOwner=true;
      wrapped.__v4225DetailOwner=true;
      try{window.renderDungeon=wrapped}catch(e){}
      try{renderDungeon=wrapped}catch(e){}
    }catch(e){console.error('V4.230 owner',e)}
  }

  try{
    const sec=document.getElementById('dungeon');
    if(sec?.classList.contains('active') && s?.dungeon?.layer==='dungeon' && s?.dungeon?.view==='map'){
      requestAnimationFrame(()=>{try{window.v430RenderDetail?.()}catch(e){}});
    }
  }catch(e){}
})();

/* ===== RETIRED v432-d7-final-script ===== */
(function(){
  const POS=[[13,16],[38,20],[63,25],[86,30],[13,46],[35,59],[53,70],[70,61],[87,48],[83,82]];

  function cleanName(s){
    return String(s||'')
      .replace(/\s+\d+\.\d+\s*$/,'')
      .replace(/\s*[–—-]\s*BOSS\s*$/i,'')
      .trim();
  }

  function applyD7(){
    const card=document.getElementById('dungeonMapCard');
    const di=Number(s?.dungeon?.selected||0);

    if(card) card.classList.toggle('v432-d7',di===6);
    if(!card || di!==6) return;

    const title=card.querySelector('.v261-title');
    if(title) title.innerHTML='DER VERBOTENE<br>GEWÄCHSHAUSTRAKT';

    card.querySelectorAll('[data-v261-room]').forEach((node,i)=>{
      const p=POS[i];
      if(p){
        node.style.setProperty('--x',String(p[0]));
        node.style.setProperty('--y',String(p[1]));
      }
      const name=node.querySelector('.v261-name');
      if(name) name.textContent=cleanName(name.textContent);
    });

    const line1=card.querySelector('.v261-line1');
    if(line1){
      const t=String(line1.textContent||'');
      line1.textContent=t.replace(
        /(\d+\s*·\s*)(.*?)(\s*[–—-]\s*BOSS)?$/i,
        (m,a,b,c)=>a+cleanName(b)+(c?' – BOSS':'')
      );
    }

    const sign=card.querySelector('.v261-signboard');
    if(sign) sign.innerHTML='ACHTUNG<br>VERBOTENES<br>GEWÄCHSHAUS<br>BETRETEN AUF<br>EIGENE GEFAHR!<small>☠</small>';
  }

  const latest=window.v430RenderDetail || window.v427RenderDetail || window.v426RenderDetail || window.v261RenderDetail;
  if(typeof latest!=='function') return;

  const detail=function(){
    const ok=latest.apply(this,arguments);
    try{applyD7()}catch(e){console.error('V4.232 D7 apply',e)}
    return ok;
  };
  detail.__v432Final=true;
  window.v432RenderDetail=detail;

  function install(){
    try{window.v251RenderDetail=detail;v251RenderDetail=detail}catch(e){}
    try{window.v244RenderSelectedDungeonMap=detail;v244RenderSelectedDungeonMap=detail}catch(e){}
    try{window.v064RenderMap=detail;v064RenderMap=detail}catch(e){}

    try{
      const current=window.renderDungeon || renderDungeon;
      if(typeof current==='function' && !current.__v432FinalOwner){
        const base=current;
        const wrapped=function(){
          try{
            if(s?.dungeon?.layer==='dungeon' && s?.dungeon?.view==='map') return detail();
          }catch(e){}
          return base.apply(this,arguments);
        };
        wrapped.__v432FinalOwner=true;
        wrapped.__v430Final=true;
        wrapped.__v428D6FinalOwner=true;
        wrapped.__v4225DetailOwner=true;
        try{window.renderDungeon=wrapped}catch(e){}
        try{renderDungeon=wrapped}catch(e){}
      }
    }catch(e){console.error('V4.232 D7 owner',e)}

    try{
      const sec=document.getElementById('dungeon');
      if(sec?.classList.contains('active') &&
         s?.dungeon?.layer==='dungeon' &&
         s?.dungeon?.view==='map' &&
         Number(s?.dungeon?.selected||0)===6){
        requestAnimationFrame(()=>{try{detail()}catch(e){}});
      }
    }catch(e){}
  }

  install();
  window.addEventListener('pageshow',()=>setTimeout(install,60),{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) setTimeout(install,60);
  },{passive:true});
})();
