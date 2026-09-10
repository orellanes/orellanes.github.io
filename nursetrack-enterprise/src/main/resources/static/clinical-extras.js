(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[m]));
let csrfToken=null,lastPhq=null;

async function csrf(){
  if(csrfToken)return csrfToken;
  const r=await fetch('/api/public/csrf',{credentials:'same-origin'});
  if(!r.ok)throw new Error('No se pudo iniciar protección CSRF');
  csrfToken=await r.json();return csrfToken;
}
async function api(url,opts={}){
  const method=(opts.method||'GET').toUpperCase();
  const headers=new Headers(opts.headers||{});
  if(opts.body&&!headers.has('Content-Type'))headers.set('Content-Type','application/json');
  if(!['GET','HEAD','OPTIONS'].includes(method)){
    const c=await csrf();headers.set(c.headerName||'X-XSRF-TOKEN',c.token);
  }
  const r=await fetch(url,{...opts,method,headers,credentials:'same-origin'});
  const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok)throw new Error((data&&data.message)||data||`Error ${r.status}`);return data;
}
async function currentPatient(){
  const raw=String($('patientMrn')?.textContent||'').replace(/^MRN\s*/i,'').trim();
  if(!raw||raw==='—')throw new Error('Seleccione un paciente primero.');
  const rows=await api('/api/v1/patients?mrn='+encodeURIComponent(raw));
  if(!rows?.length)throw new Error('No pude identificar el paciente activo.');
  return rows[0];
}
function fmt(v){if(!v)return'—';const d=new Date(v);return isNaN(d)?String(v):d.toLocaleString('es-PR',{dateStyle:'medium',timeStyle:String(v).includes('T')?'short':undefined});}
function num(id){const v=$(id)?.value;return v===''||v==null?null:Number(v);}

