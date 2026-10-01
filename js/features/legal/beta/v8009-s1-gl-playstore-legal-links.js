(function(){
  'use strict';
  const BASE='https://gamenew.djtomssen.workers.dev';
  const urls={privacy:BASE+'/datenschutz.html',imprint:BASE+'/impressum.html',delete:BASE+'/account-loeschen.html'};
  const anchor=(href,label)=>'<a href="'+href+'" target="_blank" rel="noopener noreferrer">'+label+'</a>';
  function applyLegalLinks(){
    document.querySelectorAll('.v347-footer .links').forEach(el=>{
      el.innerHTML=anchor(urls.privacy,'Datenschutz')+' &nbsp;|&nbsp; '+anchor(urls.imprint,'Impressum')+' &nbsp;|&nbsp; <a href="mailto:Tomssen5@gmail.com">Support</a>';
    });
    const menu=document.querySelector('#v141SettingsMenu');
    if(menu && !menu.querySelector('#glLegalLinks')){
      const box=document.createElement('div');
      box.id='glLegalLinks'; box.className='gl-legal-links';
      box.innerHTML=anchor(urls.privacy,'Datenschutz')+' · '+anchor(urls.imprint,'Impressum')+' · '+anchor(urls.delete,'Account-Löschung im Web');
      const version=menu.querySelector('#v141VersionLine');
      if(version) version.insertAdjacentElement('beforebegin',box); else menu.appendChild(box);
    }
  }
  const old347=typeof window.v347EnsureLayout==='function'?window.v347EnsureLayout:null;
  if(old347) window.v347EnsureLayout=function(){const r=old347.apply(this,arguments);applyLegalLinks();return r;};
  const old141=typeof window.v141BuildSettings==='function'?window.v141BuildSettings:null;
  if(old141) window.v141BuildSettings=function(){const r=old141.apply(this,arguments);applyLegalLinks();return r;};
  window.glApplyLegalLinks=applyLegalLinks;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyLegalLinks,{once:true}); else applyLegalLinks();
  setTimeout(applyLegalLinks,300); setTimeout(applyLegalLinks,1200); setTimeout(applyLegalLinks,2500);
})();
