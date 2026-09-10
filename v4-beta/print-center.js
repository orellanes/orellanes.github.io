(function(){
'use strict';
if(window.__NT_V4_PRINT_CENTER__)return;
window.__NT_V4_PRINT_CENTER__=true;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function currentPatient(){
 let p=window.NT_ACTIVE_PATIENT||null;
 if(p)return p;
 try{return JSON.parse(sessionStorage.getItem('nursetrack_active_patient')||'null')}catch(_){return null}
}
function age(d){if(!d)return'';let x=new Date(String(d).slice(0,10)+'T00:00:00'),n=new Date();if(isNaN(x))return'';let a=n.getFullYear()-x.getFullYear(),m=n.getMonth()-x.getMonth();if(m<0||(m===0&&n.getDate()<x.getDate()))a--;return a>=0?a:''}
function printPatient(){
 const p=currentPatient();
 if(!p){alert('Selecciona un paciente antes de imprimir.');return;}
 const name=[p.first_name,p.middle_name,p.last_name].filter(Boolean).join(' ');
 const dob=p.date_of_birth||p.dob||'';
 const a=age(dob);
 const area=document.getElementById('patientActionArea');
 const clinical=area&&!area.classList.contains('hidden')?area.innerHTML:'';
 const w=window.open('','_blank','noopener,noreferrer');
 if(!w){alert('Permite ventanas emergentes para imprimir.');return;}
 w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>NurseTrack One - ${esc(name||'Paciente')}</title><style>body{font-family:Arial,sans-serif;color:#17343c;margin:28px}header{border-bottom:2px solid #0d91a5;padding-bottom:12px;margin-bottom:18px}h1{margin:0;color:#164a7a;font-size:24px}.sub{color:#667f8a;margin-top:4px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}.box{border:1px solid #d9e9ef;border-radius:8px;padding:10px}.box small{display:block;color:#6f858b;margin-bottom:4px}.clinical{margin-top:20px;border-top:1px solid #d9e9ef;padding-top:16px}button,input,select,textarea,.btn,.actions{display:none!important}@media print{body{margin:12mm}a{color:inherit;text-decoration:none}}</style></head><body><header><h1>NurseTrack One</h1><div class="sub">Expediente del paciente · ${new Date().toLocaleString('es-PR')}</div></header><h2>${esc(name||'Paciente')}</h2><div class="grid"><div class="box"><small>Expediente</small>${esc(p.mrn||'—')}</div><div class="box"><small>Fecha de nacimiento</small>${esc(dob||'—')}</div><div class="box"><small>Edad</small>${a===''?'—':esc(a+' años')}</div><div class="box"><small>Sexo</small>${esc(p.sex||'—')}</div><div class="box"><small>Teléfono</small>${esc(p.phone||'—')}</div><div class="box"><small>Email</small>${esc(p.email||'—')}</div><div class="box"><small>Dirección residencial</small>${esc(p.residential_address||'—')}</div><div class="box"><small>Dirección postal</small>${esc(p.postal_address||'—')}</div><div class="box"><small>Ciudad</small>${esc(p.city||'—')}</div></div>${clinical?`<section class="clinical"><h3>Documento clínico abierto</h3>${clinical}</section>`:''}<script>window.onload=function(){setTimeout(function(){window.print()},150)}<\/script></body></html>`);
 w.document.close();
}
function addPatientButton(){
 const panel=document.getElementById('patientPanel');
 if(!panel||panel.classList.contains('hidden'))return;
 const head=panel.querySelector('.patient-head');
 if(!head||document.getElementById('ntPrintPatientBtn'))return;
 const b=document.createElement('button');b.id='ntPrintPatientBtn';b.className='btn light';b.textContent='🖨️ Imprimir';b.onclick=printPatient;
 const visit=document.getElementById('newVisitBtn');visit?.parentElement?.appendChild(b);
}
function addNav(){
 const nav=document.querySelector('.nav');if(!nav||document.getElementById('ntPrintNav'))return;
 const b=document.createElement('button');b.id='ntPrintNav';b.className='nt-boceto-nav';b.textContent='🖨️ Imprimir';b.onclick=printPatient;
 const admin=[...nav.querySelectorAll('button')].find(x=>x.textContent.trim()==='Administración');
 nav.insertBefore(b,admin||nav.querySelector('#logoutBtn'));
}
function init(){addNav();addPatientButton()}
let n=0,t=setInterval(()=>{init();if(++n>240)clearInterval(t)},250);
new MutationObserver(init).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.NT_V4_PRINT={printPatient};
})();
