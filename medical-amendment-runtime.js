(function(){
'use strict';
if(window.__NT_MEDICAL_AMENDMENTS)return;window.__NT_MEDICAL_AMENDMENTS=1;
const client=window.NURSETRACK_CLOUD_CLIENT;
if(!client)return;
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const patient=()=>{try{return window.NURSETRACK_LOCAL_API&&window.NURSETRACK_LOCAL_API.getPatient&&window.NURSETRACK_LOCAL_API.getPatient()}catch(_){return null}};
const companyId=()=>window.NURSETRACK_COMPANY_CONTEXT&&window.NURSETRACK_COMPANY_CONTEXT.companyId||'';
function canEdit(){const p=window.NurseTrackPermissions;return !p||!p.ready||p.isSuper||p.can('medical.edit')}
async function current(){
 const ready=window.NURSETRACK_CURRENT_MEDICAL_VISIT;
 if(ready&&ready.encounter)return ready;
 const pt=patient(),cid=companyId();if(!pt||!cid)return null;
 const vr=await client.from('nursetrack_visits').select('id,visit_date').eq('patient_id',pt.id).eq('company_id',cid).is('deleted_at',null).order('visit_date',{ascending:false}).limit(1).maybeSingle();
 if(vr.error||!vr.data)return null;
 const er=await client.from('nursetrack_medical_encounters').select('id,company_id,patient_id,visit_id,status,signed_at,provider_name').eq('patient_id',pt.id).eq('company_id',cid).eq('visit_id',vr.data.id).neq('status','cancelled').limit(1).maybeSingle();
 if(er.error||!er.data)return null;
 return {patientId:pt.id,companyId:cid,visit:vr.data,encounter:er.data};
}
async function history(encounterId){
 const r=await client.from('nursetrack_medical_amendments').select('id,reason,amendment_text,created_by,created_at').eq('encounter_id',encounterId).order('created_at',{ascending:false});
 return r.data||[];
}
function lockSignedFields(root){
 ['#ntm_chief_complaint','#ntm_hpi','#ntm_assessment','#ntm_plan','#ntm_notes','#ntMedicalTemplate','#ntUseMedicalTemplate','#ntDxSearch','#ntProcSearch','#ntMedicalSave','#ntMedicalSign'].forEach(sel=>{const el=$(sel,root);if(el){el.disabled=true;el.setAttribute('aria-disabled','true')}});
 root.querySelectorAll('[data-dx-remove],[data-proc-remove]').forEach(el=>{el.disabled=true;el.style.display='none'});
}
function renderHistory(host,rows){
 const h=$('#ntMedicalAmendmentHistory',host);if(!h)return;
 h.innerHTML=rows.length?rows.map(x=>`<div style="border-top:1px solid #e3ebee;padding:9px 0"><div style="font-size:12px;color:#60737b">${esc(new Date(x.created_at).toLocaleString('es-PR'))} · ${esc(x.reason)}</div><div style="margin-top:4px;white-space:pre-wrap">${esc(x.amendment_text)}</div></div>`).join(''):'<div style="font-size:12px;color:#60737b">No hay enmiendas registradas.</div>';
}
async function saveAmendment(ctx,host){
 const reason=$('#ntMedicalAmendmentReason',host).value.trim(),text=$('#ntMedicalAmendmentText',host).value.trim();
 if(!reason)return alert('Escriba el motivo de la enmienda.');
 if(!text)return alert('Escriba el contenido de la enmienda.');
 const {data:{user}}=await client.auth.getUser();
 const payload={encounter_id:ctx.encounter.id,company_id:ctx.companyId,patient_id:ctx.patientId,visit_id:ctx.visit&&ctx.visit.id||null,reason,amendment_text:text,created_by:user&&user.id||null};
 const r=await client.from('nursetrack_medical_amendments').insert(payload).select('id,reason,amendment_text,created_by,created_at').single();
 if(r.error)return alert(r.error.message||String(r.error));
 $('#ntMedicalAmendmentReason',host).value='';$('#ntMedicalAmendmentText',host).value='';
 renderHistory(host,await history(ctx.encounter.id));
 document.dispatchEvent(new CustomEvent('nursetrack:clinical-data-updated',{detail:{type:'medical_amendment',encounterId:ctx.encounter.id}}));
 alert('Enmienda guardada. La nota médica original permanece sin cambios.');
}
async function apply(){
 const overlay=$('#ntPhysicianOverlay');if(!overlay||overlay.dataset.amendmentReady==='1')return;
 const ctx=await current();if(!ctx||!ctx.encounter||ctx.encounter.status!=='signed')return;
 overlay.dataset.amendmentReady='1';lockSignedFields(overlay);
 const body=$('.ntMdBody',overlay);if(!body)return;
 const card=document.createElement('div');card.className='ntMdCard';card.id='ntMedicalAmendmentCard';
 card.style.border='1px solid #b8d9c6';card.style.background='#fbfffc';
 card.innerHTML=`<h3 style="margin:0 0 8px">🔒 Nota médica firmada</h3><div style="font-size:13px;color:#49625a;margin-bottom:10px">El documento original está bloqueado. ${ctx.encounter.signed_at?'Firmado '+esc(new Date(ctx.encounter.signed_at).toLocaleString('es-PR'))+'.':''} Cualquier corrección se registra como enmienda separada.</div>${canEdit()?`<details><summary style="cursor:pointer;font-weight:700">+ Añadir enmienda</summary><div style="margin-top:10px"><label>Motivo<input id="ntMedicalAmendmentReason" placeholder="Ej. corrección, aclaración o información adicional"></label><label style="display:block;margin-top:8px">Enmienda<textarea id="ntMedicalAmendmentText" placeholder="Escriba la aclaración sin modificar el documento original"></textarea></label><button type="button" class="btn primary" id="ntSaveMedicalAmendment" style="margin-top:8px">Guardar enmienda</button></div></details>`:''}<div style="margin-top:12px"><b>Historial de enmiendas</b><div id="ntMedicalAmendmentHistory" style="margin-top:5px"></div></div>`;
 body.insertBefore(card,body.firstChild);
 renderHistory(card,await history(ctx.encounter.id));
 const save=$('#ntSaveMedicalAmendment',card);if(save)save.onclick=()=>saveAmendment(ctx,card);
}
const obs=new MutationObserver(ms=>{for(const m of ms){for(const n of m.addedNodes||[]){if(n&&n.nodeType===1&&(n.id==='ntPhysicianOverlay'||n.querySelector&&n.querySelector('#ntPhysicianOverlay'))){setTimeout(apply,80);return}}}});
obs.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('nursetrack:medical-visit-ready',()=>setTimeout(apply,120));
setTimeout(apply,500);
window.NURSETRACK_MEDICAL_AMENDMENTS={refresh:apply};
})();