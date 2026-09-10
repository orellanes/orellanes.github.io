(function(){
'use strict';
const $=id=>document.getElementById(id);
const state={me:null,company:null,patient:null,encounterId:null,csrf:null,lazy:new Set(),lastNursing:null,lastSocial:null,socialSchema:null,socialPage:0,socialValues:{}};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

async function csrf(){
  if(state.csrf) return state.csrf;
  const r=await fetch('/api/public/csrf',{credentials:'same-origin'});
  if(!r.ok) throw new Error('No se pudo iniciar protección CSRF');
  state.csrf=await r.json();
  if($('logoutCsrf')) { $('logoutCsrf').name=state.csrf.parameterName||'_csrf'; $('logoutCsrf').value=state.csrf.token||''; }
  return state.csrf;
}

async function api(url,opts={}){
  const method=(opts.method||'GET').toUpperCase();
  const headers=new Headers(opts.headers||{});
  if(opts.body && !headers.has('Content-Type')) headers.set('Content-Type','application/json');
  if(!['GET','HEAD','OPTIONS'].includes(method)){
    const c=await csrf();
    headers.set(c.headerName||'X-XSRF-TOKEN',c.token);
  }
  const r=await fetch(url,{...opts,method,headers,credentials:'same-origin'});
  if(r.status===401){location.href='/login.html';throw new Error('Sesión expirada');}
  const text=await r.text();
  let data=null;try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok) throw new Error((data&&data.message)||data||`Error ${r.status}`);
  return data;
}

function fmtDate(v){if(!v)return'—';const d=new Date(v);return isNaN(d)?String(v):d.toLocaleString('es-PR',{dateStyle:'medium',timeStyle:v.includes?.('T')?'short':undefined});}
function age(dob){if(!dob)return'';const d=new Date(dob+'T00:00:00');const n=new Date();let a=n.getFullYear()-d.getFullYear();const m=n.getMonth()-d.getMonth();if(m<0||(m===0&&n.getDate()<d.getDate()))a--;return a>=0?a:'';}

async function boot(){
  await csrf();
  state.me=await api('/api/v1/me');
  $('userBadge').textContent=`${state.me.displayName} · ${state.me.role}`;
  if(state.me.role==='SUPERADMIN') $('adminLink').classList.remove('hidden');
  try{state.company=await api('/api/v1/company');$('companyName').textContent=state.company.name||'NurseTrack Enterprise';}catch{ }
  applyRoleTabs();
  $('searchBtn').onclick=searchPatients;
  $('patientSearch').addEventListener('keydown',e=>{if(e.key==='Enter')searchPatients();});
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>activateTab(b.dataset.tab));
  $('newEncounterBtn').onclick=createEncounter;
}

function applyRoleTabs(){
  const role=state.me?.role;
  if(['SUPERADMIN','ADMIN'].includes(role)) return;
  const discipline={NURSE:'nursing',SOCIAL_WORK:'social',PHYSICIAN:'medical'}[role];
  document.querySelectorAll('.tab').forEach(b=>{
    const t=b.dataset.tab;
    if(['summary','timeline','documents'].includes(t)) return;
    if(t!==discipline) b.classList.add('hidden');
  });
}

async function searchPatients(){
  const q=$('patientSearch').value.trim();
  const status=$('searchStatus');
  const out=$('patientResults');
  status.textContent='Buscando…';out.innerHTML='';
  try{
    let rows=await api('/api/v1/patients?lastName='+encodeURIComponent(q));
    if(!rows.length&&q) rows=await api('/api/v1/patients?mrn='+encodeURIComponent(q));
    status.textContent=rows.length?`${rows.length} resultado(s)`:'No se encontraron pacientes.';
    out.innerHTML=rows.map(p=>`<button class="patient-result" data-id="${esc(p.id)}"><strong>${esc([p.firstName,p.middleName,p.lastName].filter(Boolean).join(' '))}</strong><span>MRN ${esc(p.mrn)} · ${esc(p.dateOfBirth||'sin fecha de nacimiento')}</span></button>`).join('');
    out.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>openPatient(b.dataset.id));
  }catch(e){status.textContent=e.message;status.className='status err';}
}

