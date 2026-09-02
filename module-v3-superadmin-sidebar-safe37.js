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
      const settingsNav=document.querySelector('.navbtn[data-page="settings"],[data-page="settings"]');
      if(settingsNav&&typeof settingsNav.click==='function')settingsNav.click();
      for(let i=0;i<40;i++){
        const userAdmin=document.querySelector('#nt37UserAdminHost button');
        if(userAdmin){userAdmin.click();return;}
        const center=document.getElementById('nt37SuperCenterBtn');
        if(center){center.click();return;}
        const overlay=document.getElementById('nt37SuperCenter');
        if(overlay){overlay.style.display='block';return;}
        await wait(150);
      }
      alert('Administración de usuarios todavía está cargando. Intenta otra vez.');
    }

    function installSidebar(){
      const side=document.querySelector('.side')||document.querySelector('aside');
      if(!side)return false;
      let b=document.getElementById('nt37SuperSidebarBtn');
      if(!b){
        b=document.createElement('button');
        b.id='nt37SuperSidebarBtn';
        b.type='button';
        b.className='navbtn';
        b.textContent='🛡️ Súper Administrador';
        b.title='Usuarios, accesos y permisos';
        b.onclick=openUsers;
        const settings=side.querySelector('.navbtn[data-page="settings"],[data-page="settings"]');
        if(settings&&settings.parentNode===side){
          if(settings.nextSibling)side.insertBefore(b,settings.nextSibling);else side.appendChild(b);
        }else side.appendChild(b);
      }
      return true;
    }

    function installSettingsCard(){
      const page=document.getElementById('settingsPage');
      if(!page)return false;
      let card=document.getElementById('nt37UserSettingsCard');
      if(!card){
        card=document.createElement('div');
        card.id='nt37UserSettingsCard';
        card.className='card';
        card.innerHTML='<div class="pagehead" style="margin-bottom:10px"><div><h3 style="margin:0">🛡️ Súper Administrador — Usuarios y Accesos</h3><p class="muted" style="margin:6px 0 0">Solo Súper Administrador. Cree usuarios, otorgue acceso, cambie permisos y active o desactive cuentas.</p></div></div><div class="row"><button type="button" class="btn primary" id="nt37OpenUsersBtn">👥 Administrar usuarios y permisos</button></div>';
        page.prepend(card);
        card.querySelector('#nt37OpenUsersBtn').onclick=openUsers;
      }
      return true;
    }

    function ensure(){installSidebar();installSettingsCard();}
    ensure();
    const mo=new MutationObserver(ensure);
    mo.observe(document.documentElement,{childList:true,subtree:true});
    setInterval(ensure,1200);
    document.addEventListener('nt37AppShown',ensure);
  }catch(e){console.warn('NurseTrack superadmin settings:',e);}
});
})();