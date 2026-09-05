(function(){
'use strict';
if(window.__NT_DEVICE_COMPAT__) return;
window.__NT_DEVICE_COMPAT__=true;
var d=document, root=d.documentElement;
var style=d.createElement('style');
style.id='ntDeviceCompatStyle';
style.textContent='html,body,#appScreen{pointer-events:auto!important}input,textarea,[contenteditable="true"]{pointer-events:auto!important;cursor:text!important;user-select:text!important;-webkit-user-select:text!important;touch-action:auto!important}select{pointer-events:auto!important;cursor:default!important;touch-action:manipulation!important}button,a,label,[role="button"],[tabindex]{pointer-events:auto!important}button,a,[role="button"]{cursor:pointer!important;touch-action:manipulation!important}.main,.side,.card,dialog,.dialogbody{touch-action:pan-x pan-y!important}';
(d.head||root).appendChild(style);
function editable(t){if(!t)return false;var tag=(t.tagName||'').toLowerCase();return tag==='input'||tag==='textarea'||t.isContentEditable;}
// Do not synthesize clicks and do not call preventDefault on pointer/touch events.
// Native browser behavior controls caret placement, text selection, mouse and touch.
d.addEventListener('pointerdown',function(e){
 var t=e.target;
 if(editable(t)){
   try{t.style.setProperty('pointer-events','auto','important');t.style.setProperty('cursor','text','important');}catch(_){ }
 }
},{capture:true,passive:true});
d.addEventListener('focusin',function(e){
 var t=e.target;if(editable(t)){try{t.style.setProperty('cursor','text','important');}catch(_){ }}
},true);
// Keyboard support only for non-native custom buttons.
d.addEventListener('keydown',function(e){var t=e.target;if(!t||t.tagName==='BUTTON'||t.tagName==='A'||t.getAttribute('role')!=='button')return;if(e.key==='Enter'||e.key===' '){e.preventDefault();try{t.click();}catch(_){}}},true);
function restore(){try{root.style.pointerEvents='auto';if(d.body)d.body.style.pointerEvents='auto';}catch(_){}}
window.addEventListener('pageshow',restore);d.addEventListener('visibilitychange',function(){if(!d.hidden)restore()});
window.NURSETRACK_DEVICE_COMPAT={version:'cursorfix10',pointer:!!window.PointerEvent,touch:navigator.maxTouchPoints||0};
})();
