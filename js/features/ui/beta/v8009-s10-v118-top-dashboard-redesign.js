function v118WorldBossHeroHtml(){
  v112EnsureWorldBossState();
  const used=!!s.v110WorldBoss.freeUsed;
  const attempts=Number(s.v110WorldBoss.attempts)||0;
  const wins=Number(s.v110WorldBoss.wins)||0;

  return `<div id="v118WorldBossHero">
    <div class="v118-boss-copy">
      <div class="v118-event-ribbon">LIVE EVENT</div>
      <div class="v118-boss-kicker">MYSTISCHER WELTBOSS</div>
      <div class="v118-boss-name">Smaragd-<br>Koloss</div>
      <div class="v118-boss-features">
        <span>Extrem schwer</span>
        <span>Skaliert mit deinem Charakter</span>
        <span>Garantierte mystische Beute bei Sieg</span>
      </div>
      <div class="v118-boss-actions">
        <button type="button" class="btn" data-v111-openboss>⚔️ HERAUSFORDERN</button>
        <div class="v118-boss-meta">
          Versuche <b>${attempts}</b> · Siege <b>${wins}</b><br>
          ${used?'Nächster Versuch: 10 Harz-Taler':'Kostenloser Versuch verfügbar'}
        </div>
      </div>
    </div>
    <div class="v118-boss-art">
      <div class="v118-boss-aura"></div>
      <div class="v118-vine left"></div><div class="v118-vine right"></div>
      <div class="v118-boss-body">
        <div class="v118-boss-head"></div>
        <div class="v118-boss-crystal c1"></div>
        <div class="v118-boss-crystal c2"></div>
        <div class="v118-boss-crystal c3"></div>
      </div>
      <div class="v118-ground"></div>
    </div>
  </div>`;
}

/* Replace the old lower worldboss card with the large top hero. */
v111InstallWorldBossCard=function(){
  if(window.__V483_MODERN_WORLD_ONLY__){document.querySelector('#v111WorldBossCard')?.remove();document.querySelector('#v118WorldBossHero')?.remove();return;}
  const world=document.querySelector('#world');
  if(!world)return;

  document.querySelector('#v110WorldBossBtn')?.remove();
  document.querySelector('#v111WorldBossCard')?.remove();

  let hero=document.querySelector('#v118WorldBossHero');

  if(!v110MysticEventActive()){
    hero?.remove();
    return;
  }

  const dashboard=world.querySelector('.v085-dashboard')||world;

  if(!hero){
    const wrap=document.createElement('div');
    wrap.innerHTML=v118WorldBossHeroHtml();
    hero=wrap.firstElementChild;
    dashboard.insertBefore(hero,dashboard.firstChild);
  }else{
    /* Refresh only dynamic meta by rebuilding at top. */
    const first=dashboard.firstElementChild;
    if(first!==hero)dashboard.insertBefore(hero,first);
    const meta=hero.querySelector('.v118-boss-meta');
    if(meta){
      v112EnsureWorldBossState();
      meta.innerHTML=`Versuche <b>${Number(s.v110WorldBoss.attempts)||0}</b> · Siege <b>${Number(s.v110WorldBoss.wins)||0}</b><br>${s.v110WorldBoss.freeUsed?'Nächster Versuch: 10 Harz-Taler':'Kostenloser Versuch verfügbar'}`;
    }
  }
};

/* Make world rendering install boss hero immediately, before lower content is used. */
const v118OldInstallWorld=v085InstallWorld;
v085InstallWorld=function(){
  v118OldInstallWorld();
  if(!window.__V483_MODERN_WORLD_ONLY__)requestAnimationFrame(v111InstallWorldBossCard);
};

const v118BaseRender=render;
render=function(){
  const result=v118BaseRender();
  
  if(!window.__V483_MODERN_WORLD_ONLY__)requestAnimationFrame(v111InstallWorldBossCard);
  return result;
};

/* V4.86: retired V118 old-home worldboss hero startup install. */
