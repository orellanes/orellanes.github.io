(function(){
'use strict';
if(window.__NT_V4_MAINTENANCE_ENTRY__) return;
window.__NT_V4_MAINTENANCE_ENTRY__=true;
const $=id=>document.getElementById(id);
function inject(){
  if($('ntMaintenanceSafeEntry')) return true;
  const body=$('patientActionArea');
  if(!body) return false;
  const heading=[...body.querySelectorAll('h3')].find(h=>/súper administrador/i.test(h.textContent||''));
  if(!heading) return false;
  const host=heading.closest('.ntv4-bacard')||body;
  const card=document.createElement('div');
  card.id='ntMaintenanceSafeEntry';
  card.style.cssText='margin-top:14px;padding:14px;border:1px solid #bfe0e6;border-radius:14px;background:#f4fbfd';
  card.innerHTML='<strong style="display:block;color:#174866;font-size:16px">🛠️ Mantenimiento del sistema</strong><small style="display:block;color:#6c838d;margin-top:4px">Backups, capacidad, auditoría, caché y apariencia en una pantalla aislada.</small><a href="maintenance.html?v=20260909-maintenance-direct-1" class="btn secondary" style="display:inline-block;text-decoration:none;margin-top:10px">Abrir Mantenimiento</a>';
  host.appendChild(card);
  return true;
}
function tryAdminDirect(){
  const view=(new URLSearchParams(location.search).get('view')||'').toLowerCase();
  if(view!=='admin'&&view!=='administracion'&&view!=='administración') return;
  let n=0;const t=setInterval(()=>{
    const app=$('appView');
    if(app&&!app.classList.contains('hidden')&&window.NT_V4_ADMIN?.open){clearInterval(t);try{window.NT_V4_ADMIN.open();setTimeout(inject,250)}catch(_){} }
    if(++n>120)clearInterval(t);
  },250);
}
document.addEventListener('click',e=>{
  const b=e.target.closest?.('#modulesPanel .module,.nav button[data-view="settings"]');
  if(!b)return;
  const text=(b.textContent||'').toLowerCase();
  if(text.includes('administración')||text.includes('administracion')||b.dataset?.view==='settings')setTimeout(inject,350);
},true);
function boot(){tryAdminDirect();let n=0;const t=setInterval(()=>{if(inject()||++n>24)clearInterval(t)},1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();