(function(){'use strict';if(window.__ntCompleteVisit36)return;window.__ntCompleteVisit36=true;
function q(s,r){return(r||document).querySelector(s)}
function fieldFor(name){var e=q('#visitForm [name="'+name+'"]');return e&&e.closest('.field')}
function card(id,title,subtitle){var d=document.createElement('section');d.id=id;d.className='nt36visitcard';d.innerHTML='<div class="nt36visithead"><h3>'+title+'</h3>'+(subtitle?'<div>'+subtitle+'</div>':'')+'</div><div class="nt36visitbody"></div>';return d}
function style(){if(q('#nt36CompleteVisitStyle'))return;var s=document.createElement('style');s.id='nt36CompleteVisitStyle';s.textContent='.nt36visitcard{border:1px solid #cfdfe6;border-radius:14px;background:#fff;margin:12px 0;overflow:hidden}.nt36visithead{padding:11px 13px;background:#f1f7f8;border-bottom:1px solid #d9e7ea}.nt36visithead h3{margin:0;color:#285e69;font-size:17px}.nt36visithead div{font-size:12px;color:#667f86;margin-top:3px}.nt36visitbody{padding:13px}.nt36visitgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.nt36visitcard textarea{width:100%;min-height:105px;border:1px solid var(--line,#dbe7e9);border-radius:10px;padding:10px;background:#fff}.nt36visitlabel{display:block;font-size:13px;font-weight:800;margin-bottom:6px}.nt36clinicalblock{margin-bottom:12px}.nt36clinicalblock:last-child{margin-bottom:0}@media(max-width:700px){.nt36visitgrid{grid-template-columns:1fr}}';document.head.appendChild(s)}
function moveField(name,host){var f=fieldFor(name);if(f&&f.parentElement!==host)host.appendChild(f)}
function moveTextarea(name,host,label){var e=q('#visitForm [name="'+name+'"]');if(!e)return;var wrap=document.createElement('div');wrap.className='nt36clinicalblock';var l=document.createElement('label');l.className='nt36visitlabel';l.textContent=label;wrap.appendChild(l);wrap.appendChild(e);host.appendChild(wrap)}
function install(){var f=q('#visitForm');if(!f||q('#nt36VitalsCard'))return;style();var actions=q('.dialogactions',f);if(!actions)return;
var first=card('nt36VitalsCard','1. Datos de la visita y signos vitales','Vitales y medidas documentados en la misma visita de enfermería.');var grid=document.createElement('div');grid.className='nt36visitgrid';first.querySelector('.nt36visitbody').appendChild(grid);['type','visitDate','bp','pulse','resp','temp','spo2','weight','height','bmi'].forEach(function(n){moveField(n,grid)});
var raw=q('#visitForm .field.span2.hidden');if(raw)raw.classList.remove('hidden');
var evalCard=card('nt36EvalCard','2. Evaluación de enfermería','Resumen clínico de los hallazgos de la visita.');
var planCard=card('nt36PlanCard','3. Plan de enfermería','Plan sugerido o editado por el profesional según los hallazgos.');
var noteCard=card('nt36NoteCard','4. Nota de enfermería','Narrativa final de enfermería para esta visita.');
moveTextarea('assessment',evalCard.querySelector('.nt36visitbody'),'Evaluación / hallazgos');
moveTextarea('interventions',evalCard.querySelector('.nt36visitbody'),'Intervenciones y educación');
moveTextarea('plan',planCard.querySelector('.nt36visitbody'),'Plan de enfermería');
moveTextarea('freeNote',noteCard.querySelector('.nt36visitbody'),'Nota de enfermería');
var edu=q('#visitForm [name="educationOther"]');if(edu&&edu.parentElement)edu.style.display='none';
f.insertBefore(first,f.firstChild);f.insertBefore(evalCard,actions);f.insertBefore(planCard,actions);f.insertBefore(noteCard,actions);
try{f.dataset.ntCompleteVisit='36d'}catch(e){}
}
function init(){install();var root=q('#nursingPageSafe35')||document.body;new MutationObserver(function(){if(q('#visitForm')&&!q('#nt36VitalsCard'))install()}).observe(root,{childList:true,subtree:true});document.addEventListener('nt35VisitFormReady',function(){setTimeout(install,0)});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();})();