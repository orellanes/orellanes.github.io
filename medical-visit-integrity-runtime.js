(function(){
'use strict';
if(window.__NT_MEDICAL_VISIT_INTEGRITY)return;window.__NT_MEDICAL_VISIT_INTEGRITY=1;
const client=window.NURSETRACK_CLOUD_CLIENT;
if(!client)return;
const patient=()=>{try{return window.NURSETRACK_LOCAL_API&&window.NURSETRACK_LOCAL_API.getPatient&&window.NURSETRACK_LOCAL_API.getPatient()}catch(_){return null}};
const companyId=()=>window.NURSETRACK_COMPANY_CONTEXT&&window.NURSETRACK_COMPANY_CONTEXT.companyId||'';
const isMedicalTarget=el=>!!(el&&el.closest&&el.closest('[data-dd="medical"],#ntOpenPhysician,[data-role-action="medical"]'));
let preparing=null, preparedKey='';
function key(pid,cid,vid){return [pid||'',cid||'',vid||''].join('|')}
async function latestVisit(pid,cid){
 const r=await client.from('nursetrack_visits').select('id,visit_date,status,provider_name').eq('patient_id',pid).eq('company_id',cid).is('deleted_at',null).order('visit_date',{ascending:false}).limit(1).maybeSingle();
 if(r.error)throw r.error;return r.data||null;
}
async function encounterForVisit(pid,cid,vid){
 if(!vid)return null;
 const r=await client.from('nursetrack_medical_encounters').select('id,visit_id,status,signed_at,created_at').eq('patient_id',pid).eq('company_id',cid).eq('visit_id',vid).neq('status','cancelled').limit(1).maybeSingle();
 if(r.error)throw r.error;return r.data||null;
}
async function createDraft(pid,cid,visit){
 const {data:{user}}=await client.auth.getUser();
 const provider=(user&&((user.user_metadata&&user.user_metadata.display_name)||user.email))||visit&&visit.provider_name||null;
 const payload={company_id:cid,patient_id:pid,visit_id:visit.id,provider_user_id:user&&user.id||null,provider_name:provider,status:'draft'};
 const r=await client.from('nursetrack_medical_encounters').insert(payload).select('id,visit_id,status,signed_at,created_at').single();
 if(!r.error)return r.data;
 if(String(r.error.code||'')==='23505')return encounterForVisit(pid,cid,visit.id);
 throw r.error;
}
async function prepareCurrentVisit(){
 const pt=patient(),cid=companyId();
 if(!pt||!pt.id||!cid)throw new Error('Paciente o compañía no disponible.');
 const visit=await latestVisit(pt.id,cid);
 if(!visit)throw new Error('No hay una visita activa o reciente para abrir el módulo médico.');
 const k=key(pt.id,cid,visit.id);
 if(preparedKey===k)return {visit,encounter:await encounterForVisit(pt.id,cid,visit.id)};
 let encounter=await encounterForVisit(pt.id,cid,visit.id);
 if(!encounter)encounter=await createDraft(pt.id,cid,visit);
 preparedKey=k;
 window.NURSETRACK_CURRENT_MEDICAL_VISIT={patientId:pt.id,companyId:cid,visit,encounter};
 document.dispatchEvent(new CustomEvent('nursetrack:medical-visit-ready',{detail:window.NURSETRACK_CURRENT_MEDICAL_VISIT}));
 return window.NURSETRACK_CURRENT_MEDICAL_VISIT;
}
async function guardedPrepare(){if(preparing)return preparing;preparing=prepareCurrentVisit().finally(()=>{preparing=null});return preparing}
document.addEventListener('click',async function(e){
 const el=e.target&&e.target.closest&&e.target.closest('button,[data-dd],[data-role-action]');
 if(!isMedicalTarget(el))return;
 const pt=patient(),cid=companyId();if(!pt||!cid)return;
 let visit=null;try{visit=await latestVisit(pt.id,cid)}catch(_){return}
 const k=visit&&key(pt.id,cid,visit.id)||'';
 if(k&&preparedKey===k)return;
 e.preventDefault();e.stopImmediatePropagation();
 try{await guardedPrepare();setTimeout(()=>el.click(),0)}catch(err){alert(err&&err.message||String(err))}
},true);
document.addEventListener('nursetrack:clinical-data-updated',()=>{preparedKey=''});
document.addEventListener('nursetrack:company-changed',()=>{preparedKey=''});
window.NURSETRACK_MEDICAL_VISIT_INTEGRITY={prepareCurrentVisit:guardedPrepare,get current(){return window.NURSETRACK_CURRENT_MEDICAL_VISIT||null}};
})();