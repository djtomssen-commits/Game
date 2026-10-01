(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 function uid(){try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(e){return ''}}
 function stateOwner(){try{return String(s?.__accountOwnerId||'')}catch(e){return ''}}
 function socialOwner(){try{return String(s?.social?.playerId||'')}catch(e){return ''}}
 function verified(id){try{return !!id&&typeof window.v452AccountVerified==='function'&&window.v452AccountVerified(id)}catch(e){return false}}
 function status(){const id=uid(),o=stateOwner(),so=socialOwner();return{version:V.short,uid:id,stateOwner:o,socialOwner:so,owned:!!id&&o===id&&so===id,verified:verified(id),blocked:!!id&&(o!==id||so!==id||!verified(id))}}
 window.v4134AccountIsolationDiagnostics=status;
 /* Never attempt a compatibility checkpoint from this final layer. It is diagnostics-only;
    the actual V4.159 checkpoint above now refuses any state whose ownership is not already exact. */
 try{document.title='Grow Legends '+V.short}catch(e){}
 try{document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version').forEach(x=>x&&(x.textContent=V.label));document.querySelectorAll('.v366-ver,.v371-logo em,.v372-logo em,.v4107-version').forEach(x=>x&&(x.textContent=V.short))}catch(e){}
})();
