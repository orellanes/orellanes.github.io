(function(){'use strict';if(window.__ntSafe6DirectTemplateLibraryNav)return;window.__ntSafe6DirectTemplateLibraryNav=true;
function q(s,r){return (r||document).querySelector(s)}function qa(s,r){return Array.from((r||document).querySelectorAll(s))}
function showLibrary(){var sec=q('#templateLibraryPage');if(!sec)return false;qa('main.main > section').forEach(function(x){x.classList.add('hidden')});sec.classList.remove('hidden');var search=q('#ntlSearch');if(search)setTimeout(function(){search.focus()},50);return true}
function install(){var nav=q('.side .navbtn[data-page="templatelibrary"]');if(!nav)return;nav.id='ntDirectTemplateLibraryNav';nav.dataset.ntCanonicalHidden='1';nav.style.setProperty('display','none','important')}
function boot(){install();new MutationObserver(function(){install()}).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.NT_OPEN_TEMPLATE_LIBRARY_DIRECT=showLibrary;
})();