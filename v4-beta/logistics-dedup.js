(function(){
'use strict';
if(window.__NT_V4_LOGISTICS_DEDUP__) return;
window.__NT_V4_LOGISTICS_DEDUP__=true;

const KEEP_CLINICAL=new Set(['tasks','reminders']);
const KEEP_GLOBAL=new Set(['assignments','stations','inventory','catalogs','capacity']);

function cleanLogistics(){
  const area=document.getElementById('patientActionArea');
  if(!area) return;
  const clinical=[...area.querySelectorAll('[data-log-clinical]')];
  const global=[...area.querySelectorAll('[data-log-global]')];
  if(!clinical.length && !global.length) return;

  const kept=[];
  clinical.forEach(b=>{if(KEEP_CLINICAL.has(b.dataset.logClinical)) kept.push(b)});
  global.forEach(b=>{if(KEEP_GLOBAL.has(b.dataset.logGlobal)) kept.push(b)});

  const cards=[...area.querySelectorAll('.ntv4-logcard')];
  cards.forEach(card=>{
    if(card.querySelector('[data-log-clinical],[data-log-global]')) card.remove();
  });

  const ops=document.createElement('div');
  ops.className='ntv4-logcard';
  ops.id='ntv4LogOperationsOnly';
  ops.innerHTML='<h3>Operaciones</h3><p class="notice">Logística contiene únicamente funciones operacionales. Los módulos clínicos y administrativos se abren desde sus áreas principales para evitar duplicados.</p><div class="ntv4-loggrid" id="ntv4LogOpsGrid"></div><div id="ntv4LogStatus" class="status"></div>';
  const grid=ops.querySelector('#ntv4LogOpsGrid');
  kept.forEach(b=>grid.appendChild(b));
  area.appendChild(ops);

  const intro=area.querySelector('.ntv4-logcard');
  if(intro){
    const h=intro.querySelector('h3');
    if(h) h.textContent='🧭 Logística operacional';
    const lines=[...intro.querySelectorAll('div,p')];
    const master=lines.find(x=>/Centro maestro de NurseTrack/i.test(x.textContent||''));
    if(master) master.textContent='Centro operacional de NurseTrack One';
    const notice=intro.querySelector('.notice');
    if(notice) notice.textContent='Acceso único a funciones operacionales. Enfermería, Medicina, Trabajo Social, Laboratorios, Facturación, Reportes, Membresía y Administración permanecen en sus módulos principales.';
  }
}

function wrap(){
  const api=window.NT_V4_LOGISTICS;
  if(!api||typeof api.open!=='function') return false;
  if(api.__dedupWrapped) return true;
  const original=api.open.bind(api);
  api.open=function(){
    const r=original.apply(null,arguments);
    setTimeout(cleanLogistics,0);
    return r;
  };
  api.__dedupWrapped=true;
  api.version=(api.version||'')+'-dedup';
  return true;
}

let tries=0;
const timer=setInterval(()=>{
  if(wrap()||++tries>=40) clearInterval(timer);
},250);
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wrap,{once:true}); else wrap();
})();
