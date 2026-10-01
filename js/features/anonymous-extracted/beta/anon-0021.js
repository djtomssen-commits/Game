
/* ===== V4.02 legendary seed currency + portrait FX fix ===== */

/* Correct currency: Grow Legends uses s.harzTaler, not s.resin. */
v077BuySeed=function(){
  s.v077 ??={seeds:0,lastPlantAt:0,planted:null,buff:null};

  const balance=Number(s.harzTaler)||0;

  if(balance<V077_COST){
    if(typeof v063Toast==='function'){
      v063Toast(
        'Nicht genug Harz-Taler',
        'error',
        `Benötigt: ${V077_COST} · Vorhanden: ${balance}`
      );
    }
    return;
  }

  s.harzTaler=balance-V077_COST;
  s.v077.seeds=(Number(s.v077.seeds)||0)+1;

  localStorage.setItem(KEY,JSON.stringify(s));

  /* Update HUD immediately. */
  try{
    if(typeof v069SyncCurrencies==='function')v069SyncCurrencies();
  }catch(e){}

  if(typeof v063Toast==='function'){
    v063Toast(
      'Wundertüte OG gekauft',
      'success',
      `1 Samen erhalten · Harz-Taler: ${s.harzTaler}`
    );
  }

  try{render();}catch(e){console.error('Render after seed buy',e);}
};

/* Robustly find the actual character portrait container.
   Supports img-based portraits AND CSS/avatar containers used by current UI. */
function v079FindPortraitHost(){
  const screen=document.querySelector('#character');
  if(!screen)return null;

  const selectors=[
    '.v41-portrait',
    '.center-hero',
    '.character-stage',
    '.hero-portrait',
    '.character-portrait',
    '.avatar',
    '.portrait'
  ];

  for(const sel of selectors){
    const el=screen.querySelector(sel);
    if(el && el.offsetWidth>70 && el.offsetHeight>70){
      return el;
    }
  }

  const imgs=[...screen.querySelectorAll('img')]
    .filter(el=>el.offsetWidth>70 && el.offsetHeight>70)
    .sort((a,b)=>(b.offsetWidth*b.offsetHeight)-(a.offsetWidth*a.offsetHeight));

  if(imgs[0])return imgs[0].parentElement||imgs[0];

  /* Last-resort: largest visible central element. */
  const candidates=[...screen.querySelectorAll('div')]
    .filter(el=>el.offsetWidth>100 && el.offsetHeight>120 && el.offsetHeight<500)
    .sort((a,b)=>(b.offsetWidth*b.offsetHeight)-(a.offsetWidth*a.offsetHeight));

  return candidates[0]||null;
}

function v079RemoveBuffFx(){
  document.querySelectorAll(
    '#character .v079-buff-fx,#character .v079-buff-ring,#character .v079-buff-label'
  ).forEach(el=>el.remove());

  document.querySelectorAll('#character .v079-buff-host')
    .forEach(el=>el.classList.remove('v079-buff-host'));
}

function v079UpdateBuffFx(){
  v079RemoveBuffFx();

  const buff=v077Buff();
  if(!buff)return;

  const host=v079FindPortraitHost();
  if(!host)return;

  host.classList.add('v079-buff-host');

  const fx=document.createElement('div');
  fx.className='v079-buff-fx';

  const ring=document.createElement('div');
  ring.className='v079-buff-ring';

  const label=document.createElement('div');
  label.className='v079-buff-label';
  label.textContent=`${v077BuffLabel(buff.type)} · ${v077Fmt(buff.until-Date.now())}`;

  host.appendChild(ring);
  host.appendChild(fx);
  host.appendChild(label);
}

/* Replace the older fragile V4.02 portrait FX hook. */
v077InjectCharacterFx=v079UpdateBuffFx;

/* V6.317: V4.99 permanently disables the Wundertüte buff. Keep the cleanup
   helper for old DOM leftovers, but no longer hook it into render() or a 1 s poller. */
try{v079RemoveBuffFx()}catch(e){}
