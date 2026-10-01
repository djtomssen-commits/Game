
/* V7.160: stable compatibility only — NO resize/visibility DOM rebuilds. */
function v126PreloadAvatar(){
  try{
    const src=(typeof v080AvatarFor==='function')?v080AvatarFor(s.playerClass):'';
    if(!src)return;
    window.__v126AvatarPreload??={};
    if(window.__v126AvatarPreload[src])return;
    const img=new Image();img.loading='eager';img.decoding='sync';img.src=src;window.__v126AvatarPreload[src]=img;
  }catch(_){ }
}
function v126RepairAvatar(){return true}
function v126RepairEquipment(){return true}
function v126RepairCharacter(){return true}
window.v126RepairCharacter=window.v126RepairCharacter||v126RepairCharacter;
window.__V7126_V126_AUTOREPAIR_RETIRED__=true;
window.__V7160_V126_RESIZE_REBUILD_RETIRED__=true;
if(typeof V125_ATTRS!=='undefined'){
  const exact={staerke:'Hauptschaden beim Bud-Barbar',geschick:'Hauptschaden beim Blatt-Schützen · erhöht Ausweichen',intelligenz:'Hauptschaden beim Bong-Magier',ausdauer:'Erhöht Lebenspunkte und Verteidigung',glueck:'Erhöht Krit-Chance und beeinflusst Beute'};
  V125_ATTRS.forEach(row=>{if(exact[row[0]])row[3]=exact[row[0]]});
}
v126PreloadAvatar();
