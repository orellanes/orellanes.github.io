(function(){
'use strict';
if(window.__NT_V4_PATIENT_ROW_OPEN_FIX_V3__)return;
window.__NT_V4_PATIENT_ROW_OPEN_FIX_V3__=true;
let busy=false,lastOpen=0;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[m]));
function getRow(t){if(!t)return null;if(t.nodeType===3)t=t.parentElement;return t&&t.closest?t.closest('#patientResults .patient-row'):null}
function age(dob){if(!dob)return'';const d=new Date(String(dob).slice(0,10)+'T00:00:00'),n=new Date();if(Number.isNaN(d.getTime()))return'';let a=n.getFullYear()-d.getFullYear(),m=n.getMonth()-d.getMonth();if(m<0||(m===0&&n.getDate()<d.getDate()))a--;return a>=0?a:''}
function demo(l,v){return '<div class="demo"><small>'+esc(l)+'</small><strong>'+esc(v||'—')+'</strong></div>'}
async function client(){if(typeof NT_loadSupabase!=='function')throw Error('Cloud no disponible');const lib=await NT_loadSupabase(),cfg=window.NURSETRACK_SUPABASE||{};if(!cfg.url||!cfg.publishableKey)throw Error('Configuración cloud no disponible');return lib.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}})}
async function companyFor(sb,u){let r=await sb.from('nursetrack_company_users').select('company_id').eq('user_id',u.id).eq('active',true).limit(1);if(!r.error&&r.data?.[0])return r.data[0].company_id;let m=await sb.from('nursetrack_account_memberships').select('company_id').eq('user_id',u.id).eq('status','active').limit(1);return m.data?.[0]?.company_id||null}
function mrnFromRow(row){const spans=[...row.querySelectorAll('span')];for(const s of spans){const m=String(s.textContent||'').match(/Expediente:\s*(.+)$/i);if(m)return m[1].trim()}return''}
async function openDirect(row,e){
 if(!row||busy)return;
 if(e){e.preventDefault();e.stopPropagation();}
 const now=Date.now();if(now-lastOpen<700)return;lastOpen=now;busy=true;
 try{
  const mrn=mrnFromRow(row);if(!mrn||mrn==='—')throw Error('No pude identificar el expediente');
  const sb=await client();const ses=await sb.auth.getSession();const u=ses.data?.session?.user;if(!u)throw Error('Sesión no disponible');
  const company=await companyFor(sb,u);if(!company)throw Error('No hay compañía activa');
  const r=await sb.from('nursetrack_patients_v2').select('id,company_id,mrn,first_name,middle_name,last_name,date_of_birth,phone,email,preferred_language,status,sex,city,residential_address,postal_address,education_level').eq('company_id',company).eq('mrn',mrn).is('deleted_at',null).maybeSingle();
  if(r.error||!r.data)throw Error(r.error?.message||'No se encontró el paciente');
  const p=r.data;
  window.NT_ACTIVE_PATIENT=p;try{sessionStorage.setItem('nursetrack_active_patient',JSON.stringify(p))}catch(_){}
  $('homePanel')?.classList.add('hidden');$('modulesPanel')?.classList.add('hidden');$('placeholderPanel')?.classList.add('hidden');$('patientPanel')?.classList.remove('hidden');
  if($('pageTitle'))$('pageTitle').textContent='Expediente';
  if($('patientName'))$('patientName').textContent=[p.first_name,p.middle_name,p.last_name].filter(Boolean).join(' ');
  if($('patientMrn'))$('patientMrn').textContent='Expediente '+(p.mrn||'—');
  if($('patientDemographics'))$('patientDemographics').innerHTML=demo('Fecha de nacimiento',p.date_of_birth)+(age(p.date_of_birth)!==''?demo('Edad',age(p.date_of_birth)+' años'):'')+demo('Sexo',p.sex)+demo('Teléfono',p.phone)+demo('Email',p.email)+demo('Idioma',p.preferred_language)+demo('Ciudad',p.city)+demo('Dirección residencial',p.residential_address)+demo('Dirección postal',p.postal_address)+demo('Educación',p.education_level)+demo('Estado',p.status);
  if($('patientActionArea'))$('patientActionArea').innerHTML='<div class="notice">Expediente abierto. Selecciona la plantilla que deseas completar.</div>';
  try{window.dispatchEvent(new CustomEvent('nursetrack:patient-selected',{detail:p}))}catch(_){}
  try{row.blur()}catch(_){}
 }catch(err){console.error('NurseTrack direct patient open failed',err);const st=$('searchStatus');if(st){st.textContent='No se pudo abrir el expediente: '+err.message;st.className='status error'}}finally{busy=false}
}
document.addEventListener('touchend',e=>{const row=getRow(e.target);if(row)openDirect(row,e)},{capture:true,passive:false});
document.addEventListener('click',e=>{const row=getRow(e.target);if(row)openDirect(row,e)},true);
})();