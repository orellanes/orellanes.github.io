(function(){
'use strict';
if(window.__NT_V4_RECORD_NURSING_TEMPLATES__)return;
window.__NT_V4_RECORD_NURSING_TEMPLATES__=true;

function panel(){return document.getElementById('patientPanel')}
function area(){return document.getElementById('patientActionArea')}
function nursingButton(){return document.querySelector('.patient-action[data-action="nursing"]')}

function ensureTemplates(){
  const p=panel();
  if(!p||p.classList.contains('hidden'))return;
  if(document.getElementById('ntRecordNursingTemplates'))return;
  const host=area();
  if(!host)return;
  const box=document.createElement('div');
  box.id='ntRecordNursingTemplates';
  box.className='notice';
  box.style.marginTop='14px';
  box.innerHTML='<strong>Plantillas de Enfermería</strong><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px"><button class="btn light" data-nt-nursing-template="Evaluación inicial">Evaluación inicial</button><button class="btn light" data-nt-nursing-template="Seguimiento">Seguimiento</button><button class="btn light" data-nt-nursing-template="Reevaluación">Reevaluación</button><button class="btn light" data-nt-nursing-template="Readmisión">Readmisión</button></div><small style="display:block;margin-top:8px;color:#6f858b">Disponibles directamente dentro del expediente del paciente.</small>';
  host.prepend(box);
}

async function openTemplate(type){
  try{
    if(window.NT_V4_MODULES)await window.NT_V4_MODULES.load('nursing');
  }catch(_){}
  const b=nursingButton();
  if(b)b.click();
  setTimeout(function(){
    const sel=document.getElementById('nvType');
    if(sel){sel.value=type;sel.dispatchEvent(new Event('change',{bubbles:true}));}
  },40);
}

document.addEventListener('click',function(e){
  const t=e.target.closest&&e.target.closest('[data-nt-nursing-template]');
  if(t){e.preventDefault();openTemplate(t.dataset.ntNursingTemplate);return;}
  const patient=e.target.closest&&e.target.closest('.patient-row');
  if(patient)setTimeout(ensureTemplates,0);
  const back=e.target.closest&&e.target.closest('#backPatientBtn');
  if(back){const old=document.getElementById('ntRecordNursingTemplates');if(old)old.remove();}
},true);

// Also cover opening a patient programmatically without polling continuously.
document.addEventListener('nt:patient-opened',ensureTemplates);
})();
