(function(){
'use strict';
if(window.__NT_V4_BOCETO_UI__) return;
window.__NT_V4_BOCETO_UI__=true;
const $=s=>document.querySelector(s);
let identityClient=null,identityBusy=false,identityUserId='';
function css(){
  if(document.getElementById('ntV4BocetoStyle'))return;
  const s=document.createElement('style');
  s.id='ntV4BocetoStyle';
  s.textContent=`
:root{--nt-teal:#0d91a5;--nt-blue:#164a7a;--nt-soft:#eef8fb;--nt-line:#d9e9ef}
body{background:#f5fafc!important}.app aside{width:auto;background:linear-gradient(180deg,#f8fdff,#eef8fb)!important}.brand .mark{border-radius:50%!important;background:linear-gradient(135deg,#12a7b5,#0b668d)!important}.brand h1{color:#164a7a!important}.brand small{color:#1697aa!important}.nav{gap:4px!important}.nav button,.nt-boceto-nav{width:100%;border:0;background:transparent;text-align:left;padding:10px 12px;border-radius:10px;color:#244b66;font-weight:700}.nav button:hover,.nav button.active,.nt-boceto-nav:hover{background:#d9f3f7!important;color:#0b6577}.top{background:#fff;border:1px solid var(--nt-line);border-radius:16px;padding:14px 18px;box-shadow:0 3px 12px rgba(29,76,101,.05)}.nt-welcome{display:flex;justify-content:space-between;gap:16px;align-items:center;margin:0 0 16px}.nt-welcome h3{font-size:22px;margin:0;color:#173e61}.nt-welcome p{margin:4px 0 0;color:#6b8494}.nt-dashboard-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px}.nt-quick{border:1px solid var(--nt-line);border-radius:15px;background:#fff;padding:16px;text-align:left;min-height:120px;box-shadow:0 3px 12px rgba(29,76,101,.04)}.nt-quick:hover{border-color:#8fcbd5;background:#fbfeff}.nt-quick strong{display:block;color:#173e61;font-size:16px;margin-bottom:6px}.nt-quick span{display:block;color:#6f8794;font-size:13px;line-height:1.4}.nt-quick em{display:inline-block;margin-top:10px;font-style:normal;color:#078da1;font-weight:800;font-size:12px}.nt-system{margin-top:18px;border-top:1px solid var(--nt-line);padding-top:14px}.nt-system strong{display:block;color:#173e61}.nt-status-row{display:flex;align-items:center;gap:7px;color:#5f7885;font-size:12px;margin-top:7px}.nt-dot{width:8px;height:8px;border-radius:50%;background:#35b76f}.metric{box-shadow:0 3px 12px rgba(29,76,101,.04)!important}.metric strong{color:#164a7a}.search input{border-color:#cfe3e9!important}.search button,.btn.primary{background:linear-gradient(90deg,#087f94,#0b9eb0)!important}#companyLabel,#userLabel{white-space:nowrap}
@media(max-width:950px){.nt-dashboard-actions{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.nt-dashboard-actions{grid-template-columns:1fr}.nt-welcome{display:block}.app aside{position:relative!important}.nav{grid-template-columns:1fr 1fr!important}.top>div:last-child{display:grid;gap:6px;margin-top:8px}}
`;
  document.head.appendChild(s);
}
function openClinical(label){
  window.NT_V4_PATIENT_REGISTRATION?.close?.({focus:false});
  if(window.NT_V4_LOGISTICS?.openClinicalByLabel)return window.NT_V4_LOGISTICS.openClinicalByLabel(label);
  window.NT_V4_LOGISTICS?.open();
}
function openGlobal(type){
  window.NT_V4_PATIENT_REGISTRATION?.close?.({focus:false});
  const calls={templates:()=>window.NT_V4_TEMPLATES?.open(),reports:()=>window.NT_V4_REPORTS?.open(),membership:()=>window.NT_V4_MEMBERSHIP?.open(),admin:()=>window.NT_V4_ADMIN?.open(),logistics:()=>window.NT_V4_LOGISTICS?.open()};
  try{calls[type]?.()}catch(_){window.NT_V4_LOGISTICS?.open()}
}
function addNav(){
  const nav=$('.nav');
  if(!nav||document.getElementById('ntBocetoNavStart'))return;
  const anchor=nav.querySelector('[data-view="settings"]')||nav.querySelector('#logoutBtn');
  const items=[['Expediente','patient'],['Enfermería','Enfermería'],['Trabajo Social','Trabajo Social'],['Médico','Medicina'],['Laboratorios','Laboratorios'],['Documentos','Documentos'],['Facturación','Facturación'],['Membresía','membership'],['Reportes','reports'],['Administración','admin']];
  items.forEach(([label,key],i)=>{
    const b=document.createElement('button');
    b.className='nt-boceto-nav';
    if(i===0)b.id='ntBocetoNavStart';
    b.textContent=label;
    b.onclick=()=>{
      window.NT_V4_PATIENT_REGISTRATION?.close?.({focus:false});
      if(key==='patient'){
        const home=document.getElementById('homePanel');
        home?.classList.remove('hidden');
        document.getElementById('patientPanel')?.classList.add('hidden');
        document.getElementById('modulesPanel')?.classList.add('hidden');
        document.getElementById('placeholderPanel')?.classList.add('hidden');
        document.getElementById('patientSearch')?.focus();
        return;
      }
      if(['membership','reports','admin'].includes(key))return openGlobal(key);
      openClinical(key);
    };
    nav.insertBefore(b,anchor);
  });
  if(anchor?.dataset?.view==='settings')anchor.style.display='none';
  const sys=document.createElement('div');
  sys.className='nt-system';
  sys.innerHTML='<strong>Estado del sistema</strong><div class="nt-status-row"><span class="nt-dot"></span>Nube activa</div><div class="nt-status-row"><span class="nt-dot"></span>Datos clínicos conectados</div><div class="nt-status-row"><span class="nt-dot"></span>NurseTrack One</div>';
  nav.parentElement?.appendChild(sys);
}
function decorateHome(){
  const home=document.getElementById('homePanel');
  if(!home||document.getElementById('ntBocetoWelcome'))return;
  const w=document.createElement('div');
  w.id='ntBocetoWelcome';
  w.className='nt-welcome';
  w.innerHTML='<div><h3>Panel principal</h3><p>Busca un paciente o abre directamente un área de trabajo.</p></div><button class="btn" id="ntNewPatientBoceto">+ Nuevo paciente</button>';
  home.insertBefore(w,home.firstChild);
  document.getElementById('ntNewPatientBoceto').onclick=()=>window.NT_V4_PATIENT_REGISTRATION?.open();
  const actions=document.createElement('div');
  actions.className='nt-dashboard-actions';
  actions.innerHTML=`<button class="nt-quick" data-q="nursing"><strong>🩺 Enfermería</strong><span>Visitas, vitales, evaluación, educación, plan y alta.</span><em>Abrir módulo →</em></button><button class="nt-quick" data-q="social"><strong>👥 Trabajo Social</strong><span>Entrevista inicial, seguimiento y plantillas.</span><em>Abrir módulo →</em></button><button class="nt-quick" data-q="templates"><strong>📄 Plantillas</strong><span>Biblioteca, versiones y edición administrativa.</span><em>Ver plantillas →</em></button><button class="nt-quick" data-q="documents"><strong>🗂️ Documentos</strong><span>Documentos clínicos y archivos del paciente.</span><em>Abrir documentos →</em></button>`;
  home.appendChild(actions);
  actions.querySelector('[data-q="nursing"]').onclick=()=>openClinical('Enfermería');
  actions.querySelector('[data-q="social"]').onclick=()=>openClinical('Trabajo Social');
  actions.querySelector('[data-q="templates"]').onclick=()=>openGlobal('templates');
  actions.querySelector('[data-q="documents"]').onclick=()=>openClinical('Documentos');
}
function branding(){
  document.querySelectorAll('.brand h1').forEach(x=>x.textContent='NurseTrack One');
  document.querySelectorAll('.brand small').forEach(x=>x.textContent='Sistema Clínico y Administrativo');
  const title=document.querySelector('title');
  if(title)title.textContent='NurseTrack One';
}
async function getIdentityClient(){
  if(identityClient)return identityClient;
  if(typeof window.NT_loadSupabase!=='function')return null;
  const lib=await window.NT_loadSupabase(),cfg=window.NURSETRACK_SUPABASE||{};
  if(!cfg.url||!cfg.publishableKey)return null;
  identityClient=lib.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
  return identityClient;
}
async function decorateIdentity(){
  const companyEl=document.getElementById('companyLabel'),userEl=document.getElementById('userLabel'),app=document.getElementById('appView');
  if(!companyEl||!userEl||app?.classList.contains('hidden')||identityBusy)return;
  identityBusy=true;
  try{
    const sb=await getIdentityClient();
    if(!sb)return;
    const ses=await sb.auth.getSession(),u=ses?.data?.session?.user;
    if(!u)return;
    let companyId=null;
    const cu=await sb.from('nursetrack_company_users').select('company_id').eq('user_id',u.id).eq('active',true).limit(1);
    companyId=cu.data?.[0]?.company_id||null;
    if(!companyId){
      const m=await sb.from('nursetrack_account_memberships').select('company_id').eq('user_id',u.id).eq('status','active').limit(1);
      companyId=m.data?.[0]?.company_id||null;
    }
    const profile=await sb.from('nursetrack_profiles').select('full_name,username').eq('user_id',u.id).maybeSingle();
    let companyName='';
    if(companyId){
      const co=await sb.from('nursetrack_companies').select('display_name').eq('id',companyId).maybeSingle();
      companyName=co.data?.display_name||'';
    }
    companyEl.textContent=companyId?'Compañía: '+(companyName||'Activa'):'Sin compañía';
    userEl.textContent='Usuario: '+(profile.data?.full_name||profile.data?.username||u.email||'Sesión activa');
    identityUserId=u.id;
  }catch(_){
    if(!companyEl.textContent?.startsWith('Compañía:')&&companyEl.textContent!=='Sin compañía')companyEl.textContent='Compañía activa';
    if(userEl.textContent&&!userEl.textContent.startsWith('Usuario:'))userEl.textContent='Usuario: '+userEl.textContent;
  }finally{identityBusy=false}
}
function init(){css();branding();addNav();decorateHome();decorateIdentity()}
let n=0,t=setInterval(()=>{init();if(++n>120)clearInterval(t)},250);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('visibilitychange',()=>{if(!document.hidden)decorateIdentity()});
})();