async function openPatient(id){
  try{
    const p=await api('/api/v1/patients/'+encodeURIComponent(id));
    state.patient=p;state.encounterId=null;state.lazy.clear();state.lastNursing=null;state.lastSocial=null;state.socialValues={};
    $('emptyState').classList.add('hidden');$('record').classList.add('active');
    $('patientName').textContent=[p.firstName,p.middleName,p.lastName].filter(Boolean).join(' ');
    $('patientMrn').textContent='MRN '+p.mrn;
    $('patientDob').textContent='Nacimiento '+(p.dateOfBirth||'—')+(p.dateOfBirth?` · ${age(p.dateOfBirth)} años`:'');
    $('patientPhone').textContent='Tel. '+(p.phone||'—');
    $('patientStatus').textContent='Estado '+p.status;
    $('summaryBody').innerHTML=[
      ['Dirección residencial',p.residentialAddress],['Dirección postal',p.postalAddress],['Lugar de nacimiento',p.birthPlace],['Sexo',p.sex],['Estado civil',p.maritalStatus],['Hijos',p.childrenCount],['Correo',p.email],['Idioma',p.preferredLanguage]
    ].map(([k,v])=>`<div><strong>${esc(k)}</strong><div class="muted">${esc(v??'—')}</div></div>`).join('');
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelector('.tab[data-tab="summary"]').classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
    $('tab-summary').classList.add('active');
  }catch(e){$('searchStatus').textContent=e.message;}
}

async function activateTab(name){
  if(!state.patient)return;
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===name));
  document.querySelectorAll('.tab-panel').forEach(x=>x.classList.toggle('active',x.id==='tab-'+name));
  if(state.lazy.has(name))return;
  if(name==='timeline')await loadTimeline();
  if(name==='nursing')await renderNursing();
  if(name==='social')await renderSocial();
  state.lazy.add(name);
}

async function createEncounter(){
  if(!state.patient)return;
  const btn=$('newEncounterBtn');btn.disabled=true;
  try{
    const row=await api(`/api/v1/patients/${state.patient.id}/encounters`,{method:'POST',body:JSON.stringify({encounterType:'AMBULATORY'})});
    state.encounterId=row.id;state.lazy.delete('timeline');
    const preferred={NURSE:'nursing',SOCIAL_WORK:'social',PHYSICIAN:'medical'}[state.me.role]||'nursing';
    const tab=document.querySelector(`.tab[data-tab="${preferred}"]:not(.hidden)`);activateTab(tab?preferred:'summary');
  }catch(e){alert(e.message);}finally{btn.disabled=false;}
}

async function loadTimeline(){
  const out=$('timelineBody');out.innerHTML='<span class="muted">Cargando cronología…</span>';
  try{
    const rows=await api(`/api/v1/patients/${state.patient.id}/timeline`);
    out.innerHTML=rows.length?rows.map(x=>`<div class="timeline-item"><strong>${esc(x.title)}</strong><span>${esc(fmtDate(x.occurredAt))} · ${esc(x.status)}</span></div>`).join(''):'<span class="muted">Aún no hay eventos clínicos.</span>';
  }catch(e){out.innerHTML=`<div class="status err">${esc(e.message)}</div>`;}
}

