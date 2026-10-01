(()=>{
'use strict';
if(window.__V7185_MODERATION__?.clientGuard)return;

const NAME_COMPACT=['hitler','heilhitler','siegheil','nsdap','goebbels','himmler','eichmann'];
const NAME_TOKENS=['nazi'];
const TAG_EXACT=['ss','88','1488','nsdap','nazi'];
const MSG_COMPACT=['heilhitler','siegheil','judenraus','auslaenderraus','whitepower','judensau','nigger','nigga','schwuchtel','hurensohn','arschloch','fotze','wichser','wixer','missgeburt','motherfucker','fuckyou'];
const MSG_TOKENS=['neger','kanake','spast','hure','schlampe','nutte','asshole','cunt'];
const MSG_PHRASES=['fick dich','verpiss dich','halt die fresse','ich bring dich um','ich toete dich','ich werde dich toeten'];
const CONFUSABLE={
 'а':'a','е':'e','о':'o','р':'p','с':'c','х':'x','у':'y','і':'i','ј':'j','к':'k','м':'m','н':'h','в':'b','т':'t',
 'α':'a','β':'b','ε':'e','ζ':'z','η':'h','ι':'i','κ':'k','μ':'m','ν':'n','ο':'o','ρ':'p','τ':'t','χ':'x'
};
function normalizeWords(value){
 let v=String(value??'').toLowerCase();
 v=v.replaceAll('ä','ae').replaceAll('ö','oe').replaceAll('ü','ue').replaceAll('ß','ss');
 v=[...v].map(ch=>CONFUSABLE[ch]||ch).join('');
 v=v.replaceAll('0','o').replaceAll('1','i').replaceAll('3','e').replaceAll('4','a').replaceAll('5','s').replaceAll('7','t').replaceAll('@','a').replaceAll('$','s').replaceAll('!','i').replaceAll('€','e');
 try{v=v.normalize('NFKD').replace(/[\u0300-\u036f]/g,'')}catch(_){ }
 return v.replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}
function hasPhrase(words,phrase){return (` ${words} `).includes(` ${phrase} `)}
function check(value,context){
 const words=normalizeWords(value),compact=words.replace(/ /g,'');
 if(!words)return {blocked:false,words,compact};
 let blocked=false;
 if(context==='character_name'||context==='guild_name'){
   blocked=NAME_COMPACT.some(x=>compact.includes(x))||NAME_TOKENS.some(x=>hasPhrase(words,x));
 }else if(context==='guild_tag'){
   blocked=TAG_EXACT.includes(compact);
 }else if(context==='guild_chat'||context==='private_message'){
   blocked=MSG_COMPACT.some(x=>compact.includes(x))||MSG_TOKENS.some(x=>hasPhrase(words,x))||MSG_PHRASES.some(x=>hasPhrase(words,x));
 }
 const message=context==='character_name'
   ?'Dieser Charaktername ist nicht zulässig.'
   :(context==='guild_name'||context==='guild_tag')
     ?'Bitte einen anderen Gildennamen oder Tag wählen.'
     :'Nachricht enthält einen nicht zulässigen Ausdruck.';
 return {blocked,words,compact,message};
}
window.v7185Moderation=Object.freeze({normalizeWords,check});
window.__V7185_MODERATION__=Object.freeze({version:'V7.189',clientGuard:true,serverTriggers:true,contexts:['character_name','guild_name','guild_tag','guild_chat','private_message'],serverReject:true,storesRejectedBody:false});
})();
