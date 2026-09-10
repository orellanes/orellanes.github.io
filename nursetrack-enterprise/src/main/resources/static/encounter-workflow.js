(function(){
'use strict';
let patientId=null;
let activeEncounter=null;
let csrfCache=null;

const byId=id=>document.getElementById(id);

async function csrf(){
  if(csrfCache)return csrfCache;
  const r=await fetch('/api/public/csrf',{credentials:'same-origin'});
  if(!r.ok)throw new Error('No se pudo iniciar protección CSRF');
  csrfCache=await r.json();
  return csrfCache;
}

async function json(url,opts={}){
  const method=(opts.method||'GET').toUpperCase();
  const headers=new Headers(opts.headers||{});
  if(opts.body&&!headers.has('Content-Type'))headers.set('Content-Type','application/json');
  if(!['GET','HEAD','OPTIONS'].includes(method)){
    const c=await csrf();
    headers.set(c.headerName||'X-XSRF-TOKEN',c.token);
  }
  const r=await fetch(url,{...opts,method,headers,credentials:'same-origin'});
  const text=await r.text();
  let data=null;try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok)throw new Error((data&&data.message)||data||`Error ${r.status}`);
  return data;
}

function ensureControls(){
  const newBtn=byId('newEncounterBtn');
  if(!newBtn||byId('closeEncounterBtn'))return;
  const wrap=document.createElement('div');
  wrap.className='visit-actions';
  newBtn.parentNode.insertBefore(wrap,newBtn);
  wrap.appendChild(newBtn);
  const close=document.createElement('button');
  close.id='closeEncounterBtn';
  close.className='btn danger hidden';
  close.type='button';
  close.textContent='Cerrar visita';
  close.onclick=closeEncounter;
  wrap.appendChild(close);
  const status=document.createElement('span');
  status.id='encounterStatus';
  status.className='visit-chip muted';
  status.textContent='Sin visita activa';
  wrap.appendChild(status);
}

function paintEncounter(){
  ensureControls();
  const close=byId('closeEncounterBtn');
  const status=byId('encounterStatus');
  const newBtn=byId('newEncounterBtn');
  if(!close||!status||!newBtn)return;
  if(activeEncounter&&String(activeEncounter.status).toUpperCase()==='OPEN'){
    close.classList.remove('hidden');
    status.textContent='Visita activa';
    status.className='visit-chip open';
    newBtn.textContent='Continuar visita';
  }else{
    close.classList.add('hidden');
    status.textContent='Sin visita activa';
    status.className='visit-chip muted';
    newBtn.textContent='+ Nueva visita';
  }
}

async function refreshActive(){
  if(!patientId){activeEncounter=null;paintEncounter();return;}
  try{
    activeEncounter=await json(`/api/v1/patients/${encodeURIComponent(patientId)}/encounters/active`);
  }catch{
    activeEncounter=null;
  }
  paintEncounter();
}

async function closeEncounter(){
  if(!patientId||!activeEncounter)return;
  const btn=byId('closeEncounterBtn');
  const status=byId('encounterStatus');
  btn.disabled=true;
  try{
    const readiness=await json(`/api/v1/patients/${encodeURIComponent(patientId)}/encounters/${encodeURIComponent(activeEncounter.id)}/readiness`);
    if(!readiness.canClose){
      const message=(readiness.blockers||[]).join('\n• ');
      alert('La visita todavía no puede cerrarse.\n\n• '+message);
      status.textContent=`Pendiente · ${readiness.unsignedDocuments||0} sin firmar`;
      status.className='visit-chip blocked';
      return;
    }
    if(!confirm('¿Cerrar esta visita clínica? Los documentos firmados permanecerán bloqueados y la visita quedará cerrada.'))return;
    await json(`/api/v1/patients/${encodeURIComponent(patientId)}/encounters/${encodeURIComponent(activeEncounter.id)}/close`,{method:'POST'});
    activeEncounter=null;
    paintEncounter();
    window.dispatchEvent(new CustomEvent('nursetrack:encounter-closed',{detail:{patientId}}));
  }catch(e){
    alert(e.message);
    status.textContent='No se pudo cerrar';
    status.className='visit-chip blocked';
  }finally{btn.disabled=false;}
}

// Capture patient selection without coupling this module to app.js internal state.
document.addEventListener('click',event=>{
  const result=event.target.closest?.('.patient-result[data-id]');
  if(result){
    patientId=result.dataset.id;
    setTimeout(refreshActive,0);
    return;
  }
  if(event.target.closest?.('#newEncounterBtn')){
    setTimeout(refreshActive,250);
  }
},true);

document.addEventListener('DOMContentLoaded',()=>{
  ensureControls();
  paintEncounter();
});
})();
