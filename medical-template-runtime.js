(function(){
'use strict';
if(window.__NT_MEDICAL_TEMPLATE_RUNTIME)return;window.__NT_MEDICAL_TEMPLATE_RUNTIME=1;
const client=window.NURSETRACK_CLOUD_CLIENT;if(!client)return;
const $=(s,r=document)=>r.querySelector(s);
const companyId=()=>window.NURSETRACK_COMPANY_CONTEXT&&window.NURSETRACK_COMPANY_CONTEXT.companyId||'';
let templates=[],printLoading=false;
function ensurePrint(){if(window.NURSETRACK_MEDICAL_PRINT||printLoading)return;printLoading=true;const loader=window.NURSETRACK_MODULE_LOADER;if(loader&&loader.load){loader.load('/medical-print-runtime.js').finally(()=>{printLoading=false});return}const s=document.createElement('script');s.src='/medical-print-runtime.js?v='+(window.NURSETRACK_BUILD||Date.now());s.async=true;s.onload=s.onerror=()=>{printLoading=false};document.body.appendChild(s)}
async function load(){
 const cid=companyId();
 let q=client.from('nursetrack_templates').select('id,template_name,template_key,schema_json,company_id,language,status').eq('document_type','medical').eq('status','published').eq('language','es').is('deleted_at',null).order('template_name');
 const r=await q;if(r.error)return [];
 templates=(r.data||[]).filter(t=>!t.company_id||t.company_id===cid);return templates;
}
function fill(t){
 const s=t&&t.schema_json||{};
 const map={chief_complaint:'#ntm_chief_complaint',hpi:'#ntm_hpi',assessment:'#ntm_assessment',plan:'#ntm_plan',notes:'#ntm_notes'};
 Object.keys(map).forEach(k=>{const el=$(map[k]);if(el&&s[k]!=null)el.value=String(s[k])});
}
async function apply(){
 const overlay=$('#ntPhysicianOverlay'),sel=$('#ntMedicalTemplate');if(!overlay||!sel)return;ensurePrint();if(sel.dataset.publishedReady==='1')return;
 const rows=await load();
 sel.innerHTML='<option value="">Seleccionar plantilla médica…</option>'+rows.map(t=>'<option value="'+t.id+'">'+String(t.template_name||'Plantilla')+'</option>').join('');
 sel.dataset.publishedReady='1';
 const btn=$('#ntUseMedicalTemplate');if(btn){btn.onclick=function(){const t=templates.find(x=>x.id===sel.value);if(t)fill(t)}}
}
const obs=new MutationObserver(ms=>{for(const m of ms){for(const n of m.addedNodes||[]){if(n&&n.nodeType===1&&(n.id==='ntPhysicianOverlay'||n.querySelector&&n.querySelector('#ntPhysicianOverlay'))){setTimeout(apply,80);return}}}});
obs.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('nursetrack:medical-visit-ready',()=>setTimeout(apply,100));
setTimeout(apply,500);
window.NURSETRACK_MEDICAL_TEMPLATES={refresh:apply,load};
})();