(function(){
'use strict';
if(window.__NT_DESKTOP_STABILITY)return;window.__NT_DESKTOP_STABILITY=1;
const NativeMO=window.MutationObserver;
if(NativeMO){
 function GuardedMutationObserver(callback){
  const wrapped=function(mutations,observer){
   const filtered=mutations.filter(function(m){
    const t=m&&m.target;
    if(t&&t.nodeType===1&&t.closest&&t.closest('#ntDesktopPatientDashboard'))return false;
    return true;
   });
   if(filtered.length)callback(filtered,observer);
  };
  return new NativeMO(wrapped);
 }
 try{GuardedMutationObserver.prototype=NativeMO.prototype;Object.setPrototypeOf(GuardedMutationObserver,NativeMO);window.MutationObserver=GuardedMutationObserver}catch(_){ }
}
let lastVisitClick=0;
document.addEventListener('click',function(e){
 const b=e.target&&e.target.closest&&e.target.closest('#ntDesktopPatientDashboard [data-dd="newvisit"]');
 if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();
 const now=Date.now();if(now-lastVisitClick<700)return;lastVisitClick=now;
 const target=document.getElementById('newVisitInside')||document.getElementById('newVisit');
 if(target)target.click();
},true);
function loadModule(src,flag,ready){
 if(window[flag]||ready&&ready())return;
 window[flag]=1;
 const loader=window.NURSETRACK_MODULE_LOADER;
 const done=()=>{window[flag]=0};
 if(loader&&loader.load){loader.load(src).then(done).catch(done);return}
 const s=document.createElement('script');s.src=src+'?v='+(window.NURSETRACK_BUILD||Date.now());s.async=true;s.onload=done;s.onerror=done;document.body.appendChild(s);
}
function loadPatientSupport(){
 loadModule('/desktop-real-data-runtime.js','__NT_REAL_DATA_LOADING',()=>!!window.NURSETRACK_DESKTOP_REAL_DATA);
 loadModule('/medical-visit-integrity-runtime.js','__NT_MEDICAL_INTEGRITY_LOADING',()=>!!window.NURSETRACK_MEDICAL_VISIT_INTEGRITY);
 loadModule('/medical-amendment-runtime.js','__NT_MEDICAL_AMENDMENT_LOADING',()=>!!window.NURSETRACK_MEDICAL_AMENDMENTS);
 loadModule('/medical-template-runtime.js','__NT_MEDICAL_TEMPLATE_LOADING',()=>!!window.NURSETRACK_MEDICAL_TEMPLATES);
}
document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('.patientbtn,.openp,.openc,.ntSearchResult'))setTimeout(loadPatientSupport,80)},true);
const patientPage=document.getElementById('patientPage');
if(patientPage&&NativeMO)new NativeMO(function(){if(!patientPage.classList.contains('hidden'))loadPatientSupport()}).observe(patientPage,{attributes:true,attributeFilter:['class']});
setTimeout(function(){if(patientPage&&!patientPage.classList.contains('hidden'))loadPatientSupport()},650);
window.NURSETRACK_DESKTOP_STABILITY={active:true,mutationFilter:true,newVisitGuard:true,realDataLoader:true,medicalVisitIntegrityLoader:true,medicalAmendmentLoader:true,medicalTemplateLoader:true};
})();