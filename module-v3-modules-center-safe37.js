(function(){'use strict';
if(window.__nt37ModulesCenter)return;window.__nt37ModulesCenter=true;
function q(s,r){return(r||document).querySelector(s)}
function qa(s,r){return Array.from((r||document).querySelectorAll(s))}
function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function patient(){try{if(window.NT_PATIENT_CONTEXT&&window.NT_PATIENT_CONTEXT.get){var cp=window.NT_PATIENT_CONTEXT.get();if(cp)return cp}}catch(e){}try{if(typeof window.patient==='function'){var wp=window.patient();if(wp)return wp}}catch(e){}var st=window.state||{},ps=Array.isArray(st.patients)?st.patients:[],ids=[window.selected,st.selected,st.selectedPatientId,st.selectedId,st.patientId,st.currentPatientId];for(var i=0;i<ids.length;i++){if(ids[i]===undefined||ids[i]===null||ids[i]==='')continue;var p=ps.find(function(x){return String(x.id)===String(ids[i])});if(p)return p}var meta=q('#patientMeta'),txt=String(meta&&meta.textContent||''),m=txt.match(/MRN\s+([^·\n]+)/i),mrn=m&&m[1]?m[1].trim():'';if(mrn&&mrn!=='—')return ps.find(function(x){return String(x.mrn||'').trim()===mrn})||null;return null}
function sync(p,src){if(!p)return;var st=window.state||{};window.selected=p.id;st.selected=p.id;st.selectedPatientId=p.id;st.selectedId=p.id;st.patientId=p.id;st.currentPatientId=p.id;try{if(window.NT_PATIENT_CONTEXT&&window.NT_PATIENT_CONTEXT.set)window.NT_PATIENT_CONTEXT.set(p,src||'modules-center')}catch(e){}}
function needPatient(){var p=patient();if(p){sync(p);return p}alert('Abra primero un paciente para usar este módulo.');return null}
function findNav(rx){return qa('.navbtn').find(function(b){return rx.test(b.textContent||'')&&!b.dataset.ntLazyPlaceholder&&!b.dataset.ntModulesCenter})}
function showOnly(sec,nav){if(!sec)return false;qa('main.main>section').forEach(function(x){x.classList.add('hidden')});sec.classList.remove('hidden');qa('.navbtn').forEach(function(x){x.classList.toggle('active',x===nav)});return true}
function openButtonDirect(btn){if(!btn)return false;try{btn.click();return true}catch(_){return false}}
async function lazy(name){var od=window.nt37OnDemand;if(!od||typeof od.load!=='function')return false;try{return await od.load(name)}catch(e){return false}}
async function openModule(name){var p=null;if(['nursing','social','nutrition','mental','substance','toxicology','treatments','documents'].includes(name)){p=needPatient();if(!p)return}
if(name==='nursing'){sync(p,'modules-nursing');if(!await lazy('nursing'))return;if(window.NT_NURSING_HOST&&typeof window.NT_NURSING_HOST.show==='function')return window.NT_NURSING_HOST.show();return alert('No se pudo abrir Enfermería.')}
if(name==='social'){sync(p,'modules-social');if(!window.NT_SOCIAL_WORK_MODERN||typeof window.NT_SOCIAL_WORK_MODERN.open!=='function'){if(!await lazy('social'))return}sync(p,'modules-social-open');if(window.NT_SOCIAL_WORK_MODERN&&window.NT_SOCIAL_WORK_MODERN.syncPatient)window.NT_SOCIAL_WORK_MODERN.syncPatient(p);if(window.NT_SOCIAL_WORK_MODERN&&window.NT_SOCIAL_WORK_MODERN.open)return window.NT_SOCIAL_WORK_MODERN.open();return alert('No se pudo abrir Trabajo Social.')}
if(name==='nutrition'){if(!await lazy('nutrition'))return;if(window.NT_NUTRITION&&window.NT_NUTRITION.open)return window.NT_NUTRITION.open();return alert('No se pudo abrir Nutrición.')}
if(['mental','substance','toxicology'].includes(name)){if(!await lazy('mental'))return;if(window.NT_MENTAL_SUBSTANCE&&window.NT_MENTAL_SUBSTANCE.open)return window.NT_MENTAL_SUBSTANCE.open(name==='mental'?'mental':name);return alert('No se pudo abrir el módulo seleccionado.')}
if(name==='treatments'){if(!await lazy('treatments'))return;if(window.NT_VACCINES_TREATMENTS&&window.NT_VACCINES_TREATMENTS.open)return window.NT_VACCINES_TREATMENTS.open();return openButtonDirect(q('#nt37VtNav')||findNav(/vacuna|tratamiento/i))}
if(name==='labs'){if(!await lazy('labs'))return;return openButtonDirect(q('#nt37LabNav')||findNav(/laboratorio|\blab/i))}
if(name==='appointments'){if(!await lazy('appointments'))return;if(window.nt37Appointments&&typeof window.nt37Appointments.show==='function')return window.nt37Appointments.show();return alert('No se pudo abrir Citas.')}
if(name==='reports'){if(!await lazy('reports'))return;if(window.nt37Reports&&typeof window.nt37Reports.show==='function')return window.nt37Reports.show();return alert('No se pudo abrir Reportes.')}
if(name==='membership'){if(!await lazy('membership'))return;if(window.NT_MEMBERSHIP&&typeof window.NT_MEMBERSHIP.show==='function')return window.NT_MEMBERSHIP.show();return alert('No se pudo abrir Membresía.')}
if(name==='billing'){if(!await lazy('billing'))return;if(window.NT_BILLING&&window.NT_BILLING.open)return window.NT_BILLING.open();return openButtonDirect(findNav(/factur|billing/i))}
if(name==='documents'){if(!await lazy('documents'))return;var pp=q('#patientPage');if(pp)showOnly(pp,findNav(/paciente/i));return}
}
var GROUPS=[
['Atención clínica',[
['nursing','🩺','Enfermería','Vitales, evaluación, educación, plan, nota y seguimiento'],
['social','🤝','Trabajo Social','Evaluación psicosocial, necesidades, referidos, plan y nota'],
['nutrition','🥗','Nutrición','Evaluación, antropometría, dieta, plan, educación, seguimiento y nota'],
['mental','🧠','Salud Mental / Psiquiatría','Evaluación, PHQ-9, diagnóstico, seguimiento y nota'],
['substance','🧩','Uso de Sustancias','Evaluación, intervención y seguimiento'],
['toxicology','🧪','Monitoreo Toxicológico','Seguimiento y documentación toxicológica']]],
['Diagnóstico y tratamiento',[
['treatments','💉','Vacunas y Tratamientos','Vacunas y medicamentos'],
['labs','🧫','Laboratorios','Órdenes y resultados'],
['documents','📎','Documentos / Adjuntos','Archivos del paciente']]],
['Operación y seguimiento',[
['appointments','📅','Citas y Recordatorios','Próximas citas'],
['reports','📊','Reportes','Actividad y resúmenes'],
['billing','💵','Facturación clínica','Cargos y estado'],
['membership','💳','Membresía','Estado y pagos']]]
];
function style(){if(q('#nt37ModulesStyle'))return;var s=document.createElement('style');s.id='nt37ModulesStyle';s.textContent='.nt37ModuleGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.nt37ModuleCard{border:1px solid #dbe7e9;border-radius:14px;padding:14px;background:#fff;cursor:pointer;text-align:left}.nt37ModuleIcon{font-size:26px}.nt37ModuleCard strong,.nt37ModuleCard small{display:block;margin-top:5px}.nt37CloudTag{display:inline-block;margin-top:7px;font-size:10px}.navbtn[data-nt-canonical-hidden="1"]{display:none!important}@media(max-width:560px){.nt37ModuleGrid{grid-template-columns:1fr}}';document.head.appendChild(s)}
function markup(){var h='<section id="modulesPage" class="hidden"><div class="pagehead"><div><h2>🧩 Módulos de NurseTrack</h2><div class="muted">Una sola entrada para todos los módulos clínicos y operacionales.</div></div></div>';GROUPS.forEach(function(g){h+='<div class="card"><h3>'+g[0]+'</h3><div class="nt37ModuleGrid">';g[1].forEach(function(m){h+='<button type="button" class="nt37ModuleCard" data-nt-module="'+m[0]+'"><span class="nt37ModuleIcon">'+m[1]+'</span><strong>'+m[2]+'</strong><small>'+m[3]+'</small><span class="nt37CloudTag">☁ Nube</span></button>'});h+='</div></div>'});return h+'</section>'}
function canonicalizeSideNav(){var keep=/^(inicio|home|pacientes|patients|nuevo paciente|new patient|modulos|modules|configuracion|settings)$/;qa('.side .navbtn').forEach(function(b){if(b.id==='nt37ModulesBtn'||b.dataset.ntModulesCenter==='true'){b.removeAttribute('data-nt-canonical-hidden');return}var t=norm(b.textContent).replace(/^[^a-z0-9áéíóúñ]+/i,'').trim();if(keep.test(t)){b.removeAttribute('data-nt-canonical-hidden');return}var dup=/enfermer|trabajo social|nutric|salud mental|psiquiatr|sustancia|toxic|vacuna|tratamiento|laborator|document|adjunto|cita|agenda|reporte|factur|billing|membres|plantilla|portada|audit|respaldo|backup|clearing|recurso|mantenimiento|papelera|permiso|usuario|compañ/i.test(t);if(dup)b.dataset.ntCanonicalHidden='1'})}
function install(){var side=q('.side'),main=q('main.main');if(!side||!main)return;style();if(!q('#modulesPage'))main.insertAdjacentHTML('beforeend',markup());if(!q('#nt37ModulesBtn')){var b=document.createElement('button');b.id='nt37ModulesBtn';b.className='navbtn';b.dataset.ntModulesCenter='true';b.textContent='🧩 Módulos';var settings=side.querySelector('.navbtn[data-page="settings"]');if(settings)side.insertBefore(b,settings);else side.appendChild(b);b.onclick=function(){showOnly(q('#modulesPage'),b)}}canonicalizeSideNav()}
function init(){install();document.addEventListener('click',function(e){var c=e.target&&e.target.closest&&e.target.closest('[data-nt-module]');if(!c)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openModule(c.dataset.ntModule)},true);new MutationObserver(function(){install()}).observe(document.body,{childList:true,subtree:true});window.NT_MODULES_CENTER={openModule:openModule,canonicalize:canonicalizeSideNav}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();