(function(){'use strict';
if(window.__ntSocialTemplateBridge)return;window.__ntSocialTemplateBridge=true;
function q(s,r){return(r||document).querySelector(s)}
function install(){
 var page=q('#templateLibraryPage');if(!page)return;
 if(q('#ntSocialOasisTemplateCard',page))return;
 var grid=q('.tl-grid,.template-grid,.grid',page)||page.querySelector('.card')&&page;
 if(!grid)return;
 var card=document.createElement('div');card.id='ntSocialOasisTemplateCard';card.className='card';card.style.cssText='border-left:5px solid #0d4d92;margin:10px 0';
 card.innerHTML='<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap"><div><h3 style="margin:0 0 6px">🤝 Trabajo Social · Entrevista Inicial / Manejo de Casos</h3><div class="muted">Plantilla oficial de 4 páginas reconstruida desde los formularios enviados: datos personales y serología; historial académico, seguro, ingresos y apoyos; sustancias, antecedentes e historial de salud; necesidades inmediatas y cierre.</div></div><span style="padding:5px 9px;border-radius:999px;background:#eaf3fb;color:#0d4d92;font-size:12px;font-weight:800">Trabajo Social</span></div><div class="row" style="margin-top:12px"><button class="btn primary" id="ntSocialOasisOpen">Abrir en Trabajo Social</button><button class="btn secondary" id="ntSocialOasisPrint">Imprimir</button></div>';
 var host=q('.tl-grid,.template-grid',page)||q('.card',page);if(host&&host.parentNode&&host!==page)host.parentNode.insertBefore(card,host);else page.appendChild(card);
 q('#ntSocialOasisOpen',card).onclick=function(){if(window.NT_SOCIAL_WORK_MODERN&&NT_SOCIAL_WORK_MODERN.open)return NT_SOCIAL_WORK_MODERN.open();alert('Abra primero un paciente activo y vuelva a intentarlo.')};
 q('#ntSocialOasisPrint',card).onclick=function(){if(window.NT_SOCIAL_WORK_MODERN&&NT_SOCIAL_WORK_MODERN.print)return NT_SOCIAL_WORK_MODERN.print();alert('Abra primero un paciente activo y vuelva a intentarlo.')};
}
new MutationObserver(function(){setTimeout(install,0)}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest('[data-page="templateLibrary"],[data-page="templates"],[data-nt-module="templates"]');if(t)setTimeout(install,100)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(install,300)});else setTimeout(install,300);
})();
