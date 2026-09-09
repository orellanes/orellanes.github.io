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
    'cursor-guard.js?v=20260908-v4-cursor-3',
    'password-recovery.js?v=20260908-v4-password-recovery-1',
    'social-documents.js?v=20260908-v4-social-docs-1',
    'patient-tools.js?v=20260908-v4-patient-tools-1',
    'patient-registration.js?v=20260908-v4-patient-registration-2',
    'patient-management.js?v=20260909-patient-management-1',
    'labs.js?v=20260908-v4-labs-1',
    'medicine.js?v=20260908-v4-medicine-1',
    'medicine-advanced.js?v=20260908-v4-medicine-advanced-1',
    'nutrition-behavioral.js?v=20260908-v4-clinical-1',
    'vaccines-treatments-v4.js?v=20260908-v4-treatments-1',
    'reports-membership.js?v=20260908-v4-ops-1',
    'billing-admin.js?v=20260908-v4-billing-admin-1',
    'admin-delete-user.js?v=20260909-admin-delete-user-1',
    'permission-admin-tools.js?v=20260909-permission-admin-1',
    'operations-settings.js?v=20260908-v4-operations-1',
    'templates-editor.js?v=20260908-v4-templates-1',
    'revenue-safety.js?v=20260908-v4-revenue-safety-1',
    'personal-notifications.js?v=20260908-v4-personal-notifications-1',
    'assignments.js?v=20260908-v4-assignments-1',
    'audit-viewer.js?v=20260908-v4-audit-1',
    'admin-catalogs.js?v=20260908-v4-admin-catalogs-1',
    'storage-upload.js?v=20260908-v4-storage-1',
    'capacity-settings.js?v=20260908-v4-capacity-1',
    'appearance-settings.js?v=20260909-appearance-panel-1',
    'logistics.js?v=20260909-logistics-appearance-panel-1',
    'hide-stations-card.js?v=20260909-hide-stations-2',
    'navigation.js?v=20260908-v4-navigation-7',
    'direct-view.js?v=20260909-v4-direct-view-2',
    'boceto-ui.js?v=20260909-v4-boceto-ui-1',
    'permission-menu-guard.js?v=20260909-permission-menu-1',
    'language-settings.js?v=20260909-language-1',
    'smart-social-4page.js?v=20260909-smart-social-1',
    'print-image-fix.js?v=20260909-print-image-1',
    'smart-nursing.js?v=20260909-smart-nursing-1',
    'maintenance-entry.js?v=20260909-maintenance-direct-1'
  ].forEach(function(src){
    var s=document.createElement('script');
    s.src=src;
    s.defer=true;
    (document.head||document.documentElement).appendChild(s);
  });
})();