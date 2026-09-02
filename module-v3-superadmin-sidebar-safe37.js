(function(){
'use strict';
function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
function wait(ms){return new Promise(r=>setTimeout(r,ms));}
ready(async function(){
  const sb=window.nt28Cloud;
  if(!sb)return;
  try{
    const {data:{user}}=await sb.auth.getUser();
    if(!user)return;
    const {data:profile}=await sb.from('nursetrack_profiles').select('role,active').eq('user_id',user.id).maybeSingle();
    const role=String(profile&&profile.role||'').toLowerCase();
    if(!profile||profile.active!==true||!['superadmin','superadministrator'].includes(role))return;

    async function openUsers(){
      for(let i=0;i<40;i++){
        const userAdmin=document.querySelector('#nt37UserAdminHost button');
        if(userAdmin){userAdmin.click();return;}
        const center=document.getElementById('nt37SuperCenterBtn');
        if(center){center.click();return;}
        const overlay=document.getElementById('nt37SuperCenter');
        if(overlay){overlay.style.display='block';return;}
        await wait(150);
      }
      alert('Administración de usuarios todavía está cargando. Intenta otra vez en unos segundos.');
    }

    function removeSidebar(){
      const b=document.getElementById('nt37SuperSidebarBtn');
      if(b)b.remove();
    }

    function installSettingsCard(){
      const page=document.getElementById('settingsPage');
      if(!page)return false;
      let card=document.getElementById('nt37UserSettingsCard');
      if(!card){
        card=document.createElement('div');
        card.id='nt37UserSettingsCard';
        card.className='card';
        card.innerHTML='<h3 style="margin-top:0">👥 Administración de usuarios</h3><p class="muted">Solo Súper Administrador. Crea usuarios, asigna roles y controla su acceso.</p><div class="row"><button type="button" class="btn primary" id="nt37OpenUsersBtn">+ Añadir / administrar usuarios</button></div>';
        const settingsForm=document.getElementById('settingsForm');
        if(settingsForm)settingsForm.insertAdjacentElement('afterend',card);else page.prepend(card);
        card.querySelector('#nt37OpenUsersBtn').onclick=openUsers;
      }
      return true;
    }

    function ensure(){removeSidebar();installSettingsCard();}
    ensure();
    const mo=new MutationObserver(ensure);
    mo.observe(document.documentElement,{childList:true,subtree:true});
    setInterval(ensure,1200);
    document.addEventListener('nt37AppShown',ensure);
  }catch(e){console.warn('NurseTrack superadmin settings:',e);}
});
})();