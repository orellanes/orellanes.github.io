(function(){
'use strict';
if(window.__ntVersionGuardLoaded)return;window.__ntVersionGuardLoaded=true;
var KEY='nursetrack_v3_version_guard';
var CURRENT='20260830-final7';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
function write(v){try{localStorage.setItem(KEY,JSON.stringify(v));return true}catch(e){return false}}
function now(){return new Date().toISOString()}
function state(){var s=read();s.current=CURRENT;s.lastSeenAt=now();s.failures=s.failures||{};s.lastGood=s.lastGood||'';return s}
function markGood(){var s=state();s.lastGood=CURRENT;s.lastGoodAt=now();s.failures[CURRENT]=0;write(s);render('✓ Versión estable '+CURRENT);window.dispatchEvent(new CustomEvent('nursetrack:version-stable',{detail:{version:CURRENT}}))}
function markFailure(moduleName){var s=state();s.failures[CURRENT]=(s.failures[CURRENT]||0)+1;s.lastFailureAt=now();s.lastFailureModule=moduleName||'unknown';write(s);render('⚠️ Fallo detectado en '+(moduleName||'módulo'));if(s.failures[CURRENT]>=3){try{localStorage.setItem('nursetrack_v3_safe_mode','1')}catch(e){}window.dispatchEvent(new CustomEvent('nursetrack:rollback-requested',{detail:{lastGood:s.lastGood||'',failedVersion:CURRENT}}))}}
function render(msg){var host=document.querySelector('.top .row')||document.querySelector('.top .user');if(!host)return;var b=document.getElementById('ntVersionBadge');if(!b){b=document.createElement('span');b.id='ntVersionBadge';b.className='pill';host.insertBefore(b,host.firstChild)}b.textContent='🧬 '+CURRENT;b.title=msg||'Control de versión activo'}
function addPanel(){var f=document.getElementById('settingsForm');if(!f||document.getElementById('ntVersionGuardPanel'))return;var s=read();var d=document.createElement('div');d.id='ntVersionGuardPanel';d.className='span2';d.innerHTML='<h3>🧬 Versionado y rollback</h3><p class="muted">NurseTrack conserva la versión actual y la última versión marcada como estable. Si una versión falla repetidamente, activa Modo Seguro.</p><div class="row"><span class="pill">Actual: '+CURRENT+'</span><span class="pill">Última estable: '+(s.lastGood||'pendiente')+'</span><button type="button" class="btn secondary" id="ntMarkStable">Marcar esta versión estable</button><button type="button" class="btn secondary" id="ntEnableSafeMode">Activar Modo Seguro</button></div><div id="ntVersionMsg" class="muted" style="margin-top:8px"></div>';
f.appendChild(d);document.getElementById('ntMarkStable').onclick=function(){markGood();document.getElementById('ntVersionMsg').textContent='Versión marcada como estable ✓'};document.getElementById('ntEnableSafeMode').onclick=function(){try{localStorage.setItem('nursetrack_v3_safe_mode','1')}catch(e){}document.getElementById('ntVersionMsg').textContent='Modo Seguro activado. Recargue NurseTrack.'}}
window.addEventListener('error',function(e){var src=(e.filename||'').split('/').pop();if(src&&src.indexOf('module-')===0)markFailure(src)});
window.addEventListener('unhandledrejection',function(){markFailure('promise')});
window.addEventListener('load',function(){render();setTimeout(function(){addPanel();markGood()},10000)});
document.addEventListener('nursetrack:templates-synced',function(){markGood()});
window.ntVersionGuard={markGood:markGood,markFailure:markFailure,current:CURRENT};
})();