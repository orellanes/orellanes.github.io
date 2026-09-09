(function(){
'use strict';
if(window.__NT_V4_PRINT_IMAGE_FIX__) return;
window.__NT_V4_PRINT_IMAGE_FIX__=true;

const BRAND=`<div class="nt-print-brand" aria-label="NurseTrack One">
<svg class="nt-print-logo" viewBox="0 0 180 54" role="img" aria-label="NurseTrack One logo" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="ntg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#12a7b5"/><stop offset="1" stop-color="#0b668d"/></linearGradient></defs>
  <path fill="url(#ntg)" d="M27 48C10 37 2 28 2 17 2 8 9 2 18 2c5 0 9 2 12 7 3-5 7-7 12-7 9 0 16 6 16 15 0 11-8 20-25 31l-3 2-3-2z"/>
  <polyline points="9,26 19,26 23,18 29,36 35,23 40,26 51,26" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="68" y="24" font-family="Arial,sans-serif" font-size="19" font-weight="700" fill="#164a7a">NurseTrack One</text>
  <text x="68" y="41" font-family="Arial,sans-serif" font-size="10.5" fill="#0b8fa3">Sistema Clínico y Administrativo</text>
</svg>
<div class="nt-print-doc-title"><strong>Trabajo Social</strong><span>Entrevista Inicial / Manejo de Casos</span></div>
</div>`;

const EXTRA_STYLE=`
.nt-print-brand{display:flex;align-items:center;justify-content:space-between;gap:18px;border-bottom:2px solid #0b8fa3;padding:0 0 10px;margin:0 0 12px;break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.nt-print-logo{width:180px;height:54px;display:block;flex:0 0 auto}
.nt-print-doc-title{text-align:right;color:#173e61;line-height:1.25}.nt-print-doc-title strong{display:block;font-size:16px}.nt-print-doc-title span{font-size:11px;color:#5d7887}
.page>header{border-bottom:1px solid #d8e8ee!important;padding-bottom:9px!important;margin-bottom:12px!important}.page>header h1{font-size:16px!important;margin-bottom:5px!important}
@media print{.nt-print-brand,.nt-print-logo{visibility:visible!important;opacity:1!important}.nt-print-logo *{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;

function injectBrand(html){
  if(typeof html!=='string'||!html.includes('Trabajo Social')) return html;
  let out=html;
  if(out.includes('</style>')) out=out.replace('</style>',EXTRA_STYLE+'</style>');
  if(!out.includes('nt-print-brand')) out=out.replace(/<section class="page">/g,'<section class="page">'+BRAND);
  return out;
}

function armPrintPatch(){
  const originalOpen=window.open;
  let restored=false;
  function restore(){if(restored)return;restored=true;window.open=originalOpen}
  window.open=function(){
    const w=originalOpen.apply(window,arguments);
    if(!w){restore();return w}
    try{
      const originalWrite=w.document.write.bind(w.document);
      w.document.write=function(){
        const args=[...arguments];
        if(args.length) args[0]=injectBrand(args[0]);
        return originalWrite(...args);
      };
    }catch(_){/* preserve original printing even if wrapping fails */}
    setTimeout(restore,800);
    return w;
  };
  setTimeout(restore,1200);
}

document.addEventListener('click',function(e){
  const b=e.target.closest?.('#ntsPrint');
  if(!b)return;
  armPrintPatch();
},true);

window.NT_V4_PRINT_IMAGE_FIX={version:'1.0.0'};
})();