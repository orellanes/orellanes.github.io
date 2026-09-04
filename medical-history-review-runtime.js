(function(){
'use strict';
if(window.__NT_MEDICAL_HISTORY_REVIEW)return;window.__NT_MEDICAL_HISTORY_REVIEW=1;
const client=window.NURSETRACK_CLOUD_CLIENT;if(!client)return;
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const patient=()=>{try{return window.NURSETRACK_LOCAL_API&&window.NURSETRACK_LOCAL_API.getPatient&&window.NURSETRACK_LOCAL_API.getPatient()}catch(_){return null}};
const companyId=()=>window.NURSETRACK_COMPANY_CONTEXT&&window.NURSETRACK_COMPANY_CONTEXT.companyId||'';
const perms=()=>window.NurseTrackPermissions;
const can=k=>!perms()||!perms().ready||perms().isSuper||perms().can(k);
function shell(title,subtitle){const d=document.createElement('dialog');d.style.maxWidth='980px';d.style.width='min(980px,96vw)';d.innerHTML='<div class="dialogbody"><div class="dialoghead"><div><h2>'+esc(title)+'</h2><div class="muted">'+esc(subtitle||'')+'</div></div><button class="btn secondary x">✕</button></div><div class="ntHistBody">Cargando…</div></div>';document.body.appendChild(d);d.querySelector('.x').onclick=()=>d.close();d.addEventListener('close',()=>d.remove());d.showModal();return d}
async function history(){
 if(!can('medical.view'))return alert('No tiene permiso para ver el historial médico.');
 const p=patient(),cid=companyId();if(!p||!p.id||!cid)return alert('Abra un paciente y confirme la compañía activa.');
 const d=shell('Historial médico','Visitas médicas del paciente actual');const body=$('.ntHistBody',d);
 try{
  const er=await client.from('nursetrack_medical_encounters').select('id,visit_id,status,chief_complaint,assessment,plan,provider_name,signed_at,created_at').eq('patient_id',p.id).eq('company_id',cid).neq('status','cancelled').order('created_at',{ascending:false}).limit(50);if(er.error)throw er.error;
  const rows=er.data||[],ids=rows.map(x=>x.id),visitIds=rows.map(x=>x.visit_id).filter(Boolean);
  let dx=[],rx=[],vis=[];
  if(ids.length){const [dr,rr]=await Promise.all([client.from('nursetrack_medical_diagnoses').select('encounter_id,code,description,is_primary').in('encounter_id',ids),client.from('nursetrack_prescriptions').select('id,encounter_id,status,prescription_date,nursetrack_prescription_items(medication_name,strength,dose,route,frequency)').in('encounter_id',ids).order('created_at',{ascending:false})]);dx=dr.data||[];rx=rr.data||[]}
  if(visitIds.length){const vr=await client.from('nursetrack_visits').select('id,visit_date,visit_type,status').in('id',visitIds);vis=vr.data||[]}
  const vm=new Map(vis.map(v=>[v.id,v]));
  body.innerHTML=rows.length?rows.map(e=>{const v=vm.get(e.visit_id)||{},dxe=dx.filter(x=>x.encounter_id===e.id),rxe=rx.filter(x=>x.encounter_id===e.id);return '<div class="ntMdCard" style="margin:10px 0"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><strong>'+esc(v.visit_date||String(e.created_at||'').slice(0,10))+'</strong> · '+esc(v.visit_type||'Visita médica')+'</div><span class="ntBadge">'+esc(e.status||'')+'</span></div><div class="ntSmall" style="margin-top:4px">'+esc(e.provider_name||'Profesional no indicado')+(e.signed_at?' · Firmada '+esc(new Date(e.signed_at).toLocaleString('es-PR')):'')+'</div>'+(e.chief_complaint?'<p><b>Motivo:</b> '+esc(e.chief_complaint)+'</p>':'')+(e.assessment?'<p><b>Assessment:</b> '+esc(e.assessment)+'</p>':'')+(e.plan?'<p><b>Plan:</b> '+esc(e.plan)+'</p>':'')+'<div><b>Diagnósticos:</b> '+(dxe.length?dxe.map(x=>esc(x.code)+(x.is_primary?' ★':'')).join(', '):'—')+'</div><div style="margin-top:5px"><b>Recetas:</b> '+(rxe.length?rxe.flatMap(r=>(r.nursetrack_prescription_items||[]).map(i=>esc(i.medication_name)+(i.strength?' '+esc(i.strength):''))).join(', '):'—')+'</div></div>'}).join(''):'<div class="empty">No hay encuentros médicos registrados.</div>';
 }catch(e){body.innerHTML='<div class="err">'+esc(e.message||String(e))+'</div>'}
}
async function abnormal(){
 if(!can('labs.view'))return alert('No tiene permiso para ver resultados de laboratorio.');
 const p=patient(),cid=companyId();if(!p||!p.id||!cid)return alert('Abra un paciente y confirme la compañía activa.');
 const d=shell('Resultados anormales','Resultados del paciente que requieren revisión');const body=$('.ntHistBody',d);
 async function load(){
  const r=await client.from('nursetrack_labs').select('id,visit_id,lab_type,result_value,numeric_value,unit,result_date,source,review_status,notes,reviewed_at').eq('patient_id',p.id).eq('company_id',cid).eq('abnormal',true).order('result_date',{ascending:false}).limit(100);
  if(r.error){body.innerHTML='<div class="err">'+esc(r.error.message)+'</div>';return}
  const rows=r.data||[];body.innerHTML=rows.length?rows.map(x=>'<div class="ntMdCard" style="margin:10px 0"><div style="display:flex;justify-content:space-between;gap:10px"><div><strong>'+esc(x.lab_type)+'</strong><div class="ntSmall">'+esc(x.result_date||'')+(x.source?' · '+esc(x.source):'')+'</div></div><span class="ntBadge">'+esc(x.review_status||'pending')+'</span></div><div style="margin-top:7px"><b>Resultado:</b> '+esc(x.result_value!=null&&x.result_value!==''?x.result_value:(x.numeric_value!=null?x.numeric_value:'—'))+(x.unit?' '+esc(x.unit):'')+'</div>'+(x.notes?'<div style="margin-top:5px">'+esc(x.notes)+'</div>':'')+((x.review_status!=='reviewed'&&can('labs.edit'))?'<button class="btn primary ntReviewLab" data-id="'+esc(x.id)+'" style="margin-top:8px">Marcar revisado</button>':'')+'</div>').join(''):'<div class="empty">No hay resultados anormales registrados.</div>';
  body.querySelectorAll('.ntReviewLab').forEach(b=>b.onclick=async()=>{const {data:{user}}=await client.auth.getUser();const u=await client.from('nursetrack_labs').update({review_status:'reviewed',reviewed_by:user&&user.id||null,reviewed_at:new Date().toISOString()}).eq('id',b.dataset.id).eq('company_id',cid).eq('patient_id',p.id);if(u.error)return alert(u.error.message);load();document.dispatchEvent(new CustomEvent('nursetrack:lab-result-reviewed',{detail:{id:b.dataset.id}}))})
 }
 load();
}
function install(){const o=$('#ntPhysicianOverlay');if(!o)return;const a=$('.ntMdHead .ntMdActions',o);if(!a)return;if(!$('#ntMedicalHistoryBtn',o)){const b=document.createElement('button');b.id='ntMedicalHistoryBtn';b.type='button';b.className='btn secondary';b.textContent='📚 Historial';b.onclick=history;a.insertBefore(b,a.lastElementChild)}if(!$('#ntAbnormalLabsBtn',o)){const b=document.createElement('button');b.id='ntAbnormalLabsBtn';b.type='button';b.className='btn secondary';b.textContent='⚠️ Anormales';b.onclick=abnormal;a.insertBefore(b,a.lastElementChild)}}
const mo=new MutationObserver(()=>setTimeout(install,40));mo.observe(document.documentElement,{subtree:true,childList:true});document.addEventListener('nursetrack:medical-visit-ready',()=>setTimeout(install,80));setTimeout(install,500);
window.NURSETRACK_MEDICAL_HISTORY_REVIEW={history,abnormal,install};
})();
