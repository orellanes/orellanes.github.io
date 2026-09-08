(function(){
'use strict';
if(window.__NT_DEVICE_COMPAT_V12__) return;
window.__NT_DEVICE_COMPAT_V12__=true;
var d=document;
var old=d.getElementById('ntDeviceCompatStyleV11');if(old)old.remove();
var style=d.createElement('style');style.id='ntDeviceCompatStyleV12';style.textContent='input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[contenteditable="true"]{pointer-events:auto!important;opacity:1!important;visibility:visible!important}input:not([disabled]),textarea:not([disabled]),[contenteditable="true"]{cursor:text!important;user-select:text!important;-webkit-user-select:text!important;caret-color:auto!important}button:not([disabled]),a,[role="button"]{cursor:pointer}';(d.head||d.documentElement).appendChild(style);
function repair(){try{var app=d.getElementById('appScreen');if(app&&app.hasAttribute('inert'))app.removeAttribute('inert');d.querySelectorAll('#appScreen [inert]').forEach(function(el){el.removeAttribute('inert')})}catch(_){}}
repair();window.addEventListener('pageshow',repair);d.addEventListener('visibilitychange',function(){if(!d.hidden)repair()});
window.NURSETRACK_DEVICE_COMPAT={version:'cursorfix12-passive',pointer:!!window.PointerEvent,touch:navigator.maxTouchPoints||0};
})();
