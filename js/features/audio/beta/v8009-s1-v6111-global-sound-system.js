(()=>{
'use strict';
if(window.__V6111_GLOBAL_SOUND_SYSTEM__)return;
window.__V6111_GLOBAL_SOUND_SYSTEM__=true;
const SETTINGS_KEY=(typeof V141_SETTINGS_KEY==='string'?V141_SETTINGS_KEY:'growLegendsSettingsV141');
let ctx=null,gain=null,comp=null,noiseBuf=null,unlocked=false;
const last=new Map(),active=new Set();

function cfg(){
 try{
  if(typeof v141Settings==='object'){
   if(!Number.isFinite(Number(v141Settings.sfxVolume)))v141Settings.sfxVolume=.72;
   if(!Number.isFinite(Number(v141Settings.musicVolume)))v141Settings.musicVolume=.70;
   return v141Settings;
  }
 }catch(e){}
 return {sound:true,sfxVolume:.72,musicVolume:.70};
}
function enabled(){const x=cfg();return x.sound!==false&&Number(x.sfxVolume??.72)>0}
function ensure(){
 if(ctx)return true;
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
 try{
  const shared=typeof window.v6109GetAudioContext==='function'?window.v6109GetAudioContext():null;
  ctx=shared||new AC({latencyHint:'interactive'});
  comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=16;comp.ratio.value=5;comp.attack.value=.003;comp.release.value=.13;
  gain=ctx.createGain();gain.gain.value=Math.max(0,Math.min(1,Number(cfg().sfxVolume??.72)))*.34;gain.connect(comp);comp.connect(ctx.destination);
  noiseBuf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.7),ctx.sampleRate);const d=noiseBuf.getChannelData(0);let seed=6111;
  for(let i=0;i<d.length;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=(seed/4294967296)*2-1}
  return true;
 }catch(e){return false}
}
async function unlock(){unlocked=true;if(!ensure())return;try{if(ctx.state==='suspended')await ctx.resume()}catch(e){}}
function setSfxVolume(v){const n=Math.max(0,Math.min(1,Number(v)||0));try{v141Settings.sfxVolume=n;localStorage.setItem(SETTINGS_KEY,JSON.stringify(v141Settings))}catch(e){}try{if(gain&&ctx)gain.gain.setTargetAtTime(n*.34,ctx.currentTime,.02)}catch(e){}}
window.v6111SetSfxVolume=setSfxVolume;
function out(v){const g=ctx.createGain();g.gain.value=v;g.connect(gain);return g}
function tone(f,d=.08,v=.12,type='sine',delay=0,endF=null){if(!ctx)return;const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=out(v);o.type=type;o.frequency.setValueAtTime(Math.max(20,f),t);if(endF)o.frequency.exponentialRampToValueAtTime(Math.max(20,endF),t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);o.start(t);o.stop(t+d+.02);active.add(o);o.onended=()=>{active.delete(o);try{o.disconnect();g.disconnect()}catch(e){}}}
function noise(d=.08,v=.08,delay=0,f=1800){if(!ctx||!noiseBuf)return;const t=ctx.currentTime+delay,s=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),g=out(v);s.buffer=noiseBuf;bp.type='bandpass';bp.frequency.value=f;bp.Q.value=.8;s.connect(bp);bp.connect(g);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.start(t,0,d);s.stop(t+d+.01);active.add(s);s.onended=()=>{active.delete(s);try{s.disconnect();bp.disconnect();g.disconnect()}catch(e){}}}
function seq(a,v=.1,type='sine'){a.forEach(([f,t,d=.08,m=1])=>tone(f,d,v*m,type,t))}
function ok(name){const cd={click:45,hit:85,enemyHit:85,crit:130,reward:550,pet:500,success:300,notification:300,care:180}[name]??90,now=performance.now(),prev=Number(last.get(name)||0);if(now-prev<cd)return false;last.set(name,now);return true}
function play(name){
 if(!enabled()||document.hidden||!unlocked||!ok(name)||!ensure())return;
 if(ctx.state==='suspended'){ctx.resume().catch(()=>{});return}
 switch(name){
  case'click':tone(420,.035,.055,'triangle',0,520);noise(.025,.018,0,1200);break;
  case'open':seq([[260,0,.055],[390,.045,.06],[520,.09,.07]],.065,'triangle');break;
  case'close':seq([[430,0,.05],[300,.045,.065]],.055,'triangle');break;
  case'buy':seq([[720,0,.055],[980,.06,.065],[1320,.12,.085]],.095);noise(.04,.025,.02,2700);break;
  case'sell':seq([[1050,0,.045],[760,.055,.055],[540,.11,.08]],.085,'triangle');noise(.055,.025,.03,2300);break;
  case'equip':noise(.07,.08,0,950);tone(205,.08,.10,'square',0,250);tone(690,.08,.065,'triangle',.045,820);break;
  case'unequip':tone(680,.06,.065,'triangle');tone(420,.075,.055,'triangle',.055);break;
  case'autoEquip':noise(.055,.075,0,1100);seq([[330,0,.06],[495,.05,.07],[660,.10,.08]],.075,'triangle');break;
  case'dismantle':noise(.14,.13,0,780);tone(150,.12,.11,'square',0,95);noise(.10,.07,.08,2300);break;
  case'forge':noise(.075,.14,0,900);tone(125,.11,.13,'square',0,85);seq([[440,.11,.08],[660,.17,.09],[880,.24,.12]],.075,'triangle');break;
  case'reroll':noise(.18,.055,0,1500);seq([[310,.02,.04],[390,.07,.04],[470,.12,.05]],.055,'triangle');break;
  case'socket':seq([[980,0,.055],[1480,.055,.09]],.085);break;
  case'enchant':seq([[440,0,.08],[660,.05,.08],[990,.11,.12]],.075);noise(.12,.025,.04,3400);break;
  case'reward':seq([[523,0,.08],[659,.075,.08],[784,.15,.09],[1047,.23,.14]],.085,'triangle');break;
  case'pet':seq([[740,0,.07],[990,.07,.08],[1240,.14,.12]],.085);break;
  case'achievement':seq([[392,0,.08],[523,.08,.08],[659,.16,.09],[784,.24,.14]],.095,'triangle');break;
  case'levelup':seq([[330,0,.08],[440,.07,.08],[554,.14,.08],[660,.21,.09],[880,.29,.16]],.10,'triangle');break;
  case'plant':tone(170,.07,.06,'sine',0,115);noise(.05,.025,.025,900);tone(520,.07,.035,'sine',.06,620);break;
  case'care':noise(.09,.025,0,2600);seq([[620,.03,.06],[760,.085,.07]],.045);break;
  case'harvest':noise(.18,.045,0,1800);seq([[360,.02,.06],[520,.08,.07],[720,.15,.09],[980,.23,.12]],.065,'triangle');break;
  case'questStart':noise(.09,.025,0,1100);seq([[290,.02,.06],[430,.08,.08]],.055,'triangle');break;
  case'battleStart':tone(92,.15,.10);noise(.075,.08,0,650);tone(116,.15,.10,'sine',.16);noise(.075,.08,.16,650);break;
  case'hit':noise(.065,.085,0,1000);tone(145,.065,.075,'square',0,95);break;
  case'enemyHit':noise(.075,.09,0,760);tone(112,.08,.085,'square',0,72);break;
  case'crit':noise(.11,.13,0,1250);tone(105,.12,.13,'square',0,65);tone(1180,.11,.075,'triangle',.025,1650);break;
  case'dodge':noise(.15,.05,0,3200);tone(760,.09,.035,'sine',0,420);break;
  case'block':noise(.075,.07,0,2100);tone(310,.11,.09,'square');tone(620,.13,.055,'triangle',.015);break;
  case'heal':seq([[420,0,.08],[560,.055,.08],[720,.11,.10],[900,.18,.13]],.055);break;
  case'win':seq([[392,0,.10],[523,.08,.10],[659,.16,.10],[784,.24,.12],[1047,.34,.20]],.10,'triangle');break;
  case'lose':seq([[440,0,.11],[349,.10,.12],[294,.21,.14],[220,.34,.22]],.075,'triangle');break;
  case'boss':tone(72,.22,.13,'sawtooth',0,48);noise(.15,.10,0,520);break;
  case'success':seq([[620,0,.06],[830,.06,.09]],.060,'triangle');break;
  case'error':tone(180,.09,.075,'square');tone(145,.12,.06,'square',.095);break;
  case'notification':seq([[760,0,.06],[1040,.065,.09]],.055);break;
  case'mail':seq([[620,0,.06],[830,.06,.07],[1040,.12,.09]],.055);break;
 }
}
window.v6111Sfx=play;

