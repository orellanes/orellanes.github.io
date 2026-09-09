(function(){
'use strict';
if(window.__NT_V4_APPEARANCE_ROUTE_FIX__) return;
window.__NT_V4_APPEARANCE_ROUTE_FIX__=true;
function routeToAppearance(e){
  const b=e.target.closest?.('#ntmAppearance');
  if(!b) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  const u=new URL(location.href);
  u.searchParams.set('view','appearance');
  u.searchParams.set('open','appearance');
  u.searchParams.set('v','20260909-appearance-route-1');
  location.assign(u.toString());
}
document.addEventListener('click',routeToAppearance,true);
function decorate(){
  const b=document.getElementById('ntmAppearance');
  if(!b||b.dataset.ntDirectRoute==='1') return;
  b.dataset.ntDirectRoute='1';
  b.title='Abrir Apariencia y Portadas';
}
let n=0;const t=setInterval(()=>{decorate();if(++n>120)clearInterval(t)},250);
new MutationObserver(decorate).observe(document.documentElement,{childList:true,subtree:true});
})();
