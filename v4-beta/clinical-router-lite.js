(function(){
'use strict';
if(window.__NT_V4_CLINICAL_ROUTER_LITE__)return;
window.__NT_V4_CLINICAL_ROUTER_LITE__=true;

let openingNursing=false;
let openingSocial=false;

function msg(text){
  const area=document.getElementById('patientActionArea');
  if(area)area.innerHTML='<div class="notice">'+String(text||'')+'</div>';
}

async function openNursing(){
  if(openingNursing)return;
  openingNursing=true;
  try{
    if(!window.NT_V4_MODULES)throw new Error('Cargador de módulos no disponible');
    msg('Abriendo plantilla interactiva de Enfermería…');
    // Cargar SOLO la plantilla inteligente. Evita cargar complementos y observadores
    // adicionales que podían competir al mismo tiempo y bloquear la página.
    await window.NT_V4_MODULES.loadFile('smart-nursing.js');
    if(!window.NT_V4_SMART_NURSING||typeof window.NT_V4_SMART_NURSING.open!=='function'){
      throw new Error('La plantilla de Enfermería no terminó de iniciar');
    }
    await window.NT_V4_SMART_NURSING.open();
  }catch(e){
    const area=document.getElementById('patientActionArea');
    if(area)area.innerHTML='<div class="notice" style="color:#933">No se pudo abrir Enfermería: '+String(e&&e.message||e).replace(/[&<>"']/g,'')+'</div>';
  }finally{
    openingNursing=false;
  }
}

async function openSocial(){
  if(openingSocial)return;
  openingSocial=true;
  try{
    if(!window.NT_V4_MODULES)throw new Error('Cargador de módulos no disponible');
    msg('Abriendo Trabajo Social…');
    await window.NT_V4_MODULES.load('social');
    if(window.NT_V4_SOCIAL_DOCS?.openSocial)await window.NT_V4_SOCIAL_DOCS.openSocial();
    else throw new Error('Trabajo Social no terminó de iniciar');
  }catch(e){
    const area=document.getElementById('patientActionArea');
    if(area)area.innerHTML='<div class="notice" style="color:#933">No se pudo abrir Trabajo Social: '+String(e&&e.message||e).replace(/[&<>"']/g,'')+'</div>';
  }finally{
    openingSocial=false;
  }
}

document.addEventListener('click',function(e){
  const nursing=e.target.closest?.('.patient-action[data-action="nursing"],#newVisitBtn');
  if(nursing){
    e.preventDefault();
    e.stopImmediatePropagation();
    openNursing();
    return;
  }
  const social=e.target.closest?.('.patient-action[data-action="social"]');
  if(social){
    e.preventDefault();
    e.stopImmediatePropagation();
    openSocial();
    return;
  }
  const mod=e.target.closest?.('#modulesPanel .module');
  if(mod){
    const name=(mod.querySelector('strong')?.textContent||'').trim();
    if(name==='Enfermería'||name==='Trabajo Social'){
      e.preventDefault();
      e.stopImmediatePropagation();
      const patientPanel=document.getElementById('patientPanel');
      if(!patientPanel||patientPanel.classList.contains('hidden')){
        document.querySelector('[data-view="patients"]')?.click();
        const st=document.getElementById('searchStatus');
        if(st){st.textContent='Busca y abre primero el expediente del paciente.';st.className='status';}
        return;
      }
      if(name==='Enfermería')openNursing(); else openSocial();
    }
  }
},true);
})();