function classify(el){
 if(!el)return'click';if(el.disabled||el.getAttribute('aria-disabled')==='true')return'error';
 const txt=String(el.textContent||el.getAttribute('aria-label')||el.title||'').replace(/\s+/g,' ').trim().toLowerCase();
 const id=((el.id||'')+' '+(el.className||'')+' '+Object.entries(el.dataset||{}).map(([k,v])=>k+' '+v).join(' ')).toLowerCase(),a=txt+' '+id;
 if(/zerlegen|dismant/.test(a))return'dismantle';if(/schmieden|forge|craft/.test(a))return'forge';if(/neu würfeln|neuwürfeln|reroll|refresh/.test(a))return'reroll';
 if(/verkaufen|sell/.test(a))return'sell';if(/kaufen|buy/.test(a))return'buy';if(/beste ausrüstung|auto.?ausrüst|automatisch.*anlegen/.test(a))return'autoEquip';
 if(/ablegen|unequip/.test(a))return'unequip';if(/anlegen|ausrüsten|equip/.test(a))return'equip';if(/sockel|edelstein einsetzen|gem einsetzen/.test(a))return'socket';if(/verzauber|rolle anwenden|enchant/.test(a))return'enchant';
 if(/ernten|harvest/.test(a))return'harvest';if(/pflanzen|einpflanzen|plant/.test(a))return'plant';if(/gießen|giessen|licht|düng|dueng|lüften|lueften|pflege|care/.test(a))return'care';
 if(/belohnung|abholen|einsammeln|claim|reward/.test(a))return'reward';if(/quest.*start|auftrag.*start|start.*quest/.test(a))return'questStart';if(/angreifen|kämpfen|kaempfen|herausfordern|fight|battle/.test(a))return'battleStart';
 if(/nachricht|mail|postfach|nebel-post/.test(a))return'mail';if(/schließen|schliessen|close|zurück|zurueck|×|✕/.test(a))return'close';if(/öffnen|oeffnen|details|anzeigen/.test(a))return'open';return'click';
}
document.addEventListener('click',e=>{const el=e.target?.closest?.('button,[role="button"],.top-menu-item,.v459-tab,.v514-tab,.v686-page-btn,[data-go],[data-book],[data-pets]');if(el)play(classify(el))},true);

