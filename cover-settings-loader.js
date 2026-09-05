(function(){
  function loadIntoApp(){
    var frame=document.querySelector('iframe');
    if(!frame)return;
    try{
      var d=frame.contentDocument||frame.contentWindow.document;
      if(!d || d.getElementById('ntCoverSettingsRuntimeScript'))return;
      var s=d.createElement('script');
      s.id='ntCoverSettingsRuntimeScript';
      s.src='/cover-settings-runtime.js?v=20260904-coveredit1';
      d.head.appendChild(s);
    }catch(e){console.error('[NurseTrack cover loader]',e)}
  }
  function boot(){
    loadIntoApp();
    var frame=document.querySelector('iframe');
    if(frame) frame.addEventListener('load',function(){setTimeout(loadIntoApp,250)});
    setTimeout(loadIntoApp,800);
    setTimeout(loadIntoApp,1800);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
