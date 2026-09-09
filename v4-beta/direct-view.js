(function(){
'use strict';
if(window.__NT_V4_DIRECT_VIEW__) return;
window.__NT_V4_DIRECT_VIEW__=true;
const params=new URLSearchParams(location.search);
const view=(params.get('view')||'').trim().toLowerCase();
if(!view) return;
function openRequested(){
  if(view==='templates' || view==='plantillas'){
    if(window.NT_V4_TEMPLATES && typeof window.NT_V4_TEMPLATES.open==='function'){
      try{ window.NT_V4_TEMPLATES.open(); return true; }catch(_){ return false; }
    }
  }
  return false;
}
let tries=0;
const timer=setInterval(function(){
  tries++;
  const app=document.getElementById('appView');
  const ready=app && !app.classList.contains('hidden');
  if(ready && openRequested()) clearInterval(timer);
  if(tries>160) clearInterval(timer);
},250);
})();
