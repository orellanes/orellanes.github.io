(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
async function api(url){const r=await fetch(url,{credentials:'same-origin'});const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}if(!r.ok)throw new Error((data&&data.message)||data||`Error ${r.status}`);return data;}
async function load(){
  const out=$('emptyState');if(!out)return;
  try{
    const [m,patients]=await Promise.all([api('/api/v1/dashboard'),api('/api/v1/patients?lastName=')]);
    out.classList.remove('empty');
    out.innerHTML=`<div class="card" style="margin-bottom:14px"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div><h2 style="margin:0">Panel clínico</h2><p class="muted" style="margin-bottom:0">Censo y pendientes de la compañía activa. Abra un paciente para entrar al expediente único.</p></div><button class="btn primary" id="dashFocusSearch">Buscar expediente</button></div></div><div class="grid4" style="margin-bottom:14px"><div class="card"><span class="muted">Pacientes activos</span><div style="font-size:28px;font-weight:900">${esc(m.activePatients)}</div></div><div class="card"><span class="muted">Visitas activas</span><div style="font-size:28px;font-weight:900">${esc(m.activeEncounters)}</div></div><div class="card"><span class="muted">Documentos pendientes</span><div style="font-size:28px;font-weight:900">${esc(m.pendingDocuments)}</div></div><div class="card"><span class="muted">PHQ-9 seguimiento</span><div style="font-size:28px;font-weight:900">${esc(m.phq9FollowUps)}</div></div></div><div class="grid2"><div class="card"><h3 style="margin-top:0">Pendientes por disciplina</h3><div class="timeline"><div class="timeline-item"><strong>Enfermería</strong><span>${esc(m.nursingDrafts)} borrador(es)</span></div><div class="timeline-item"><strong>Trabajo Social</strong><span>${esc(m.socialWorkDrafts)} borrador(es)</span></div><div class="timeline-item"><strong>Medicina</strong><span>${esc(m.medicalDrafts)} borrador(es)</span></div></div></div><div class="card"><h3 style="margin-top:0">Censo</h3><p class="muted">Primeros pacientes activos. También puede buscar por apellido o MRN en la columna izquierda.</p><div class="timeline">${patients.length?patients.slice(0,12).map(p=>`<button type="button" class="patient-result" data-dash-mrn="${esc(p.mrn)}" style="width:100%;text-align:left"><strong>${esc([p.firstName,p.middleName,p.lastName].filter(Boolean).join(' '))}</strong><span>MRN ${esc(p.mrn)}</span></button>`).join(''):'<span class="muted">Aún no hay pacientes.</span>'}</div></div></div>`;
    $('dashFocusSearch').onclick=()=>$('patientSearch')?.focus();
    out.querySelectorAll('[data-dash-mrn]').forEach(b=>b.onclick=()=>{const input=$('patientSearch');if(!input)return;input.value=b.dataset.dashMrn;$('searchBtn')?.click();input.focus();});
  }catch(e){out.innerHTML=`<div class="card"><h2 style="margin-top:0">Panel clínico</h2><div class="status err">${esc(e.message)}</div><p class="muted">Puede usar la búsqueda de pacientes mientras se recupera el panel.</p></div>`;}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,250));else setTimeout(load,250);
})();
