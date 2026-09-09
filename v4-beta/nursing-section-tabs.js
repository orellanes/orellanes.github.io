(function(){
'use strict';
if(window.__NT_V4_NURSING_SECTION_TABS__)return;
window.__NT_V4_NURSING_SECTION_TABS__=true;

const SECTIONS=[
  ['vitals','Signos vitales'],
  ['findings','Hallazgos'],
  ['education','Educación'],
  ['interventions','Intervenciones'],
  ['plan','Plan'],
  ['phq9','PHQ-9'],
  ['discharge','Alta / Nota']
];
let active='vitals';

function ensureStyle(){
  if(document.getElementById('ntNursingSectionTabsStyle'))return;
  const s=document.createElement('style');
  s.id='ntNursingSectionTabsStyle';
  s.textContent=`
  .ntn-section-tabs{display:flex;gap:7px;overflow-x:auto;padding:4px 0 10px;margin:2px 0 10px;scrollbar-width:thin}
  .ntn-section-tabs button{flex:0 0 auto;border:1px solid #cfe0e4;border-radius:999px;padding:9px 12px;background:#f3f8f9;color:#244d61;font-weight:850;white-space:nowrap}
  .ntn-section-tabs button.on{background:#0b8fa3;color:#fff;border-color:#0b8fa3}
  .ntn-section-pane-off{display:none!important}
  .ntn-section-hint{font-size:12px;color:#657b83;margin:-4px 0 8px}
  @media(max-width:560px){.ntn-section-tabs{margin-left:-4px;margin-right:-4px;padding-left:4px;padding-right:4px}}
  `;
  document.head.appendChild(s);
}

function classify(box){
  if(box.querySelector('#nAssessment'))return 'findings';
  if(box.querySelector('#nEducation'))return 'education';
  if(box.querySelector('#nIntervention'))return 'interventions';
  if(box.querySelector('#nPlanText'))return 'plan';
  if(box.querySelector('#nPhqOn,#nPhq'))return 'phq9';
  if(box.querySelector('#nDischarge,#nNarrative'))return 'discharge';
  if(box.querySelector('#nDate,#nBp,#nPulse,#nResp,#nTemp,#nSpo2,#nWeight,#nHeight,#nBmi'))return 'vitals';
  return 'other';
}

function apply(){
  ensureStyle();
  const root=document.querySelector('#patientActionArea .ntn');
  if(!root)return false;
  const grid=root.querySelector('.ntn-grid');
  if(!grid)return false;

  let tabs=root.querySelector('.ntn-section-tabs');
  if(!tabs){
    tabs=document.createElement('div');
    tabs.className='ntn-section-tabs';
    tabs.setAttribute('role','tablist');
    tabs.setAttribute('aria-label','Secciones de la plantilla de Enfermería');
    tabs.innerHTML=SECTIONS.map(([k,l])=>`<button type="button" data-ntn-section="${k}" class="${k===active?'on':''}">${l}</button>`).join('');
    const typeTabs=root.querySelector('.ntn-tabs');
    if(typeTabs)typeTabs.insertAdjacentElement('afterend',tabs);else root.querySelector('h3')?.insertAdjacentElement('afterend',tabs);
    const hint=document.createElement('div');
    hint.className='ntn-section-hint';
    hint.textContent='Completa una sección a la vez. Tus datos permanecen mientras cambias de pestaña.';
    tabs.insertAdjacentElement('afterend',hint);
  }

  const boxes=[...grid.children].filter(el=>el.classList.contains('ntn-f'));
  boxes.forEach(box=>{
    const section=classify(box);
    box.dataset.ntnSectionPane=section;
    box.classList.toggle('ntn-section-pane-off',section!=='other'&&section!==active);
  });
  tabs.querySelectorAll('[data-ntn-section]').forEach(b=>b.classList.toggle('on',b.dataset.ntnSection===active));
  return true;
}

function choose(k){
  if(!SECTIONS.some(x=>x[0]===k))return;
  active=k;
  apply();
}

document.addEventListener('click',function(e){
  const tab=e.target.closest?.('[data-ntn-section]');
  if(tab){e.preventDefault();choose(tab.dataset.ntnSection);return;}
  if(e.target.closest?.('.patient-action[data-action="nursing"], [data-nt-nursing-template], .ntn-tab')){
    setTimeout(apply,30);
    setTimeout(apply,120);
  }
},true);

document.addEventListener('nt:nursing-rendered',apply);
setTimeout(apply,80);
})();
