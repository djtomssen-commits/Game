
(()=>{
 'use strict';
 window.v6286GrowMainDiagnostics=()=>({
   version:'V6.286',
   activeBuffInMain:[...document.querySelectorAll('#grow .v492-bottom .v492-card h3')]
     .some(x=>(x.textContent||'').includes('Aktive Sorte')),
   activeBuffInStock:!!document.querySelector('#grow .v6282-summary')
 });
})();
