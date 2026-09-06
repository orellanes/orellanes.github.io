(function(){'use strict';if(window.__ntNursingVitalGraphsDisabled)return;window.__ntNursingVitalGraphsDisabled=true;
function isGraphButton(el){var t=String((el&&el.textContent)||'').replace(/\s+/g,' ').trim().toLowerCase();return t==='gráficas de vitales'||t==='graficas de vitales'||t==='vital graphs'}
function clean(){document.querySelectorAll('button,a').forEach(function(el){if(isGraphButton(el))el.remove()});document.querySelectorAll('#nursingTab .visit div').forEach(function(el){var s=el.querySelector&&el.querySelector('strong');if(s&&/gráfica de esta visita|grafica de esta visita/i.test(String(s.textContent||'')))el.remove()})}
try{window.chartVitalSigns=function(){return false}}catch(e){}
try{window.miniVisitChart=function(){return ''}}catch(e){}
function init(){clean();var mo=new MutationObserver(function(){clean()});mo.observe(document.body,{childList:true,subtree:true});setInterval(clean,2000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();