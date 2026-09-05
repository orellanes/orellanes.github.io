(function(){
  function safe(fn){try{return fn()}catch(e){console.error('[NurseTrack cover settings]',e)}}
  function settingsForm(){return document.getElementById('settingsForm')}
  function ensureSection(){
    var f=settingsForm();
    if(!f || document.getElementById('ntCoverSettingsSection')) return;
    var wrap=document.createElement('section');
    wrap.id='ntCoverSettingsSection';
    wrap.className='card span2';
    wrap.style.marginTop='16px';
    wrap.innerHTML='\
      <div class="pagehead" style="margin-bottom:12px">\
        <div><h3 style="margin:0">🖼️ Editar portada principal</h3><div class="muted">Personalice la cabecera principal y la portada impresa de NurseTrack.</div></div>\
      </div>\
      <div class="formgrid">\
        <div class="field"><label>Nombre del sistema / clínica</label><input name="coverTitle" placeholder="Ej. NurseTrack Clinical"></div>\
        <div class="field"><label>Subtítulo</label><input name="coverSubtitle" placeholder="Ej. Censo · enfermería · documentación"></div>\
        <div class="field span2"><label>Mensaje superior</label><input name="coverNotice" placeholder="Mensaje visible debajo de la barra principal"></div>\
        <div class="field"><label>Nombre del servicio</label><input name="serviceName" placeholder="Nombre de la clínica o servicio"></div>\
        <div class="field"><label>Teléfono</label><input name="servicePhone" placeholder="(787) 000-0000"></div>\
        <div class="field span2"><label>Dirección</label><input name="serviceAddress" placeholder="Dirección física"></div>\
        <div class="field"><label>Ciudad</label><input name="serviceCity" placeholder="Ciudad"></div>\
        <div class="field"><label>Estado / territorio</label><input name="serviceState" placeholder="PR"></div>\
        <div class="field"><label>Código postal</label><input name="serviceZip" placeholder="00900"></div>\
        <div class="field"><label>Título de reportes impresos</label><input name="reportTitle" placeholder="Ej. Expediente clínico"></div>\
        <div class="field span2"><label>Texto institucional de reportes</label><input name="reportIntro" placeholder="Ej. Servicio de enfermería"></div>\
      </div>\
      <div class="row" style="margin-top:14px">\
        <button type="button" class="btn secondary" id="ntPreviewCoverBtn">Vista previa</button>\
        <span class="muted">Use el botón Guardar configuración de esta pantalla para conservar los cambios.</span>\
      </div>';
    var submit=f.querySelector('button[type="submit"],input[type="submit"]');
    if(submit && submit.parentNode) f.insertBefore(wrap,submit.parentNode);
    else f.appendChild(wrap);
    hydrate();
    var p=document.getElementById('ntPreviewCoverBtn');
    if(p) p.onclick=function(){
      applyLive();
      if(typeof window.printCoverPage==='function') window.printCoverPage();
      else alert('La vista previa impresa estará disponible al abrir un paciente. Los cambios de portada principal ya se muestran en la cabecera.');
    };
  }
  function value(name){var f=settingsForm(); var el=f&&f.elements&&f.elements[name]; return el?String(el.value||'').trim():''}
  function hydrate(){
    var f=settingsForm(); if(!f)return;
    var s=(window.state&&window.state.settings)||{};
    ['coverTitle','coverSubtitle','coverNotice','serviceName','servicePhone','serviceAddress','serviceCity','serviceState','serviceZip','reportTitle','reportIntro'].forEach(function(k){
      var el=f.elements&&f.elements[k]; if(el && !el.value && s[k]) el.value=s[k];
    });
  }
  function applyLive(){
    var title=value('coverTitle'), sub=value('coverSubtitle'), note=value('coverNotice');
    var h=document.querySelector('.brand h1'); if(h && title) h.textContent=title;
    var sm=document.querySelector('.brand small'); if(sm && sub) sm.textContent=sub;
    var b=document.querySelector('.banner'); if(b && note) b.textContent=note;
  }
  function hookSave(){
    var f=settingsForm(); if(!f || f.dataset.ntCoverHooked)return;
    f.dataset.ntCoverHooked='1';
    f.addEventListener('submit',function(){setTimeout(applyLive,0)});
  }
  function boot(){safe(ensureSection);safe(hookSave);safe(applyLive)}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  var mo=new MutationObserver(function(){safe(ensureSection);safe(hookSave)});
  mo.observe(document.documentElement,{childList:true,subtree:true});
  window.NurseTrackCoverSettings={refresh:boot,apply:applyLive};
})();
