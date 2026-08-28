(function(){
'use strict';
var KEY='nursetrack_visit_agenda_v295';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}}
function save(x){try{localStorage.setItem(KEY,JSON.stringify(x));return true}catch(e){return false}}
function defaultMessage(x){return 'Recordatorio de cita de NurseTrack Clinical: su cita está programada para '+(x.date||'')+' a las '+(x.time||'')+'. Tipo de visita: '+(x.type||'')+'. Si necesita cambiar su cita, comuníquese con la clínica.'}
function cleanError(err,data){
  var msg='No se pudo enviar el texto.';
  if(data&&data.error)msg=data.error;
  else if(err&&err.message)msg=err.message;
  if(/SMS provider not configured/i.test(msg))return 'Falta conectar la cuenta de Twilio para activar el envío real de SMS.';
  return msg;
}
async function send(btn){
  var i=Number(btn.dataset.i),a=read(),x=a[i];if(!x)return;
  var ta=document.querySelector('.ntaMessage[data-i="'+i+'"]');
  if(ta)x.message=ta.value;
  var phone=String(x.phone||'').trim();
  if(!phone)phone=prompt('Teléfono móvil del paciente:')||'';
  if(!phone)return;
  x.phone=phone;
  var body=String(x.message||'').trim()||defaultMessage(x);
  x.message=body;save(a);
  var cloud=window.nt28Cloud,user=window.nt28CloudUser;
  if(!cloud||!user||!cloud.functions||typeof cloud.functions.invoke!=='function'){
    alert('La cuenta de nube no está conectada. Conecte Supabase antes de enviar el texto.');return;
  }
  var old=btn.textContent;btn.disabled=true;btn.textContent='Enviando…';
  try{
    var r=await cloud.functions.invoke('send-sms',{body:{to:phone,body:body}});
    if(r.error||!r.data||r.data.ok!==true)throw {error:r.error,data:r.data};
    a=read();if(a[i]){a[i].phone=phone;a[i].message=body;a[i].smsSentAt=new Date().toISOString();a[i].smsStatus='sent';save(a)}
    btn.textContent='Enviado ✓';
    setTimeout(function(){btn.disabled=false;btn.textContent='📱 Texto'},1800);
  }catch(e){
    btn.disabled=false;btn.textContent=old||'📱 Texto';
    alert(cleanError(e&&e.error,e&&e.data));
  }
}
document.addEventListener('click',function(e){
  var btn=e.target&&e.target.closest?e.target.closest('.ntaSms'):null;if(!btn)return;
  e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  send(btn);
},true);
})();