(function(){
'use strict';
if(window.__NT_V4_PATIENT_ROW_OPEN_FIX_V2__)return;
window.__NT_V4_PATIENT_ROW_OPEN_FIX_V2__=true;
let lastTouchOpen=0;

function getRow(target){
  if(!target)return null;
  if(target.nodeType===3)target=target.parentElement;
  return target&&target.closest?target.closest('#patientResults .patient-row'):null;
}
function openRow(row,e){
  if(!row||typeof row.onclick!=='function')return false;
  try{
    if(e){e.preventDefault();e.stopPropagation();}
    row.onclick.call(row,e||new Event('click'));
    return true;
  }catch(err){
    console.error('NurseTrack patient open failed',err);
    return false;
  }
}

document.addEventListener('touchend',function(e){
  const row=getRow(e.target);
  if(!row)return;
  if(openRow(row,e))lastTouchOpen=Date.now();
},{capture:true,passive:false});

document.addEventListener('click',function(e){
  const row=getRow(e.target);
  if(!row)return;
  if(Date.now()-lastTouchOpen<900){e.preventDefault();e.stopPropagation();return;}
  openRow(row,e);
},true);
})();
