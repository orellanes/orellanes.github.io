(function(){'use strict';if(window.__ntCloudMirror)return;window.__ntCloudMirror=true;
var PREFIX='mirror:';
var KEYS=[
'nursetrack_clinical_v21','nursetrack_visit_agenda_v295','nursetrack_v3_safe_appointments','nursetrack_v3_safe_labs',
'nursetrack_v3_template_governance','nursetrack_v3_custom_templates','nursetrack_v3_completed_template_records','nursetrack_v3_signed_template_records','nursetrack_v3_company_branding','nursetrack_v3_login_cover',
'nursetrack_v3_users_permissions','nursetrack_v3_patient_assignments','nursetrack_v3_superadmin','nursetrack_v3_assisted_recovery_audit',
'nursetrack_v3_social_notes','nursetrack_v3_social_referrals','nursetrack_v3_social_case','nursetrack_v3_social_assessment','nursetrack_v3_social_followup','nursetrack_v3_social_closure','nursetrack_v3_addiction_templates','nursetrack_v3_cpt_diagnosis_catalog',
'nursetrack_v3_clinical_catalog_v1','nursetrack_v3_clinical_catalog_audit','nursetrack_v3_lab_orders','nursetrack_v3_prescriptions_ready',
'nursetrack_clinical_safety_v296','nursetrack_v3_safety_safe','nursetrack_provider_handoff_v297',
'nursetrack_billing_v1','nursetrack_v3_billing_safe','nursetrack_v3_membership_safe','nursetrack_v3_membership_payments',
'nursetrack_medication_safety_v1','nursetrack_v3_med_interactions','nursetrack_v3_medication_reference_reviews','nursetrack_fund_routing_v1'
];
var watched=new Set(KEYS),applying=false,started=false,queue=new Map();
var proto=Storage.prototype,origSet=proto.setItem,origRemove=proto.removeItem;
function parse(raw){if(raw==null)return null;try{return JSON.parse(raw)}catch(e){return raw}}
function raw(k){try{return localStorage.getItem(k)}catch(e){return null}}
function store(){return window.NT_CLOUD_STORE&&typeof window.NT_CLOUD_STORE.get==='function'?window.NT_CLOUD_STORE:null}
function setCloudStatus(text,kind){try{var s=document.getElementById('saveStatus');if(s)s.textContent=text}catch(e){}try{if(typeof window.nt28SetCloudStatus==='function')window.nt28SetCloudStatus(text,kind||'')}catch(e){}}
function signal(name,detail){try{window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}))}catch(e){}}
function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
function failStatus(err){setCloudStatus('Error de nube','error');signal('nursetrack:cloud-mirror-error',{message:err&&err.message?err.message:String(err||'Cloud error')})}
function schedule(k,v,removed){if(applying||!watched.has(k))return;clearTimeout(queue.get(k));queue.set(k,setTimeout(async function(){queue.delete(k);var s=store();if(!s){setCloudStatus('Guardado local','error');return}try{await s.set(PREFIX+k,{value:v,removed:!!removed,updatedAt:new Date().toISOString()});setCloudStatus('Nube ✓','ok');signal('nursetrack:cloud-mirror-saved',{key:k})}catch(e){failStatus(e)}},260))}
proto.setItem=function(k,v){var r=origSet.apply(this,arguments);try{if(this===localStorage)schedule(String(k),parse(String(v)),false)}catch(e){}return r};
proto.removeItem=function(k){var r=origRemove.apply(this,arguments);try{if(this===localStorage)schedule(String(k),null,true)}catch(e){}return r};
async function verifyStore(s){if(!s||typeof s.list!=='function')throw new Error('Cloud Store unavailable');await s.list();return true}
async function hydrate(opts){opts=opts||{};var s=store();if(!s)throw new Error('Cloud Store unavailable');await verifyStore(s);var changed=false,pushed=0,pulled=0;applying=true;try{for(var i=0;i<KEYS.length;i++){var k=KEYS[i],remote=await s.get(PREFIX+k,null,true),localRaw=raw(k);if(remote&&typeof remote==='object'&&Object.prototype.hasOwnProperty.call(remote,'removed')){if(remote.removed){if(localRaw!=null){origRemove.call(localStorage,k);changed=true;pulled++}}else{var rr=JSON.stringify(remote.value);if(localRaw!==rr){origSet.call(localStorage,k,rr);changed=true;pulled++}}}else if(localRaw!=null){await s.setNow(PREFIX+k,{value:parse(localRaw),removed:false,updatedAt:new Date().toISOString()});pushed++}if(i%5===4)await wait(35)}}finally{applying=false}signal('nursetrack:cloud-mirror-ready',{changed:changed,pushed:pushed,pulled:pulled});if(changed&&opts.reload!==false)setTimeout(function(){location.reload()},120);return{ok:true,changed:changed,pushed:pushed,pulled:pulled}}
async function syncNow(){var s=store();if(!s)throw new Error('Cloud Store unavailable');setCloudStatus('Sincronizando…','busy');if(queue.size)await wait(520);try{var r=await hydrate({reload:true});if(!r.changed)setCloudStatus('Nube ✓','ok');return r}catch(e){failStatus(e);throw e}}
async function init(){if(started)return;started=true;setCloudStatus('Verificando nube…','busy');try{var r=await hydrate({reload:true});if(r.ok&&!r.changed)setCloudStatus('Nube ✓','ok')}catch(e){failStatus(e)}}
window.NT_CLOUD_MIRROR={keys:KEYS.slice(),hydrate:hydrate,syncNow:syncNow,prefix:PREFIX,verify:function(){var s=store();return verifyStore(s)}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,120)});else setTimeout(init,120);
})();