(function(){
  'use strict';
  const client=window.NURSETRACK_CLOUD_CLIENT;
  const local=window.NURSETRACK_LOCAL_API;
  if(!client||!local)return;
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
  function makeKey(){return 'ntv_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);}
  function now(){return new Date().toISOString();}
  ready(function(){
    const dialog=document.getElementById('visitDialog'), form=document.getElementById('visitForm');
    if(!dialog||!form)return;
    let keyInput=form.elements.cloudClientVisitKey;
    if(!keyInput){keyInput=document.createElement('input');keyInput.type='hidden'; keyInput.name='cloudClientVisitKey';form.appendChild(keyInput);}
    const status=document.createElement('div');status.id='cloudVisitSyncStatus';status.className='notice hidden';status.style.marginTop='12px';const actions=form.querySelector('.dialogactions');if(actions) actions.before(status); else form.appendChild(status);
    function show(msg,type){status.textContent=msg;status.classList.remove('hidden','error','ok');if(type)status.classList.add(type);}
    function beginVisit(){keyInput.value=makeKey();status.classList.add('hidden');}
    function ensureKey(v){if(v&&v.cloudClientVisitKey)return v.cloudClientVisitKey;if(!keyInput.value)keyInput.value=makeKey();return keyInput.value;}
    function localPatient(){try{return local.getPatient();}catch(_){return null;}}
    function localState(){try{return local.getState();}catch(_){return null;}}
    function saveLocal(){try{local.save();}catch(_){}}
    document.addEventListener('click',function(e){if(e.target.closest('#newVisit,#newVisitInside,.vitalc'))beginVisit();},true);
    async function syncVisit(p,v){if(!p||!v||!p.mrn||!p.firstName||!p.lastName)return {ok:false,skipped:true};if(v.cloudSyncedAt&&v.cloudVisitId)return {ok:true,idempotent:true,local:true};const visitKey=ensureKey(v);v.cloudClientVisitKey=visitKey;v.cloudSyncStatus='syncing'; v.cloudSyncAttemptedAt=now(); saveLocal();show('☁️ Sincronizando visita con la nube…');const args={p_client_visit_key:visitKey,p_mrn:String(p.mrn||''),p_first_name:String(p.firstName||''),p_last_name:String(p.lastName||''),p_dob:p.dob||null,p_phone:p.phone||null,p_email:p.email||null,p_language:p.language||null,p_patient_status:p.status||'Activo',p_visit_type:v.type||null,p_visit_status:v.status==='Cerrada'?'closed':'open',p_reason:v.reason||null,p_crosswalk_id:v.mhCrosswalkId||null};const {data,error}=await client.rpc('nursetrack_sync_mental_health_visit',args);if(error){v.cloudSyncStatus='failed'; v.cloudSyncError=error.message||String(error); v.cloudSyncAttemptedAt=now(); saveLocal();show('⚠️ La visita quedó guardada localmente, pero la sincronización con la nube falló. Se reintentará automáticamente.','error');document.dispatchEvent(new CustomEvent('nursetrack:cloud-visit-sync-error',{detail:{message:v.cloudSyncError,clientVisitKey:visitKey}}));return {ok:false,error:v.cloudSyncError};}v.cloudVisitId=data&&data.visit_id||v.cloudVisitId||null;v.cloudPatientId=data&&data.patient_id||v.cloudPatientId||null;v.cloudCompanyId=data&&data.company_id||v.cloudCompanyId||null;v.cloudSyncedAt=now();v.cloudSyncStatus='synced'; v.cloudSyncError='';v.cloudBillingRecorded=!!(data&&data.billing_recorded);saveLocal();show(v.cloudBillingRecorded?'✓ Visita y selección clínica sincronizadas con la nube.':'✓ Visita sincronizada con la nube.','ok');document.dispatchEvent(new CustomEvent('nursetrack:cloud-visit-synced',{detail:data||{ok:true}}));return data||{ok:true};}
    async function syncLatest(){const p=localPatient(); if(!p)return;const latest=(p.visits||[]).slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0];if(latest)await syncVisit(p,latest);}
    function queue(){const expected=keyInput.value||makeKey(); keyInput.value=expected;setTimeout(function(){const p=localPatient(); if(!p)return;const latest=(p.visits||[]).slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0];if(!latest)return;if(!latest.cloudClientVisitKey)latest.cloudClientVisitKey=expected;syncVisit(p,latest);},350);}
    document.addEventListener('click',function(e){if(e.target.closest('#saveDraft,#signClose'))queue();},true);
    async function retryPending(){const st=localState();if(!st||!Array.isArray(st.patients)||!navigator.onLine)return;for(const p of st.patients){for(const v of (p.visits||[])){if((v.cloudSyncStatus==='failed'||(!v.cloudSyncedAt&&v.cloudClientVisitKey))&&!v.cloudVisitId){await syncVisit(p,v);}}}}
    window.NurseTrackCloudVisitSync={retry:retryPending,syncLatest:syncLatest};window.addEventListener('online',()=>setTimeout(retryPending,500));setTimeout(retryPending,1800);
  });
})();