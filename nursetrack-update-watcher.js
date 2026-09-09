(function(){'use strict';
var CHECK_MS=300000;
var current=String(window.NURSETRACK_PUBLIC_BUILD||'');
var reloading=false,lastCheck=0,billingLoading=null;
function showAndReload(build){if(reloading)return;reloading=true;try{var n=document.createElement('div');n.textContent='Nueva versión disponible — actualizando…';n.style.cssText='position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:2147483647;background:#073e6d;color:#fff;padding:10px 16px;border-radius:999px;font:600 13px -apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;box-shadow:0 5px 20px rgba(0,0,0,.2)';document.body.appendChild(n);}catch(e){}setTimeout(function(){var base=location.pathname.indexOf('app-safe6.html')>=0?'app-safe6.html':'/';location.replace(base+'?v='+encodeURIComponent(build)+'&r='+Date.now());},900);}
async function check(force){try{var now=Date.now();if(!force&&now-lastCheck<CHECK_MS)return;lastCheck=now;var r=await fetch('nursetrack-version.json?t='+now,{cache:'no-store'});if(!r.ok)return;var j=await r.json();var build=String(j&&j.build||'');if(!build)return;if(!current){current=build;window.NURSETRACK_PUBLIC_BUILD=build;return;}if(build!==current)showAndReload(build);}catch(e){}}
function loadRuntime(name){return new Promise(function(resolve){try{if(Array.from(document.scripts).some(function(s){return (s.src||'').indexOf('/'+name)>=0;})){resolve(true);return;}var s=document.createElement('script');s.src=name+'?v='+(window.NURSETRACK_PUBLIC_BUILD||Date.now());s.async=true;s.onload=function(){resolve(true)};s.onerror=function(){resolve(false)};(document.head||document.documentElement).appendChild(s);}catch(e){resolve(false)}})}
async function ensureCompanyBilling(){if(billingLoading)return billingLoading;billingLoading=(async function(){try{await loadRuntime('company-context-runtime.js');for(var i=0;i<15&&!window.NURSETRACK_COMPANY_CONTEXT;i++)await new Promise(function(r){setTimeout(r,100)});await loadRuntime('company-subscription-billing-admin.js');}catch(e){}finally{billingLoading=null}})();return billingLoading;}
setInterval(function(){check(false)},CHECK_MS);
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')check(false)});
window.addEventListener('focus',function(){check(false)});
setTimeout(function(){check(true)},2000);
document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('[data-page="settings"],#settingsBtn,[data-page="billing"],[data-page="membership"]'):null;if(t)setTimeout(ensureCompanyBilling,80);},true);
})();
