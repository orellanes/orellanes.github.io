(function(){
'use strict';
if(window.__NT_V4_ADMIN_DELETE_USER__) return;
window.__NT_V4_ADMIN_DELETE_USER__=true;

let currentUserId=null,busy=false;
const $=id=>document.getElementById(id);

function cfg(){return window.NURSETRACK_SUPABASE||{}}

async function deleteUser(){
  if(busy||!currentUserId)return;
  const name=$('ntv4DetailName')?.value?.trim()||'este usuario';
  if(!confirm(`¿Retirar y eliminar el acceso de ${name}?\n\nLos expedientes clínicos y la auditoría se conservarán.`))return;
  const word=prompt('Para confirmar, escribe ELIMINAR:');
  if(word!=='ELIMINAR')return;
  const st=$('ntv4AdminStatus');
  busy=true;
  if(st){st.textContent='Eliminando usuario…';st.style.color='#933'}
  try{
    if(typeof window.NT_loadSupabase!=='function')throw new Error('Supabase no disponible');
    const lib=await window.NT_loadSupabase(),c=cfg();
    const sb=lib.createClient(c.url,c.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
    const ses=await sb.auth.getSession();
    const token=ses?.data?.session?.access_token;
    if(!token)throw new Error('Sesión no disponible');
    const r=await fetch(c.url+'/functions/v1/admin-users',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,'apikey':c.publishableKey},
      body:JSON.stringify({action:'delete-user',user_id:currentUserId})
    });
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.ok)throw new Error(d.error||'No se pudo eliminar el usuario.');
    if(st){st.textContent=d.message||'Usuario eliminado.';st.style.color='#216b48'}
    currentUserId=null;
    setTimeout(()=>window.NT_V4_ADMIN?.open(),500);
  }catch(e){
    if(st){st.textContent=e?.message||String(e);st.style.color='#933'}
    else alert(e?.message||String(e));
  }finally{busy=false}
}

function inject(){
  const toggle=$('ntv4ToggleActive');
  if(!toggle||!currentUserId||$('ntv4DeleteUser'))return;
  const host=toggle.closest('.ntv4-baactions');
  if(!host)return;
  const b=document.createElement('button');
  b.id='ntv4DeleteUser';
  b.type='button';
  b.className='btn';
  b.textContent='🗑️ Eliminar usuario';
  b.style.background='#9a3434';
  b.style.color='#fff';
  b.onclick=deleteUser;
  host.appendChild(b);
}

function scheduleInject(){
  let n=0;
  const t=setInterval(()=>{inject();if($('ntv4DeleteUser')||++n>=20)clearInterval(t)},150);
}

document.addEventListener('click',e=>{
  const detail=e.target.closest?.('[data-user-details]');
  if(detail){currentUserId=detail.dataset.userDetails||null;scheduleInject();return}
  const list=e.target.closest?.('#ntv4AdminList,#ntv4AdminCreate');
  if(list)currentUserId=null;
},true);

window.NT_V4_ADMIN_DELETE_USER={version:'1.0.0'};
})();
