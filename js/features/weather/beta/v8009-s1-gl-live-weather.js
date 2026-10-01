(()=>{
'use strict';
if(window.__GL_LIVE_WEATHER__)return;window.__GL_LIVE_WEATHER__=true;
const CFG={lat:51.1657,lon:10.4515,name:'Deutschland-Mitte',cacheKey:'growLegends:liveWeather:v1',refreshMs:60*60*1000};
const DEFAULT={kind:'neutral',icon:'🌤️',label:'Server-Wetter',temp:null,code:null,isDay:1,updatedAt:0,bonus:{growMul:1,yieldMul:1,extraSeedChance:0,rareSeedChance:0,text:'Kein Wetterbonus'}};

function weatherMenuHtml(){
 const w=window.GL_WEATHER||DEFAULT,temp=Number.isFinite(Number(w.temp))?`${Math.round(Number(w.temp))} °C`:'';
 return `<div class="glw-menu-icon">${w.icon||'🌤️'}</div><div class="glw-menu-copy"><small>LIVE-WETTER</small><b>${w.label||'Server-Wetter'}</b><span>${w?.bonus?.text||'Kein Wetterbonus'}</span></div><div class="glw-menu-temp">${temp}</div>`
}
function ensureMenuWeather(){
 const panel=document.getElementById('v032MenuPanel');if(!panel)return false;
 let box=panel.querySelector(':scope > #glWeatherMenu');
 if(!box){box=document.createElement('div');box.id='glWeatherMenu';box.setAttribute('role','status');panel.prepend(box)}
 const html=weatherMenuHtml();if(box.__glWeatherHtml!==html){box.__glWeatherHtml=html;box.innerHTML=html}
 return true;
}
function bindWeatherMenuObserver(){
 /* V6.215: menu observer retired; menu-open/account lifecycle hooks refresh directly. */
 return false;
}
function paintWeatherSlots(){
 const w=window.GL_WEATHER||DEFAULT;
 const home=document.querySelector('#world .glw-home-slot');
 if(home){
  const icon=home.querySelector('.glw-home-icon'),title=home.querySelector('.glw-home-copy b'),bonus=home.querySelector('.glw-home-copy span'),temp=home.querySelector('.glw-home-temp');
  if(icon)icon.textContent=w.icon||'🌤️';if(title)title.textContent=w.label||'Server-Wetter';if(bonus)bonus.textContent=w?.bonus?.text||'Kein Wetterbonus';if(temp)temp.textContent=Number.isFinite(Number(w.temp))?`${Math.round(Number(w.temp))} °C`:'';
 }
 const grow=document.querySelector('#grow .glw-grow-card');
 if(grow&&typeof window.GL_WEATHER_growCard==='function'){
  const wrap=document.createElement('div');wrap.innerHTML=window.GL_WEATHER_growCard();const next=wrap.firstElementChild;if(next)grow.replaceWith(next)
 }
}

function safeParse(v){try{return JSON.parse(v)}catch(e){return null}}
function classify(cur){
 const code=Number(cur?.weather_code),day=Number(cur?.is_day)!==0,rain=Number(cur?.rain||0)+Number(cur?.showers||0),snow=Number(cur?.snowfall||0);
 if([95,96,99].includes(code))return {kind:'thunder',icon:'⛈️',label:'Gewitter',bonus:{growMul:1.15,yieldMul:1,extraSeedChance:0,rareSeedChance:0,text:'Wachstum +15 %'}};
 if(snow>0||[71,73,75,77,85,86].includes(code))return {kind:'snow',icon:'❄️',label:'Schnee / Frost',bonus:{growMul:.95,yieldMul:1,extraSeedChance:0,rareSeedChance:.10,text:'Seltene-Samen-Chance +10 % · Wachstum −5 %'}};
 if([45,48].includes(code))return {kind:'fog',icon:'🌫️',label:'Nebel',bonus:{growMul:1,yieldMul:1,extraSeedChance:.08,rareSeedChance:0,text:'Zusatz-Samen-Chance +8 %'}};
 if(rain>0||[51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))return {kind:'rain',icon:'🌧️',label:'Regen',bonus:{growMul:1.10,yieldMul:1,extraSeedChance:0,rareSeedChance:0,text:'Wachstum +10 %'}};
 if(day&&code===0)return {kind:'sun',icon:'☀️',label:'Sonne',bonus:{growMul:1,yieldMul:1.12,extraSeedChance:0,rareSeedChance:0,text:'Ertrag +12 %'}};
 if(!day&&code===0)return {kind:'clear-night',icon:'🌙',label:'Klare Nacht',bonus:{growMul:1,yieldMul:1,extraSeedChance:0,rareSeedChance:0,text:'Kein Wetterbonus'}};
 if([1,2,3].includes(code))return {kind:'cloud',icon:'☁️',label:code===1?'Leicht bewölkt':'Bewölkt',bonus:{growMul:1.05,yieldMul:1.05,extraSeedChance:0,rareSeedChance:0,text:'Wachstum +5 % · Ertrag +5 %'}};
 return {kind:'neutral',icon:'🌤️',label:'Wechselhaft',bonus:{growMul:1,yieldMul:1,extraSeedChance:0,rareSeedChance:0,text:'Kein Wetterbonus'}};
}
function currentMul(){return Math.max(.8,Math.min(1.3,Number(window.GL_WEATHER?.bonus?.growMul)||1))}
function preservePlantProgress(oldMul,newMul){
 try{
  if(!window.s?.grow?.plants||Math.abs(oldMul-newMul)<.0001)return;
  const now=Date.now();let changed=false;
  s.grow.plants.forEach(p=>{if(!p)return;const dur=Math.max(1,Number(p.duration)||1),elapsed=Math.max(0,now-Number(p.start||now)),prog=Math.max(0,Math.min(1,(elapsed*oldMul)/dur));if(prog>=1)return;p.start=Math.round(now-(prog*dur/newMul));changed=true});
  if(changed){try{typeof persist==='function'&&persist(false)}catch(e){};resyncPush()}
 }catch(e){console.warn('Live-Wetter Pflanzenfortschritt',e)}
}
function resyncPush(){
 try{
  const plants=(s?.grow?.plants||[]).filter(Boolean);if(!plants.length)return;
  const mul=currentMul(),next=Math.min(...plants.map(p=>(Number(p.start)||Date.now())+Math.round((Number(p.duration)||0)/mul)));
  if(Number.isFinite(next)&&typeof window.glSyncGrowPushJob==='function')void window.glSyncGrowPushJob(next);
  if(typeof window.glSyncGrowCarePushJob==='function')void window.glSyncGrowCarePushJob();
 }catch(e){}
}
function ensureUi(){
 const layer=document.getElementById('glWeatherLayer');if(layer)layer.remove();
 let badge=document.getElementById('glWeatherBadge');if(!badge){badge=document.createElement('div');badge.id='glWeatherBadge';document.body.appendChild(badge)}
 return badge;
}
function apply(state,{preserve=true}={}){
 const prev=currentMul(),next=Math.max(.8,Math.min(1.3,Number(state?.bonus?.growMul)||1));
 if(preserve)preservePlantProgress(prev,next);
 const prevKind=window.GL_WEATHER?.kind||'';
 window.GL_WEATHER={...DEFAULT,...state,bonus:{...DEFAULT.bonus,...(state?.bonus||{})}};
 if(prevKind!==window.GL_WEATHER.kind||document.body.dataset.glWeather!==window.GL_WEATHER.kind){
  ['sun','cloud','rain','fog','thunder','snow','clear-night','neutral'].forEach(k=>document.body.classList.remove('glw-'+k));document.body.classList.add('glw-'+window.GL_WEATHER.kind);
  document.body.dataset.glWeather=window.GL_WEATHER.kind;
 }
 ensureUi();ensureMenuWeather();bindWeatherMenuObserver();paintWeatherSlots();
}
window.GL_WEATHER_growCard=()=>{const w=window.GL_WEATHER||DEFAULT;return `<div class="glw-grow-card"><div class="ico">${w.icon}</div><div><b>Live-Wetter · ${w.label}</b><span>${w.bonus.text}</span></div><em>${Number.isFinite(Number(w.temp))?Math.round(Number(w.temp))+' °C':''}</em></div>`};
window.GL_WEATHER_applyHarvestBonus=(ready)=>{
 try{
  const w=window.GL_WEATHER||DEFAULT,b=w.bonus||DEFAULT.bonus,plants=Array.isArray(ready)?ready:[];let text='';
  const names={moss:'White Widow',lime:'Northern Lights',jack:'Jack Herer',violet:'Purple Haze',blue:'Blue Dream',critical:'Critical+',nebula:'OG Kush',lemon:'Lemon Haze',gorilla:'Gorilla Glue',greencrack:'Green Crack',amnesia:'Amnesia Haze',emerald:'Smaragd OG'};
  if(plants.length&&Number(b.extraSeedChance)>0&&Math.random()<Number(b.extraSeedChance)){
   const p=plants[Math.floor(Math.random()*plants.length)],id=p?.seed;if(id&&s?.grow?.seeds){s.grow.seeds[id]=(Number(s.grow.seeds[id])||0)+1;text+=` · ${w.icon} Wetter-Samen: +1 ${names[id]||id}`}
  }
  if(Number(b.rareSeedChance)>0&&Math.random()<Number(b.rareSeedChance)&&s?.grow?.seeds){
   const pool=['violet','blue','critical','nebula','lemon'];const id=pool[Math.floor(Math.random()*pool.length)];s.grow.seeds[id]=(Number(s.grow.seeds[id])||0)+1;text+=` · ❄️ Seltener Wetter-Samen: +1 ${names[id]||id}`
  }
  return {text};
 }catch(e){return {text:''}}
};
async function fetchWeather(force=false){
 try{
  const cached=safeParse(localStorage.getItem(CFG.cacheKey)||'');if(!force&&cached&&Date.now()-Number(cached.updatedAt||0)<45*60*1000){apply(cached);return cached}
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),8000);
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${CFG.lat}&longitude=${CFG.lon}&current=temperature_2m,precipitation,rain,showers,snowfall,weather_code,cloud_cover,is_day&timezone=Europe%2FBerlin`;
  const res=await fetch(url,{signal:ctl.signal,cache:'no-store'});clearTimeout(to);if(!res.ok)throw new Error('weather '+res.status);const j=await res.json(),cur=j?.current||{};const c=classify(cur),state={...c,temp:Number(cur.temperature_2m),code:Number(cur.weather_code),isDay:Number(cur.is_day),updatedAt:Date.now()};localStorage.setItem(CFG.cacheKey,JSON.stringify(state));apply(state);return state;
 }catch(e){
  const cached=safeParse(localStorage.getItem(CFG.cacheKey)||'');if(cached)apply(cached,{preserve:false});else apply(DEFAULT,{preserve:false});
setTimeout(()=>{ensureMenuWeather();bindWeatherMenuObserver()},120);console.warn('Grow Legends Live-Wetter nicht erreichbar',e);return null;
 }
}
window.GL_WEATHER_refresh=()=>fetchWeather(true);
document.addEventListener('click',e=>{if(e.target?.closest?.('#v032MenuBtn,#v032MenuToggle,.v366-menu,#v372TopbarShell .v372-menu'))requestAnimationFrame(()=>{ensureMenuWeather();bindWeatherMenuObserver()})},true);
['growlegends:account-ready','growlegends:extras-ready','growlegends:foreground-ready'].forEach(ev=>window.addEventListener(ev,()=>requestAnimationFrame(()=>{ensureMenuWeather();bindWeatherMenuObserver()})));

const cached=safeParse(localStorage.getItem(CFG.cacheKey)||'');if(cached)apply(cached,{preserve:false});else apply(DEFAULT,{preserve:false});
setTimeout(()=>fetchWeather(false),350);setInterval(()=>{if(!document.hidden)fetchWeather(true)},CFG.refreshMs);
window.addEventListener('pageshow',()=>{if(Date.now()-Number(window.GL_WEATHER?.updatedAt||0)>45*60*1000)fetchWeather(true)},{passive:true});
window.addEventListener('online',()=>fetchWeather(true),{passive:true});
})();
