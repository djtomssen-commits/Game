
(()=>{
'use strict';
window.v6329CombatEffectDiagnostics=()=>({
  version:'V6.332',
  lanes:document.querySelectorAll('.v6329-companion-status-lane').length,
  statusChips:document.querySelectorAll('.v6329-companion-status').length,
  legacyImpactLabels:[...document.querySelectorAll('.v6303-companion-impact>small')].filter(x=>getComputedStyle(x).display!=='none').length
});
})();
