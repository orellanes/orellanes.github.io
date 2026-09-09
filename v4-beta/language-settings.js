(function(){
'use strict';
if(window.__NT_V4_LANGUAGE_SETTINGS__) return;
window.__NT_V4_LANGUAGE_SETTINGS__=true;

const $=id=>document.getElementById(id);
let sb=null,currentLanguage='es',currentUser=null,busy=false;

const PAIRS=[
  ['Inicio','Home'],['Pacientes','Patients'],['Logística','Logistics'],['Módulos','Modules'],['Bloquear','Lock'],
  ['Expediente','Record'],['Enfermería','Nursing'],['Trabajo Social','Social Work'],['Médico','Medical'],['Medicina','Medicine'],
  ['Laboratorios','Laboratory'],['Documentos','Documents'],['Facturación','Billing'],['Membresía','Membership'],['Reportes','Reports'],['Administración','Administration'],
  ['Estado del sistema','System status'],['Nube activa','Cloud active'],['Datos clínicos conectados','Clinical data connected'],
  ['Panel principal','Main dashboard'],['Busca un paciente o abre directamente un área de trabajo.','Search for a patient or open a work area directly.'],
  ['+ Nuevo paciente','+ New patient'],['Plantillas','Templates'],['Abrir módulo →','Open module →'],['Ver plantillas →','View templates →'],['Abrir documentos →','Open documents →'],
  ['Pacientes activos','Active patients'],['Visitas hoy','Visits today'],['Buscar','Search'],['Compañía','Company'],
  ['Sistema Clínico y Administrativo','Clinical and Administrative System'],['Nueva visita','New visit'],['+ Nueva visita','+ New visit'],
  ['Historial','History'],['Citas','Appointments'],['Apariencia / Portadas','Appearance / Covers'],['Capacidad / Memoria','Capacity / Storage'],
  ['Asignaciones','Assignments'],['Inventario','Inventory'],['Localidades / Departamentos','Locations / Departments'],['Tareas','Tasks'],['Recordatorios','Reminders'],
  ['Súper Administrador','Super Administrator'],['Usuarios','Users'],['Crear usuario','Create user'],['Settings','Settings'],['Idioma','Language']
];

function targetText(text,lang){
  const t=String(text||'').trim();
  for(const [es,en] of PAIRS){
    if(t===es||t===en) return lang==='en'?en:es;
  }
  return null;
}

function translateExactElements(lang){
  const selectors=['.nav button','.nt-boceto-nav','.nt-system strong','.nt-status-row','#ntBocetoWelcome h3','#ntBocetoWelcome p','#ntNewPatientBoceto','.nt-quick strong','.nt-quick span','.nt-quick em','.metric span','#searchBtn','#logoutBtn','#pageTitle','.patient-action','#newVisitBtn'];
  document.querySelectorAll(selectors.join(',')).forEach(el=>{
    const v=targetText(el.textContent,lang);
    if(v!==null) el.textContent=v;
  });
  const search=$('patientSearch');
  if(search) search.placeholder=lang==='en'?'Search by name, date of birth, phone, or record number':'Buscar por nombre, fecha de nacimiento, teléfono o expediente';
  const loginName=$('loginName');
  if(loginName) loginName.placeholder=lang==='en'?'Username':'';
  document.documentElement.lang=lang==='en'?'en':'es';
  try{localStorage.setItem('nt_preferred_language',lang)}catch(_){}
}

function apply(lang){
  currentLanguage=lang==='en'?'en':'es';
  translateExactElements(currentLanguage);
  [100,500,1500,3500].forEach(ms=>setTimeout(()=>translateExactElements(currentLanguage),ms));
  return currentLanguage;
}

async function client(){
  if(sb) return sb;
  if(typeof window.NT_loadSupabase!=='function') throw new Error('Supabase no disponible');
  const lib=await window.NT_loadSupabase(),cfg=window.NURSETRACK_SUPABASE||{};
  if(!cfg.url||!cfg.publishableKey) throw new Error('Configuración cloud incompleta');
  sb=lib.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
  return sb;
}

async function session(){
  await client();
  const s=await sb.auth.getSession();
  currentUser=s?.data?.session?.user||null;
  return currentUser;
}

async function loadPreference(){
  const u=await session();
  if(!u){
    let cached='es';
    try{cached=localStorage.getItem('nt_preferred_language')||'es'}catch(_){}
    return apply(cached);
  }
  const r=await sb.from('nursetrack_profiles').select('preferred_language').eq('user_id',u.id).maybeSingle();
  if(r.error) throw r.error;
  return apply(r.data?.preferred_language||'es');
}

function shell(title){
  ['homePanel','modulesPanel','placeholderPanel'].forEach(id=>$(id)?.classList.add('hidden'));
  $('patientPanel')?.classList.remove('hidden');
  if($('patientName')) $('patientName').textContent=title;
  if($('patientMrn')) $('patientMrn').textContent='';
  if($('patientDemographics')) $('patientDemographics').innerHTML='';
  const actions=document.querySelector('#patientPanel .actions');if(actions)actions.style.display='none';
  if($('newVisitBtn')) $('newVisitBtn').style.display='none';
  if($('pageTitle')) $('pageTitle').textContent=title;
  const out=$('patientActionArea');if(out)out.innerHTML='';
  return out;
}

async function saveLanguage(){
  if(busy)return;
  busy=true;
  const st=$('ntv4LanguageStatus');
  try{
    const u=currentUser||await session();
    if(!u) throw new Error(currentLanguage==='en'?'Session unavailable.':'Sesión no disponible.');
    const lang=$('ntv4LanguageSelect')?.value==='en'?'en':'es';
    if(st) st.textContent=lang==='en'?'Saving language…':'Guardando idioma…';
    const r=await sb.from('nursetrack_profiles').update({preferred_language:lang,updated_at:new Date().toISOString()}).eq('user_id',u.id);
    if(r.error) throw r.error;
    apply(lang);
    if(st){st.textContent=lang==='en'?'Language saved for your user.':'Idioma guardado para tu usuario.';st.style.color='#216b48'}
    renderSettings();
  }catch(e){if(st){st.textContent=e?.message||String(e);st.style.color='#933'}}
  finally{busy=false}
}

function renderSettings(){
  const lang=currentLanguage;
  const out=shell(lang==='en'?'Settings · Language':'Settings · Idioma');
  if(!out)return;
  out.innerHTML=`<div class="ntv4-bacard" style="max-width:760px"><h3>${lang==='en'?'🌐 Language':'🌐 Idioma'}</h3><p>${lang==='en'?'Choose the interface language for your user. This does not change clinical notes or stored clinical documents.':'Selecciona el idioma de la interfaz para tu usuario. Esto no cambia las notas clínicas ni los documentos clínicos guardados.'}</p><div class="ntv4-bagrid"><div><label>${lang==='en'?'Interface language':'Idioma de la interfaz'}</label><select id="ntv4LanguageSelect"><option value="es" ${lang==='es'?'selected':''}>🇪🇸 Español</option><option value="en" ${lang==='en'?'selected':''}>🇺🇸 English</option></select></div></div><div class="ntv4-baactions"><button class="btn" id="ntv4LanguageSave">${lang==='en'?'Save language':'Guardar idioma'}</button><button class="btn light" id="ntv4LanguageBack">${lang==='en'?'← Administration':'← Administración'}</button></div><div id="ntv4LanguageStatus" class="status"></div></div>`;
  $('ntv4LanguageSave').onclick=saveLanguage;
  $('ntv4LanguageSelect').onchange=()=>apply($('ntv4LanguageSelect').value);
  $('ntv4LanguageBack').onclick=()=>window.NT_V4_ADMIN?.open();
}

async function open(){
  try{await loadPreference()}catch(_){}
  renderSettings();
}

function ensureAdminSettingsButton(){
  const list=$('ntv4AdminList');
  if(!list||$('ntv4AdminSettings'))return;
  const host=list.closest('.ntv4-batabs');
  if(!host)return;
  const b=document.createElement('button');
  b.id='ntv4AdminSettings';b.type='button';b.className='btn light';
  b.textContent=currentLanguage==='en'?'Settings':'Settings';
  b.onclick=open;
  host.appendChild(b);
}

function scheduleAdminButton(){[30,150,400,900].forEach(ms=>setTimeout(ensureAdminSettingsButton,ms))}

document.addEventListener('click',()=>scheduleAdminButton(),true);

window.NT_V4_LANGUAGE={open,apply,get:()=>currentLanguage,version:'1.0.0'};

async function init(){
  try{await loadPreference()}catch(_){
    let cached='es';try{cached=localStorage.getItem('nt_preferred_language')||'es'}catch(_){}
    apply(cached);
  }
  scheduleAdminButton();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
