(async function(){
  const msg=document.getElementById('loginMessage');
  const params=new URLSearchParams(location.search);
  if(params.get('error')) msg.textContent='Correo o contraseña incorrectos.';
  if(params.get('logout')) msg.textContent='Sesión cerrada correctamente.';
  try{
    const r=await fetch('/api/public/csrf',{credentials:'same-origin'});
    if(!r.ok) throw new Error('csrf');
    const c=await r.json();
    const f=document.getElementById('csrfField');
    f.name=c.parameterName||'_csrf';
    f.value=c.token||'';
  }catch(e){
    msg.textContent='No se pudo iniciar la sesión segura. Actualiza la página.';
    document.getElementById('loginForm').addEventListener('submit',e=>e.preventDefault(),{once:true});
  }
})();
