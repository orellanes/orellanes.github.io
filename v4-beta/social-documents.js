(function(){
'use strict';
if(window.__NT_V4_SOCIAL_DOCS__) return;
window.__NT_V4_SOCIAL_DOCS__=true;

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const LABELS={
  demographics:'Demografía',household:'Composición familiar / red de apoyo',housing:'Vivienda',income:'Ingresos / empleo / beneficios',transportation:'Transportación',needs:'Necesidades sociales',mental_health:'Salud mental',substance_use:'Uso de sustancias',interventions:'Intervenciones / gestiones',referrals:'Referidos',changes:'Cambios desde la última intervención',plan:'Plan / seguimiento'
};
let sb=null,ctx=null,patient=null,currentTemplate=null,currentDocument=null,saving=false;

function addStyles(){
 if(document.getElementById('ntV4SocialDocsStyle')) return;
 const st=document.createElement('style');st.id='ntV4SocialDocsStyle';st.textContent=`
 .ntv4-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.ntv4-card{border:1px solid #d8e6e8;border-radius:14px;padding:14px;background:#fff;margin-top:12px}.ntv4-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ntv4-field.full{grid-column:1/-1}.ntv4-field label{display:block;font-weight:800;margin-bottom:6px}.ntv4-field small{display:block;color:#6f858b;margin-bottom:6px}.ntv4-field textarea{width:100%;min-height:105px}.ntv4-docrow{display:grid;grid-template-columns:1.4fr .7fr .8fr auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #e4eeee}.ntv4-docrow:last-child{border-bottom:0}.ntv4-muted{color:#6f858b}.ntv4-status{margin-top:10px;font-size:13px}.ntv4-ok{color:#216b48}.ntv4-err{color:#9b3d3d}.ntv4-template{width:100%;text-align:left;border:1px solid #d8e6e8;background:#fff;padding:14px;border-radius:12px;margin:6px 0;cursor:pointer}.ntv4-template:hover{background:#f7fbfb}.ntv4-template strong{display:block}.ntv4-template small{color:#6f858b}@media(max-width:700px){.ntv4-fields{grid-template-columns:1fr}.ntv4-docrow{grid-template-columns:1fr}.ntv4-field.full{grid-column:auto}}
 `;(document.head||document.documentElement).appendChild(st);
}

async function initClient(){
 if(sb) return sb;
 if(typeof window.NT_loadSupabase!=='function') throw new Error('Supabase no disponible');
 const lib=await window.NT_loadSupabase();
 const cfg=window.NURSETRACK_SUPABASE||{};
 sb=lib.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
 return sb;
}
async function getCtx(){
 await initClient();
 const ses=await sb.auth.getSession();
 const user=ses?.data?.session?.user;if(!user) throw new Error('Sesión no disponible');
 let company=null;
 let r=await sb.from('nursetrack_company_users').select('company_id').eq('user_id',user.id).eq('active',true).limit(1);
 if(!r.error&&r.data?.[0]) company=r.data[0].company_id;
 if(!company){let m=await sb.from('nursetrack_account_memberships').select('company_id').eq('user_id',user.id).eq('status','active').limit(1);company=m.data?.[0]?.company_id||null}
 if(!company) throw new Error('No hay compañía activa');
 ctx={user,company};return ctx;
}
function parseMrn(){
 const el=document.getElementById('patientMrn');if(!el) return '';
 return (el.textContent||'').replace(/^(MRN|Expediente)\s*:?-?\s*/i,'').trim();
}
async function resolvePatient(){
 const c=await getCtx();const mrn=parseMrn();
 let q=sb.from('nursetrack_patients_v2').select('*').eq('company_id',c.company).is('deleted_at',null);
 if(mrn) q=q.ilike('mrn',mrn);
 else {
   const name=(document.getElementById('patientName')?.textContent||'').trim();
   if(!name) throw new Error('Abre un paciente primero');
   const parts=name.split(/\s+/);q=q.ilike('first_name',parts[0]||'').ilike('last_name',parts[parts.length-1]||'');
 }
 const r=await q.limit(1);if(r.error) throw r.error;if(!r.data?.[0]) throw new Error('No pude resolver el paciente activo');
 patient=r.data[0];return patient;
}
function area(){return document.getElementById('patientActionArea')}
function setArea(html){const a=area();if(a)a.innerHTML=html}
function status(text,type){const el=document.getElementById('ntv4SocialStatus');if(!el)return;el.textContent=text||'';el.className='ntv4-status '+(type==='ok'?'ntv4-ok':type==='err'?'ntv4-err':'ntv4-muted')}
function patientHeader(p){return `<div class="ntv4-card"><strong>${esc(p.first_name)} ${esc(p.last_name)}</strong> <span class="ntv4-muted">· Expediente ${esc(p.mrn||'')}</span><div class="ntv4-muted">DOB ${esc(p.date_of_birth||'—')} · ${esc(p.phone||'Sin teléfono')}</div></div>`}

async function socialTemplates(){
 const c=await getCtx();
 let r=await sb.from('nursetrack_templates').select('id,company_id,template_key,template_name,document_type,language,status,current_version,schema_json,style_json').eq('document_type','social_work').eq('status','published').is('deleted_at',null).or(`company_id.is.null,company_id.eq.${c.company}`).order('template_name');
 if(r.error) throw r.error;return r.data||[];
}
async function openSocial(){
 try{
   const p=await resolvePatient(),templates=await socialTemplates();
   setArea(`${patientHeader(p)}<div class="ntv4-card"><h3>Trabajo Social</h3><p class="ntv4-muted">Plantillas publicadas de tu biblioteca actual.</p>${templates.length?templates.map(t=>`<button class="ntv4-template" data-ntv4-template="${esc(t.id)}"><strong>${esc(t.template_name)}</strong><small>${esc(t.template_key)} · versión ${esc(t.current_version)}</small></button>`).join(''):'<div class="ntv4-muted">No hay plantillas publicadas.</div>'}<div id="ntv4SocialStatus" class="ntv4-status"></div></div>`);
   area()?.querySelectorAll('[data-ntv4-template]').forEach(b=>b.addEventListener('click',()=>{const t=templates.find(x=>x.id===b.dataset.ntv4Template);if(t) openSocialTemplate(t)}));
 }catch(e){setArea(`<div class="ntv4-card ntv4-err">${esc(e.message||e)}</div>`)}
}
async function loadDraft(t){
 const c=await getCtx(),p=patient||await resolvePatient();
 const r=await sb.from('nursetrack_documents').select('*').eq('company_id',c.company).eq('patient_id',p.id).eq('template_id',t.id).eq('status','draft').is('deleted_at',null).order('updated_at',{ascending:false}).limit(1);
 if(r.error) throw r.error;return r.data?.[0]||null;
}
async function openSocialTemplate(t){
 try{
   currentTemplate=t;currentDocument=await loadDraft(t);const p=patient||await resolvePatient();
   const vals=currentDocument?.data_json?.fields||currentDocument?.data_json||{};
   const fields=Object.entries(t.schema_json||{});
   setArea(`${patientHeader(p)}<div class="ntv4-card"><div class="ntv4-toolbar"><button class="btn light" id="ntv4BackSocial">← Trabajo Social</button><button class="btn light" id="ntv4PrintSocial">Imprimir</button></div><h3>${esc(t.template_name)}</h3><div class="ntv4-muted">${currentDocument?'Editando borrador existente — no se creará otro.':'Nuevo borrador'} · versión ${esc(t.current_version)}</div><div class="ntv4-fields">${fields.map(([k,h])=>`<div class="ntv4-field ${k==='plan'||k==='interventions'||k==='demographics'?'full':''}"><label>${esc(LABELS[k]||k.replaceAll('_',' '))}</label><small>${esc(h||'')}</small><textarea data-ntv4-field="${esc(k)}">${esc(vals[k]||'')}</textarea></div>`).join('')}</div><div class="ntv4-toolbar"><button class="btn" id="ntv4SaveSocial">Guardar borrador</button><button class="btn secondary" id="ntv4SignSocial">Guardar y firmar</button></div><div id="ntv4SocialStatus" class="ntv4-status"></div></div>`);
   document.getElementById('ntv4BackSocial')?.addEventListener('click',openSocial);
   document.getElementById('ntv4SaveSocial')?.addEventListener('click',()=>saveSocial(false));
   document.getElementById('ntv4SignSocial')?.addEventListener('click',()=>saveSocial(true));
   document.getElementById('ntv4PrintSocial')?.addEventListener('click',printSocial);
   area()?.querySelector('textarea')?.focus();
 }catch(e){setArea(`<div class="ntv4-card ntv4-err">${esc(e.message||e)}</div>`)}
}
function collectFields(){const out={};area()?.querySelectorAll('[data-ntv4-field]').forEach(el=>out[el.dataset.ntv4Field]=el.value.trim());return out}
function summary(fields){return Object.entries(fields).filter(([,v])=>v).map(([k,v])=>`${LABELS[k]||k}: ${v}`).join('\n').slice(0,10000)}
async function saveSocial(sign){
 if(saving)return;saving=true;status(sign?'Guardando y firmando…':'Guardando…');
 try{
   const c=await getCtx(),p=patient||await resolvePatient(),t=currentTemplate;if(!t)throw new Error('Plantilla no seleccionada');
   const fields=collectFields();const payload={template_key:t.template_key,template_name:t.template_name,fields,patient_snapshot:{mrn:p.mrn,first_name:p.first_name,last_name:p.last_name,date_of_birth:p.date_of_birth,phone:p.phone,email:p.email,residential_address:p.residential_address,postal_address:p.postal_address}};
   const base={company_id:c.company,patient_id:p.id,template_id:t.id,template_version:t.current_version||1,document_type:'social_work',status:'draft',data_json:payload,rendered_summary:summary(fields),created_by:c.user.id,updated_at:new Date().toISOString()};
   let doc=currentDocument;
   if(doc){const r=await sb.from('nursetrack_documents').update({data_json:payload,rendered_summary:base.rendered_summary,updated_at:base.updated_at}).eq('id',doc.id).eq('status','draft').select('*').single();if(r.error)throw r.error;doc=r.data}
   else {const check=await loadDraft(t);if(check){currentDocument=check;return saveSocial(sign)}const r=await sb.from('nursetrack_documents').insert(base).select('*').single();if(r.error)throw r.error;doc=r.data}
   currentDocument=doc;
   if(sign){const r=await sb.rpc('nursetrack_sign_document',{p_document_id:doc.id});if(r.error)throw r.error;status('Documento guardado y firmado.','ok');setTimeout(()=>openSocialTemplate(t),500)}
   else status('Borrador guardado. Se actualizará este mismo borrador la próxima vez.','ok');
 }catch(e){status(e.message||String(e),'err')}finally{saving=false}
}
function printSocial(){
 const p=patient;if(!p||!currentTemplate)return;const fields=collectFields();const w=window.open('','_blank','noopener,noreferrer');if(!w)return;
 w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(currentTemplate.template_name)}</title><style>body{font-family:Arial,sans-serif;color:#172f36;margin:32px}h1{font-size:22px}.head{border-bottom:2px solid #397f88;padding-bottom:12px;margin-bottom:18px}.row{margin:14px 0}.row strong{display:block;margin-bottom:5px}.muted{color:#64777c;font-size:13px;white-space:pre-wrap}.value{white-space:pre-wrap}</style></head><body><div class="head"><h1>${esc(currentTemplate.template_name)}</h1><div>${esc(p.first_name)} ${esc(p.last_name)} · Expediente ${esc(p.mrn||'')}</div><div class="muted">DOB ${esc(p.date_of_birth||'—')} · ${esc(p.phone||'')}</div></div>${Object.entries(fields).map(([k,v])=>`<div class="row"><strong>${esc(LABELS[k]||k.replaceAll('_',' '))}</strong><div class="value">${esc(v||'—')}</div></div>`).join('')}</body></html>`);w.document.close();setTimeout(()=>w.print(),150)
}

async function openDocuments(){
 try{
   const c=await getCtx(),p=await resolvePatient();
   const [d,a]=await Promise.all([
     sb.from('nursetrack_documents').select('id,template_id,template_version,document_type,status,rendered_summary,signed_at,created_at,updated_at').eq('company_id',c.company).eq('patient_id',p.id).is('deleted_at',null).order('created_at',{ascending:false}).limit(100),
     sb.from('nursetrack_patient_documents').select('id,category,file_name,mime_type,size_bytes,created_at').eq('company_id',c.company).eq('patient_id',p.id).order('created_at',{ascending:false}).limit(100)
   ]);
   if(d.error)throw d.error;if(a.error)throw a.error;
   setArea(`${patientHeader(p)}<div class="ntv4-card"><div class="ntv4-toolbar"><button class="btn secondary" id="ntv4GoSocial">+ Trabajo Social</button></div><h3>Documentos clínicos</h3>${d.data?.length?d.data.map(x=>`<div class="ntv4-docrow"><div><strong>${esc(x.document_type||'Documento')}</strong><div class="ntv4-muted">${esc((x.rendered_summary||'').slice(0,120))}</div></div><div>${esc(x.status||'')}</div><div>${esc((x.signed_at||x.updated_at||x.created_at||'').slice(0,10))}</div><button class="btn light" data-ntv4-doc="${esc(x.id)}">Ver</button></div>`).join(''):'<div class="ntv4-muted">No hay documentos clínicos todavía.</div>'}<h3 style="margin-top:22px">Archivos del paciente</h3>${a.data?.length?a.data.map(x=>`<div class="ntv4-docrow"><div><strong>${esc(x.file_name)}</strong><div class="ntv4-muted">${esc(x.category||'archivo')} · ${esc(x.mime_type||'')}</div></div><div>${x.size_bytes?Math.round(Number(x.size_bytes)/1024)+' KB':''}</div><div>${esc((x.created_at||'').slice(0,10))}</div><span></span></div>`).join(''):'<div class="ntv4-muted">No hay archivos adicionales.</div>'}</div>`);
   document.getElementById('ntv4GoSocial')?.addEventListener('click',openSocial);
   area()?.querySelectorAll('[data-ntv4-doc]').forEach(b=>b.addEventListener('click',()=>viewDocument(b.dataset.ntv4Doc)));
 }catch(e){setArea(`<div class="ntv4-card ntv4-err">${esc(e.message||e)}</div>`)}
}
async function viewDocument(id){
 const c=await getCtx(),p=patient||await resolvePatient();const r=await sb.from('nursetrack_documents').select('*').eq('company_id',c.company).eq('patient_id',p.id).eq('id',id).single();if(r.error){setArea(`<div class="ntv4-card ntv4-err">${esc(r.error.message)}</div>`);return}const d=r.data;const f=d.data_json?.fields||d.data_json||{};setArea(`${patientHeader(p)}<div class="ntv4-card"><div class="ntv4-toolbar"><button class="btn light" id="ntv4BackDocs">← Documentos</button></div><h3>${esc(d.document_type||'Documento')}</h3><div class="ntv4-muted">Estado: ${esc(d.status)} · ${esc((d.signed_at||d.updated_at||d.created_at||'').slice(0,10))}</div>${Object.entries(f).map(([k,v])=>typeof v==='object'?'':`<div class="ntv4-card"><strong>${esc(LABELS[k]||k.replaceAll('_',' '))}</strong><div style="white-space:pre-wrap;margin-top:6px">${esc(v||'')}</div></div>`).join('')}</div>`);document.getElementById('ntv4BackDocs')?.addEventListener('click',openDocuments)
}

function intercept(e){
 const social=e.target.closest?.('.patient-action[data-action="social"]');
 const docs=e.target.closest?.('.patient-action[data-action="documents"]');
 if(social){e.preventDefault();e.stopImmediatePropagation();openSocial();return}
 if(docs){e.preventDefault();e.stopImmediatePropagation();openDocuments();return}
 const mod=e.target.closest?.('.module');if(mod){const name=(mod.querySelector('strong')?.textContent||'').trim();if(name==='Trabajo Social'){e.preventDefault();e.stopImmediatePropagation();document.querySelector('[data-action="social"]')?.click()}if(name==='Documentos'){e.preventDefault();e.stopImmediatePropagation();document.querySelector('[data-action="documents"]')?.click()}}
}
function boot(){addStyles();document.addEventListener('click',intercept,true);window.NT_V4_SOCIAL_DOCS={openSocial,openDocuments,version:'1.0.0'}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
