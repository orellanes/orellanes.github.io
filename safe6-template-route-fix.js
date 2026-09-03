(function(){'use strict';
if(window.__ntSafe6TemplateRouteFix)return;window.__ntSafe6TemplateRouteFix=true;
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function setStatus(text,err){var x=document.getElementById('globalStatus');if(!x)return;x.textContent=text;x.className='status'+(err?' err':'')}
async function waitFor(fn,tries,ms){for(var i=0;i<tries;i++){try{var v=fn();if(v)return v}catch(e){}await sleep(ms)}return null}
async function ensureBuilder(){
 var opener=await waitFor(function(){return typeof window.NT_OPEN_TEMPLATE_BUILDER==='function'&&window.NT_OPEN_TEMPLATE_BUILDER},50,100);
 if(opener){var ok=await opener('templates');if(ok!==false){setStatus('Portadas y Plantillas listo.');return true}}
 var od=await waitFor(function(){return window.nt37OnDemand&&typeof window.nt37OnDemand.load==='function'&&window.nt37OnDemand},50,100);
 if(od){try{await od.load('templates')}catch(e){}}
 var ds=await waitFor(function(){return window.NT_DESIGN_STUDIO},30,100);
 if(ds&&typeof ds.showTemplates==='function'){ds.showTemplates();setStatus('Portadas y Plantillas listo.');return true}
 setStatus('No se pudo abrir Portadas y Plantillas. Pulsa Super Administrador e inténtalo nuevamente.',true);return false
}
function requested(){try{return new URLSearchParams(location.search).get('module')==='templates'}catch(e){return false}}
function bind(){
 document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('#nt37DesignNav,[data-nt-module="templates"]');if(!b)return;e.preventDefault();e.stopPropagation();ensureBuilder()},true);
 if(requested())setTimeout(ensureBuilder,700)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
window.NT_SAFE6_OPEN_TEMPLATES=ensureBuilder;
})();