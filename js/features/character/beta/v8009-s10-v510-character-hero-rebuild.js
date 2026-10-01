(function(){
  'use strict';
  let busy=false;

  function move(parent,node){
    if(parent&&node&&node.parentElement!==parent)parent.appendChild(node);
  }
  function build(){
    if(busy)return;
    busy=true;
    try{
      const character=document.getElementById('character');
      const hero=character?.querySelector(':scope > .hero-card');
      if(!character||!hero)return;
      character.classList.add('v510-char');

      let root=document.getElementById('v510HeroRoot');
      if(!root){
        root=document.createElement('section');
        root.id='v510HeroRoot';
        root.innerHTML=`
          <div class="v510-titlebar">HELDENQUARTIER</div>
          <div class="v510-stage">
            <div class="v510-layout">
              <div class="v510-col v510-left"></div>
              <div class="v510-center">
                <div class="v510-portrait"></div>
              </div>
              <div class="v510-col v510-right"></div>
            </div>
            <div class="v510-secondary"></div>
          </div>
          <div class="v510-footer">
            <div class="v510-stats"></div>
          </div>`;
        hero.prepend(root);
      }

      const left=root.querySelector('.v510-left');
      const right=root.querySelector('.v510-right');
      const center=root.querySelector('.v510-center');
      const portrait=root.querySelector('.v510-portrait');
      const secondary=root.querySelector('.v510-secondary');
      const stats=root.querySelector('.v510-stats');
      const footer=root.querySelector('.v510-footer');

      ['slot-head','slot-weapon','slot-weapon2','slot-ring'].forEach(id=>move(left,document.getElementById(id)));
      ['slot-body','slot-boots','slot-amulet'].forEach(id=>move(right,document.getElementById(id)));

      const scene=document.querySelector('#character .avatar-scene');
      const name=document.getElementById('avatarTitle');
      const sub=document.getElementById('avatarSubtitle');
      const level=document.querySelector('#character .level-shield');
      const xp=document.querySelector('#character .center-xp');
      /* V6.115: Book + Pet are owned exclusively by .v514-book-host.
         Never pull the Illegal Book back above the EXP bar. */
      move(portrait,scene);
      [name,sub,level,xp].forEach(n=>move(center,n));

      const grow=document.getElementById('v492CharGrowBuff');
      const buds=document.querySelector('#character .v204-avatar-badge');
      /* V6.117: Class passive is owned by V5.14's visible footer row.
         Do NOT move it back into .v510-secondary, because that donor area is
         hidden in the final Heldenquartier layout. */
      [grow,buds].forEach(n=>move(secondary,n));

      const bottom=hero.querySelector('.v459-hero-bottom,.char-bottom');
      const boxes=bottom?[...bottom.querySelectorAll('.combat-row .combat-box')]:[];
      boxes.forEach((b,i)=>{
        b.classList.toggle('hp',i===0);
        b.classList.toggle('power',i===1);
        move(stats,b);
      });
      const setSummary=document.getElementById('v459SetSummary');
      move(footer,setSummary);

      /* old stage is now only a hidden donor; nothing visible is duplicated */
      hero.querySelector('.character-stage')?.setAttribute('aria-hidden','true');
      bottom?.setAttribute('aria-hidden','true');
    }catch(e){console.warn('V5.10 character rebuild',e)}
    finally{busy=false}
  }

  window.v510BuildCharacter=build;

  /* Character navigation/stability lifecycles own structural re-parenting.
     Data renders update the already-moved nodes in place. */
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')build()});
  window.__v510GoWrapped='v7119-event';

  build();
  document.addEventListener('DOMContentLoaded',build,{once:true});
})();