async function nursingTemplate(){
  const row=await api('/api/v1/templates/nursing_interactive_v1');
  return JSON.parse(row.schemaJson);
}
function bmi(w,h){w=+w;h=+h;return w>0&&h>0?Math.round((703*w/(h*h))*10)/10:null;}
function bmiClass(n){if(!n)return'';return n<18.5?'Bajo peso':n<25?'Normal':n<30?'Sobrepeso':'Obesidad';}
function selectedValues(name){return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(x=>x.value);}
function nval(id){return $(id)?.value?.trim?.()||'';}
function nursingNarrative(){
  const type=$('nVisitType')?.value||'Evaluación inicial';
  const p=[`${type} de Enfermería a ${$('patientName').textContent}.`];
  const v=[];
  if(nval('nBp'))v.push('PA '+nval('nBp')+' mmHg');if(nval('nPulse'))v.push('pulso '+nval('nPulse')+' lpm');if(nval('nResp'))v.push('respiración '+nval('nResp')+' rpm');if(nval('nTemp'))v.push('temperatura '+nval('nTemp')+' °F');if(nval('nSpo2'))v.push('SpO₂ '+nval('nSpo2')+'%');if(nval('nWeight'))v.push('peso '+nval('nWeight')+' lb');if(nval('nHeight'))v.push('estatura '+nval('nHeight')+' in');
  const b=bmi(nval('nWeight'),nval('nHeight'));if(b)v.push(`IMC ${b} (${bmiClass(b)})`);if(v.length)p.push('Signos vitales: '+v.join(', ')+'.');
  const f=selectedValues('nFind');if(f.length)p.push('Hallazgos de Enfermería: '+f.join('. ')+'.');
  const e=selectedValues('nEdu');if(e.length)p.push('Se brinda educación sobre '+e.join(', ')+'.');
  const i=nval('nInterventions');if(i)p.push('Intervenciones de Enfermería: '+i+'.');
  const plan=nval('nPlan');if(plan)p.push('Plan: '+plan+'.');
  const d=selectedValues('nDisc');if(d.length)p.push('Alta de Enfermería: '+d.join('; ')+'.');
  return p.join(' ');
}
function updateNursingNarrative(force=false){
  const b=bmi(nval('nWeight'),nval('nHeight'));if($('nBmi'))$('nBmi').value=b?`${b} · ${bmiClass(b)}`:'';
  const n=$('nNarrative');if(n&&(force||!n.dataset.manual)){delete n.dataset.manual;n.value=nursingNarrative();}
}

async function renderNursing(){
  const out=$('nursingBody');out.innerHTML='<span class="muted">Cargando plantilla de Enfermería…</span>';
  try{
    const t=await nursingTemplate();
    const checks=(name,items)=>items.map(x=>{const label=x.label||x,sentence=x.sentence||x;return`<label class="check"><input type="checkbox" name="${name}" value="${esc(sentence)}"><span>${esc(label)}</span></label>`}).join('');
    out.innerHTML=`<h3>🩺 Enfermería — Plantilla interactiva</h3><div class="grid4"><div><label>Tipo de visita</label><select id="nVisitType">${t.visitTypes.map(x=>`<option>${esc(x)}</option>`).join('')}</select></div><div><label>PA</label><input id="nBp" placeholder="120/80"></div><div><label>Pulso</label><input id="nPulse" type="number"></div><div><label>Respiración</label><input id="nResp" type="number"></div><div><label>Temperatura °F</label><input id="nTemp" type="number" step="0.1"></div><div><label>SpO₂ %</label><input id="nSpo2" type="number"></div><div><label>Peso lb</label><input id="nWeight" type="number" step="0.1"></div><div><label>Estatura in</label><input id="nHeight" type="number" step="0.1"></div></div><div class="section-title">IMC automático</div><input id="nBmi" readonly><div class="section-title">Hallazgos de Enfermería</div><div class="checks">${checks('nFind',t.findings)}</div><div class="section-title">Educación</div><div class="checks">${checks('nEdu',t.education)}</div><div class="section-title">Intervenciones</div><textarea id="nInterventions" placeholder="Intervenciones realizadas"></textarea><div class="section-title">Plan</div><textarea id="nPlan" placeholder="Plan de cuidado, coordinación y seguimiento"></textarea><div class="section-title">Alta de Enfermería</div><div class="checks">${checks('nDisc',t.discharge)}</div><div class="section-title">Narrativa automática editable</div><textarea id="nNarrative" class="narrative"></textarea><div class="toolbar"><button class="btn" id="nRegen">✨ Generar nuevamente</button><button class="btn primary" id="nSave">Guardar borrador</button><button class="btn secondary hidden" id="nSign">Firmar nota</button></div><div id="nStatus" class="status"></div><div class="section-title">Notas previas</div><div id="nHistory" class="timeline"><span class="muted">Cargando…</span></div>`;
    out.querySelectorAll('input,select,textarea').forEach(el=>{if(el.id==='nNarrative'){el.addEventListener('input',()=>el.dataset.manual='1');}else{el.addEventListener('input',()=>updateNursingNarrative());el.addEventListener('change',()=>updateNursingNarrative());}});
    $('nRegen').onclick=()=>updateNursingNarrative(true);$('nSave').onclick=saveNursing;$('nSign').onclick=signNursing;updateNursingNarrative(true);await loadNursingHistory();
  }catch(e){out.innerHTML=`<div class="status err">${esc(e.message)}</div>`;}
}

