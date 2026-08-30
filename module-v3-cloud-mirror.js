(function(){'use strict';if(window.__ntCloudMirror)return;window.__ntCloudMirror=true;
var PREFIX='mirror:';
var KEYS=[
'nursetrack_clinical_v21','nursetrack_visit_agenda_v295','nursetrack_v3_safe_appointments','nursetrack_v3_safe_labs',
'nursetrack_v3_template_governance','nursetrack_v3_custom_templates','nursetrack_v3_signed_template_records','nursetrack_v3_company_branding',
'nursetrack_v3_users_permissions','nursetrack_v3_patient_assignments','nursetrack_v3_superadmin',
'nursetrack_v3_social_notes','nursetrack_v3_social_referrals','nursetrack_v3_social_case','nursetrack_v3_social_assessment','nursetrack_v3_social_followup','nursetrack_v3_social_closure','nursetrack_v3_addiction_templates','nursetrack_v3_cpt_diagnosis_catalog',
'nursetrack_clinical_safety_v296','nursetrack_v3_safety_safe','nursetrack_provider_handoff_v297',
'nursetrack_billing_v1','nursetrack_v3_billing_safe','nursetrack_v3_membership_safe','nursetrack_v3_membership_payments',
'nursetrack_medication_safety_v1','nursetrack_v3_med_interactions','nursetrack_v3_medication_reference_reviews','nursetrack_fund_routing_v1'
];
var watched=new Set(KEYS),applying=false,started=false,queue=new Map();
var proto=Storage.prototype,origSet=proto.setItem,origRemove=proto.removeItem;
function parse(raw){if(raw==null)return null;try{return JSON.parse(raw)}catch(e){return raw}}
function raw(k){try{return localStorage.getItem(k)}catch(e){return null}}
function store(){return window.NT_CLOUD_STORE&&typeof window.NT_CLOUD_STORE.get==='function'?window.NT_CLOUD_STORE:null}
function status(t){try{var s=document.getElementById('saveStatus');if(s)s.textContent=t}catch(e){}}
function schedule(k,v,removed){if(applying||!watched.has(k))return;clearTimeout(queue.get(k));queue.set(k,setTimeout(async function(){queue.delete(k);var s=store();if(!s)return;try{await s.set(PREFIX+k,{value:v,removed:!!removed,updatedAt:new Date().toISOString()});status('Nube ✓');try{window.dispatchEvent(new CustomEvent('nursetrack:cloud-mirror-saved',{detail:{key:k}}))}catch(e){}}catch(e){status('Guardado local')}},260))}
proto.setItem=function(k,v){var r=origSet.apply(this,arguments);try{if(this===localStorage)schedule(String(k),parse(String(v)),false)}catch(e){}return r};
proto.removeItem=function(k){var r=origRemove.apply(this,arguments);try{if(this===localStorage)schedule(String(k),null,true)}catch(e){}return r};
async function hydrate(opts){opts=opts||{};var s=store();if(!s)return{ok:false,changed:false,pushed:0,pulled:0};var changed=false,pushed=0,pulled=0;applying=true;try{for(var i=0;i<KEYS.length;i++){var k=KEYS[i],remote=null;try{remote=await s.get(PREFIX+k,null,true)}catch(e){remote=null}var localRaw=raw(k);if(remote&&typeof remote==='object'&&Object.prototype.hasOwnProperty.call(remote,'removed')){if(remote.removed){if(localRaw!=null){origRemove.call(localStorage,k);changed=true;pulled++}}else{var rr=JSON.stringify(remote.value),lr=localRaw;if(lr!==rr){origSet.call(localStorage,k,rr);changed=true;pulled++}}}else if(localRaw!=null){try{await s.setNow(PREFIX+k,{value:parse(localRaw),removed:false,updatedAt:new Date().toISOString()});pushed++}catch(e){}}if(i%5===4)await new Promise(function(r){setTimeout(r,35)})}}finally{applying=false}try{window.dispatchEvent(new CustomEvent('nursetrack:cloud-mirror-ready',{detail:{changed:changed,pushed:pushed,pulled:pulled}}))}catch(e){}if(changed&&opts.reload!==false){var mark='nt_cloud_mirror_reloaded';if(!sessionStorage.getItem(mark)){sessionStorage.setItem(mark,'1');setTimeout(function(){location.reload()},60)}}return{ok:true,changed:changed,pushed:pushed,pulled:pulled}}
async function syncNow(){queue.forEach(function(t){clearTimeout(t)});queue.clear();var s=store();if(!s)return{ok:false};for(var i=0;i<KEYS.length;i++){var k=KEYS[i],r=raw(k);if(r!=null){try{await s.setNow(PREFIX+k,{value:parse(r),removed:false,updatedAt:new Date().toISOString()})}catch(e){}}}sessionStorage.removeItem('nt_cloud_mirror_reloaded');return hydrate({reload:true})}
async function init(){if(started)return;started=true;status('Verificando nube…');try{var r=await hydrate({reload:true});if(r.ok)status('Nube ✓');else status('Guardado local')}catch(e){status('Guardado local')}}
window.NT_CLOUD_MIRROR={keys:KEYS.slice(),hydrate:hydrate,syncNow:syncNow,prefix:PREFIX};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,80)});else setTimeout(init,80);
})();