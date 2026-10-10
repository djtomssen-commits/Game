
/* ===== V4.02 Dampf UI Cleanup ===== */
const V028_DAMPF_ICON='💨';

/* V8.372 Beta: preserve live text nodes when Dampf labels are already
   canonical. This original owner runs after every base render. */
function v028WriteText(el,value){
  if(!el)return;
  if(!(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta'||(window.__GROW_SERVER1_PERFORMANCE_V8376__===true&&String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='server1'))||el.textContent!==value)el.textContent=value;
}
function v028ApplyDampfUI(){
  // Top resource label/value
  const energyEl=document.querySelector('#energy');
  if(energyEl){
    v028WriteText(energyEl,`${V028_DAMPF_ICON} ${Math.floor(s.energy||0)}/300`);
    const stat=energyEl.parentElement;
    if(stat){
      // Preserve only the resource label before the <b>
      const first=stat.childNodes[0];
      if(first && first.nodeType===3 && (!(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta'||(window.__GROW_SERVER1_PERFORMANCE_V8376__===true&&String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='server1'))||first.nodeValue!=='DAMPF')) first.nodeValue='DAMPF';
    }
  }

  // Quest costs: replace old symbols/text in rendered quest area only.
  const quests=document.querySelector('#quests');
  if(quests){
    quests.querySelectorAll('*').forEach(el=>{
      if(el.children.length===0 && typeof el.textContent==='string'){
        const original=el.textContent;
        const canonical=original
          .replace(/⚡\s*/g,`${V028_DAMPF_ICON} `)
          .replace(/🍀\s*(\d+)/g,`${V028_DAMPF_ICON} $1`)
          .replace(/\bEnergie\b/g,'Dampf');
        if(!(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta'||(window.__GROW_SERVER1_PERFORMANCE_V8376__===true&&String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='server1'))||canonical!==original)el.textContent=canonical;
      }
    });
  }

  // Refill button/labels
  const refill=document.querySelector('#v026RefillBtn');
  if(refill) v028WriteText(refill,`🟢 +20 ${V028_DAMPF_ICON} Dampf`);

  // Any leftover simple "Energie" labels anywhere in the app.
  document.querySelectorAll('body *').forEach(el=>{
    if(el.children.length===0 && typeof el.textContent==='string'){
      const original=el.textContent;
      if(!(String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta'||(window.__GROW_SERVER1_PERFORMANCE_V8376__===true&&String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='server1'))){
        el.textContent=original.replace(/\bEnergie\b/g,'Dampf');
      }else if(original.includes('Energie')){
        const canonical=original.replace(/\bEnergie\b/g,'Dampf');
        if(canonical!==original)el.textContent=canonical;
      }
    }
  });
}

// Replace old V4.02 painter if present.
v026PaintDampf=function(){
  const energyEl=document.querySelector('#energy');
  if(energyEl)v028WriteText(energyEl,`${V028_DAMPF_ICON} ${Math.floor(s.energy||0)}/300`);
  v028ApplyDampfUI();
};

// Make sure the UI is cleaned after every render.
const v028OldRender=render;
render=function(){
  v028OldRender();
  v028ApplyDampfUI();
};

try{v028ApplyDampfUI();render()}catch(e){console.error('V4.02 Dampf UI',e)}
