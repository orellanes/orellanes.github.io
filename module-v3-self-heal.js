(function(){
'use strict';
if(window.__ntSelfHealLoaded)return;window.__ntSelfHealLoaded=true;
var CORE='nursetrack_clinical_v21';
var HEALTH='nursetrack_v3_system_health_v2';
var SAFE='nursetrack_v3_safe_mode';
var QUAR='nursetrack_v3_quarantined_modules';
var LASTGOOD='nursetrack_v3_last_good_modules';
var MODULES=['module-v3-safe-core.js','module-v3-safe-clinical.js','module-v3-safe-workflow.js','module-v3-safe-appointments-lab.js','module-v3-safe-billing.js','module-v3-safe-membership.js','module-v3-safe-social-templates.js','module-v3-social-referrals.js','module-v3-social-case-management.js','module-v3-social-assessment.js','module-v3-social-followup.js','module-v3-social-closure.js','module-v3-addiction-coding.js','module-v3-admin-users.js','module-v3-superadmin.js','module-v3-patient-assignment.js','module-v3-role-visibility.js','module-v3-module-permissions.js','module-v3-edit-permissions.js','module-v3-template-governance.js','module-v3-company-branding.js','module-v3-cloud-status.js','module-sync.js','module-v3-resilience.js','module-v3-refresh-sync.js'];
function now(){return new Date().toISOString()}
function read(k,fb){try{var v=localStorage.getItem(k);return v==null?fb:JSON.parse(v)}catch(e){return fb}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
function coreValid(){var s=read(CORE,null);return !!s&&typeof s==='object'&&Array.isArray(s.patients)&&Array.isArray(s.audit)&&s.settings&&typeof s.settings==='object'}
function setHealth(status,detail){var h={status:status,detail:detail||'',checkedAt:now(),coreValid:coreValid(),safeMode:!!read(SAFE,false),quarantined:read(QUAR,[])};write(HEALTH,h);render(h);return h}
function render(h){try{var host=document.querySelector('.top .row')||document.querySelector('.top .user');if(!host)return;var b=document.getElementById('ntSelfHealBadge');if(!b){b=document.createElement('span');b.id='ntSelfHealBadge';b.className='pill';host.insertBefore(b,host.firstChild)}b.textContent=h.status==='ok'?'⚡ Auto-Health OK':h.safeMode?'🧯 Modo seguro':'⚠️ Auto-Health';b.title=h.detail||''}catch(e){}}
function moduleErrors(){var q=read(QUAR,[]);return Array.isArray(q)?q:[]}
function quarantine(name,reason){if(!name)return;var q=moduleErrors();if(!q.some(function(x){return x.name===name})){q.push({name:name,reason:reason||'error',at:now()});write(QUAR,q)}setHealth('warn','Módulo aislado: '+name)}
function clearQuarantine(){write(QUAR,[]);write(SAFE,false);setHealth('ok','Aislamiento de módulos limpiado')}
function enterSafeMode(reason){write(SAFE,true);setHealth('warn',reason||'Modo seguro activado')}
function leaveSafeMode(){write(SAFE,false);setHealth('ok','Modo seguro desactivado')}
function verify(){var problems=[];if(!coreValid())problems.push('estado clínico local inválido');if(!document.querySelector('main.main'))problems.push('interfaz principal no disponible');if(!document.querySelector('.side'))problems.push('menú principal no disponible');if(problems.length){enterSafeMode(problems.join('; '));return false}write(LASTGOOD,{at:now(),modules:MODULES.slice()});setHealth('ok','Sistema, datos e interfaz verificados');return true}
function addPanel(){try{var f=document.getElementById('settingsForm');if(!f||document.getElementById('ntSelfHealPanel'))return;var d=document.createElement('div');d.id='ntSelfHealPanel';d.className='span2';d.innerHTML='<h3>⚡ Auto-Health / Modo seguro</h3><p class="muted">Supervisa la estructura principal, registra módulos con error y permite arrancar NurseTrack en modo seguro sin perder los datos.</p><div class="row"><button type="button" class="btn secondary" id="ntSelfCheck">Verificar ahora</button><button type="button" class="btn secondary" id="ntSafeOn">Activar modo seguro</button><button type="button" class="btn secondary" id="ntSafeOff">Salir de modo seguro</button><button type="button" class="btn secondary" id="ntClearQuarantine">Limpiar aislamiento</button><span class="muted" id="ntSelfHealText"></span></div>';f.appendChild(d);var t=document.getElementById('ntSelfHealText');document.getElementById('ntSelfCheck').onclick=function(){t.textContent=verify()?'Sistema íntegro ✓':'Modo seguro activado'};document.getElementById('ntSafeOn').onclick=function(){enterSafeMode('Activado manualmente');t.textContent='Modo seguro listo para el próximo inicio';};document.getElementById('ntSafeOff').onclick=function(){leaveSafeMode();t.textContent='Modo seguro desactivado';};document.getElementById('ntClearQuarantine').onclick=function(){clearQuarantine();t.textContent='Aislamiento limpiado ✓';};}catch(e){}}
window.addEventListener('error',function(e){try{var src=String(e.filename||'').split('/').pop().split('?')[0];if(src&&MODULES.indexOf(src)>=0)quarantine(src,String(e.message||'error'))}catch(x){}});
window.addEventListener('unhandledrejection',function(){setHealth('warn','Se detectó una operación asíncrona fallida')});
document.addEventListener('nursetrack:templates-synced',verify);document.addEventListener('nursetrack:membership-payment-synced',verify);
function init(){verify();addPanel();setInterval(verify,120000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.ntSelfHeal={verify:verify,enterSafeMode:enterSafeMode,leaveSafeMode:leaveSafeMode,quarantine:quarantine,clearQuarantine:clearQuarantine};
})();