const PHQ=[
  'Poco interés o placer en hacer cosas',
  'Sentirse decaído(a), deprimido(a) o sin esperanza',
  'Dificultad para dormir o dormir demasiado',
  'Sentirse cansado(a) o con poca energía',
  'Poco apetito o comer en exceso',
  'Sentirse mal consigo mismo(a) o que ha fallado',
  'Dificultad para concentrarse',
  'Moverse/hablar muy lento o estar muy inquieto(a)',
  'Pensamientos de que estaría mejor muerto(a) o de hacerse daño'
];
const PHQ_OPTS=[['0','Nunca'],['1','Varios días'],['2','Más de la mitad de los días'],['3','Casi todos los días']];
function severity(n){return n<5?'Mínima':n<10?'Leve':n<15?'Moderada':n<20?'Moderadamente severa':'Severa';}
function phqTotal(){let total=0,complete=true;for(let i=1;i<=9;i++){const v=$('phq'+i)?.value;if(v===''){complete=false;break;}total+=Number(v);}return complete?total:null;}
function updatePhq(){
  const total=phqTotal();const box=$('phqScore');if(!box)return;
  if(total==null){box.innerHTML='<strong>Puntuación:</strong> complete las 9 preguntas.';return;}
  const q9=Number($('phq9').value||0);const follow=total>=5||q9>0;
  box.innerHTML=`<strong>Total: ${total}/27 · ${severity(total)}</strong>${follow?'<div class="status err" style="margin-top:8px">Requiere seguimiento clínico. Con puntuación ≥5, documente evaluación/referido según corresponda.</div>':''}${q9>0?'<div class="status err">⚠ Pregunta 9 positiva: documente de inmediato la acción clínica tomada.</div>':''}`;
}
async function renderPhq9(){
  const out=$('phq9Body');if(!out)return;out.innerHTML='<span class="muted">Cargando PHQ-9…</span>';
  try{
    const p=await currentPatient();const rows=await api(`/api/v1/patients/${p.id}/phq9`);
    const today=new Date().toISOString().slice(0,10);
    out.innerHTML=`<h3>PHQ-9</h3><p class="muted">Instrumento opcional dentro del expediente. La puntuación se calcula automáticamente.</p><div class="grid2"><div><label>Fecha</label><input id="phqDate" type="date" value="${today}"></div><div id="phqScore" class="card" style="padding:10px"><strong>Puntuación:</strong> complete las 9 preguntas.</div></div><div style="margin-top:12px">${PHQ.map((q,i)=>`<div class="card" style="margin-bottom:8px;padding:10px"><strong>${i+1}. ${esc(q)}</strong><select id="phq${i+1}" style="margin-top:7px"><option value="">Seleccione…</option>${PHQ_OPTS.map(([v,l])=>`<option value="${v}">${v} · ${esc(l)}</option>`).join('')}</select></div>`).join('')}</div><div class="section-title">Acción clínica / referido</div><textarea id="phqAction" placeholder="Ej. evaluación realizada, referido a Salud Mental, plan de seguridad, seguimiento..."></textarea><div class="section-title">Notas</div><textarea id="phqNotes"></textarea><div class="toolbar"><button class="btn primary" id="phqSave">Guardar PHQ-9</button><button class="btn secondary hidden" id="phqSign">Firmar</button></div><div id="phqStatus" class="status"></div><div class="section-title">Historial PHQ-9</div><div id="phqHistory" class="timeline"></div>`;
    for(let i=1;i<=9;i++)$('phq'+i).onchange=updatePhq;$('phqSave').onclick=savePhq;$('phqSign').onclick=signPhq;renderPhqHistory(rows);updatePhq();
  }catch(e){out.innerHTML=`<div class="status err">${esc(e.message)}</div>`;}
}
function renderPhqHistory(rows){const out=$('phqHistory');if(!out)return;out.innerHTML=rows?.length?rows.map(x=>`<div class="timeline-item"><strong>${esc(x.screeningDate)} · ${esc(x.totalScore)}/27 · ${esc(String(x.severity||'').replaceAll('_',' '))}</strong><span>${esc(x.status)}${x.followUpRequired?' · seguimiento requerido':''}</span>${x.actionTaken?`<div>${esc(x.actionTaken)}</div>`:''}</div>`).join(''):'<span class="muted">No hay PHQ-9 previos.</span>';}
async function savePhq(){
  const st=$('phqStatus');try{
    const p=await currentPatient();const total=phqTotal();if(total==null)throw new Error('Complete las 9 preguntas.');
    const body={screeningDate:$('phqDate').value};for(let i=1;i<=9;i++)body['q'+i]=Number($('phq'+i).value);body.actionTaken=$('phqAction').value.trim()||null;body.notes=$('phqNotes').value.trim()||null;
    if(body.q9>0&&!body.actionTaken)throw new Error('Pregunta 9 positiva: documente la acción clínica tomada antes de guardar.');
    lastPhq=await api(`/api/v1/patients/${p.id}/phq9`,{method:'POST',body:JSON.stringify(body)});st.textContent='PHQ-9 guardado.';st.className='status ok';$('phqSign').classList.remove('hidden');renderPhqHistory(await api(`/api/v1/patients/${p.id}/phq9`));
  }catch(e){st.textContent=e.message;st.className='status err';}
}
async function signPhq(){if(!lastPhq)return;if(!confirm('¿Firmar este PHQ-9?'))return;const st=$('phqStatus');try{const p=await currentPatient();lastPhq=await api(`/api/v1/patients/${p.id}/phq9/${lastPhq.id}/sign`,{method:'POST'});st.textContent='PHQ-9 firmado y bloqueado.';st.className='status ok';$('phqSign').classList.add('hidden');renderPhqHistory(await api(`/api/v1/patients/${p.id}/phq9`));}catch(e){st.textContent=e.message;st.className='status err';}}

