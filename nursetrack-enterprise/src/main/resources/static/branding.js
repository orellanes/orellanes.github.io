(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
async function loadBranding(){
  try{
    const r=await fetch('/api/v1/company',{credentials:'same-origin'});if(!r.ok)return;const c=await r.json();
    if($('companyName'))$('companyName').textContent=c.name||'NurseTrack One';
    document.title=(c.name||'NurseTrack One')+' — Expediente clínico';
    const brand=document.querySelector('.brand');if(brand&&!document.getElementById('companyBrandMeta')){
      const details=[c.addressLine1,c.addressLine2,[c.city,c.state,c.postalCode].filter(Boolean).join(', '),c.phone].filter(Boolean);
      const meta=document.createElement('div');meta.id='companyBrandMeta';meta.className='company-brand-meta';meta.innerHTML=details.map(x=>`<span>${esc(x)}</span>`).join('');brand.appendChild(meta);
      if(c.logoUrl){const mark=document.querySelector('.brandmark');if(mark){mark.innerHTML=`<img src="${esc(c.logoUrl)}" alt="Logo de ${esc(c.name||'compañía')}" style="max-width:100%;max-height:100%;object-fit:contain">`;mark.classList.add('company-logo');}}
    }
    const print=document.createElement('style');print.id='companyPrintStyle';print.textContent=`@media print{.sidebar,.tabs,.top-actions,#newEncounterBtn{display:none!important}.app{display:block!important}.main{max-width:none!important;padding:0!important}.topbar{position:static!important;box-shadow:none!important;border-bottom:2px solid #222!important}.company-brand-meta{display:flex!important;flex-direction:column!important;font-size:10pt!important}.tab-panel{display:none!important}.tab-panel.active{display:block!important}.record{display:block!important}.card{box-shadow:none!important;break-inside:avoid}.patient-head{break-inside:avoid}}`;
    document.head.appendChild(print);
  }catch{}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(loadBranding,150));else setTimeout(loadBranding,150);
})();
