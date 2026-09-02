(function(){
'use strict';
function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
ready(async function(){
  const sb=window.nt28Cloud;
  if(!sb)return;
  try{
    const {data:{user}}=await sb.auth.getUser();
    if(!user)return;
    const {data:profile}=await sb.from('nursetrack_profiles').select('role,active').eq('user_id',user.id).maybeSingle();
    if(!profile||profile.active!==true||!['superadmin','superadministrator'].includes(String(profile.role||'').toLowerCase()))return;

    const side=document.querySelector('.side');
    if(!side||document.getElementById('nt37SuperSidebarBtn'))return;

    const b=document.createElement('button');
    b.id='nt37SuperSidebarBtn';
    b.type='button';
    b.className='navbtn';
    b.innerHTML='🛡️ Súper Administrador';
    b.style.cssText='font-weight:900;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);margin:6px 0 10px';

    const settings=side.querySelector('[data-page="settings"]');
    if(settings) settings.insertAdjacentElement('afterend',b); else side.prepend(b);

    b.onclick=function(){
      const center=document.getElementById('nt37SuperCenterBtn');
      if(center){center.click();return;}
      const userAdmin=document.querySelector('#nt37UserAdminHost button');
      if(userAdmin){userAdmin.click();return;}
      const overlay=document.getElementById('nt37SuperCenter');
      if(overlay){overlay.style.display='block';return;}
      alert('El Centro del Súper Administrador todavía está cargando. Intenta de nuevo en unos segundos.');
    };
  }catch(e){console.warn('NurseTrack superadmin sidebar:',e);}
});
})();