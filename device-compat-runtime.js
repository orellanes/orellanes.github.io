(function(){
'use strict';
if(window.__NT_DEVICE_COMPAT__) return;
window.__NT_DEVICE_COMPAT__=true;
var doc=document;
var root=doc.documentElement;
var body=doc.body;
try{root.style.setProperty('touch-action','manipulation');root.style.setProperty('overscroll-behavior','contain');}catch(_){ }
try{if(body){body.style.setProperty('touch-action','manipulation');body.style.setProperty('-webkit-overflow-scrolling','touch');body.style.setProperty('pointer-events','auto','important');}}catch(_){ }
var style=doc.createElement('style');
style.id='ntDeviceCompatStyle';
style.textContent='html,body{pointer-events:auto!important;-webkit-text-size-adjust:100%;}button,a,input,select,textarea,label,[role="button"],[tabindex]{pointer-events:auto!important;touch-action:manipulation;}input,textarea,select{user-select:text;-webkit-user-select:text;}button,a,[role="button"]{user-select:none;-webkit-user-select:none;}@media (hover:hover) and (pointer:fine){button,a,[role="button"]{cursor:pointer}}';
(doc.head||root).appendChild(style);
function focusEditable(target){
  if(!target) return;
  var tag=(target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||tag==='select'||target.isContentEditable){
    try{target.focus({preventScroll:false});}catch(_){try{target.focus();}catch(__){}}
  }
}
// Pointer Events are the shared path for mouse, pen, and modern touch. Do not synthesize clicks.
doc.addEventListener('pointerdown',function(e){focusEditable(e.target);},{capture:true,passive:true});
// iOS fallback when Pointer Events are delayed inside embedded documents.
doc.addEventListener('touchend',function(e){if(e.changedTouches&&e.changedTouches.length){focusEditable(e.target);}},{capture:true,passive:true});
// Keyboard accessibility for custom role=button controls only; native buttons already handle Enter/Space.
doc.addEventListener('keydown',function(e){
  var t=e.target;
  if(!t||t.getAttribute('role')!=='button'||t.tagName==='BUTTON') return;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();try{t.click();}catch(_){}}
},true);
// Recover focus after switching back from browser chrome or another app.
window.addEventListener('pageshow',function(){try{doc.documentElement.style.pointerEvents='auto';if(doc.body)doc.body.style.pointerEvents='auto';}catch(_){}});
doc.addEventListener('visibilitychange',function(){if(!doc.hidden){try{doc.documentElement.style.pointerEvents='auto';if(doc.body)doc.body.style.pointerEvents='auto';}catch(_){}}});
window.NURSETRACK_DEVICE_COMPAT={pointer:!!window.PointerEvent,touch:navigator.maxTouchPoints||0};
})();
