(function(){
'use strict';
if(window.__NT_V4_CLINICAL_ROUTER_LITE__)return;
window.__NT_V4_CLINICAL_ROUTER_LITE__=true;

async function loadAndOpen(group, api, method){
  try{
    if(!window.NT_V4_MODULES)throw new Error('Cargador de módulos no disponible');
    await window.NT_V4_MODULES.load(group);
    const obj=window[api];
    if(!obj||typeof obj[method]!=='function')throw new Error('El módulo no terminó de iniciar');
    await obj[method]();
  }catch(e){
    const area=document.getElementById('patientActionArea');
    if(area)area.innerHTML='<div class="notice" style="color:#933">No se pudo abrir el módulo: '+String(e&&e.message||e).replace(/[&<>"']/g,'')+'</div>';
  }
}

document.addEventListener('click',function(e){
  const nursing=e.target.closest?.('.patient-action[data-action="nursing"],#newVisitBtn');
  if(nursing){
    e.preventDefault();e.stopImmediatePropagation();
    loadAndOpen('nursing','NT_V4_SMART_NURSING','open');
    return;
  }
  const social=e.target.closest?.('.patient-action[data-action="social"]');
  if(social){
    e.preventDefault();e.stopImmediatePropagation();
    loadAndOpen('social','NT_V4_SOCIAL_DOCS','openSocial');
    return;
  }
  const mod=e.target.closest?.('#modulesPanel .module');
  if(mod){
    const name=(mod.querySelector('strong')?.textContent||'').trim();
    if(name==='Enfermería'){
      e.preventDefault();e.stopImmediatePropagation();
      const b=document.querySelector('.patient-action[data-action="nursing"]');
      if(b)b.click();
    }else if(name==='Trabajo Social'){
      e.preventDefault();e.stopImmediatePropagation();
      const b=document.querySelector('.patient-action[data-action="social"]');
      if(b)b.click();
    }
  }
},true);
})();
