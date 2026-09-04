(function(){
  'use strict';
  const client=window.NURSETRACK_CLOUD_CLIENT;
  if(!client)return;
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
  async function goLogin(msg){try{sessionStorage.setItem('nursetrack_logout_message',msg||'');}catch(_e){} location.replace('/cloud-login-custom.html?v='+(window.NURSETRACK_BUILD||Date.now()));}
  ready(async function(){
    const {data:{user}}=await client.auth.getUser();
    if(!user){goLogin('Tu sesión terminó. Inicia sesión nuevamente.');return;}
    const {data:profile}=await client.from('nursetrack_profiles').select('active,role,full_name,username').eq('user_id',user.id).maybeSingle();
    if(!profile||profile.active!==true){await client.auth.signOut({scope:'local'}).catch(()=>{});goLogin('Esta cuenta está inactiva. Comunícate con el Súper Administrador.');return;}
    const settings=document.getElementById('settingsPage');
    if(settings&&!document.getElementById('ntSessionSecurity')){
      const card=document.createElement('div');card.id='ntSessionSecurity';card.className='card';
      card.innerHTML=`<div class="pagehead" style="margin-bottom:12px"><div><h3 style="margin:0">🔐 Sesión y seguridad</h3><div class="muted">Controla la sesión de este dispositivo o termina todas tus sesiones abiertas.</div></div></div><div class="formgrid"><div class="field"><label>Usuario</label><input readonly value="${String(profile.full_name||profile.username||user.email||'Usuario').replace(/"/g,'&quot;')}"></div><div class="field"><label>Estado</label><input readonly value="Activo · sesión segura"></div></div><div class="row" style="gap:8px;flex-wrap:wrap;margin-top:14px"><button type="button" class="btn secondary" id="ntSignOutLocal">Cerrar este dispositivo</button><button type="button" class="btn primary" id="ntSignOutGlobal">Cerrar todos los dispositivos</button></div><div class="muted" style="margin-top:10px;font-size:.9rem">Cerrar sesión no elimina pacientes, visitas ni documentos guardados en la nube.</div>`;
      settings.appendChild(card);
      card.querySelector('#ntSignOutLocal').addEventListener('click',async()=>{await client.auth.signOut({scope:'local'});goLogin('Sesión cerrada en este dispositivo.');});
      card.querySelector('#ntSignOutGlobal').addEventListener('click',async()=>{if(!confirm('¿Cerrar NurseTrack en todos los dispositivos donde esta cuenta tenga una sesión abierta?'))return;await client.auth.signOut({scope:'global'});goLogin('Se cerraron las sesiones de esta cuenta.');});
    }
    let busy=false;
    async function verifyActive(){if(busy)return;busy=true;try{const {data:{user:current},error}=await client.auth.getUser();if(error||!current){goLogin('Tu sesión terminó. Inicia sesión nuevamente.');return;}const {data:p,error:pe}=await client.from('nursetrack_profiles').select('active').eq('user_id',current.id).maybeSingle();if(pe||!p||p.active!==true){await client.auth.signOut({scope:'local'}).catch(()=>{});goLogin('Esta cuenta fue desactivada.');}}finally{busy=false;}}
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')verifyActive();});
    window.addEventListener('focus',verifyActive);
    setInterval(verifyActive,5*60*1000);
    client.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT')goLogin('Tu sesión fue cerrada.');});
  });
})();