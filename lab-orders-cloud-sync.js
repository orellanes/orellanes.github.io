(function(){
  'use strict';
  const client=window.NURSETRACK_CLOUD_CLIENT;
  const local=window.NURSETRACK_LOCAL_API;
  if(!client||!local)return;
  function state(){try{return local.getState()||{}}catch(_){return {}}}
  function currentPatient(){try{return local.getPatient&&local.getPatient()}catch(_){return null}}
  function companyId(){return window.NURSETRACK_COMPANY_CONTEXT&&window.NURSETRACK_COMPANY_CONTEXT.companyId||''}
  function save(){try{local.save&&local.save()}catch(_){}}
  function now(){return new Date().toISOString()}
  function splitCodes(v){return String(v||'').split(/[\s,;]+/).map(x=>x.trim()).filter(Boolean)}
  function uniq(arr){return Array.from(new Set((arr||[]).filter(Boolean)))}
  function testsPayload(o){const dx=splitCodes(o.diagnosis),cpt=splitCodes(o.cpt);return String(o.tests||'').split(/\n+/).map(x=>x.trim()).filter(Boolean).map(name=>({name,dx,cpt}))}
  async function resolveCloudPatient(p){if(!p||!p.mrn)return null;let q=client.from('nursetrack_patients_v2').select('id,company_id,mrn').eq('mrn',String(p.mrn));const cid=companyId();if(cid)q=q.eq('company_id',cid);const {data,error}=await q.limit(1);if(error)throw error;return data&&data[0]||null}
  async function resolveVisit(cp){if(!cp)return null;const ready=window.NURSETRACK_CURRENT_MEDICAL_VISIT;if(ready&&ready.patientId===cp.id&&ready.companyId===cp.company_id&&ready.visit&&ready.visit.id)return ready.visit.id;const {data,error}=await client.from('nursetrack_visits').select('id').eq('patient_id',cp.id).eq('company_id',cp.company_id).is('deleted_at',null).order('visit_date',{ascending:false}).limit(1).maybeSingle();if(error)throw error;return data&&data.id||null}
  async function syncOrder(o,p){
    if(!o||!p||o.cloudSyncStatus==='syncing')return;
    if(o.cloudSyncedAt&&!o.cloudDirty)return;
    if(!navigator.onLine)return;
    o.cloudSyncStatus='syncing';o.cloudSyncAttemptedAt=now();save();
    try{
      const cp=await resolveCloudPatient(p);if(!cp)throw new Error('No se encontró el paciente en la nube para la compañía activa. Guarde/sincronice primero el expediente o una visita.');
      const visitId=o.visitId||await resolveVisit(cp);
      const {data:{user}}=await client.auth.getUser();
      const status=(o.status==='Cancelada')?'cancelled':(o.status==='Modificada'?'amended':'ordered');
      const payload={company_id:cp.company_id,patient_id:cp.id,visit_id:visitId||null,status,tests:testsPayload(o),diagnosis_codes:splitCodes(o.diagnosis),clinical_reason:o.reason||null,professional_confirmed:!!String(o.provider||'').trim(),created_by:o.createdBy||user&&user.id||null,order_date:o.orderDate||null,priority:o.priority||'Rutina',instructions:o.instructions||null,ordering_professional:o.provider||null,ordering_professional_id:o.providerId||null,client_order_key:o.id,amendment_history:Array.isArray(o.amendmentHistory)?o.amendmentHistory:[],cancellation_reason:o.cancellationReason||null,cancelled_at:o.cancelledAt||null,last_modified_by:user&&user.id||null,updated_at:now()};
      const {data,error}=await client.from('nursetrack_lab_orders').upsert(payload,{onConflict:'client_order_key'}).select('id,visit_id').single();if(error)throw error;
      o.visitId=data&&data.visit_id||visitId||null;o.cloudOrderId=data&&data.id||null;o.cloudSyncedAt=now();o.cloudDirty=false;o.cloudSyncStatus='synced';o.cloudSyncError='';save();
      try{await client.from('nursetrack_audit_events').insert({company_id:cp.company_id,user_id:user&&user.id||null,action:o.lastAuditAction||'lab_order_sync',entity_type:'lab_order',entity_id:String(o.cloudOrderId||o.id),patient_id:cp.id,metadata:{local_order_id:o.id,visit_id:o.visitId||null,status:o.status||'Activa',reason:o.cancellationReason||null,changed_at:o.lastModifiedAt||o.createdAt||now()}})}catch(_){ }
      document.dispatchEvent(new CustomEvent('nursetrack:lab-order-synced',{detail:{localOrderId:o.id,cloudOrderId:o.cloudOrderId,visitId:o.visitId||null}}));
    }catch(err){o.cloudSyncStatus='failed';o.cloudSyncError=err&&err.message||String(err);o.cloudSyncAttemptedAt=now();save();document.dispatchEvent(new CustomEvent('nursetrack:lab-order-sync-error',{detail:{localOrderId:o.id,message:o.cloudSyncError}}))}
  }
  async function retryPending(){const s=state();if(!Array.isArray(s.patients)||!Array.isArray(s.labOrders)||!navigator.onLine)return;for(const o of s.labOrders){if(o.cloudSyncedAt&&!o.cloudDirty)continue;const p=s.patients.find(x=>x.id===o.patientId);if(p)await syncOrder(o,p)}}
  let pulling=false,lastPullKey='';
  async function pullForPatient(p,force){
    if(!p||!p.mrn||!navigator.onLine||pulling)return {ok:false,skipped:true};const key=String(p.id||'')+'|'+String(p.mrn||'')+'|'+companyId();if(!force&&key===lastPullKey)return {ok:true,cached:true};pulling=true;
    try{
      const cp=await resolveCloudPatient(p);if(!cp)return {ok:false,notFound:true};
      const {data,error}=await client.from('nursetrack_lab_orders').select('id,patient_id,visit_id,status,tests,diagnosis_codes,clinical_reason,professional_confirmed,created_at,updated_at,order_date,priority,instructions,ordering_professional,ordering_professional_id,client_order_key,amendment_history,cancellation_reason,cancelled_at').eq('patient_id',cp.id).eq('company_id',cp.company_id).order('created_at',{ascending:false});if(error)throw error;
      const s=state();s.labOrders=s.labOrders||[];let changed=false;
      for(const row of (data||[])){
        const localId=row.client_order_key||('cloud_'+row.id);let o=s.labOrders.find(x=>x.id===localId||x.cloudOrderId===row.id);if(o&&o.cloudDirty)continue;
        const testRows=Array.isArray(row.tests)?row.tests:[],names=testRows.map(t=>typeof t==='string'?t:(t&&t.name)||'').filter(Boolean),dx=uniq([].concat(Array.isArray(row.diagnosis_codes)?row.diagnosis_codes:[],...testRows.map(t=>Array.isArray(t&&t.dx)?t.dx:[]))),cpt=uniq([].concat(...testRows.map(t=>Array.isArray(t&&t.cpt)?t.cpt:[])));
        const mapped={id:localId,patientId:p.id,visitId:row.visit_id||null,createdAt:row.created_at||now(),orderDate:row.order_date||String(row.created_at||'').slice(0,10),priority:row.priority||'Rutina',tests:names.join('\n'),diagnosis:dx.join(', '),cpt:cpt.join(', '),reason:row.clinical_reason||'',provider:row.ordering_professional||'',providerId:row.ordering_professional_id||'',instructions:row.instructions||'',status:row.status==='cancelled'?'Cancelada':(row.status==='amended'?'Modificada':'Activa'),amendmentHistory:Array.isArray(row.amendment_history)?row.amendment_history:[],cancellationReason:row.cancellation_reason||'',cancelledAt:row.cancelled_at||null,cloudOrderId:row.id,cloudSyncedAt:row.updated_at||row.created_at||now(),cloudDirty:false,cloudSyncStatus:'synced',cloudSyncError:''};
        if(!o){s.labOrders.push(mapped);changed=true}else{const before=JSON.stringify(o);Object.assign(o,mapped);if(JSON.stringify(o)!==before)changed=true}
      }
      if(changed)save();lastPullKey=key;document.dispatchEvent(new CustomEvent('nursetrack:lab-orders-loaded',{detail:{patientId:p.id,count:(data||[]).length,changed}}));return {ok:true,count:(data||[]).length,changed};
    }catch(err){console.warn('Could not load laboratory orders from cloud',err);return {ok:false,error:err&&err.message||String(err)}}finally{pulling=false}
  }
  async function pullCurrent(force){return pullForPatient(currentPatient(),!!force)}
  window.NurseTrackLabCloudSync={retry:retryPending,pullCurrent,pullForPatient,syncOrder};
  window.addEventListener('online',()=>setTimeout(function(){retryPending();pullCurrent(true)},500));
  ['nursetrack:lab-order-created','nursetrack:lab-order-changed'].forEach(ev=>document.addEventListener(ev,()=>setTimeout(function(){retryPending();pullCurrent(true)},100)));
  document.addEventListener('nursetrack:lab-order-synced',()=>setTimeout(function(){pullCurrent(true)},150));
  document.addEventListener('nursetrack:company-changed',()=>{lastPullKey='';setTimeout(()=>pullCurrent(true),100)});
  setTimeout(function(){retryPending();pullCurrent(true)},1600);setInterval(retryPending,15000);setInterval(function(){const p=currentPatient();if(p&&document.querySelector('#patientPage:not(.hidden)'))pullForPatient(p,false);else lastPullKey=''},1800);
})();