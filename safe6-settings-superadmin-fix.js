(function(){'use strict';
if(window.__ntSafe6SettingsSuperFix)return;window.__ntSafe6SettingsSuperFix=true;
var guarded=typeof window.showPage==='function'?window.showPage:null;
var base=typeof window.nt287ShowPage==='function'?window.nt287ShowPage:null;
function norm(r){return String(r||'').toLowerCase().trim().replace(/[\s-]+/g,'_')}
function verified(){
  if(window.nt37VerifiedSuperAdmin===true)return true;
  var up=window.nt37UserPermissions&&window.nt37UserPermissions.state;
  if(up&&up.ready&&norm(up.role)==='superadmin')return true;
  var p=window.nt37Permissions;
  try{if(p&&typeof p.isSuper==='function'&&p.isSuper())return true}catch(e){}
  return false;
}
function reveal(n){
  if(base){base(n);return true}
  var ids={settings:'settingsPage',audit:'auditPage'},id=ids[n],el=id&&document.getElementById(id);if(!el)return false;
  document.querySelectorAll('main.main > section').forEach(function(x){x.classList.add('hidden')});
  el.classList.remove('hidden');el.style.removeProperty('display');el.style.removeProperty('visibility');
  document.querySelectorAll('.navbtn[data-page]').forEach(function(b){b.classList.toggle('active',b.dataset.page===n)});
  return true;
}
async function authorizeAndOpen(n){
  if(verified()){reveal(n);return true}
  try{
    if(typeof window.NT_VERIFY_SUPERADMIN==='function'){
      var ok=await window.NT_VERIFY_SUPERADMIN();
      if(ok){reveal(n);return true}
    }
  }catch(e){}
  if(guarded)guarded(n);
  return false;
}
window.showPage=function(n){
  if(n==='settings'||n==='audit'){
    if(verified())return reveal(n);
    authorizeAndOpen(n);return;
  }
  return guarded?guarded(n):undefined;
};
document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest&&e.target.closest('.navbtn[data-page="settings"],.navbtn[data-page="audit"],[data-go="settings"],[data-go="audit"]');
  if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();
  authorizeAndOpen((b.dataset.page||b.dataset.go||'settings'));
},true);
document.addEventListener('nt37:superadmin-verified',function(){try{document.documentElement.dataset.ntSuperadmin='true'}catch(e){}});
})();