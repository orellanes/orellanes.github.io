(function(){
'use strict';
if(window.__NT_V4_CLINICAL_ROUTER_LITE__)return;
window.__NT_V4_CLINICAL_ROUTER_LITE__=true;

function hasActivePatient(){
  const panel=document.getElementById('patientPanel');
  const mrn=(document.getElementById('patientMrn')?.textContent||'').replace(/^(MRN|Expediente)\s*:?-?\s*/i,'').trim();
  return !!(panel&&!panel.classList.contains('hidden')&&mrn&&mrn!=='—');
}
function goPatients(msg){
  const btn=document.querySelector('.nav button[data-view="patients"]');
  if(btn)btn.click();
  const st=document.getElementById('searchStatus');
  if(st)st.textContent=msg||'Busca y abre primero el expediente del paciente.';
  setTimeout(()=>document.getElementById('patientSearch')?.focus(),0);
}
async function loadAndOpen(group, api, method){
  try{
    if(!hasActivePatient()){goPatients('Busca y abre el expediente; luego selecciona el módulo clínico dentro del paciente.');return;}
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
  if(!mod)return;
  const name=(mod.querySelector('strong')?.textContent||'').trim();
  if(name==='Enfermería'){
    e.preventDefault();e.stopImmediatePropagation();
    if(!hasActivePatient()){goPatients('Para Enfermería: busca y abre un paciente. Dentro del expediente toca “Enfermería”.');return;}
    loadAndOpen('nursing','NT_V4_SMART_NURSING','open');
  }else if(name==='Trabajo Social'){
    e.preventDefault();e.stopImmediatePropagation();
    if(!hasActivePatient()){goPatients('Para Trabajo Social: busca y abre un paciente. Dentro del expediente toca “Trabajo Social”.');return;}
    loadAndOpen('social','NT_V4_SOCIAL_DOCS','openSocial');
  }
},true);
})();
