(function(){'use strict';
var CHECK_MS=60000;
var current=String(window.NURSETRACK_PUBLIC_BUILD||'');
var reloading=false;
function showAndReload(build){if(reloading)return;reloading=true;try{var n=document.createElement('div');n.textContent='Nueva versión disponible — actualizando…';n.style.cssText='position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:2147483647;background:#073e6d;color:#fff;padding:10px 16px;border-radius:999px;font:600 13px -apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;box-shadow:0 5px 20px rgba(0,0,0,.2)';document.body.appendChild(n);}catch(e){}setTimeout(function(){var base=location.pathname.indexOf('app-safe6.html')>=0?'app-safe6.html':'/';location.replace(base+'?v='+encodeURIComponent(build)+'&r='+Date.now());},900);}
async function check(){try{var r=await fetch('nursetrack-version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;var j=await r.json();var build=String(j&&j.build||'');if(!build)return;if(!current){current=build;window.NURSETRACK_PUBLIC_BUILD=build;return;}if(build!==current)showAndReload(build);}catch(e){}}
setInterval(check,CHECK_MS);
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')check();});
window.addEventListener('focus',check);
setTimeout(check,1500);
})();
