(function(){'use strict';if(window.__ntAppearanceSettingsV1)return;window.__ntAppearanceSettingsV1=true;
var KEY='nursetrack_v3_appearance';
var DEF={logoText:'#ffffff',logoBg:'#397f88',brandText:'#ffffff',subtitleText:'#d9edf4',topNavText:'#ffffff',topBg:'#073b78',sideText:'#ffffff',sideBg:'#073b78',logoSize:24,brandSize:24,subtitleSize:13,topNavSize:15,sideNavSize:15};
function read(){try{return Object.assign({},DEF,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return Object.assign({},DEF)}}
function write(v){localStorage.setItem(KEY,JSON.stringify(v));apply(v)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function isSuper(){return document.documentElement.dataset.ntSuperadmin==='true'||document.documentElement.dataset.superadmin==='true'||!!window.NURSETRACK_SUPERADMIN_FULL_ACCESS||!!window.nt37VerifiedSuperAdmin||!!document.querySelector('#ntSafe6MasterAdmin,[data-superadmin-verified="true"]')}
function settings(){return document.getElementById('settingsPage')||document.querySelector('[data-page-panel="settings"]')||document.querySelector('.settings-page')}
function styleEl(){var s=document.getElementById('ntAppearanceLiveStyle');if(!s){s=document.createElement('style');s.id='ntAppearanceLiveStyle';(document.head||document.documentElement).appendChild(s)}return s}
function apply(v){v=v||read();var css='\n'+
'.top{background:'+v.topBg+'!important;color:'+v.topNavText+'!important}\n'+
'.top .brand h1,.top .brand,.top .brand *{color:'+v.brandText+'!important}\n'+
'.top .brand small{color:'+v.subtitleText+'!important}\n'+
'.top .logo{background:'+v.logoBg+'!important;color:'+v.logoText+'!important;font-size:'+Number(v.logoSize||24)+'px!important}\n'+
'.top .brand h1{font-size:'+Number(v.brandSize||24)+'px!important}\n'+
'.top .brand small{font-size:'+Number(v.subtitleSize||13)+'px!important}\n'+
'.top button,.top a,.top .navbtn,.top [role="button"],.top .user,.top .user span{color:'+v.topNavText+'!important;font-size:'+Number(v.topNavSize||15)+'px!important}\n'+
'.side{background:'+v.sideBg+'!important;color:'+v.sideText+'!important}\n'+
'.side .navbtn,.side .patientbtn,.side .section-title,.side label,.side strong,.side span{color:'+v.sideText+'!important;font-size:'+Number(v.sideNavSize||15)+'px!important}\n'+
'.side .patientbtn small{color:'+v.sideText+'!important;opacity:.82}\n';
styleEl().textContent=css;
try{window.dispatchEvent(new CustomEvent('nursetrack:appearance-updated',{detail:v}))}catch(e){}
}
function field(label,id,val){return '<div class="field"><label>'+label+'</label><div style="display:flex;gap:8px;align-items:center"><input id="'+id+'" type="color" value="'+esc(val)+'" style="width:54px;height:42px;padding:2px"><input id="'+id+'Hex" value="'+esc(val)+'" maxlength="7" style="max-width:110px"></div></div>'}
function range(label,id,val,min,max){return '<div class="field"><label>'+label+' <strong id="'+id+'Out">'+val+' px</strong></label><input id="'+id+'" type="range" min="'+min+'" max="'+max+'" value="'+val+'" step="1"></div>'}
function vals(){function c(id){var e=document.getElementById(id+'Hex');return /^#[0-9a-f]{6}$/i.test(e.value.trim())?e.value.trim():document.getElementById(id).value}function n(id){return Number(document.getElementById(id).value)}return{logoText:c('apLogoText'),logoBg:c('apLogoBg'),brandText:c('apBrandText'),subtitleText:c('apSubtitleText'),topNavText:c('apTopNavText'),topBg:c('apTopBg'),sideText:c('apSideText'),sideBg:c('apSideBg'),logoSize:n('apLogoSize'),brandSize:n('apBrandSize'),subtitleSize:n('apSubtitleSize'),topNavSize:n('apTopNavSize'),sideNavSize:n('apSideNavSize')}}
function syncColor(id){var a=document.getElementById(id),b=document.getElementById(id+'Hex');a.oninput=function(){b.value=a.value;apply(vals())};b.oninput=function(){if(/^#[0-9a-f]{6}$/i.test(b.value.trim())){a.value=b.value.trim();apply(vals())}}}
function mount(){if(!isSuper())return;var host=settings();if(!host||document.getElementById('ntAppearanceSettings'))return;var v=read(),p=document.createElement('section');p.id='ntAppearanceSettings';p.className='card';p.style.marginTop='14px';p.innerHTML='<div class="pagehead"><div><h2 style="margin:0">🎨 Apariencia · Colores y tamaño</h2><div class="muted">Personaliza la barra superior, el logo NT y el menú lateral. Solo Súper Administrador.</div></div></div><div class="formgrid" style="margin-top:14px">'+field('Letras del logo NT','apLogoText',v.logoText)+field('Fondo del logo NT','apLogoBg',v.logoBg)+field('Nombre NurseTrack','apBrandText',v.brandText)+field('Subtítulo','apSubtitleText',v.subtitleText)+field('Texto menú superior','apTopNavText',v.topNavText)+field('Fondo barra superior','apTopBg',v.topBg)+field('Texto menú lateral','apSideText',v.sideText)+field('Fondo menú lateral','apSideBg',v.sideBg)+range('Tamaño letras NT','apLogoSize',v.logoSize,16,40)+range('Tamaño NurseTrack','apBrandSize',v.brandSize,16,40)+range('Tamaño subtítulo','apSubtitleSize',v.subtitleSize,10,24)+range('Tamaño menú superior','apTopNavSize',v.topNavSize,11,24)+range('Tamaño menú lateral','apSideNavSize',v.sideNavSize,11,24)+'</div><div class="row" style="margin-top:14px;gap:8px;flex-wrap:wrap"><button type="button" class="btn primary" id="apSave">Guardar apariencia</button><button type="button" class="btn secondary" id="apWhite">Blanco alto contraste</button><button type="button" class="btn secondary" id="apBlue">Azul clásico</button><button type="button" class="btn secondary" id="apTeal">Verde azulado</button><button type="button" class="btn secondary" id="apReset">Restaurar</button></div><div id="apMsg" class="muted" style="margin-top:8px"></div>';
host.insertBefore(p,host.firstChild);
['apLogoText','apLogoBg','apBrandText','apSubtitleText','apTopNavText','apTopBg','apSideText','apSideBg'].forEach(syncColor);
['apLogoSize','apBrandSize','apSubtitleSize','apTopNavSize','apSideNavSize'].forEach(function(id){var e=document.getElementById(id),o=document.getElementById(id+'Out');e.oninput=function(){o.textContent=e.value+' px';apply(vals())}});
document.getElementById('apSave').onclick=function(){write(vals());document.getElementById('apMsg').textContent='✓ Apariencia guardada.'};
function setPreset(x){write(Object.assign({},read(),x));location.reload()}
document.getElementById('apWhite').onclick=function(){setPreset({logoText:'#ffffff',brandText:'#ffffff',subtitleText:'#e6f4ff',topNavText:'#ffffff',sideText:'#ffffff',topBg:'#073b78',sideBg:'#073b78'})};
document.getElementById('apBlue').onclick=function(){setPreset({logoText:'#ffffff',logoBg:'#1d6fd6',brandText:'#ffffff',subtitleText:'#dfeeff',topNavText:'#ffffff',sideText:'#ffffff',topBg:'#083f86',sideBg:'#083f86'})};
document.getElementById('apTeal').onclick=function(){setPreset({logoText:'#ffffff',logoBg:'#267f86',brandText:'#ffffff',subtitleText:'#def4f4',topNavText:'#ffffff',sideText:'#ffffff',topBg:'#155c68',sideBg:'#155c68'})};
document.getElementById('apReset').onclick=function(){localStorage.removeItem(KEY);apply(DEF);location.reload()};apply(v)}
function open(){mount();var p=document.getElementById('ntAppearanceSettings');if(!p)return false;p.scrollIntoView({behavior:'smooth',block:'start'});return true}
function boot(){apply(read());mount()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
new MutationObserver(function(){mount()}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('nt37:superadmin-verified',mount);document.addEventListener('nursetrack:superadmin-ready',mount);
window.NT_APPEARANCE_SETTINGS={open:open,apply:apply,read:read};
})();