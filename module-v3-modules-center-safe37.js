(function(){
'use strict';
if(window.__nt37ModulesCenter)return;window.__nt37ModulesCenter=true;
function q(s,r){return(r||document).querySelector(s)}function qa(s,r){return Array.from((r||document).querySelectorAll(s))}
function currentPatient(){var st=window.state||{};return(st.patients||[]).find(function(p){return String(p.id)===String(st.selectedPatientId)})||null}
function findNav(rx){return qa('.navbtn').find(function(b){return rx.test(b.textContent||'')&&!b.dataset.ntModulesCenter})}
function clickNav(rx){var b=findNav(rx);if(b){b.click();return true}return false}
async function lazy(name){var od=window.nt37OnDemand;if(!od||typeof od.load!=='function')return false;try{return await od.load(name)}catch(e){return false}}
function needPatient(){if(currentPatient())return true;alert('Abra primero un paciente para usar este módulo.');return false}
async function openModule(name){
 if(name==='nursing'){await lazy('nursing');if(!needPatient())return;var b=q('#nt35OpenNursing');if(b)return b.click();return clickNav(/enfermer/i)}
 if(name==='social'){await lazy('social');if(!needPatient())return;if(window.NT_SOCIAL_WORK_MODERN&&typeof window.NT_SOCIAL_WORK_MODERN.open==='function')return window.NT_SOCIAL_WORK_MODERN.open();return clickNav(/trabajo social/i)}
 if(name==='nutrition'){if(!needPatient())return;if(window.NT_NUTRITION&&typeof window.NT_NUTRITION.open==='function')return window.NT_NUTRITION.open();return clickNav(/nutrici/i)}
 if(name==='mental'){if(!needPatient())return;if(window.NT_MENTAL_SUBSTANCE&&typeof window.NT_MENTAL_SUBSTANCE.open==='function')return window.NT_MENTAL_SUBSTANCE.open('mental');alert('El módulo de Salud Mental está cargando. Intente nuevamente.');return}
 if(name==='substance'){if(!needPatient())return;if(window.NT_MENTAL_SUBSTANCE&&typeof window.NT_MENTAL_SUBSTANCE.open==='function')return window.NT_MENTAL_SUBSTANCE.open('substance');alert('El módulo de Sustancias está cargando. Intente nuevamente.');return}
 if(name==='toxicology'){if(!needPatient())return;if(window.NT_MENTAL_SUBSTANCE&&typeof window.NT_MENTAL_SUBSTANCE.open==='function')return window.NT_MENTAL_SUBSTANCE.open('toxicology');alert('El módulo de monitoreo toxicológico está cargando.');return}
 if(name==='labs'){await lazy('labs');return clickNav(/laboratorio|\blab/i)||alert('Laboratorios está cargado. Abra nuevamente Módulos.')}
 if(name==='coding'){await lazy('coding');return clickNav(/icd|cpt|hcpcs|código/i)||alert('Códigos clínicos está cargado. Abra nuevamente Módulos.')}
 if(name==='safety'){await lazy('safety');return clickNav(/seguridad.*med|medicamento/i)||alert('Seguridad de medicamentos está cargada.')}
 if(name==='appointments'){await lazy('appointments');return clickNav(/cita|agenda/i)||alert('Citas y recordatorios está cargado.')}
 if(name==='reports'){await lazy('reports');return clickNav(/reporte|report/i)||alert('Reportes está cargado.')}
 if(name==='membership'){await lazy('membership');return clickNav(/membres/i)||alert('Membresía está cargada.')}
 if(name==='documents'){if(!needPatient())return;if(typeof window.showPage==='function')window.showPage('patient');setTimeout(function(){if(window.NT_PATIENT_DOCUMENTS&&typeof window.NT_PATIENT_DOCUMENTS.load==='function')window.NT_PATIENT_DOCUMENTS.load();var c=q('#nt37PatientDocumentsCard');if(c)c.scrollIntoView({behavior:'smooth',block:'start'})},120);return}
 if(name==='backup'){if(typeof window.showPage==='function')window.showPage('backup');return}
 if(name==='settings'){if(typeof window.showPage==='function')window.showPage('settings');return}
 if(name==='admin'){var b=q('#nt37SuperSidebarBtn')||q('#nt37SuperCenterBtn')||q('#nt37ForcedOpenUsers');if(b)return b.click();if(typeof window.showPage==='function')window.showPage('settings');return}
 if(name==='print'){var b=q('#nt37SuperPrintCenterBtn')||findNav(/impresi|print/i);if(b)return b.click();alert('El centro de impresión está disponible desde las plantillas del paciente.');return}
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
  ['labs','🧫','Laboratorios','Órdenes, resultados, documentos e impresión'],
  ['coding','🧾','ICD-10 / CPT / HCPCS','Diagnósticos, procedimientos y cruce clínico'],
  ['safety','💊','Seguridad de Medicamentos','Alertas e interacciones clínicas'],
  ['documents','📎','Documentos / Adjuntos','Laboratorios externos, pruebas, consentimientos y archivos']]],
 ['Operación y seguimiento',[
  ['appointments','📅','Citas y Recordatorios','Próximas citas, llegadas y recordatorios'],
  ['reports','📊','Reportes','Ausencias, llegadas, actividad y resúmenes'],
  ['membership','💳','Membresía','Estado, vencimiento, pagos y administración'],
  ['print','🖨️','Centro de Impresión','Plantillas y documentos imprimibles'],
  ['backup','💾','Respaldo','Exportación e importación de datos']]],
 ['Administración',[
  ['settings','⚙️','Configuración','Idioma, servicio y preferencias'],
  ['admin','🛡️','Súper Administrador','Usuarios, accesos, permisos y mantenimiento']]]
];
function style(){if(q('#nt37ModulesStyle'))return;var s=document.createElement('style');s.id='nt37ModulesStyle';s.textContent='.nt37ModuleGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.nt37ModuleCard{border:1px solid var(--line,#dbe7e9);border-radius:14px;padding:14px;background:#fff;cursor:pointer;text-align:left}.nt37ModuleCard:hover{box-shadow:0 8px 24px rgba(35,74,82,.10);transform:translateY(-1px)}.nt37ModuleIcon{font-size:26px}.nt37ModuleCard strong{display:block;margin:5px 0;color:#17343c}.nt37ModuleCard small{display:block;color:var(--muted,#687f86);line-height:1.35}.nt37ModuleGroup{margin:0 0 18px}.nt37ModuleGroup h3{margin:0 0 10px}@media(max-width:900px){.nt37ModuleGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.nt37ModuleGrid{grid-template-columns:1fr}}';document.head.appendChild(s)}
function pageMarkup(){var html='<section id="modulesPage" class="hidden"><div class="pagehead"><div><h2>🧩 Módulos de NurseTrack</h2><div class="muted">Acceso central a las áreas clínicas, operacionales y administrativas.</div></div></div>';
 GROUPS.forEach(function(g){html+='<div class="card nt37ModuleGroup"><h3>'+g[0]+'</h3><div class="nt37ModuleGrid">';g[1].forEach(function(m){html+='<button type="button" class="nt37ModuleCard" data-nt-module="'+m[0]+'"><span class="nt37ModuleIcon">'+m[1]+'</span><strong>'+m[2]+'</strong><small>'+m[3]+'</small></button>'});html+='</div></div>'});return html+'</section>'}
function install(){var side=q('.side'),main=q('main.main');if(!side||!main)return false;style();if(!q('#modulesPage')){main.insertAdjacentHTML('beforeend',pageMarkup());qa('[data-nt-module]').forEach(function(b){b.onclick=function(){openModule(b.dataset.ntModule)}})}if(!q('#nt37ModulesBtn')){var b=document.createElement('button');b.id='nt37ModulesBtn';b.className='navbtn';b.dataset.page='modules';b.dataset.ntModulesCenter='true';b.textContent='🧩 Módulos';b.title='Todos los módulos de NurseTrack';var settings=side.querySelector('.navbtn[data-page="settings"]');if(settings)side.insertBefore(b,settings);else side.appendChild(b);b.onclick=function(){if(typeof window.showPage==='function')window.showPage('modules')}}return true}
function init(){install();new MutationObserver(function(){install()}).observe(document.body,{childList:true,subtree:true});document.addEventListener('nt37AppShown',install);window.NT_MODULES_CENTER={open:function(){if(typeof window.showPage==='function')window.showPage('modules')},openModule:openModule}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();