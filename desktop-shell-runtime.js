(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
function desktop(){return matchMedia('(min-width:980px)').matches}
function style(){if($('#ntDesktopShellStyle'))return;const s=document.createElement('style');s.id='ntDesktopShellStyle';s.textContent=`
@media(min-width:980px){
 :root{--primary:#075b91;--primary2:#06456e;--bg:#f5f8fb;--line:#dbe5ee}
 #appScreen>.top{height:76px;background:linear-gradient(90deg,#073e6d,#075b91);color:#fff;border:0;padding:10px 22px;display:grid;grid-template-columns:auto minmax(320px,720px) auto;gap:24px;box-shadow:0 3px 14px rgba(5,51,87,.18)}
 #appScreen>.top .brand h1,#appScreen>.top .brand small{color:#fff}#appScreen>.top .logo{background:#fff;color:#075b91;width:48px;height:48px;border-radius:14px}
 #appScreen>.top .user span{color:#e7f3fb}#appScreen>.top .user .btn{background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.22)}
 #ntDesktopTopSearch{display:flex;align-items:center;width:100%;position:relative}#ntDesktopTopSearch input{height:44px;border:0;border-radius:10px;padding:0 46px 0 14px;background:#fff;color:#183647;box-shadow:0 2px 8px rgba(0,0,0,.08)}#ntDesktopTopSearch button{position:absolute;right:4px;width:38px;height:36px;border:0;border-radius:8px;background:#eaf3fa;color:#075b91;font-size:18px}
 #appScreen>.banner{display:none}.shell{grid-template-columns:230px minmax(0,1fr);min-height:calc(100vh - 76px)}.side{background:linear-gradient(180deg,#073e6d,#062d50);padding:12px 8px;position:sticky;top:76px;height:calc(100vh - 76px);overflow:auto}.side .navbtn{display:flex;align-items:center;min-height:44px;padding:10px 12px;border-radius:9px;font-size:14px}.side .navbtn.active{background:#0c70c7}.side .section-title{color:#91b8d5;margin-top:18px}.side .search input{border:0}.main{padding:20px 24px 36px;max-width:1600px;width:100%;margin:0 auto}.card{box-shadow:0 3px 15px rgba(30,65,88,.05)}
 #ntDesktopClinicFoot{margin:20px 4px 4px;padding:14px 8px;border-top:1px solid rgba(255,255,255,.14);color:#c8deee;font-size:12px;line-height:1.55}#ntDesktopClinicFoot strong{display:block;color:#fff;font-size:13px;margin-bottom:3px}
}
@media(max-width:979px){#ntDesktopTopSearch,#ntDesktopClinicFoot{display:none!important}}
`;document.head.appendChild(s)}
function goHomeSearch(q){const homeBtn=$('.navbtn[data-page="home"]');if(homeBtn)homeBtn.click();setTimeout(()=>{const input=$('#ntPatientUniversalSearch')||$('#sideSearch');if(!input)return;input.value=q||'';input.focus();input.dispatchEvent(new Event('input',{bubbles:true}))},120)}
function installTopSearch(){const top=$('#appScreen>.top');if(!top||$('#ntDesktopTopSearch'))return;const box=document.createElement('div');box.id='ntDesktopTopSearch';box.innerHTML='<input type="search" autocomplete="off" aria-label="Buscar paciente" placeholder="Buscar paciente por nombre, expediente, fecha de nacimiento o teléfono…"><button type="button" aria-label="Buscar">⌕</button>';const user=top.querySelector('.user');top.insertBefore(box,user);const input=box.querySelector('input');box.querySelector('button').onclick=()=>goHomeSearch(input.value.trim());input.addEventListener('keydown',e=>{if(e.key==='Enter')goHomeSearch(input.value.trim())})}
function relabelNav(){const labels={home:'🏠  Inicio / Dashboard',patients:'👥  Pacientes',newPatient:'📋  Registro',backup:'💾  Respaldo / Excel',settings:'⚙️  Configuración',audit:'🧾  Auditoría'};$$('.side .navbtn[data-page]').forEach(b=>{const k=b.dataset.page;if(labels[k])b.textContent=labels[k]})}
function installFoot(){const side=$('.side');if(!side||$('#ntDesktopClinicFoot'))return;const f=document.createElement('div');f.id='ntDesktopClinicFoot';f.innerHTML='<strong>NurseTrack Clinical</strong><span>Interfaz clínica segura · Vista de computadora</span>';side.appendChild(f)}
function install(){style();installTopSearch();relabelNav();installFoot();document.documentElement.dataset.ntDesktopShell=desktop()?'1':'0'}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();document.addEventListener('nursetrack:permissions-applied',()=>setTimeout(install,60));window.addEventListener('resize',()=>{document.documentElement.dataset.ntDesktopShell=desktop()?'1':'0'});
})();
