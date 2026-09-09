(function(){
'use strict';
if(window.__NT_V4_HIDE_STATIONS_CARD__) return;
window.__NT_V4_HIDE_STATIONS_CARD__=true;

function removeStationsCard(){
  document.getElementById('ntv4StationsCard')?.remove();
  document.querySelectorAll('[data-log-global="stations"]').forEach(el=>el.remove());
  document.querySelectorAll('#modulesPanel .module').forEach(btn=>{
    const title=(btn.querySelector('strong')?.textContent||'').trim().toLowerCase();
    if(title==='estaciones') btn.remove();
  });
}

removeStationsCard();
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',removeStationsCard,{once:true});
let tries=0;
const timer=setInterval(()=>{
  removeStationsCard();
  if(++tries>=40) clearInterval(timer);
},250);
})();
