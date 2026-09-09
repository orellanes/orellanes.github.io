(function(){
'use strict';
if(window.__NT_V4_RECORD_NURSING_TEMPLATES__)return;
window.__NT_V4_RECORD_NURSING_TEMPLATES__=true;

function panel(){return document.getElementById('patientPanel')}
function actionArea(){return document.getElementById('patientActionArea')}
function actionsRow(){return panel()?.querySelector('.actions')}
function nursingButton(){return document.querySelector('.patient-action[data-action="nursing"]')}

function ensureStyle(){
  if(document.getElementById('ntRecordNursingTemplatesStyle'))return;
  const s=document.createElement('style');
  s.id='ntRecordNursingTemplatesStyle';
  s.textContent=`
    #ntRecordNursingTemplates{margin-top:16px;border:1px solid #cfe1e4;background:#f8fbfb;border-radius:16px;padding:16px}
    #ntRecordNursingTemplates .nt-rnt-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:10px}
    #ntRecordNursingTemplates .nt-rnt-head h4{margin:0;font-size:17px}
    #ntRecordNursingTemplates .nt-rnt-head small{color:#6f858b}
    #ntRecordNursingTemplates .nt-rnt-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
    #ntRecordNursingTemplates .nt-rnt-card{border:1px solid #d8e6e8;background:#fff;border-radius:12px;padding:12px;text-align:left;color:#17343c;font-weight:800}
    #ntRecordNursingTemplates .nt-rnt-card span{display:block;margin-top:4px;color:#6f858b;font-size:12px;font-weight:600}
    @media(max-width:760px){#ntRecordNursingTemplates .nt-rnt-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:480px){#ntRecordNursingTemplates .nt-rnt-grid{grid-template-columns:1fr}}
  `;
  (document.head||document.documentElement).appendChild(s);
}

function ensureTemplates(){
  const p=panel();
  if(!p||p.classList.contains('hidden'))return;
  ensureStyle();
  let box=document.getElementById('ntRecordNursingTemplates');
  if(box)return;
  const row=actionsRow();
  const area=actionArea();
  if(!row||!area)return;
  box=document.createElement('section');
  box.id='ntRecordNursingTemplates';
  box.innerHTML=`
    <div class="nt-rnt-head"><div><h4>Plantillas de Enfermería</h4><small>Disponibles dentro del expediente</small></div></div>
    <div class="nt-rnt-grid">
      <button class="nt-rnt-card" data-nt-nursing-template="Evaluación inicial">Evaluación inicial<span>Ingreso / primera evaluación</span></button>
      <button class="nt-rnt-card" data-nt-nursing-template="Seguimiento">Seguimiento<span>Visita de seguimiento</span></button>
      <button class="nt-rnt-card" data-nt-nursing-template="Reevaluación">Reevaluación<span>Revisión clínica</span></button>
      <button class="nt-rnt-card" data-nt-nursing-template="Readmisión">Readmisión<span>Paciente que regresa al servicio</span></button>
    </div>`;
  // IMPORTANT: insert outside patientActionArea because history/form rendering replaces that area.
  area.parentNode.insertBefore(box,area);
}

async function openTemplate(type){
  try{if(window.NT_V4_MODULES)await window.NT_V4_MODULES.load('nursing')}catch(_){}
  const b=nursingButton();
  if(b)b.click();
  setTimeout(function(){
    const sel=document.getElementById('nvType');
    if(sel){sel.value=type;sel.dispatchEvent(new Event('change',{bubbles:true}))}
  },80);
}

document.addEventListener('click',function(e){
  const t=e.target.closest&&e.target.closest('[data-nt-nursing-template]');
  if(t){e.preventDefault();openTemplate(t.dataset.ntNursingTemplate);return}
  const patient=e.target.closest&&e.target.closest('.patient-row');
  if(patient){setTimeout(ensureTemplates,50);setTimeout(ensureTemplates,500)}
  const back=e.target.closest&&e.target.closest('#backPatientBtn');
  if(back){const old=document.getElementById('ntRecordNursingTemplates');if(old)old.remove()}
},true);

document.addEventListener('nt:patient-opened',ensureTemplates);
})();
