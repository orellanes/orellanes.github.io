(function(){
'use strict';
if(window.__NT_V4_ADMIN_ROUTER__) return;
window.__NT_V4_ADMIN_ROUTER__=true;
let opening=false;

function titleOf(el){return (el?.querySelector?.('strong')?.textContent||el?.textContent||'').trim().toLowerCase();}
function isAdminCard(el){return el?.matches?.('#modulesPanel .module') && titleOf(el)==='administración';}
function isSettings(el){return el?.matches?.('.nav button[data-view="settings"]');}

async function openAdmin(){
  if(opening) return;
  opening=true;
  const status=document.getElementById('moduleStatus');
  try{
    if(status) status.textContent='Abriendo Administración…';
    if(!window.NT_V4_MODULES?.load) throw new Error('Cargador de módulos no disponible');
    // billing-admin.js contiene el panel administrativo principal; las
    // herramientas administrativas complementarias se cargan después.
    await window.NT_V4_MODULES.load('billing');
    await window.NT_V4_MODULES.load('admin');
    if(!window.NT_V4_ADMIN?.open) throw new Error('Panel administrativo no disponible');
    await window.NT_V4_ADMIN.open();
    if(status) status.textContent='Administración activa.';
  }catch(e){
    console.error('[NurseTrack v4] Administración:',e);
    if(status) status.textContent='No se pudo abrir Administración: '+(e?.message||e);
  }finally{
    opening=false;
  }
}

// Captura antes del onclick provisional del index para que nunca vuelva a
// mostrar “está preservado…”. El módulo se descarga solo cuando se solicita.
document.addEventListener('click',function(e){
  const card=e.target.closest?.('#modulesPanel .module');
  const settings=e.target.closest?.('.nav button[data-view="settings"]');
  if(isAdminCard(card) || isSettings(settings)){
    e.preventDefault();
    e.stopImmediatePropagation();
    openAdmin();
  }
},true);

window.NT_V4_ADMIN_ROUTER={open:openAdmin,version:'1.0.0'};
})();
