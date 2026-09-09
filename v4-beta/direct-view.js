(function(){
'use strict';
if(window.__NT_V4_DIRECT_VIEW__) return;
window.__NT_V4_DIRECT_VIEW__=true;
const params=new URLSearchParams(location.search);
const view=(params.get('view')||'').trim().toLowerCase();
if(!view) return;
function showError(message){
  const out=document.getElementById('patientActionArea')||document.getElementById('placeholderPanel');
  if(out) out.innerHTML='<div class="notice" style="color:#933">'+String(message||'No se pudo abrir la pantalla solicitada.').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))+'</div>';
}
function invoke(mod){
  if(mod && typeof mod.open==='function'){
    try{
      const r=mod.open();
      if(r && typeof r.catch==='function') r.catch(e=>showError(e?.message||e));
      return true;
    }catch(e){showError(e?.message||e);return true;}
  }
  return false;
}
function openRequested(){
  if(view==='templates' || view==='plantillas') return invoke(window.NT_V4_TEMPLATES);
  if(view==='appearance' || view==='apariencia' || view==='portadas') return invoke(window.NT_V4_APPEARANCE);
  if(view==='maintenance' || view==='mantenimiento') return invoke(window.NT_V4_MAINTENANCE);
  if(view==='capacity' || view==='capacidad') return invoke(window.NT_V4_CAPACITY);
  if(view==='audit' || view==='auditoria') return invoke(window.NT_V4_AUDIT);
  return false;
}
let tries=0;
const timer=setInterval(function(){
  tries++;
  const app=document.getElementById('appView');
  const ready=app && !app.classList.contains('hidden');
  if(ready && openRequested()) clearInterval(timer);
  if(tries>240){clearInterval(timer);if(ready)showError('La pantalla solicitada no terminó de cargar. Actualiza NurseTrack One e inténtalo nuevamente.');}
},250);
})();
