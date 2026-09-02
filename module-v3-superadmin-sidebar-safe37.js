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
    if(!profile||profile.active!==true||!['superadmin','superadministrator'].includes(String(profile.role||'').toLowerCase()))return;

    function findSide(){return document.querySelector('.side')||document.querySelector('aside');}
    async function openUsers(){
      for(let i=0;i<30;i++){
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

    function install(){
      const side=findSide();
      if(!side)return false;
      if(document.getElementById('nt37SuperSidebarBtn'))return true;
      const b=document.createElement('button');
      b.id='nt37SuperSidebarBtn';
      b.type='button';
      b.className='navbtn';
      b.innerHTML='👥 Administrar usuarios';
      b.title='Solo Súper Administrador';
      b.style.cssText='font-weight:900;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);margin:6px 0 10px';
      const settings=side.querySelector('[data-page="settings"]');
      if(settings)settings.insertAdjacentElement('afterend',b);else side.prepend(b);
      b.onclick=openUsers;
      return true;
    }

    if(!install()){
      const mo=new MutationObserver(()=>{if(install())mo.disconnect();});
      mo.observe(document.documentElement,{childList:true,subtree:true});
      setTimeout(()=>mo.disconnect(),15000);
    }

    // Also add a clear card inside Settings so the feature is easy to find.
    function installSettingsCard(){
      const page=document.getElementById('settingsPage');
      if(!page||document.getElementById('nt37UserSettingsCard'))return false;
      const card=document.createElement('div');
      card.id='nt37UserSettingsCard';
      card.className='card';
      card.innerHTML='<h3 style="margin-top:0">👥 Administración de usuarios</h3><p class="muted">Solo Súper Administrador. Crea usuarios, asigna roles y controla su acceso.</p><button type="button" class="btn primary" id="nt37OpenUsersBtn">+ Añadir / administrar usuarios</button>';
      const firstCard=page.querySelector('.card');
      if(firstCard)firstCard.insertAdjacentElement('afterend',card);else page.appendChild(card);
      card.querySelector('#nt37OpenUsersBtn').onclick=openUsers;
      return true;
    }
    if(!installSettingsCard()){
      const mo2=new MutationObserver(()=>{if(installSettingsCard())mo2.disconnect();});
      mo2.observe(document.documentElement,{childList:true,subtree:true});
      setTimeout(()=>mo2.disconnect(),15000);
    }
  }catch(e){console.warn('NurseTrack superadmin sidebar:',e);}
});
})();