async function ensureEncounter(type){
  if(state.encounterId)return state.encounterId;
  const e=await api(`/api/v1/patients/${state.patient.id}/encounters`,{method:'POST',body:JSON.stringify({encounterType:type})});state.encounterId=e.id;return e.id;
}
async function saveNursing(){
  const st=$('nStatus');st.textContent='Guardando…';st.className='status';
  try{
    const encounterId=await ensureEncounter('NURSING');
    const body={encounterId,visitType:nval('nVisitType'),bloodPressure:nval('nBp')||null,pulse:numOrNull('nPulse'),respirations:numOrNull('nResp'),temperatureF:numOrNull('nTemp'),spo2:numOrNull('nSpo2'),weightLb:numOrNull('nWeight'),heightIn:numOrNull('nHeight'),findingsJson:JSON.stringify(selectedValues('nFind')),narrative:nval('nNarrative'),educationJson:JSON.stringify(selectedValues('nEdu')),interventionsJson:JSON.stringify({text:nval('nInterventions')}),plan:nval('nPlan')||null,dischargeNote:selectedValues('nDisc').join('; ')||null};
    state.lastNursing=await api(`/api/v1/patients/${state.patient.id}/nursing`,{method:'POST',body:JSON.stringify(body)});
    st.textContent='Borrador guardado.';st.className='status ok';$('nSign').classList.remove('hidden');state.lazy.delete('timeline');await loadNursingHistory();
  }catch(e){st.textContent=e.message;st.className='status err';}
}
async function signNursing(){
  if(!state.lastNursing)return;
  if(!confirm('¿Firmar esta nota? Después de firmarla no podrá editarse.'))return;
  const st=$('nStatus');
  try{state.lastNursing=await api(`/api/v1/patients/${state.patient.id}/nursing/${state.lastNursing.id}/sign`,{method:'POST'});st.textContent='Nota firmada y bloqueada.';st.className='status ok';$('nSign').classList.add('hidden');await loadNursingHistory();}catch(e){st.textContent=e.message;st.className='status err';}
}
async function loadNursingHistory(){
  const out=$('nHistory');if(!out)return;
  const rows=await api(`/api/v1/patients/${state.patient.id}/nursing`);
  out.innerHTML=rows.length?rows.map(x=>`<div class="timeline-item"><strong>${esc(x.visitType)}</strong><span>${esc(fmtDate(x.createdAt))} · ${esc(x.status)}${x.bmi?` · IMC ${esc(x.bmi)}`:''}</span><div style="margin-top:6px">${esc(x.narrative)}</div></div>`).join(''):'<span class="muted">No hay notas previas.</span>';
}
function numOrNull(id){const v=nval(id);return v===''?null:Number(v);}

