(function(){
'use strict';
if(window.__NT_SETTINGS_PERMISSION_RUNTIME)return;window.__NT_SETTINGS_PERMISSION_RUNTIME=1;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
function P(){return window.NurseTrackPermissions}
function can(k){const p=P();return !p||!p.ready||p.isSuper||p.can(k)}
const sectionMap={
 ntUserManagement:'users.manage',
 ntPermissionsAdmin:'users.manage',
 ntMembershipAdmin:'membership.manage',
 ntTemplateAdmin:'templates.manage',
 ntResourcesPlans:'settings.manage',
 ntClearinghouseCompanyAdmin:'settings.manage',
 ntLoginCoverAdmin:'settings.manage',
 ntSystemMaintenance:'settings.manage',
 ntRecycleBin:'patients.edit'
};
const tileMap={
 ntUserManagement:'users.manage',
 ntPermissionsAdmin:'users.manage',
 ntMembershipAdmin:'membership.manage',
 ntTemplateAdmin:'templates.manage',
 ntResourcesPlans:'settings.manage',
 ntSystemMaintenance:'settings.manage',
 ntRecycleBin:'patients.edit',
 ntClearinghouseCompanyAdmin:'settings.manage'
};
function apply(){
 Object.entries(sectionMap).forEach(([id,k])=>{const el=document.getElementById(id);if(el)el.classList.toggle('hidden',!can(k))});
 const hub=document.getElementById('ntSuperAdminHub');
 if(hub){hub.querySelectorAll('[data-target]').forEach(btn=>{const k=tileMap[btn.dataset.target];if(k)btn.classList.toggle('hidden',!can(k))});}
 const superNav=document.getElementById('ntSuperAdminNav');
 if(superNav){const p=P();superNav.classList.toggle('hidden',!!(p&&p.ready&&!p.isSuper))}
 document.documentElement.dataset.ntSettingsPermissions='1';
}
function schedule(){clearTimeout(window.__ntSettingsPermTimer);window.__ntSettingsPermTimer=setTimeout(apply,80)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('nursetrack:permissions-applied',schedule);
document.addEventListener('nursetrack:permissions-updated',schedule);
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
window.NURSETRACK_SETTINGS_PERMISSIONS={apply,can};
})();
