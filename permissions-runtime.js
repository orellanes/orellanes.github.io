(function(){
  'use strict';
  const client=window.NURSETRACK_CLOUD_CLIENT;
  if(!client)return;
  const state={ready:false,isSuper:false,role:'',userId:null,allowed:new Set()};
  const deniedMessage='No tiene permiso para usar esta función. Comuníquese con el Súper Administrador.';
  const selectors={
    'patients.view':['[data-page="patients"]','#patientPage','#sideSearch','#patientList'],
    'patients.edit':['[data-page="newPatient"]','#newPatientTop','#newPatientHome','#newPatientForm','#demoForm button[type="submit"]'],
    'nursing.view':['.tab[data-tab="nursing"]','#nursingTab'],
    'nursing.edit':['#newVisit','#newVisitInside','.vitalc','#saveDraft','#signClose'],
    'medical.view':['#ntPhysicianOpen','#ntPhysicianOverlay','[data-pwtab="medical"]'],
    'medical.edit':['#ntMedicalSave','#ntMedicalSign','#ntRxSave','#ntCloseVisit','.nt-med-edit','.nt-med-remove'],
    'social_work.view':['.tab[data-tab="social"]','#socialTab'],
    'social_work.edit':['#socialForm button[type="submit"]'],
    'attachments.manage':['.tab[data-tab="documents"]','#documentsTab','#addDoc','#docInput','.delDoc'],
    'print.use':['#printCenter','#printSelected','#printVitalCards'],
    'reports.view':['[data-page="backup"]','#backupPage','#exportPatientExcel','#exportCensusExcel','#exportVisitsExcel','#exportDischargesExcel'],
    'settings.manage':['[data-page="settings"]','#settingsPage #settingsForm'],
    'mental_health.view':['[data-page="mentalHealthCloud"]','#mentalHealthPage'],
    'mental_health.edit':['.mh-confirm','.mh-confirm-dx','.mhVisitPick','#mhVisitRemove'],
    'billing.edit':['#billingCodeAdminPanel','#billingCodeAdminPage'],
    'labs.view':['#ntLabMenuWrap','.nt-lab-dialog','.nt-lab-print-state'],
    'labs.edit':['[data-act="new"]','.nt-new','.nt-edit','.nt-cancel-order','.nt-save','#ntLabCatalogAdmin'],
    'users.manage':['#ntPermissionsAdmin']
  };
  const actionPermission=[
    ['#newPatientTop,#newPatientHome,[data-page="newPatient"]','patients.edit'],
    ['#newVisit,#newVisitInside,.vitalc,#saveDraft,#signClose','nursing.edit'],
    ['.tab[data-tab="nursing"]','nursing.view'],
    ['#ntPhysicianOpen,[data-pwtab="medical"]','medical.view'],
    ['#ntMedicalSave,#ntMedicalSign,#ntRxSave,#ntCloseVisit,.nt-med-edit,.nt-med-remove','medical.edit'],
    ['.tab[data-tab="social"]','social_work.view'],
    ['#socialForm button[type="submit"]','social_work.edit'],
    ['#addDoc,#docInput,.delDoc','attachments.manage'],
    ['#printCenter,#printSelected,#printVitalCards','print.use'],
    ['[data-page="backup"],#exportPatientExcel,#exportCensusExcel,#exportVisitsExcel,#exportDischargesExcel','reports.view'],
    ['[data-page="settings"]','settings.manage'],
    ['[data-page="mentalHealthCloud"]','.mh-pick-dx,.mh-pick-code','mental_health.view'],
    ['.mh-confirm,.mh-confirm-dx,.mhVisitPick,#mhVisitRemove','mental_health.edit'],
    ['#ntLabMain,[data-act="list"],[data-act="print"],.nt-view,.nt-print,.nt-history','labs.view'],
    ['[data-act="new"],.nt-new,.nt-edit,.nt-cancel-order,.nt-save,#ntLabCatalogAdmin','labs.edit']
  ];
  function normalizeRole(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\s_-]+/g,'');}
  function isSuperRole(v){return ['superadmin','superadministrator','superadministrador'].includes(normalizeRole(v));}
  function can(key){return state.isSuper||state.allowed.has(key);}
  function hide(el,yes){if(!el)return;el.classList.toggle('hidden',!!yes);if(yes)el.setAttribute('data-nt-permission-hidden','1');else el.removeAttribute('data-nt-permission-hidden');}
  function apply(){if(!state.ready)return;Object.entries(selectors).forEach(([key,list])=>{const allowed=can(key);list.forEach(sel=>document.querySelectorAll(sel).forEach(el=>hide(el,!allowed)));});if(can('patients.view')&&!can('patients.edit'))document.querySelectorAll('#demoForm input,#demoForm select,#demoForm textarea').forEach(el=>el.disabled=true);if(can('nursing.view')&&!can('nursing.edit'))document.querySelectorAll('#visitForm input,#visitForm select,#visitForm textarea').forEach(el=>el.disabled=true);if(can('medical.view')&&!can('medical.edit'))document.querySelectorAll('#ntPhysicianOverlay input,#ntPhysicianOverlay select,#ntPhysicianOverlay textarea').forEach(el=>el.disabled=true);if(can('social_work.view')&&!can('social_work.edit'))document.querySelectorAll('#socialForm input,#socialForm select,#socialForm textarea').forEach(el=>el.disabled=true);if(can('labs.view')&&!can('labs.edit'))document.querySelectorAll('#ntLabForm input,#ntLabForm select,#ntLabForm textarea').forEach(el=>el.disabled=true);document.dispatchEvent(new CustomEvent('nursetrack:permissions-applied',{detail:{role:state.role,isSuper:state.isSuper,allowed:[...state.allowed]}}));}
  async function load(){const {data:{user}}=await client.auth.getUser();if(!user)return;state.userId=user.id;const {data:profile,error:profileError}=await client.from('nursetrack_profiles').select('role,active').eq('user_id',user.id).maybeSingle();if(profileError||!profile||!profile.active){state.ready=true;apply();return;}state.role=profile.role||'';state.isSuper=isSuperRole(state.role);if(!state.isSuper){const {data,error}=await client.from('nursetrack_user_permissions').select('permission_key,allowed').eq('user_id',user.id).eq('allowed',true);if(!error)(data||[]).forEach(x=>state.allowed.add(x.permission_key));}state.ready=true;if(state.isSuper){document.documentElement.dataset.ntSuperadmin='true';window.NURSETRACK_SUPERADMIN_FULL_ACCESS=true;}apply();}
  window.NurseTrackPermissions={can,isSuperRole,get ready(){return state.ready;},get role(){return state.role;},get isSuper(){return state.isSuper;},refresh:async function(){state.allowed.clear();state.ready=false;await load();return true;}};
  document.addEventListener('click',function(e){if(!state.ready||state.isSuper)return;for(const [sel,key] of actionPermission){if(e.target.closest(sel)&&!can(key)){e.preventDefault();e.stopImmediatePropagation();alert(deniedMessage);return;}}},true);
  document.addEventListener('submit',function(e){if(!state.ready||state.isSuper)return;const f=e.target;const key=f.id==='newPatientForm'||f.id==='demoForm'?'patients.edit':f.id==='socialForm'?'social_work.edit':f.id==='visitForm'?'nursing.edit':f.id==='settingsForm'?'settings.manage':f.id==='ntLabForm'?'labs.edit':f.id==='ntMedicalForm'?'medical.edit':null;if(key&&!can(key)){e.preventDefault();e.stopImmediatePropagation();alert(deniedMessage);}},true);
  document.addEventListener('nursetrack:permissions-updated',function(e){if(e.detail&&e.detail.user_id===state.userId)window.NurseTrackPermissions.refresh();});
  const observer=new MutationObserver(()=>apply());observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();