async function renderSocial(){
  const out=$('socialBody');out.innerHTML='<span class="muted">Cargando plantilla aprobada de cuatro páginas…</span>';
  try{
    const row=await api('/api/v1/templates/social_work_case_management_4page');state.socialSchema=JSON.parse(row.schemaJson);state.socialPage=0;
    const p=state.patient;state.socialValues={record_number:p.mrn,name:[p.firstName,p.middleName,p.lastName].filter(Boolean).join(' '),residential_address:p.residentialAddress||'',postal_address:p.postalAddress||'',phone:p.phone||'',dob:p.dateOfBirth||'',birth_place:p.birthPlace||'',age:age(p.dateOfBirth),sex:p.sex||'',marital_status:p.maritalStatus||'',admission_date:new Date().toISOString().slice(0,10)};
    renderSocialPage();
  }catch(e){out.innerHTML=`<div class="status err">${esc(e.message)}</div>`;}
}
function socialField(f){
  const v=state.socialValues[f.key]??'';const k=esc(f.key),lab=esc(f.label||f.key);
  if(f.type==='textarea')return`<div class="social-field" data-wrap="${k}"><label>${lab}</label><textarea data-sfield="${k}">${esc(v)}</textarea></div>`;
  if(f.type==='choice')return`<div class="social-field" data-wrap="${k}"><label>${lab}</label><select data-sfield="${k}"><option value="">Seleccione…</option>${(f.options||[]).map(o=>`<option ${String(v)===String(o)?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`;
  if(f.type==='boolean')return`<div class="social-field" data-wrap="${k}"><label>${lab}</label><select data-sfield="${k}"><option value="">Seleccione…</option><option value="true" ${v===true?'selected':''}>Sí</option><option value="false" ${v===false?'selected':''}>No</option></select></div>`;
  if(f.type==='multi_choice'){const a=Array.isArray(v)?v:[];return`<div class="social-field" data-wrap="${k}"><label>${lab}</label><div class="checks">${(f.options||[]).map(o=>`<label class="check"><input type="checkbox" data-smulti="${k}" value="${esc(o)}" ${a.includes(o)?'checked':''}><span>${esc(o)}</span></label>`).join('')}</div></div>`;}
  if(f.type==='repeater'){const rows=Array.isArray(v)&&v.length?v:[{}];return`<div class="social-field" data-wrap="${k}"><label>${lab}</label><div data-repeat-box="${k}">${rows.map((row,i)=>`<div class="grid2" style="margin-bottom:8px">${(f.fields||[]).map(sub=>`<input data-srepeat="${k}" data-row="${i}" data-sub="${esc(sub)}" placeholder="${esc(sub)}" value="${esc(row[sub]||'')}">`).join('')}</div>`).join('')}</div><button class="btn" type="button" data-add-repeat="${k}">+ Añadir fila</button></div>`;}
  if(f.type==='group'){const obj=v&&typeof v==='object'&&!Array.isArray(v)?v:{};return`<div class="social-field" data-wrap="${k}"><label>${lab}</label><div class="grid2">${(f.fields||[]).map(sub=>`<input data-sgroup="${k}" data-sub="${esc(sub)}" placeholder="${esc(sub)}" value="${esc(obj[sub]||'')}">`).join('')}</div></div>`;}
  const type=['date','number','tel'].includes(f.type)?f.type:'text';return`<div class="social-field" data-wrap="${k}"><label>${lab}</label><input type="${type}" data-sfield="${k}" value="${esc(v)}" ${f.calculated?'readonly':''}></div>`;
}
function renderSocialPage(){
  const out=$('socialBody'),pages=state.socialSchema.pages||[],p=pages[state.socialPage];
  out.innerHTML=`<h3>Trabajo Social — Entrevista Inicial / Manejo de Casos</h3><div class="social-steps">${pages.map((x,i)=>`<button type="button" class="social-step ${i===state.socialPage?'active':''}" data-spage="${i}">Página ${x.page}</button>`).join('')}</div><h3 style="font-size:16px">${esc(p.title)}</h3><div id="socialFields">${(p.fields||[]).map(socialField).join('')}</div><div class="section-title">Narrativa editable</div><textarea id="socialNarrative" class="narrative">${esc(buildSocialNarrative())}</textarea><div class="toolbar"><button class="btn" id="socialPrev" ${state.socialPage===0?'disabled':''}>Anterior</button><button class="btn" id="socialNext" ${state.socialPage===pages.length-1?'disabled':''}>Siguiente</button><button class="btn primary" id="socialSave">Guardar borrador</button><button class="btn secondary ${state.lastSocial?'':'hidden'}" id="socialSign">Firmar</button></div><div id="socialStatus" class="status"></div>`;
  bindSocialFields();$('socialPrev').onclick=()=>{if(state.socialPage>0){state.socialPage--;renderSocialPage();}};$('socialNext').onclick=()=>{if(state.socialPage<pages.length-1){state.socialPage++;renderSocialPage();}};document.querySelectorAll('[data-spage]').forEach(b=>b.onclick=()=>{state.socialPage=Number(b.dataset.spage);renderSocialPage();});$('socialSave').onclick=saveSocial;$('socialSign').onclick=signSocial;updateSocialConditional();
}
function bindSocialFields(){
  document.querySelectorAll('[data-sfield]').forEach(el=>el.oninput=()=>{let v=el.value;if(el.tagName==='SELECT'&&(v==='true'||v==='false'))v=v==='true';state.socialValues[el.dataset.sfield]=v;if(el.dataset.sfield==='dob')state.socialValues.age=age(v);updateSocialConditional();});
  document.querySelectorAll('[data-smulti]').forEach(el=>el.onchange=()=>{const k=el.dataset.smulti;state.socialValues[k]=[...document.querySelectorAll(`[data-smulti="${CSS.escape(k)}"]:checked`)].map(x=>x.value);});
  document.querySelectorAll('[data-srepeat]').forEach(el=>el.oninput=()=>{const k=el.dataset.srepeat,i=Number(el.dataset.row),sub=el.dataset.sub,a=Array.isArray(state.socialValues[k])?state.socialValues[k]:[];while(a.length<=i)a.push({});a[i][sub]=el.value;state.socialValues[k]=a;});
  document.querySelectorAll('[data-sgroup]').forEach(el=>el.oninput=()=>{const k=el.dataset.sgroup,sub=el.dataset.sub,obj=state.socialValues[k]&&typeof state.socialValues[k]==='object'?state.socialValues[k]:{};obj[sub]=el.value;state.socialValues[k]=obj;});
  document.querySelectorAll('[data-add-repeat]').forEach(b=>b.onclick=()=>{const k=b.dataset.addRepeat,a=Array.isArray(state.socialValues[k])?state.socialValues[k]:[];a.push({});state.socialValues[k]=a;renderSocialPage();});
}
function updateSocialConditional(){
  const p=(state.socialSchema.pages||[])[state.socialPage];(p.fields||[]).forEach(f=>{if(!f.show_if)return;const [k,v]=f.show_if.split('=');const el=document.querySelector(`[data-wrap="${CSS.escape(f.key)}"]`);if(el)el.classList.toggle('hidden',String(state.socialValues[k]??'')!==v);});
}
function buildSocialNarrative(){
  const v=state.socialValues;let txt=`Se realiza entrevista inicial de Trabajo Social / Manejo de Casos a ${v.name||'paciente'}${v.age?`, de ${v.age} años`:''}.`;
  const bits=[];if(v.marital_status)bits.push(`estado civil ${v.marital_status}`);if(v.education_level)bits.push(`nivel educativo ${v.education_level}`);if(bits.length)txt+=` Se documenta ${bits.join('; ')}.`;
  const needs=Array.isArray(v.immediate_needs)?v.immediate_needs:[];if(needs.length)txt+=` Necesidades inmediatas identificadas: ${needs.join(', ')}.`;if(v.comments)txt+=` Comentarios: ${v.comments}`;return txt;
}
async function saveSocial(){
  const st=$('socialStatus');st.textContent='Guardando…';
  try{
    const encounterId=await ensureEncounter('SOCIAL_WORK');
    const pageValues=n=>{const page=state.socialSchema.pages[n-1];const o={};(page.fields||[]).forEach(f=>o[f.key]=state.socialValues[f.key]??null);return JSON.stringify(o);};
    const body={encounterId,page1Json:pageValues(1),page2Json:pageValues(2),page3Json:pageValues(3),page4Json:pageValues(4),narrative:$('socialNarrative').value.trim()};
    state.lastSocial=await api(`/api/v1/patients/${state.patient.id}/social-work`,{method:'POST',body:JSON.stringify(body)});st.textContent='Borrador de cuatro páginas guardado.';st.className='status ok';$('socialSign').classList.remove('hidden');state.lazy.delete('timeline');
  }catch(e){st.textContent=e.message;st.className='status err';}
}
async function signSocial(){
  if(!state.lastSocial)return;if(!confirm('¿Firmar la evaluación de Trabajo Social? Después de firmarla no podrá editarse.'))return;
  const st=$('socialStatus');try{state.lastSocial=await api(`/api/v1/patients/${state.patient.id}/social-work/${state.lastSocial.id}/sign`,{method:'POST'});st.textContent='Evaluación firmada y bloqueada.';st.className='status ok';$('socialSign').classList.add('hidden');}catch(e){st.textContent=e.message;st.className='status err';}
}

boot().catch(e=>{console.error(e);location.href='/login.html';});
})();