function fFromC(c){return c==null?'—':Math.round((Number(c)*9/5+32)*10)/10;}
function lbFromKg(k){return k==null?'—':Math.round(Number(k)*2.2046226218*10)/10;}
function inFromCm(c){return c==null?'—':Math.round(Number(c)/2.54*10)/10;}
async function renderVitals(){
  const out=$('vitalsBody');if(!out)return;out.innerHTML='<span class="muted">Cargando signos vitales…</span>';
  try{
    const p=await currentPatient();const rows=await api(`/api/v1/patients/${p.id}/vitals`);
    out.innerHTML=`<h3>Signos vitales</h3><p class="muted">Se muestran en unidades US; el sistema normaliza los valores internamente para tendencias clínicas.</p><div class="grid4"><div><label>PA sistólica</label><input id="vSys" type="number"></div><div><label>PA diastólica</label><input id="vDia" type="number"></div><div><label>Pulso</label><input id="vHr" type="number"></div><div><label>Respiración</label><input id="vRr" type="number"></div><div><label>Temperatura °F</label><input id="vTemp" type="number" step="0.1"></div><div><label>SpO₂ %</label><input id="vSpo2" type="number"></div><div><label>Peso lb</label><input id="vWeight" type="number" step="0.1"></div><div><label>Estatura in</label><input id="vHeight" type="number" step="0.1"></div><div><label>Dolor 0–10</label><input id="vPain" type="number" min="0" max="10"></div></div><div class="section-title">Notas</div><textarea id="vNotes"></textarea><div class="toolbar"><button class="btn primary" id="vSave">Registrar signos vitales</button></div><div id="vStatus" class="status"></div><div class="section-title">Tendencia / historial</div><div id="vHistory" class="timeline"></div>`;
    $('vSave').onclick=saveVitals;renderVitalsHistory(rows);
  }catch(e){out.innerHTML=`<div class="status err">${esc(e.message)}</div>`;}
}
function renderVitalsHistory(rows){const out=$('vHistory');if(!out)return;out.innerHTML=rows?.length?rows.map(x=>`<div class="timeline-item"><strong>${esc(fmt(x.measuredAt))}</strong><span>PA ${esc(x.systolic??'—')}/${esc(x.diastolic??'—')} · Pulso ${esc(x.heartRate??'—')} · Resp ${esc(x.respiratoryRate??'—')} · Temp ${esc(fFromC(x.temperatureC))} °F · SpO₂ ${esc(x.spo2??'—')}% · Peso ${esc(lbFromKg(x.weightKg))} lb · Estatura ${esc(inFromCm(x.heightCm))} in${x.bmi?` · IMC ${esc(x.bmi)}`:''}</span></div>`).join(''):'<span class="muted">No hay signos vitales registrados.</span>';}
async function saveVitals(){const st=$('vStatus');try{const p=await currentPatient();const body={systolic:num('vSys'),diastolic:num('vDia'),heartRate:num('vHr'),respiratoryRate:num('vRr'),temperatureF:num('vTemp'),spo2:num('vSpo2'),weightLb:num('vWeight'),heightIn:num('vHeight'),painScore:num('vPain'),notes:$('vNotes').value.trim()||null};await api(`/api/v1/patients/${p.id}/vitals`,{method:'POST',body:JSON.stringify(body)});st.textContent='Signos vitales registrados.';st.className='status ok';renderVitalsHistory(await api(`/api/v1/patients/${p.id}/vitals`));}catch(e){st.textContent=e.message;st.className='status err';}}

async function adjustTabs(attempt=0){try{const me=await api('/api/v1/me');if(['SUPERADMIN','ADMIN','NURSE','SOCIAL_WORK','PHYSICIAN'].includes(me.role))document.querySelector('.tab[data-tab="phq9"]')?.classList.remove('hidden');if(['SUPERADMIN','ADMIN','NURSE','PHYSICIAN'].includes(me.role))document.querySelector('.tab[data-tab="vitals"]')?.classList.remove('hidden');}catch{if(attempt<5)setTimeout(()=>adjustTabs(attempt+1),400);}}
document.addEventListener('click',e=>{const b=e.target.closest?.('.tab[data-tab]');if(!b)return;if(b.dataset.tab==='phq9')setTimeout(renderPhq9,0);if(b.dataset.tab==='vitals')setTimeout(renderVitals,0);});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(adjustTabs,300));else setTimeout(adjustTabs,300);
})();
