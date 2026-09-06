(function(){'use strict';
function q(s,r){return (r||document).querySelector(s)}
function activate(btn){document.querySelectorAll('.ntm-tab').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active')}
function install(){const tabs=[...document.querySelectorAll('.ntm-tabs .ntm-tab')];if(tabs.length<4)return false;if(tabs[0].dataset.ntTabsFixed==='1')return true;tabs.forEach(b=>b.dataset.ntTabsFixed='1');
 const grid=q('.ntm-grid'),cards=grid?[...grid.querySelectorAll('.ntm-card')]:[];
 tabs[0].onclick=function(){activate(this);if(grid)grid.style.display='grid';if(cards[0])cards[0].style.display='block';if(cards[1])cards[1].style.display='block';cards[0]?.scrollIntoView({behavior:'smooth',block:'start'})};
 tabs[1].onclick=function(){activate(this);if(grid)grid.style.display='grid';if(cards[0])cards[0].style.display='none';if(cards[1]){cards[1].style.display='block';cards[1].scrollIntoView({behavior:'smooth',block:'start'})}}
 tabs[2].onclick=function(){activate(this);const target=q('[data-page="membership"], [data-nav="membership"], [href*="membership"]');const close=q('#nt37UsersClose');if(close)close.click();setTimeout(()=>{if(target&&typeof target.click==='function')target.click();else window.dispatchEvent(new CustomEvent('nursetrack:open-membership'))},120)};
 tabs[3].onclick=function(){activate(this);const sys=q('#nt37TabSystem');if(sys&&typeof sys.click==='function')sys.click();else{const target=q('[data-page="settings"], [data-page="system"], [data-nav="system"]');if(target&&typeof target.click==='function')target.click()}};
 return true}
let n=0;const t=setInterval(()=>{n++;if(install()||n>120)clearInterval(t)},200);document.addEventListener('click',()=>setTimeout(install,80),true);})();