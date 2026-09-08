(function(){
'use strict';
if(window.__NT_V4_CURSOR_GUARD__)return;window.__NT_V4_CURSOR_GUARD__=true;
function install(){
  if(!document.getElementById('ntV4CursorGuardStyle')){
    const s=document.createElement('style');s.id='ntV4CursorGuardStyle';s.textContent=`
      #loginView{position:relative!important;z-index:2147483000!important;pointer-events:auto!important}
      #loginView .card,#loginForm,#loginForm *{position:relative;z-index:2147483001;pointer-events:auto!important}
      input,textarea,[contenteditable="true"]{cursor:text!important;caret-color:auto!important;pointer-events:auto!important;-webkit-user-select:text!important;user-select:text!important}
      select{pointer-events:auto!important}
      button,a,[role="button"]{pointer-events:auto!important;cursor:pointer!important}
    `;(document.head||document.documentElement).appendChild(s);
  }
  const focusables=()=>[...document.querySelectorAll('input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[contenteditable="true"]')].filter(el=>{const r=el.getBoundingClientRect(),cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'});
  function recoverFocus(e){
    const x=e.clientX,y=e.clientY;if(typeof x!=='number'||typeof y!=='number')return;
    let best=null,bestArea=Infinity;
    for(const el of focusables()){
      const r=el.getBoundingClientRect();if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom){const a=r.width*r.height;if(a<bestArea){best=el;bestArea=a}}
    }
    if(best&&document.activeElement!==best){try{best.focus({preventScroll:true})}catch(_){try{best.focus()}catch(__){}}}
  }
  document.addEventListener('pointerdown',recoverFocus,true);
  document.addEventListener('mousedown',recoverFocus,true);
  document.addEventListener('touchstart',e=>{const t=e.touches?.[0];if(t)recoverFocus({clientX:t.clientX,clientY:t.clientY})},{capture:true,passive:true});
  ['loginName','loginPass','patientSearch'].forEach(id=>{const el=document.getElementById(id);if(el){el.removeAttribute('inert');el.disabled=false;el.style.pointerEvents='auto';el.style.cursor='text'}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
new MutationObserver(()=>{['loginName','loginPass','patientSearch'].forEach(id=>{const el=document.getElementById(id);if(el){el.removeAttribute('inert');el.style.pointerEvents='auto';el.style.cursor='text'}})}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class','disabled','inert']});
})();