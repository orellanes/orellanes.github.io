(function(){
'use strict';
var STORE='nursetrack_clinical_v21';
var BACKUP='nursetrack_before_cloud_pull_v1';
async function forcePullFromCloud(){
  var cloud=window.nt28Cloud,user=window.nt28CloudUser;
  if(!cloud||!user)return false;
  try{
    if(typeof window.nt28SetCloudStatus==='function')window.nt28SetCloudStatus('Descargando nube…','busy');
    if(typeof window.nt28PanelMessage==='function')window.nt28PanelMessage('Descargando expediente desde la nube…');
    var r=await cloud.from('nursetrack_state').select('app_data,updated_at').eq('user_id',user.id).maybeSingle();
    if(r.error)throw r.error;
    if(r.data&&r.data.app_data){
      try{localStorage.setItem(BACKUP,localStorage.getItem(STORE)||'')}catch(e){}
      window.nt28CloudApplying=true;
      if(typeof window.normalize==='function')window.state=window.normalize(r.data.app_data);else window.state=r.data.app_data;
      try{localStorage.setItem(STORE,JSON.stringify(window.state))}catch(e){}
      try{localStorage.setItem('nursetrack_local_updated_at_v28',r.data.updated_at||new Date().toISOString())}catch(e){}
      window.nt28CloudApplying=false;
      if(typeof window.renderAll==='function')window.renderAll();
      if(typeof window.nt28SetCloudStatus==='function')window.nt28SetCloudStatus('Nube sincronizada','ok');
      if(typeof window.nt28PanelMessage==='function')window.nt28PanelMessage('Expedientes actualizados desde la nube.');
      return true;
    }
    if(typeof window.nt28PanelMessage==='function')window.nt28PanelMessage('La nube está conectada, pero todavía no tiene un expediente guardado.');
    return false;
  }catch(e){
    window.nt28CloudApplying=false;
    if(typeof window.nt28SetCloudStatus==='function')window.nt28SetCloudStatus('Sin conexión','error');
    if(typeof window.nt28PanelMessage==='function')window.nt28PanelMessage('No se pudo descargar el expediente desde la nube.');
    return false;
  }
}
function install(){
  if(window.__ntCloudSyncFixInstalled)return;
  if(typeof window.nt28CloudConnect!=='function')return setTimeout(install,120);
  window.__ntCloudSyncFixInstalled=true;
  var originalConnect=window.nt28CloudConnect;
  window.nt28CloudConnect=async function(){
    if(!window.nt28Cloud){window.nt28CloudStarted=false;if(typeof window.nt28CloudStart==='function')await window.nt28CloudStart()}
    var email=(document.getElementById('nt28CloudEmail')||{}).value||'';
    var pass=(document.getElementById('nt28CloudPassword')||{}).value||'';
    email=email.trim();
    if(!email||!pass){if(typeof window.nt28PanelMessage==='function')window.nt28PanelMessage('Escriba el correo y la contraseña de la cuenta de nube.');return}
    if(typeof window.nt28PanelMessage==='function')window.nt28PanelMessage('Conectando…');
    if(typeof window.nt28SetCloudStatus==='function')window.nt28SetCloudStatus('Conectando…','busy');
    try{
      var r=await window.nt28Cloud.auth.signInWithPassword({email:email,password:pass});
      if(r.error)throw r.error;
      window.nt28CloudUser=r.data.user;
      var pw=document.getElementById('nt28CloudPassword');if(pw)pw.value='';
      await forcePullFromCloud();
    }catch(e){
      if(typeof window.nt28SetCloudStatus==='function')window.nt28SetCloudStatus('Local','error');
      if(typeof window.nt28PanelMessage==='function')window.nt28PanelMessage('No se pudo conectar. Verifique la cuenta de nube.');
    }
  };
  window.nt28ForcePullFromCloud=forcePullFromCloud;
  var addPanel=window.nt28AddCloudPanel;
  if(typeof addPanel==='function'){
    window.nt28AddCloudPanel=function(){
      var r=addPanel.apply(this,arguments);
      setTimeout(function(){
        var sync=document.getElementById('nt28CloudSyncNow');
        if(sync){sync.textContent='Actualizar desde nube';sync.onclick=function(){forcePullFromCloud()}}
      },0);
      return r;
    };
  }
  setTimeout(function(){var sync=document.getElementById('nt28CloudSyncNow');if(sync){sync.textContent='Actualizar desde nube';sync.onclick=function(){forcePullFromCloud()}}},300);
}
install();
})();