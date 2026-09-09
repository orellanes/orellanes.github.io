window.NURSETRACK_SUPABASE = {
  url: "https://ummubyacvgdobgbwvwmf.supabase.co",
  publishableKey: "sb_publishable_KQOrfgQCG35W_sQIYDvbvw_tow1VFn1"
};

(function(){
  'use strict';
  if(!/\/v4-beta\//.test(location.pathname)) return;
  if(window.__NT_V4_EXTENSIONS_LOADER__) return;
  window.__NT_V4_EXTENSIONS_LOADER__=true;

  // NurseTrack One v4: NO cargar todos los módulos al iniciar.
  // Antes esta lista inyectaba decenas de scripts de una vez y podía bloquear
  // el hilo principal del navegador. Ahora cada módulo se carga solo cuando
  // el usuario realmente lo abre.
  const loaded=new Set();
  const groups={
    patients:['patient-tools.js','patient-registration.js','patient-management.js'],
    nursing:['smart-nursing.js'],
    social:['social-documents.js','smart-social-4page.js'],
    labs:['labs.js'],
    medical:['medicine.js','medicine-advanced.js'],
    clinical:['nutrition-behavioral.js','vaccines-treatments-v4.js'],
    reports:['reports-membership.js'],
    billing:['billing-admin.js','revenue-safety.js'],
    admin:['admin-delete-user.js','permission-admin-tools.js','operations-settings.js','admin-catalogs.js','capacity-settings.js'],
    templates:['templates-editor.js','print-image-fix.js'],
    logistics:['assignments.js','logistics.js'],
    audit:['audit-viewer.js'],
    storage:['storage-upload.js'],
    appearance:['appearance-settings.js','language-settings.js'],
    maintenance:['maintenance-entry.js'],
    navigation:['navigation.js','direct-view.js','boceto-ui.js','permission-menu-guard.js'],
    notifications:['personal-notifications.js'],
    recovery:['password-recovery.js']
  };

  function loadScript(src){
    return new Promise(function(resolve,reject){
      if(loaded.has(src)) return resolve(src);
      const existing=document.querySelector('script[data-nt-v4-module="'+src+'"]');
      if(existing){loaded.add(src);return resolve(src);}
      const s=document.createElement('script');
      s.src=src+'?v=20260909-lazy-1';
      s.defer=true;
      s.dataset.ntV4Module=src;
      s.onload=function(){loaded.add(src);resolve(src)};
      s.onerror=function(){reject(new Error('No se pudo cargar '+src))};
      (document.head||document.documentElement).appendChild(s);
    });
  }

  window.NT_V4_MODULES={
    groups:groups,
    load:async function(group){
      const files=groups[group]||[];
      for(const file of files) await loadScript(file);
      return true;
    },
    loadFile:loadScript,
    isLoaded:function(src){return loaded.has(src)}
  };

  // Solo utilidades pequeñas necesarias para el inicio. El resto queda diferido.
  ['cursor-guard.js','hide-stations-card.js'].forEach(function(src){
    setTimeout(function(){loadScript(src).catch(function(){})},0);
  });
})();