(function(){
'use strict';
if(window.__NT_V4_APPEARANCE_ROUTE_FIX__) return;
window.__NT_V4_APPEARANCE_ROUTE_FIX__=true;

function isAppearanceTarget(target){
  if(!target) return false;
  if(target.closest?.('#ntmAppearance')) return true;
  const card=target.closest?.('.ntm-tool');
  if(!card) return false;
  const title=(card.querySelector('h4')?.textContent||'').toLowerCase();
  return title.includes('apariencia') && title.includes('portada');
}
function routeUrl(){return 'appearance.html?v=20260909-appearance-direct-1&r='+Date.now()}
function openAppearance(e){
  if(!isAppearanceTarget(e.target)) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  const status=document.getElementById('ntmStatus');
  if(status){status.textContent='Abriendo Apariencia / Portadas…';status.style.color='#31545b'}
  location.assign(routeUrl());
}
document.addEventListener('click',openAppearance,true);
function decorate(){
  const button=document.getElementById('ntmAppearance');
  const card=button?.closest('.ntm-tool');
  if(button){button.dataset.ntDirectRoute='3';button.title='Abrir Apariencia y Portadas';button.textContent='Abrir Apariencia / Portadas'}
  if(card && card.dataset.ntAppearanceCard!=='1'){
    card.dataset.ntAppearanceCard='1';card.setAttribute('role','link');card.setAttribute('tabindex','0');card.style.cursor='pointer';card.title='Abrir Apariencia y Portadas';
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();location.assign(routeUrl())}});
  }
}
let n=0;const t=setInterval(()=>{decorate();if(++n>240)clearInterval(t)},250);
new MutationObserver(decorate).observe(document.documentElement,{childList:true,subtree:true});
})();
