window.NURSETRACK_SUPABASE = {
  url: "https://ummubyacvgdobgbwvwmf.supabase.co",
  publishableKey: "sb_publishable_KQOrfgQCG35W_sQIYDvbvw_tow1VFn1"
};

(function(){
  'use strict';
  if(!/\/v4-beta\//.test(location.pathname)) return;
  if(window.__NT_V4_EXTENSIONS_LOADER__) return;
  window.__NT_V4_EXTENSIONS_LOADER__=true;
  [
    'social-documents.js?v=20260908-v4-social-docs-1',
    'patient-tools.js?v=20260908-v4-patient-tools-1',
    'labs.js?v=20260908-v4-labs-1',
    'medicine.js?v=20260908-v4-medicine-1',
    'nutrition-behavioral.js?v=20260908-v4-clinical-1',
    'vaccines-treatments-v4.js?v=20260908-v4-treatments-1'
  ].forEach(function(src){
    var s=document.createElement('script');
    s.src=src;
    s.defer=true;
    (document.head||document.documentElement).appendChild(s);
  });
})();
