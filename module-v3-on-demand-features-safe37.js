(function(){'use strict';
if(window.__nt37OnDemand)return;window.__nt37OnDemand=true;
var VERSION='20260903-cloud-patienttemplates2';
var bundles={
 nursing:['module-v3-shared-demographics-safe37.js','module-v3-nursing-host-safe35.js','module-v3-nursing-modern.js','module-v3-nursing-complete-visit-safe36.js','module-v3-nursing-print-safe36.js','module-v3-nursing-followup-shared-safe37.js'],
 social:['module-v3-shared-demographics-safe37.js','module-v3-social-work-shared-demographics-safe37.js','module-v3-social-work-modern.js'],
 nutrition:['module-v3-nutrition-safe37.js'],
 mental:['module-v3-mental-substance-safe37.js'],
 treatments:['module-v3-vaccines-treatments-safe37.js'],
 stations:['module-v3-stations-safe37.js'],
 labs:['module-v3-lab-full-catalog-safe37.js','module-v3-lab-order-safe37.js','module-v3-lab-header-safe37.js','module-v3-lab-cloud-orders-safe37.js'],
 coding:['module-v3-fcodes-safe37.js','coding-assistant.js','module-v3-coding-bridge-safe37.js'],
 catalogs:['module-v3-code-catalog-admin-safe37.js','module-v3-diagnosis-catalog-admin-safe37.js','module-v3-diagnosis-bulk-tools-safe37.js','module-v3-icd-import-guard-safe37.js'],
 safety:['module-v3-medication-safety-safe37.js'],
 documents:['module-v3-patient-documents-safe37.js'],
 appointments:['module-v3-appointments-safe37.js','module-v3-reminder-outbox-safe37.js'],
 reports:['module-v3-reports-safe37.js'],
 membership:['module-v3-safe-membership.js','module-v3-membership-patient-link-safe37.js','module-v3-membership-plan-admin.js','module-v3-paypal-readiness.js'],
 billing:['module-v3-billing-safe37.js'],
 signature:['module-v3-professional-profile-safe37.js','module-v3-electronic-signature-safe37.js'],
 templates:['module-v3-design-studio-safe37.js'],
 classic_templates:['module-v3-template-studio-safe36.js'],
 backup:['module-v3-cloud-backup-audit-safe37.js'],
 audit:['module-v3-cloud-backup-audit-safe37.js'],
 health:['module-v3-system-health-safe37.js'],
 print:['module-v3-superadmin-print-center-safe37.js'],
 admin:['module-v3-user-management-safe37.js','module-v3-user-permission-admin-safe37.js','module-v3-user-details-admin-safe37.js','module-v3-superadmin-center-safe37.js','module-v3-superadmin-maintenance-safe37.js']
};
var loaded={},inflight={};
function pause(ms){return new Promise(function(r){setTimeout(r,ms)})}
function hasScript(src){return Array.from(document.scripts).some(function(s){return (s.src||'').indexOf(src)>=0})}
function add(src){return new Promise(function(resolve){if(hasScript(src)){resolve(true);return}var s=document.createElement('script'),done=false,t=setTimeout(function(){if(done)return;done=true;try{s.remove()}catch(e){}resolve(false)},7000);s.src=src+'?v='+VERSION+'&t='+Date.now();s.async=false;s.onload=function(){if(done)return;done=true;clearTimeout(t);resolve(true)};s.onerror=function(){if(done)return;done=true;clearTimeout(t);resolve(false)};(document.head||document.documentElement).appendChild(s)})}
async function doLoad(name){if(loaded[name])return true;var list=bundles[name]||[],ok=list.length>0;document.documentElement.dataset.ntCloudModuleLoading=name;for(var i=0;i<list.length;i++){var x=await add(list[i]);if(!x){await pause(150);x=await add(list[i])}if(!x)ok=false;await pause(80)}if(ok)loaded[name]=true;delete document.documentElement.dataset.ntCloudModuleLoading;document.documentElement.dataset['ntOnDemand'+name.charAt(0).toUpperCase()+name.slice(1)]=ok?'loaded':'failed';try{document.dispatchEvent(new CustomEvent('nt37CloudModuleLoaded',{detail:{module:name,ok:ok}}))}catch(e){}return ok}
function load(name){if(loaded[name])return Promise.resolve(true);if(inflight[name])return inflight[name];inflight[name]=doLoad(name).finally(function(){delete inflight[name]});return inflight[name]}
function currentPatient(){var st=window.state||{};return(st.patients||[]).find(function(p){return String(p.id)===String(st.selectedPatientId)})||null}
function findNav(words){return Array.from(document.querySelectorAll('.navbtn')).find(function(b){var t=(b.textContent||'').toLowerCase();return !b.dataset.ntLazyPlaceholder&&words.some(function(w){return t.indexOf(w)>=0})})}
async function openGeneric(name,words,btn){var old=btn&&btn.textContent;if(btn){btn.disabled=true;btn.textContent='Cargando desde la nube…'}var guard=window.nt37UserPermissions;if(guard&&typeof guard.moduleAllowed==='function'&&guard.moduleAllowed(name)===false){if(btn){btn.disabled=false;btn.textContent=old}alert('Este usuario no tiene permiso para abrir este módulo.');return false}var ok=await load(name);if(btn){btn.disabled=false;btn.textContent=old}if(!ok){alert('No se pudo cargar este módulo desde la nube. Verifica la conexión.');return false}var real=findNav(words||[]);if(real){real.click();return true}return true}
function placeholder(side,label,name,words){if(!side||side.querySelector('[data-nt-lazy-placeholder="'+name+'"]'))return;var b=document.createElement('button');b.className='navbtn';b.dataset.ntLazyPlaceholder=name;b.textContent=label;b.onclick=function(){openGeneric(name,words,b)};side.appendChild(b)}
function setup(){var side=document.querySelector('.side');if(side){placeholder(side,'🩺 Enfermería','nursing',['enfermer']);placeholder(side,'🤝 Trabajo Social','social',['trabajo social']);placeholder(side,'🥗 Nutrición','nutrition',['nutric']);placeholder(side,'💉 Vacunas / Tratamientos','treatments',['vacuna','tratamiento']);placeholder(side,'🧠 Salud Mental','mental',['salud mental','psiquiatr']);placeholder(side,'🏥 Estaciones','stations',['estaciones']);placeholder(side,'🧪 Laboratorios','labs',['laboratorio','lab']);placeholder(side,'🧾 ICD-10 / CPT / HCPCS','coding',['icd','cpt','código']);placeholder(side,'💊 Seguridad de medicamentos','safety',['medicamento','seguridad']);placeholder(side,'📅 Citas','appointments',['cita','agenda']);placeholder(side,'📊 Reportes','reports',['reporte','report']);placeholder(side,'💳 Membresía','membership',['membres']);}document.documentElement.dataset.ntOnDemandReady='true';try{if(window.nt37UserPermissions&&window.nt37UserPermissions.apply)window.nt37UserPermissions.apply()}catch(e){}}
function init(){setup();new MutationObserver(function(){setup()}).observe(document.body,{childList:true,subtree:true});window.nt37OnDemand={load:load,bundles:bundles,isLoaded:function(n){return!!loaded[n]},loaded:loaded,currentPatient:currentPatient}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();