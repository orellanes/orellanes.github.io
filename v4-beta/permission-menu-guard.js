(function(){
'use strict';
if(window.__NT_V4_PERMISSION_MENU_GUARD__)return;
window.__NT_V4_PERMISSION_MENU_GUARD__=true;
let sb=null,state={ready:false,super:false,allowed:''};
function cfg(){return window.NURSETRACK_SUPABASE||{}}
async function client(){if(sb)return sb;if(typeof window.NT_loadSupabase!=='function')throw new Error('Supabase no disponible');const lib=await window.NT_loadSupabase(),c=cfg();sb=lib.createClient(c.url,c.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});return sb}
async function adminCall(payload){await client();const ses=await sb.auth.getSession(),token=ses?.data?.session?.access_token,c=cfg();if(!token)throw new Error('Sesión no disponible');const r=await fetch(c.url+'/functions/v1/admin-users',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,'apikey':c.publishableKey},body:JSON.stringify(payload)}),d=await r.json().catch(()=>({}));if(!r.ok||!d.ok)throw new Error(d.error||'Permisos no disponibles');return d}
function clean(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
const KEYS={
 'pacientes':['patient','paciente','expediente'], 'expediente':['patient','paciente','expediente'],
 'enfermeria':['nurs','enfermer'], 'trabajo social':['social'], 'medico':['medic','provider'], 'medicina':['medic','provider'],
 'laboratorios':['lab'], 'documentos':['doc'], 'facturacion':['bill','factur','claim','revenue'], 'membresia':['member','membres'],
 'reportes':['report'], 'administracion':['admin'], 'logistica':['logist','assignment','asign','inventory','invent','task','tarea','reminder','record','catalog','capacity','capacidad']
};
function allowed(label){if(state.super)return true;const l=clean(label).replace(/^\W+/,'').trim(),words=KEYS[l];if(!words)return true;return words.some(w=>state.allowed.includes(clean(w)))}
function setVisible(el,ok){if(!el)return;if(ok){if(el.dataset.ntPermHidden==='1'){el.style.removeProperty('display');delete el.dataset.ntPermHidden}}else{el.dataset.ntPermHidden='1';el.style.setProperty('display','none','important')}}
function apply(){if(!state.ready)return;document.querySelectorAll('.nav button,.nt-boceto-nav').forEach(b=>{const text=clean(b.textContent).trim();if(text==='inicio'||text==='home'||text==='bloquear'||text==='lock'){setVisible(b,true);return}setVisible(b,allowed(b.textContent))});document.querySelectorAll('.nt-quick').forEach(b=>{const q=clean(b.dataset.q||b.querySelector('strong')?.textContent||'');const map={nursing:'Enfermería',social:'Trabajo Social',templates:'Administración',documents:'Documentos'};setVisible(b,allowed(map[q]||b.textContent))});const newPatient=document.getElementById('ntNewPatientBoceto');if(newPatient)setVisible(newPatient,allowed('Pacientes'))}
async function load(){try{await client();const ses=await sb.auth.getSession(),u=ses?.data?.session?.user;if(!u)return;const pr=await sb.from('nursetrack_profiles').select('role').eq('user_id',u.id).maybeSingle(),role=clean(pr.data?.role);state.super=['superadmin','superadministrator'].includes(role);if(state.super){state.ready=true;state.allowed='*';apply();return}try{const d=await adminCall({action:'get-user-details',user_id:u.id}),catalog=d.catalog||[],byKey=new Map(catalog.map(x=>[x.permission_key,x])),parts=[];(d.permissions||[]).filter(x=>x.allowed).forEach(x=>{const c=byKey.get(x.permission_key)||{};parts.push(x.permission_key,c.label,c.module)});state.allowed=clean(parts.filter(Boolean).join(' '))}catch(_){state.allowed=''}state.ready=true;apply();[250,750,1800,4000,9000,16000].forEach(ms=>setTimeout(apply,ms))}catch(_){}}
window.NT_V4_PERMISSION_GUARD={reapply:apply,getState:()=>Object.assign({},state),version:'1.0.0'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();