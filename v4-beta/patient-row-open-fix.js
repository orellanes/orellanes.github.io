(function(){
'use strict';
if(window.__NT_V4_PATIENT_ROW_OPEN_FIX__)return;
window.__NT_V4_PATIENT_ROW_OPEN_FIX__=true;

document.addEventListener('click',function(e){
  const row=e.target&&e.target.closest?e.target.closest('#patientResults .patient-row'):null;
  if(!row)return;
  if(typeof row.onclick!=='function')return;
  e.preventDefault();
  e.stopImmediatePropagation();
  try{row.onclick.call(row,e)}catch(err){
    console.error('NurseTrack patient open failed',err);
  }
},true);
})();
