(()=>{
'use strict';
if(window.GL_EVENTS)return;
const listeners=new Map(),seen=new Map(),stats={emitted:{},deduped:{},listeners:{},last:{}};
const MAX_SEEN=400,TTL=10*60*1000;
function prune(now=Date.now()){
 if(seen.size<=MAX_SEEN)return;
 for(const [k,t] of seen){if(now-t>TTL)seen.delete(k);if(seen.size<=MAX_SEEN)return}
 while(seen.size>MAX_SEEN)seen.delete(seen.keys().next().value);
}
function on(type,fn){
 type=String(type||'');if(!type||typeof fn!=='function')return()=>{};
 let set=listeners.get(type);if(!set){set=new Set();listeners.set(type,set)}
 set.add(fn);stats.listeners[type]=set.size;
 return()=>{set.delete(fn);stats.listeners[type]=set.size};
}
function emit(type,detail={},token=''){
 type=String(type||'');if(!type)return false;
 const now=Date.now(),tk=String(token||detail?.token||'');
 if(tk){const key=type+'|'+tk,prev=seen.get(key);if(prev&&now-prev<TTL){stats.deduped[type]=(stats.deduped[type]||0)+1;return false}seen.set(key,now);prune(now)}
 const packet={...(detail&&typeof detail==='object'?detail:{}),type,token:tk,emittedAt:now};
 stats.emitted[type]=(stats.emitted[type]||0)+1;stats.last[type]={token:tk,at:now};
 const set=listeners.get(type);if(set)for(const fn of [...set]){try{fn(packet)}catch(e){console.error('[GL Event]',type,e)}}
 try{window.dispatchEvent(new CustomEvent('growlegends:'+type,{detail:packet}))}catch(_){}
 return true;
}
window.GL_EVENTS=Object.freeze({on,emit,stats:()=>JSON.parse(JSON.stringify(stats))});
window.glOnGameEvent=on;window.glEmitGameEvent=emit;window.__V6140_EVENT_BUS__=true;
})();
