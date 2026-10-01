/* ===== V4.02 compact seed interaction ===== */

/*
  Seed rows themselves select the seed. This removes one visible button
  from every row and makes the shop much easier to scan on a phone.
*/
document.addEventListener('click',e=>{
  const target=e.target;
  if(!(target instanceof Element))return;

  const card=target.closest('#grow .seed-card[data-seed]');
  if(!card)return;

  /* Buy remains a separate action handled by V4.02. */
  if(target.closest('[data-v232-seed-buy]'))return;

  e.preventDefault();
  e.stopImmediatePropagation();

  v232SelectSeed(card.dataset.seed);
},true);


/* Shorter labels in the equipment renderer. */
renderGrowEquipment=function(){
  v232EnsureGrowState();

  const box=document.querySelector('#growEquipment');
  if(!box)return;

  const lamp=Number(s.grow.equipment.lamp)||0;
  const pots=Number(s.grow.equipment.pots)||0;

  box.innerHTML=`
    <div class="equip-card">
      <div class="big">💡</div>
      <h4>Lampe · Lv. ${lamp}</h4>
      <div class="tiny">-8 % Zeit / Level</div>
      <button
        type="button"
        class="btn grow-upgrade"
        data-v232-grow-upgrade="lamp">
        Upgrade · ${120+lamp*140} G
      </button>
    </div>

    <div class="equip-card">
      <div class="big">🪴</div>
      <h4>Töpfe · Lv. ${pots}</h4>
      <div class="tiny">+10 % Ertrag / Level</div>
      <button
        type="button"
        class="btn grow-upgrade"
        data-v232-grow-upgrade="pots">
        Upgrade · ${130+pots*150} G
      </button>
    </div>
  `;
};


/* Compact seed rows. */
renderSeedShop=function(){
  v232EnsureGrowState();

  const box=document.querySelector('#seedShop');
  if(!box)return;

  box.innerHTML=Object.entries(seedTypes).map(([id,x])=>{
    const selected=s.grow.selectedSeed===id;
    const stock=Number(s.grow.seeds[id])||0;
    const seconds=Math.max(
      1,
      Math.round(Number(x.growMs)*lampSpeed()/1000)
    );

    return `
      <div
        class="seed-card ${selected?'selected':''}"
        data-seed="${id}"
        role="button"
        aria-label="${x.name} auswählen">

        <div class="big">${x.icon}</div>

        <h4>${x.name}</h4>

        <div class="tiny">
          ${seconds}s · Verkauf ${x.sell} G
        </div>

        <div class="seed-stock">
          <span>Vorrat</span><b>${stock}</b>
        </div>

        <button
          type="button"
          class="btn seed-buy"
          data-v232-seed-buy="${id}">
          Kaufen · ${x.buy} G
        </button>
      </div>
    `;
  }).join('');
};


/* V6.319: compact V234 render helpers remain for compatibility, but its
   obsolete startup repaint is retired. V4.92/V6.163 build the visible Growroom. */
