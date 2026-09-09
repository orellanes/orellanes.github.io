(function(){
'use strict';
if(window.__NT_V4_HIDE_STATIONS_CARD_V2__) return;
window.__NT_V4_HIDE_STATIONS_CARD_V2__=true;

function installPermanentHide(){
  let style=document.getElementById('ntv4HideStationsPermanent');
  if(!style){
    style=document.createElement('style');
    style.id='ntv4HideStationsPermanent';
    style.textContent='#ntv4StationsCard,[data-log-global="stations"]{display:none!important;visibility:hidden!important;pointer-events:none!important}';
    (document.head||document.documentElement).appendChild(style);
  }
}

function removeStationsCard(){
  document.getElementById('ntv4StationsCard')?.remove();
  document.querySelectorAll('[data-log-global="stations"]').forEach(el=>el.remove());
}

installPermanentHide();
removeStationsCard();
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{installPermanentHide();removeStationsCard()},{once:true});
})();
