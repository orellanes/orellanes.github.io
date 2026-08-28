(function(){
'use strict';
var STORE='nursetrack_clinical_v21';
var BACKUP='nursetrack_before_cloud_pull_v1';
var LOCAL_UPDATED='nursetrack_local_updated_at_v28';
var pulling=false;
function ts(v){var n=Date.parse(v||'');return isNaN(n)?0:n}
function editing(){try{var d=document.querySelector('dialog[open]');if(d)return true;var a=document.activeElement;return !!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.value!==a.defaultValue)}catch(e){return false}}
async function ensureSession(){
  try{
    if(!window.nt28Cloud&&typeof window.nt28CloudStart==='function')await window.nt28CloudStart();
    var cloud=window.nt28Cloud;if(!cloud||!cloud.auth)return false;
    var s=await cloud.auth.getSession();
    if(s&&s.data&&s.data.session&&s.data.session.user){window.nt28CloudUser=s.data.session.user;return true}
  }catch(e){}
  return false;
}
async function pullIfNewer(force){
  if(pulling)return false;
  if(!(await ensureSession()))return false;
  var cloud=window.nt28Cloud,user=window.nt28CloudUser;if(!cloud||!user)return false;
  if(!force&&editing())return false;
  pulling=true;
  try{
    var r=await cloud.from('nursetrack_state').select('app_data,updated_at').eq('user_id',user.id).maybeSingle();
    if(r.error)throw r.error;
    if(!r.data||!r.data.app_data)return false;
    var localTime=ts(localStorage.getItem(LOCAL_UPDATED));
    var remoteTime=ts(r.data.updated_at);
    if(!force&&localTime&&remoteTime<=localTime){
      if(typeof window.nt28SetCloudStatus==='function')window.nt28SetCloudStatus('Nube sincronizada','ok');
      return false;
    }
    try{localStorage.setItem(BACKUP,localStorage.getItem(STORE)||'')}catch(e){}
    window.nt28CloudApplying=true;
    if(typeof window.normalize==='function')window.state=window.normalize(r.data.app_data);else window.state=r.data.app_data;
    try{localStorage.setItem(STORE,JSON.stringify(window.state))}catch(e){}
    try{localStorage.setItem(LOCAL_UPDATED,r.data.updated_at||new Date().toISOString())}catch(e){}
    window.nt28CloudApplying=false;
    if(typeof window.renderAll==='function')window.renderAll();
    if(typeof window.nt28SetCloudStatus==='function')window.nt28SetCloudStatus('Nube sincronizada','ok');
    if(force&&typeof window.nt28PanelMessage==='function')window.nt28PanelMessage('Expedientes actualizados desde la nube.');
    return true;
  }catch(e){
    window.nt28CloudApplying=false;
    if(typeof window.nt28SetCloudStatus==='function')window.nt28SetCloudStatus('Nube temporalmente no disponible','error');
    return false;
  }finally{pulling=false}
}
async function forcePullFromCloud(){return pullIfNewer(true)}
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
    if(!email||!pass){
      if(await ensureSession()){await pullIfNewer(true);return}
      if(typeof window.nt28PanelMessage==='function')window.nt28PanelMessage('Escriba el correo y la contraseña de la cuenta de nube solo para la primera conexión en este dispositivo.');return
    }
    if(typeof window.nt28PanelMessage==='function')window.nt28PanelMessage('Conectando…');
    if(typeof window.nt28SetCloudStatus==='function')window.nt28SetCloudStatus('Conectando…','busy');
    try{
      var r=await window.nt28Cloud.auth.signInWithPassword({email:email,password:pass});
      if(r.error)throw r.error;
      window.nt28CloudUser=r.data.user;
      var pw=document.getElementById('nt28CloudPassword');if(pw)pw.value='';
      await pullIfNewer(true);
    }catch(e){
      if(typeof window.nt28SetCloudStatus==='function')window.nt28SetCloudStatus('Sin conexión','error');
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
        var dis=document.getElementById('nt28CloudDisconnect');
        if(dis){dis.textContent='Desconectar nube (emergencia)'}
      },0);
      return r;
    };
  }
  setTimeout(function(){
    var sync=document.getElementById('nt28CloudSyncNow');if(sync){sync.textContent='Actualizar desde nube';sync.onclick=function(){forcePullFromCloud()}}
    var dis=document.getElementById('nt28CloudDisconnect');if(dis)dis.textContent='Desconectar nube (emergencia)';
  },300);
  setTimeout(function(){pullIfNewer(false)},500);
  setInterval(function(){if(!document.hidden)pullIfNewer(false)},15000);
  window.addEventListener('focus',function(){pullIfNewer(false)});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)pullIfNewer(false)});
  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest?e.target.closest('.patientbtn,[data-patient-id],[data-id]'):null;
    if(t)setTimeout(function(){pullIfNewer(false)},80);
  },true);
  try{
    if(window.nt28Cloud&&window.nt28Cloud.auth&&window.nt28Cloud.auth.onAuthStateChange){
      window.nt28Cloud.auth.onAuthStateChange(function(event,session){
        if(session&&session.user){window.nt28CloudUser=session.user;setTimeout(function(){pullIfNewer(false)},100)}
      });
    }
  }catch(e){}
}
install();
})();