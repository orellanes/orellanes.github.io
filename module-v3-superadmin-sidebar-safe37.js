(function(){
'use strict';
function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
ready(async function(){
  var sb=window.nt28Cloud;if(!sb)return;
  try{
    var u=(await sb.auth.getUser()).data.user;if(!u)return;
    var pr=await sb.from('nursetrack_profiles').select('role,active').eq('user_id',u.id).maybeSingle(),profile=pr.data;
    var role=String(profile&&profile.role||'').toLowerCase();
    if(!profile||profile.active!==true||['superadmin','superadministrator'].indexOf(role)<0)return;
    async function openUsers(){
      var settingsNav=document.querySelector('.navbtn[data-page="settings"],[data-page="settings"]');if(settingsNav)settingsNav.click();
      if(window.nt37OnDemand&&window.nt37OnDemand.load){var ok=await window.nt37OnDemand.load('admin');if(!ok){alert('No se pudo cargar Súper Administrador desde la nube.');return}}
      for(var i=0;i<30;i++){
        var b=document.querySelector('#nt37UserAdminHost button')||document.getElementById('nt37SuperCenterBtn');if(b){b.click();return}
        var overlay=document.getElementById('nt37SuperCenter');if(overlay){overlay.style.display='block';return}
        await wait(120)
      }
      alert('Administración de usuarios no pudo abrirse.');
    }
    function installSidebar(){var side=document.querySelector('.side')||document.querySelector('aside');if(!side)return false;var b=document.getElementById('nt37SuperSidebarBtn');if(!b){b=document.createElement('button');b.id='nt37SuperSidebarBtn';b.type='button';b.className='navbtn';b.textContent='🛡️ Súper Administrador';b.title='Usuarios, accesos y permisos';b.onclick=openUsers;var settings=side.querySelector('.navbtn[data-page="settings"],[data-page="settings"]');if(settings&&settings.parentNode===side&&settings.nextSibling)side.insertBefore(b,settings.nextSibling);else side.appendChild(b)}return true}
    function installSettingsCard(){var page=document.getElementById('settingsPage');if(!page)return false;var card=document.getElementById('nt37UserSettingsCard');if(!card){card=document.createElement('div');card.id='nt37UserSettingsCard';card.className='card';card.innerHTML='<h3 style="margin-top:0">🛡️ Súper Administrador — Usuarios y Accesos</h3><p class="muted">Las herramientas administrativas se cargan desde la nube solo cuando las abre.</p><button type="button" class="btn primary" id="nt37OpenUsersBtn">👥 Administrar usuarios y permisos</button>';page.prepend(card);card.querySelector('#nt37OpenUsersBtn').onclick=openUsers}return true}
    function ensure(){installSidebar();installSettingsCard()}
    ensure();new MutationObserver(ensure).observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('nt37AppShown',ensure);
  }catch(e){console.warn('NurseTrack superadmin:',e)}
});
})();