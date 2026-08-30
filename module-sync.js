(function(){
'use strict';
var TABLE='nursetrack_modules';
var META_KEY='nursetrack_module_sync_meta_v1';
var KEYS=[
  'nursetrack_visit_agenda_v295',
  'nursetrack_admin_center_v291',
  'nursetrack_template_design_v294',
  'nursetrack_v3_template_governance',
  'nursetrack_v3_custom_templates',
  'nursetrack_v3_signed_template_records',
  'nursetrack_v3_users_permissions',
  'nursetrack_v3_patient_assignments',
  'nursetrack_v3_superadmin',
  'nursetrack_v3_social_notes',
  'nursetrack_v3_addiction_templates',
  'nursetrack_v3_cpt_diagnosis_catalog',
  'nursetrack_clinical_safety_v296',
  'nursetrack_v3_safety_safe',
  'nursetrack_provider_handoff_v297',
  'nursetrack_billing_v1',
  'nursetrack_v3_billing_safe',
  'nursetrack_v3_membership_safe',
  'nursetrack_v3_membership_payments',
  'nursetrack_medication_safety_v1',
  'nursetrack_v3_med_interactions',
  'nursetrack_v3_medication_reference_reviews',
  'nursetrack_fund_routing_v1'
];
var lastLocal={},applying=false,initializing=false,activeUser='',pushTimer=null,lastRemoteCheck=0;
function now(){return new Date().toISOString()}
function readJSON(k,fb){try{var v=localStorage.getItem(k);return v==null?fb:JSON.parse(v)}catch(e){return fb}}
function writeJSON(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
function readValue(k){var raw=localStorage.getItem(k);if(raw==null)return null;try{return JSON.parse(raw)}catch(e){return raw}}
function writeValue(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
function meta(){var m=readJSON(META_KEY,{});return m&&typeof m==='object'?m:{}}
function saveMeta(m){writeJSON(META_KEY,m)}
function capture(){var out={};KEYS.forEach(function(k){out[k]=readValue(k)});return out}
function serial(v){try{return JSON.stringify(v)}catch(e){return String(v)}}
function meaningful(v){if(v==null)return false;if(Array.isArray(v))return v.length>0;if(typeof v==='object')return Object.keys(v).length>0;return String(v).length>0}
function client(){return window.nt28Cloud&&typeof window.nt28Cloud.from==='function'?window.nt28Cloud:null}
function user(){return window.nt28CloudUser&&window.nt28CloudUser.id?window.nt28CloudUser:null}
function status(text,kind){try{if(typeof window.nt28SetCloudStatus==='function')window.nt28SetCloudStatus(text,kind||'')}catch(e){}try{var p=document.getElementById('nt28CloudPanelStatus');if(p&&text==='Nube sincronizada')p.textContent='Datos, firmas, usuarios, permisos, asignaciones, plantillas, medicamentos, membresía y pagos sincronizados.'}catch(e){}}
function remember(values){KEYS.forEach(function(k){lastLocal[k]=serial(values[k])})}
function notifyModules(){['nursetrack:templates-synced','nursetrack:custom-templates-updated','nursetrack:signed-template-updated','nursetrack:company-directory-updated','nursetrack:patient-assignments-updated','nursetrack:social-templates-synced','nursetrack:addiction-coding-synced','nursetrack:membership-payment-synced','nursetrack:medication-interactions-synced','nursetrack:med-reference-updated'].forEach(function(n){try{window.dispatchEvent(new Event(n))}catch(e){}})}
async function push(showMessage){var c=client(),u=user();if(!c||!u||applying)return false;clearTimeout(pushTimer);pushTimer=null;var m=meta(),values=capture(),stamp=now();if(showMessage)status('Guardando…','busy');try{var r=await c.from(TABLE).upsert({user_id:u.id,app_data:{schema:9,modules:values,stamps:m},updated_at:stamp},{onConflict:'user_id'});if(r.error)throw r.error;remember(values);status('Nube sincronizada','ok');notifyModules();return true}catch(e){status('Sin conexión','error');return false}}
function schedulePush(){clearTimeout(pushTimer);pushTimer=setTimeout(function(){push(false)},700)}
async function initialize(){var c=client(),u=user();if(!c||!u||initializing)return;if(activeUser===u.id)return;initializing=true;status('Sincronizando datos clínicos y configuración…','busy');try{var r=await c.from(TABLE).select('app_data,updated_at').eq('user_id',u.id).maybeSingle();if(r.error)throw r.error;var values=capture(),m=meta(),needPush=false,data=r.data&&r.data.app_data?r.data.app_data:null;if(data){var remote=data.modules||{},stamps=data.stamps||{},fallback=r.data.updated_at||'';applying=true;KEYS.forEach(function(k){var rv=Object.prototype.hasOwnProperty.call(remote,k)?remote[k]:undefined,rs=stamps[k]||fallback,ls=m[k]||'',lv=values[k];if(rv!==undefined&&rs&&(!ls||rs>ls)){writeValue(k,rv);m[k]=rs;values[k]=rv}else if(rv===undefined&&meaningful(lv)){if(!ls)m[k]=now();needPush=true}else if(rv!==undefined&&ls&&ls>=rs&&serial(lv)!==serial(rv))needPush=true});applying=false;saveMeta(m)}else{var first=now();KEYS.forEach(function(k){if(meaningful(values[k])&&!m[k])m[k]=first});saveMeta(m);needPush=true}activeUser=u.id;remember(capture());if(needPush)await push(false);else{status('Nube sincronizada','ok');notifyModules()}}catch(e){applying=false;status('Sin conexión','error')}initializing=false}
async function pull(){var c=client(),u=user();if(!c||!u||activeUser!==u.id||applying)return;try{var r=await c.from(TABLE).select('app_data,updated_at').eq('user_id',u.id).maybeSingle();if(r.error||!r.data||!r.data.app_data)return;var data=r.data.app_data,remote=data.modules||{},stamps=data.stamps||{},fallback=r.data.updated_at||'',m=meta(),changed=false;applying=true;KEYS.forEach(function(k){if(!Object.prototype.hasOwnProperty.call(remote,k))return;var rs=stamps[k]||fallback,ls=m[k]||'';if(rs&&(!ls||rs>ls)){if(writeValue(k,remote[k])){m[k]=rs;lastLocal[k]=serial(remote[k]);changed=true}}});applying=false;if(changed){saveMeta(m);try{if(typeof window.renderAll==='function')window.renderAll()}catch(e){}try{if(typeof window.ntBillingRender==='function')window.ntBillingRender()}catch(e){}notifyModules();status('Nube sincronizada','ok')}}catch(e){applying=false}}
function detectLocalChanges(){var u=user();if(!u){activeUser='';return}if(activeUser!==u.id){initialize();return}if(applying)return;var values=capture(),m=meta(),dirty=false,t=now();KEYS.forEach(function(k){var s=serial(values[k]);if(lastLocal[k]!==undefined&&s!==lastLocal[k]){m[k]=t;dirty=true}lastLocal[k]=s});if(dirty){saveMeta(m);schedulePush()}var n=Date.now();if(n-lastRemoteCheck>5000){lastRemoteCheck=n;pull()}}
async function syncNow(){await initialize();var m=meta(),t=now();KEYS.forEach(function(k){if(meaningful(readValue(k))&&!m[k])m[k]=t});saveMeta(m);await push(true);await pull()}
window.ntModuleSyncNow=syncNow;document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('#nt28CloudSyncNow'):null;if(t)setTimeout(syncNow,50)},true);setInterval(detectLocalChanges,1200);setTimeout(detectLocalChanges,300);
})();