try{
 if(typeof v063Toast==='function'&&!window.__v6111Toast){
  const base=v063Toast;v063Toast=function(title,type='info',detail=''){const t=String(type||'').toLowerCase();if(t==='success')play('success');else if(t==='error')play('error');else if(t==='warn'||t==='warning')play('notification');return base.apply(this,arguments)};
  try{window.v063Toast=v063Toast}catch(e){}window.__v6111Toast=true;
 }
}catch(e){}

function rows(){
 const menu=document.getElementById('v141SettingsMenu');if(!menu)return false;
 let sfx=document.getElementById('v6111SfxVolumeRow');
 if(!sfx){sfx=document.createElement('label');sfx.id='v6111SfxVolumeRow';sfx.className='v141-setting-row v6111-volume-row';sfx.innerHTML=`<span class="v141-setting-icon">⚔️</span><span class="v141-setting-copy"><b>Soundeffekte</b><span>Klicks, Items, Kampf, Loot, Growroom und Belohnungen.</span></span><span class="v6111-volume-wrap"><input id="v6111SfxVolume" class="v6111-range" type="range" min="0" max="100" step="5"><b id="v6111SfxValue" class="v6111-volume-value"></b></span>`;(document.getElementById('v6109MusicRow')||document.getElementById('v141Sound')?.closest('.v141-setting-row'))?.insertAdjacentElement('afterend',sfx)}
 let mv=document.getElementById('v6111MusicVolumeRow');
 if(!mv){mv=document.createElement('label');mv.id='v6111MusicVolumeRow';mv.className='v141-setting-row v6111-volume-row';mv.innerHTML=`<span class="v141-setting-icon">🎼</span><span class="v141-setting-copy"><b>Musik-Lautstärke</b><span>Lautstärke der Hintergrundmusik.</span></span><span class="v6111-volume-wrap"><input id="v6111MusicVolume" class="v6111-range" type="range" min="0" max="100" step="5"><b id="v6111MusicValue" class="v6111-volume-value"></b></span>`;sfx.insertAdjacentElement('afterend',mv)}
 const c=cfg(),si=document.getElementById('v6111SfxVolume'),mi=document.getElementById('v6111MusicVolume'),sv=document.getElementById('v6111SfxValue'),mvv=document.getElementById('v6111MusicValue');
 if(si){si.value=Math.round(Number(c.sfxVolume??.72)*100);if(sv)sv.textContent=si.value+'%';if(!si.dataset.bound){si.dataset.bound='1';si.addEventListener('input',()=>{setSfxVolume(Number(si.value)/100);if(sv)sv.textContent=si.value+'%';play('click')})}}
 if(mi){mi.value=Math.round(Number(c.musicVolume??.70)*100);if(mvv)mvv.textContent=mi.value+'%';if(!mi.dataset.bound){mi.dataset.bound='1';mi.addEventListener('input',()=>{const v=Number(mi.value)/100;try{v141Settings.musicVolume=v;localStorage.setItem(SETTINGS_KEY,JSON.stringify(v141Settings))}catch(e){}window.v6109SetMusicVolume?.(v);if(mvv)mvv.textContent=mi.value+'%'})}}
 return true;
}
window.v6111EnsureSoundSettings=rows;
document.addEventListener('pointerdown',unlock,{once:true,passive:true,capture:true});
document.addEventListener('keydown',unlock,{once:true,capture:true});
document.addEventListener('DOMContentLoaded',rows,{once:true});
window.addEventListener('pageshow',()=>setTimeout(rows,80),{passive:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(rows,120));
window.v6111SoundInfo=()=>({unlocked,enabled:enabled(),sfxVolume:Number(cfg().sfxVolume??.72),musicVolume:Number(cfg().musicVolume??.70),voices:active.size,context:ctx?.state||'not-created',sampleRate:ctx?.sampleRate||0,sharedWithMusic:!!ctx&&typeof window.v6109GetAudioContext==='function'&&ctx===window.v6109GetAudioContext(),intervals:0});
})();
