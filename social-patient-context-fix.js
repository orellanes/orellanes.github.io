(function(){'use strict';
if(window.__ntSocialPatientContextFix)return;window.__ntSocialPatientContextFix=true;
var last=null;
function val(sel){var e=document.querySelector(sel);return e?String(e.value||e.textContent||'').trim():''}
function visiblePatient(){
 var page=document.getElementById('patientPage');
 if(!page||page.classList.contains('hidden'))return null;
 var name=val('#patientName'),meta=val('#patientMeta'),m=meta.match(/MRN\s+([^·\n]+)/i),mrn=m&&m[1]?m[1].trim():'';
 var form=document.getElementById('demoForm');
 function fv(n){if(!form)return'';var e=form.querySelector('[name="'+n+'"]');return e?String(e.value||'').trim():''}
 var first=fv('firstName'),lastName=fv('lastName');
 if(!name)name=[first,lastName].filter(Boolean).join(' ');
 if(!mrn)mrn=fv('mrn');
 if(!name&&!mrn)return null;
 return {id:'dom-social-'+(mrn||name).toLowerCase().replace(/[^a-z0-9]+/g,'-'),mrn:mrn,recordNumber:mrn,name:name,fullName:name,firstName:first,lastName:lastName,dob:fv('dob'),phone:fv('phone'),address:fv('address'),city:fv('city'),sex:fv('sexAtBirth')||fv('genderIdentity'),status:(meta.split('·')[1]||'').trim()};
}
function prime(){
 var p=visiblePatient();if(!p)return null;last=p;
 try{if(window.NT_SOCIAL_WORK_MODERN&&typeof window.NT_SOCIAL_WORK_MODERN.syncPatient==='function')window.NT_SOCIAL_WORK_MODERN.syncPatient(p)}catch(e){}
 return p;
}
function patchApi(){
 var api=window.NT_SOCIAL_WORK_MODERN;if(!api||api.__domPatientPatched)return false;
 var original=api.open;if(typeof original!=='function')return false;
 api.open=function(){
   var p=prime();
   if(!p)return original.apply(api,arguments);
   var ctx=window.NT_ACTIVE_PATIENT,created=false,oldGet=null,oldSet=null;
   if(ctx){oldGet=ctx.get;oldSet=ctx.set;ctx.get=function(){var x=null;try{x=typeof oldGet==='function'?oldGet.call(ctx):null}catch(e){}return x||last||p};ctx.set=function(x){last=x||last;try{return typeof oldSet==='function'?oldSet.call(ctx,x):x}catch(e){return x}}}
   else{created=true;ctx=window.NT_ACTIVE_PATIENT={get:function(){return last||p},set:function(x){last=x||last;return x}}}
   try{return original.apply(api,arguments)}finally{setTimeout(function(){if(created){try{delete window.NT_ACTIVE_PATIENT}catch(e){}}else if(ctx){ctx.get=oldGet;ctx.set=oldSet}},0)}
 };
 api.__domPatientPatched=true;return true;
}
document.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest('#ntSocialOasisOpen,#ntSwOpen,[data-social-work-open]');if(t)prime()},true);
new MutationObserver(function(){prime();patchApi()}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
var tries=0,t=setInterval(function(){prime();if(patchApi()||++tries>40)clearInterval(t)},250);
})();
