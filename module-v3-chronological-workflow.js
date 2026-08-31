(function(){'use strict';if(window.__ntChronologicalWorkflow)return;window.__ntChronologicalWorkflow=true;
var ORDER=[
{id:'n-initial',label:'1. Evaluación inicial',optional:false},
{id:'phq9',label:'2. PHQ-9',optional:true},
{id:'suicide',label:'3. Riesgo suicida',optional:true},
{id:'hiv-follow',label:'4. VIH / laboratorios',optional:true},
{id:'treatment',label:'5. Tratamiento',optional:true},
{id:'cabenuva',label:'6. Cabenuva',optional:true},
{id:'vaccine',label:'7. Vacunación',optional:true},
{id:'n-reassess',label:'8. Reevaluación',optional:false},
{id:'n-follow',label:'9. Nota post-médico',optional:false},
{id:'n-discharge',label:'10. Alta de enfermería',optional:false}
];
function currentPatient(){try{var id=window.state&&window.state.selectedPatientId;if(!id)return null;var raw=JSON.parse(localStorage.getItem('nursetrack_clinical_v21')||'{"patients":[]}');return (raw.patients||[]).find(function(p){return String(p.id)===String(id)})||null}catch(e){return null}}
function records(pid){try{var a=JSON.parse(localStorage.getItem('nursetrack_v3_nursing_template_records')||'[]');return a.filter(function(r){return String(r.patientId)===String(pid)})}catch(e){return[]}}
function latestCompleted(a,id){return a.filter(function(r){return r.templateId===id}).sort(function(x,y){return String(y.completedAt).localeCompare(String(x.completedAt))})[0]||null}
function nextStep(a){for(var i=0;i<ORDER.length;i++){var s=ORDER[i];if(!s.optional&&!latestCompleted(a,s.id))return s}return ORDER.find(function(s){return !latestCompleted(a,s.id)})||null}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function render(){var card=document.getElementById('ntNursingRecordCard');if(!card)return;var p=currentPatient();if(!p)return;var old=card.querySelector('#ntChronoFlow');if(old)old.remove();var a=records(p.id),next=nextStep(a),box=document.createElement('div');box.id='ntChronoFlow';box.style.cssText='border:1px solid #bfd9dc;background:#fff;border-radius:12px;padding:12px;margin:12px 0';box.innerHTML='<h4 style="margin:0 0 4px">🕒 Secuencia cronológica de la entrevista</h4><div class="muted" style="margin-bottom:10px">NurseTrack organiza las plantillas en el orden habitual de trabajo. Las opcionales se usan cuando correspondan.</div>'+ORDER.map(function(s){var done=latestCompleted(a,s.id),isNext=next&&next.id===s.id,status=done?'✅ Completado':(isNext?'➡️ Siguiente':(s.optional?'○ Según corresponda':'○ Pendiente'));return '<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:9px 0;border-top:1px solid #e4eeee"><div><strong>'+esc(s.label)+'</strong><div class="muted">'+status+(done?' · '+new Date(done.completedAt).toLocaleDateString():'')+'</div></div><button class="btn small '+(isNext?'primary':'secondary')+'" data-chrono-open="'+s.id+'">'+(done?'Abrir de nuevo':isNext?'Continuar':'Abrir')+'</button></div>'}).join('');var auto=card.querySelector('.ntnr-auto');if(auto)card.insertBefore(box,auto);else card.appendChild(box);box.querySelectorAll('[data-chrono-open]').forEach(function(b){b.onclick=function(){var target=card.querySelector('[data-ntnr-open="'+b.dataset.chronoOpen+'"]');if(target)target.click()}})}
function init(){var obs=new MutationObserver(function(){clearTimeout(window.__ntChronoTimer);window.__ntChronoTimer=setTimeout(render,40)});obs.observe(document.body,{childList:true,subtree:true});window.addEventListener('nursetrack:nursing-template-updated',function(){setTimeout(render,30)});window.addEventListener('nursetrack:clinical-record-updated',function(){setTimeout(render,30)});document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('[data-page="integratedRecord"],.patientbtn,[data-patient-id],[data-id]'))setTimeout(render,100)},true);setInterval(render,1800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.NT_CHRONO_WORKFLOW={render:render,order:ORDER.slice()};})();