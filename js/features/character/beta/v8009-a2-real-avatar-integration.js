/* ===== V4.02 real avatar integration ===== */
const V080_AVATARS={"grower": "assets/v7198-base64/c2ef1bb4cddd8d7fd4a7.webp", "bruiser": "assets/v7198-base64/9abf2e30103c8d4fbdbb.webp", "scout": "assets/v7198-base64/75e355872d1f5d02cca6.webp", "frost": "assets/v7198-base64/26f59a48b1d10122f12b.webp"};

function v080AvatarFor(classId){
  return V080_AVATARS[classId] || V080_AVATARS.grower;
}

function v4143RefreshBootArt(){
  try{
    const labels={grower:"Bud-Barbar",scout:"Blatt-Schütze",bruiser:"Bong-Magier",frost:"Bekiffter Frost-Todesritter",summoner:"Harzruferin"};
    document.querySelectorAll(".v4143-boot-char[data-class]").forEach(img=>{
      const cls=img.dataset.class||"grower";
      img.src=v080AvatarFor(cls);
      img.alt=labels[cls]||"Grow Legends Charakter";
      img.loading="eager";
      img.decoding="sync";
    });
  }catch(e){}
}
window.v4143RefreshBootArt=v4143RefreshBootArt;

/* Replace the generated SVG portrait from V4.02 with the new class artwork. */
v41ClassPortrait=function(){
  const src=v080AvatarFor(s.playerClass);
  const alt=classes?.[s.playerClass]?.name || 'Grow Legends Charakter';
  return `<img class="v080-class-avatar-img" src="${src}" alt="${alt}">`;
};

v41InstallPortrait=function(){
  const scene=document.querySelector('.avatar-scene');
  if(!scene)return;
  const src=v080AvatarFor(s.playerClass);
  const alt=classes?.[s.playerClass]?.name || 'Grow Legends Charakter';
  scene.innerHTML=`<div class="v41-portrait"><img class="v080-class-avatar-img" src="${src}" alt="${alt}"></div>`;
};

/* Own character profile/avatar renderer. */
const v080OldRenderClassAvatar=renderClassAvatar;
renderClassAvatar=function(){
  try{v080OldRenderClassAvatar()}catch(e){}
  v41InstallPortrait();
  try{
    if(typeof v079UpdateBuffFx==='function')v079UpdateBuffFx();
    else if(typeof v077InjectCharacterFx==='function')v077InjectCharacterFx();
  }catch(e){console.error('V4.02 buff fx',e)}
};

/* Replace the mandatory class-selection popup with image cards. */
v029ShowClassChoice=function(){
  if(s.playerClass || document.querySelector('#v029ClassModal')) return;

  const modal=document.createElement('div');
  modal.id='v029ClassModal';
  modal.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto';

  modal.innerHTML=`
    <div style="max-width:720px;width:100%;background:#111a12;border:1px solid #41583e;border-radius:18px;padding:18px">
      <h2 style="margin-top:0">Wähle deine Legende</h2>
      <div class="muted" style="margin-bottom:12px">
        Deine Klasse wird für diesen Charakter dauerhaft festgelegt.
      </div>
      <div class="class-grid">
        ${Object.entries(classes).map(([id,c])=>`
          <button class="class-card" data-v029-class="${id}">
            <img class="v080-choice-img" src="${v080AvatarFor(id)}" alt="${c.name}">
            <h4>${c.name}</h4>
            <p>${c.text}</p>
          </button>
        `).join('')}
      </div>
    </div>`;

  document.body.appendChild(modal);

  modal.querySelectorAll('[data-v029-class]').forEach(btn=>{
    btn.onclick=()=>{
      const id=btn.dataset.v029Class;
      if(!confirm(`${classes[id].name} wirklich wählen? Die Klasse kann später nicht gewechselt werden.`))return;
      s.playerClass=id;
      s.classLocked=true;
      localStorage.setItem(KEY,JSON.stringify(s));
      modal.remove();
      render();
    };
  });
};

/* Portrait refresh is owned directly by renderClassAvatar; no global render wrapper. */
try{v41InstallPortrait()}catch(e){console.error('V4.02 avatar init',e)}
