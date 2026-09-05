(function(){
'use strict';
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.from((r||document).querySelectorAll(s))}
function addStyle(){if(q('#ntBocetoUIStyle'))return;const s=document.createElement('style');s.id='ntBocetoUIStyle';s.textContent=`
:root{--nt-blue:#0b63a8;--nt-blue2:#147bd1;--nt-dark:#073e6d;--nt-navy:#052d4f;--nt-bg:#f4f8fb;--nt-line:#dbe6ee;--nt-text:#17384a;--nt-muted:#6b8190}
html,body{background:var(--nt-bg)!important;color:var(--nt-text)}
#appScreen>.top,.top{background:linear-gradient(90deg,var(--nt-dark),var(--nt-blue))!important;box-shadow:0 4px 18px rgba(5,55,91,.18)!important}.side{background:linear-gradient(180deg,var(--nt-dark),var(--nt-navy))!important;box-shadow:6px 0 18px rgba(6,45,79,.08)}
.side .navbtn{border-radius:10px!important;margin:2px 0!important;transition:.16s ease}.side .navbtn:hover{background:rgba(255,255,255,.10)!important}.side .navbtn.active{background:linear-gradient(90deg,#0d79cf,#1590e6)!important}.main{background:var(--nt-bg)!important}
.card,.ntPwBox,.ntSearchCard{background:#fff!important;border:1px solid var(--nt-line)!important;border-radius:16px!important;box-shadow:0 4px 18px rgba(32,72,96,.06)!important}.btn,input,select,textarea{border-radius:10px!important}.btn.primary{background:linear-gradient(90deg,var(--nt-blue),var(--nt-blue2))!important;border-color:transparent!important}
#ntPatientUniversalSearch{height:54px!important;border:2px solid #cfe0eb!important;font-size:17px!important}.ntSearchCard:hover{border-color:#b9d5e8!important;box-shadow:0 7px 22px rgba(32,91,126,.10)!important}
#patientPage .tabs{background:rgba(244,248,251,.95)!important;backdrop-filter:blur(8px)}#patientPage .tab{border-radius:10px!important}.pagehead h2{letter-spacing:-.02em}.notice{border-radius:12px!important}
.ntUiFlow{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:12px 14px;border:1px solid var(--nt-line);border-radius:14px;background:#fff;margin:12px 0}.ntUiFlow span{padding:7px 10px;border-radius:999px;background:#edf5fb;color:#174c6c;font-size:12px}.ntUiFlow i{font-style:normal;color:#81a1b5}
@media(max-width:700px){.card{border-radius:13px!important}.main{padding-left:10px!important;padding-right:10px!important}.ntUiFlow{overflow:auto;flex-wrap:nowrap}.ntUiFlow span{white-space:nowrap}}
`;document.head.appendChild(s)}
function nav(){const labels={home:'🏠  Inicio',patients:'👥  Pacientes',newPatient:'➕  Registro',backup:'💾  Respaldo',settings:'⚙️  Settings',audit:'🧾  Auditoría'};qa('.side .navbtn[data-page]').forEach(b=>{if(labels[b.dataset.page])b.textContent=labels[b.dataset.page]})}
function brand(){qa('.brand h1').forEach(h=>h.textContent='NurseTrack');qa('.brand small').forEach(s=>s.textContent='Pacientes. Cuidado. Resultados.')}
function flow(){const p=q('#patientPage');if(!p||q('#ntUiPatientFlow',p))return;const tabs=q('.tabs',p);if(!tabs)return;const d=document.createElement('div');d.id='ntUiPatientFlow';d.className='ntUiFlow';d.innerHTML='<span>Registro</span><i>→</i><span>Enfermería</span><i>→</i><span>Consulta médica</span><i>→</i><span>Laboratorios / Recetas</span><i>→</i><span>Facturación</span><i>→</i><span>Seguimiento</span>';tabs.parentNode.insertBefore(d,tabs)}
function install(){addStyle();brand();nav();flow();document.documentElement.dataset.ntBocetoUi='2'}
function boot(){install();const mo=new MutationObserver(()=>{clearTimeout(window.__ntBocetoTimer);window.__ntBocetoTimer=setTimeout(install,100)});mo.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();