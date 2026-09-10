window.NURSETRACK_SUPABASE = {
  url: "https://ummubyacvgdobgbwvwmf.supabase.co",
  publishableKey: "sb_publishable_KQOrfgQCG35W_sQIYDvbvw_tow1VFn1"
};

(function(){
  'use strict';
  if(!/\/v4-beta\//.test(location.pathname)) return;
  if(window.__NT_V4_EXTENSIONS_LOADER__) return;
  window.__NT_V4_EXTENSIONS_LOADER__=true;

  // Modo estable: solo el router clínico ultraligero se carga al inicio.
  // Los módulos completos se descargan únicamente cuando el usuario los abre.
  const loaded=new Set();
  const loading=new Map();
  const groups={
    patients:['patient-tools.js','patient-registration.js','patient-management.js'],
    nursing:['record-nursing-templates.js','smart-nursing.js','nursing-section-tabs.js'],
    social:['social-documents.js','smart-social-4page.js'],
    labs:['labs.js'],
    medical:['medicine.js','medicine-advanced.js'],
    clinical:['nutrition-behavioral.js','vaccines-treatments-v4.js'],
    reports:['reports-membership.js'],
    billing:['billing-admin.js','revenue-safety.js'],
    admin:['billing-admin.js','admin-delete-user.js','permission-admin-tools.js','operations-settings.js','admin-catalogs.js','capacity-settings.js'],
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
    if(loaded.has(src)) return Promise.resolve(src);
    if(loading.has(src)) return loading.get(src);
    const p=new Promise(function(resolve,reject){
      const existing=document.querySelector('script[data-nt-v4-module="'+src+'"]');
      if(existing){loaded.add(src);resolve(src);return;}
      const s=document.createElement('script');
      s.src=src+'?v=20260909-stable-2';
      s.async=true;
      s.dataset.ntV4Module=src;
      s.onload=function(){loaded.add(src);loading.delete(src);resolve(src)};
      s.onerror=function(){loading.delete(src);reject(new Error('No se pudo cargar '+src))};
      (document.head||document.documentElement).appendChild(s);
    });
    loading.set(src,p);
    return p;
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

  // Router mínimo: no consulta la nube, no usa observadores ni intervalos.
  // Solo intercepta Enfermería/Trabajo Social y entonces carga el módulo completo.
  loadScript('clinical-router-lite.js').catch(function(){});
})();