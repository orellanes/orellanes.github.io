(function(){
'use strict';
if(window.__NT_DEVICE_COMPAT_V11__) return;
window.__NT_DEVICE_COMPAT_V11__=true;
var d=document,root=d.documentElement;
var style=d.createElement('style');style.id='ntDeviceCompatStyleV11';style.textContent='html,body,#appScreen,.main,.side,.card{pointer-events:auto!important}input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[contenteditable="true"]{pointer-events:auto!important;position:relative!important;z-index:5!important;opacity:1!important;visibility:visible!important}input:not([disabled]),textarea:not([disabled]),[contenteditable="true"]{cursor:text!important;user-select:text!important;-webkit-user-select:text!important;caret-color:auto!important}button,a,label,[role="button"]{pointer-events:auto!important}';(d.head||root).appendChild(style);
function editable(t){if(!t)return false;var tag=(t.tagName||'').toLowerCase();return tag==='input'||tag==='textarea'||tag==='select'||t.isContentEditable}
function wake(t){if(!editable(t))return;try{t.removeAttribute('inert');if(t.disabled===false||typeof t.disabled==='undefined'){}t.style.setProperty('pointer-events','auto','important');t.style.setProperty('visibility','visible','important');t.style.setProperty('opacity','1','important');if((t.tagName||'').toLowerCase()!=='select')t.style.setProperty('cursor','text','important')}catch(_){}}
['pointerdown','mousedown','touchstart'].forEach(function(ev){d.addEventListener(ev,function(e){var t=e.target;if(editable(t)){wake(t);setTimeout(function(){try{t.focus({preventScroll:true})}catch(_){try{t.focus()}catch(__){}}},0)}},{capture:true,passive:true})});
d.addEventListener('click',function(e){var t=e.target;if(editable(t)){wake(t);try{t.focus({preventScroll:true})}catch(_){try{t.focus()}catch(__){}}}},true);
d.addEventListener('focusin',function(e){wake(e.target)},true);
function clearBadOverlays(){try{d.querySelectorAll('[inert]').forEach(function(x){if(x.closest&&x.closest('#appScreen'))x.removeAttribute('inert')});var app=d.getElementById('appScreen');if(app){app.style.setProperty('pointer-events','auto','important');app.removeAttribute('inert')}}catch(_){}}
clearBadOverlays();setInterval(clearBadOverlays,1500);window.addEventListener('pageshow',clearBadOverlays);d.addEventListener('visibilitychange',function(){if(!d.hidden)clearBadOverlays()});
window.NURSETRACK_DEVICE_COMPAT={version:'cursorfix11',pointer:!!window.PointerEvent,touch:navigator.maxTouchPoints||0};
})();