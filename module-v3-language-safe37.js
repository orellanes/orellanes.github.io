(function(){
'use strict';
function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
ready(function(){
  var KEY='nursetrack_language';
  var pairs={
    'Censo':'Census','Pacientes':'Patients','Nuevo paciente':'New patient','Respaldo / Excel':'Backup / Excel','Respaldo':'Backup','Configuración':'Settings','Settings':'Configuración','Auditoría':'Audit','Súper Administrador':'Super Administrator','Enfermería':'Nursing','Trabajo Social':'Social Work','Nutrición':'Nutrition','Salud Mental':'Mental Health','Salud Mental / Psiquiatría':'Mental Health / Psychiatry','Uso de Sustancias':'Substance Use','Monitoreo Toxicológico':'Toxicology Monitoring','Laboratorios':'Laboratories','ICD-10 / CPT / HCPCS':'ICD-10 / CPT / HCPCS','Seguridad de Medicamentos':'Medication Safety','Documentos / Adjuntos':'Documents / Attachments','Citas y Recordatorios':'Appointments & Reminders','Reportes':'Reports','Membresía':'Membership','Centro de Impresión':'Print Center','Módulos':'Modules','Módulos de NurseTrack':'NurseTrack Modules','Atención clínica':'Clinical Care','Diagnóstico y tratamiento':'Diagnosis & Treatment','Operación y seguimiento':'Operations & Follow-up','Administración':'Administration','Guardar':'Save','Cancelar':'Cancel','Editar':'Edit','Imprimir':'Print','Buscar':'Search','Añadir':'Add','Administración de usuarios':'User administration','Usuarios y Accesos':'Users & Access','Administrar usuarios y permisos':'Manage users and permissions','Idioma':'Language','Español':'Spanish'
  };
  function current(){return localStorage.getItem(KEY)||'es';}
  function translateExact(text,to){
    var t=String(text||'').trim(); if(!t)return null;
    if(to==='en') return pairs[t]||null;
    for(var es in pairs){if(pairs[es]===t)return es;}
    return null;
  }
  function apply(){
    var to=current(); document.documentElement.lang=to;
    document.querySelectorAll('button,a,label,h1,h2,h3,h4,th,td,span,.navbtn,strong').forEach(function(el){
      if(el.closest&&el.closest('#nt37LanguageCard'))return;
      if(el.children&&el.children.length)return;
      var tr=translateExact(el.textContent,to); if(tr)el.textContent=tr;
    });
  }
  function setLang(v){localStorage.setItem(KEY,v);apply();sync();document.dispatchEvent(new CustomEvent('nt37LanguageChanged',{detail:{language:v}}));}
  function sync(){var s=document.getElementById('nt37LangSelect');if(s)s.value=current();var q=document.getElementById('nt37TopLangSelect');if(q)q.value=current();}
  function installSettings(){
    var page=document.getElementById('settingsPage'); if(!page)return false;
    var card=document.getElementById('nt37LanguageCard');
    if(!card){
      card=document.createElement('div');card.id='nt37LanguageCard';card.className='card';
      card.innerHTML='<h3 style="margin-top:0">🌐 Idioma / Language</h3><p class="muted">Seleccione el idioma de la interfaz de NurseTrack.</p><div class="row"><label for="nt37LangSelect" style="font-weight:800">Idioma</label><select id="nt37LangSelect" style="min-height:44px;border:1px solid #cfe0e3;border-radius:10px;padding:8px 12px;font-size:15px"><option value="es">🇵🇷 Español</option><option value="en">🇺🇸 English</option></select></div>';
      var anchor=document.getElementById('nt37UserSettingsCard')||document.getElementById('nt37ForcedUsersCard');
      if(anchor&&anchor.parentNode===page)anchor.insertAdjacentElement('afterend',card);else page.prepend(card);
      card.querySelector('#nt37LangSelect').onchange=function(){setLang(this.value)};
    }
    sync();return true;
  }
  function installTop(){
    if(document.getElementById('nt37TopLangWrap'))return true;
    var b=document.body;if(!b)return false;
    var w=document.createElement('div');w.id='nt37TopLangWrap';w.style.cssText='position:fixed;top:12px;right:108px;z-index:2147483646;background:#fff;border:1px solid #cfe0e3;border-radius:10px;padding:4px 7px;box-shadow:0 3px 12px rgba(0,0,0,.08)';
    w.innerHTML='<select id="nt37TopLangSelect" aria-label="Idioma" style="border:0;background:#fff;font-weight:800;color:#315f67;min-height:34px"><option value="es">ES</option><option value="en">EN</option></select>';
    b.appendChild(w);w.querySelector('select').onchange=function(){setLang(this.value)};sync();return true;
  }
  function ensure(){installSettings();installTop();apply();}
  ensure();
  var mo=new MutationObserver(function(){installSettings();installTop();apply();});mo.observe(document.documentElement,{childList:true,subtree:true});
  setInterval(ensure,1800);
  document.addEventListener('nt37AppShown',ensure);
  document.addEventListener('nt37PermissionsChanged',apply);
});
})();