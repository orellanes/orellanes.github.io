(function(){
'use strict';
var KEY='nursetrack_visit_agenda_v295';
var CLOUD_URL='https://ummubyacvgdobgbwvwmf.supabase.co';
var CLOUD_KEY='sb_publishable_KQOrfgQCG35W_sQIYDvbvw_tow1VFn1';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}}
function save(x){try{localStorage.setItem(KEY,JSON.stringify(x));return true}catch(e){return false}}
function defaultMessage(x){return 'Recordatorio de cita de NurseTrack Clinical: su cita está programada para '+(x.date||'')+' a las '+(x.time||'')+'. Tipo de visita: '+(x.type||'')+'. Si necesita cambiar su cita, comuníquese con la clínica.'}
function cleanError(msg){msg=String(msg||'No se pudo enviar el texto.');if(/SMS provider not configured/i.test(msg))return 'Falta conectar la clave segura de Telnyx para activar el envío real de SMS.';if(/401|JWT|Unauthorized/i.test(msg))return 'La sesión de nube expiró. Vuelva a Configuración y pulse Conectar nube una vez.';return msg}
async function getSession(){
  try{
    if(!window.nt28Cloud&&typeof window.nt28CloudStart==='function')await window.nt28CloudStart();
    var cloud=window.nt28Cloud;
    if(!cloud&&window.supabase&&window.supabase.createClient){cloud=window.supabase.createClient(CLOUD_URL,CLOUD_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});window.nt28Cloud=cloud}
    if(!cloud||!cloud.auth)return null;
    var s=await cloud.auth.getSession();
    if(s&&s.data&&s.data.session){window.nt28CloudUser=s.data.session.user;return s.data.session}
  }catch(e){}
  return null;
}
async function callSms(session,phone,body){
  var r=await fetch(CLOUD_URL+'/functions/v1/send-sms',{method:'POST',headers:{'Content-Type':'application/json','apikey':CLOUD_KEY,'Authorization':'Bearer '+session.access_token},body:JSON.stringify({to:phone,body:body})});
  var data={};try{data=await r.json()}catch(e){}
  if(!r.ok||!data||data.ok!==true){throw new Error((data&&data.error)||('SMS HTTP '+r.status))}
  return data;
}
async function send(btn){
  var i=Number(btn.dataset.i),a=read(),x=a[i];if(!x)return;
  var ta=document.querySelector('.ntaMessage[data-i="'+i+'"]');if(ta)x.message=ta.value;
  var phone=String(x.phone||'').trim();if(!phone)phone=prompt('Teléfono móvil del paciente:')||'';if(!phone)return;
  x.phone=phone;var body=String(x.message||'').trim()||defaultMessage(x);x.message=body;save(a);
  var old=btn.textContent;btn.disabled=true;btn.textContent='Verificando nube…';
  var session=await getSession();
  if(!session){btn.disabled=false;btn.textContent=old||'📱 Texto';alert('No encuentro una sesión de nube guardada. Vuelva a Configuración y pulse Conectar nube una vez.');return}
  btn.textContent='Enviando…';
  try{
    await callSms(session,phone,body);
    a=read();if(a[i]){a[i].phone=phone;a[i].message=body;a[i].smsSentAt=new Date().toISOString();a[i].smsStatus='sent';save(a)}
    btn.textContent='Enviado ✓';setTimeout(function(){btn.disabled=false;btn.textContent='📱 Texto'},1800);
  }catch(e){btn.disabled=false;btn.textContent=old||'📱 Texto';alert(cleanError(e&&e.message))}
}
document.addEventListener('click',function(e){var btn=e.target&&e.target.closest?e.target.closest('.ntaSms'):null;if(!btn)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();send(btn)},true);
})();