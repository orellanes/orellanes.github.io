(function(){
'use strict';
if(window.__NT_V4_PERFORMANCE_GUARD__)return;
window.__NT_V4_PERFORMANCE_GUARD__=true;

const FEATURES={
  broad_catalog_search:{label:'Búsqueda amplia ICD/CPT',desc:'Permite buscar dentro de descripciones completas. El modo protegido usa búsquedas más cortas y dirigidas.'},
  full_catalog_load:{label:'Carga completa de catálogos',desc:'Permite cargar grandes catálogos completos. Normalmente se usan páginas pequeñas.'},
  full_audit:{label:'Auditoría clínica completa',desc:'Permite recorridos amplios de datos para auditorías administrativas.'},
  mass_counts:{label:'Conteos masivos',desc:'Permite recalcular conteos extensos en tiempo real.'},
  bulk_export:{label:'Exportaciones masivas',desc:'Permite exportaciones grandes que pueden consumir memoria y red.'},
  storage_scan:{label:'Escaneo completo de almacenamiento',desc:'Permite revisar almacenamiento y estadísticas de forma intensiva.'},
  aggressive_refresh:{label:'Actualización intensiva',desc:'Permite refrescos frecuentes de paneles y métricas.'}
};
const DEFAULT_GUARD={protected:true,features:Object.fromEntries(Object.keys(FEATURES).map(k=>[k,false]))};
let sb=null,ctx=null,guard=JSON.parse(JSON.stringify(DEFAULT_GUARD)),ready=false,loading=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

function config(){return window.NURSETRACK_SUPABASE||{}}
async function client(){
  if(sb)return sb;
  if(window.NT_V4_SB){sb=window.NT_V4_SB;return sb;}
  if(typeof window.NT_loadSupabase!=='function')throw new Error('Supabase no disponible');
  const lib=await window.NT_loadSupabase(),c=config();
  if(!c.url||!c.publishableKey)throw new Error('Configuración cloud no disponible');
  sb=lib.createClient(c.url,c.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
  return sb;
}
async function context(force){
  if(ctx&&!force)return ctx;
  await client();
  const ses=await sb.auth.getSession(),u=ses?.data?.session?.user;
  if(!u)throw new Error('Sesión no disponible');
  const [cu,pr]=await Promise.all([
    sb.from('nursetrack_company_users').select('company_id').eq('user_id',u.id).eq('active',true).limit(1),
    sb.from('nursetrack_profiles').select('role').eq('user_id',u.id).maybeSingle()
  ]);
  let company=cu.data?.[0]?.company_id||null;
  if(!company){const m=await sb.from('nursetrack_account_memberships').select('company_id').eq('user_id',u.id).eq('status','active').limit(1);company=m.data?.[0]?.company_id||null}
  if(!company)throw new Error('No hay compañía activa');
  const role=String(pr.data?.role||'').toLowerCase().replace(/[^a-z]/g,'');
  const superAdmin=role==='superadmin'||role==='superadministrator';
  ctx={user:u,company,superAdmin};
  return ctx;
}
function normalize(x){const src=x&&typeof x==='object'?x:{};return {protected:true,features:{...DEFAULT_GUARD.features,...(src.features&&typeof src.features==='object'?src.features:{})}}}
async function load(force){
  if(ready&&!force)return guard;
  if(loading&&!force)return loading;
  loading=(async()=>{
    const c=await context(force);
    const r=await sb.from('nursetrack_company_settings').select('settings').eq('company_id',c.company).maybeSingle();
    if(r.error)throw r.error;
    guard=normalize(r.data?.settings?.performance_guard);ready=true;updateCards();return guard;
  })().finally(()=>loading=null);
  return loading;
}
function isAllowed(feature){if(!ready||!FEATURES[feature]||!ctx?.superAdmin)return false;return guard.features?.[feature]===true}
function state(){return {ready,superAdmin:!!ctx?.superAdmin,company:ctx?.company||null,protected:true,features:{...guard.features}}}
function toast(msg){let t=$('ntV4PerfToast');if(!t){t=document.createElement('div');t.id='ntV4PerfToast';t.style.cssText='position:fixed;right:18px;bottom:18px;z-index:2147483647;max-width:390px;padding:12px 14px;border-radius:12px;background:#17343c;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.22);font:600 14px -apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif';document.body.appendChild(t)}t.textContent=msg;t.style.display='block';clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',3800)}
function requireFeature(feature,label){if(isAllowed(feature))return true;toast((label||FEATURES[feature]?.label||'Función de alto consumo')+' está restringida por Rendimiento protegido.');return false}
async function save(next){const c=await context();if(!c.superAdmin)throw new Error('Solo el Súper Administrador puede cambiar este control.');const normalized=normalize(next);const r=await sb.rpc('nursetrack_set_performance_guard',{p_company_id:c.company,p_guard:normalized});if(r.error)throw r.error;guard=normalize(r.data||normalized);ready=true;updateCards();return guard}
function style(){if($('ntV4PerfStyle'))return;const s=document.createElement('style');s.id='ntV4PerfStyle';s.textContent=`.ntv4-perf-card{position:relative;border:1px solid #a7ced0!important;background:linear-gradient(180deg,#f8fdfd,#edf8f8)!important}.ntv4-perf-card .ntv4-perf-state{display:inline-block;margin-top:7px;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:900;background:#dff4e8;color:#216b48}.ntv4-perf-card[data-open="1"] .ntv4-perf-state{background:#fff0d7;color:#8a5700}.ntv4-perf-modal{position:fixed;inset:0;z-index:2147483646;background:rgba(15,37,42,.42);display:grid;place-items:center;padding:18px}.ntv4-perf-box{width:min(720px,100%);max-height:88vh;overflow:auto;background:#fff;border-radius:20px;padding:20px;box-shadow:0 24px 70px rgba(0,0,0,.28);color:#17343c}.ntv4-perf-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.ntv4-perf-head h3{margin:0 0 5px}.ntv4-perf-close{border:0;background:#edf5f6;border-radius:10px;padding:8px 11px;font-weight:900}.ntv4-perf-banner{margin:14px 0;padding:12px 14px;border-radius:12px;background:#edf8f8;border:1px solid #cce5e5}.ntv4-perf-list{display:grid;gap:9px}.ntv4-perf-row{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;border:1px solid #d8e6e8;border-radius:12px;padding:12px}.ntv4-perf-row small{display:block;color:#6f858b;margin-top:3px}.ntv4-perf-toggle{min-width:108px;border:0;border-radius:10px;padding:9px 11px;font-weight:900;background:#edf5f6;color:#31545b}.ntv4-perf-toggle.on{background:#fff0d7;color:#8a5700}.ntv4-perf-master{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.ntv4-perf-note{font-size:13px;color:#6f858b}@media(max-width:560px){.ntv4-perf-row{grid-template-columns:1fr}.ntv4-perf-toggle{width:100%}}`;(document.head||document.documentElement).appendChild(s)}
function cardMarkup(){const open=Object.values(guard.features||{}).some(Boolean);return `<strong>🛡️ Rendimiento protegido</strong><small>${ctx?.superAdmin?'Control de funciones de alto consumo · solo Súper Administrador':'Funciones de alto consumo restringidas'}</small><span class="ntv4-perf-state">${open?'EXCEPCIONES ACTIVAS':'PROTEGIDO'}</span>`}
function ensureCard(){style();const grid=document.querySelector('#modulesPanel .module-grid');if(!grid)return;let b=$('ntV4PerformanceCard');if(!b){b=document.createElement('button');b.id='ntV4PerformanceCard';b.className='module ntv4-perf-card';b.type='button';b.addEventListener('click',openPanel);grid.appendChild(b)}b.innerHTML=cardMarkup();b.dataset.open=Object.values(guard.features||{}).some(Boolean)?'1':'0'}
function updateCards(){ensureCard();const b=$('ntV4PerformanceCard');if(b){b.innerHTML=cardMarkup();b.dataset.open=Object.values(guard.features||{}).some(Boolean)?'1':'0'}}
function featureRows(){return Object.entries(FEATURES).map(([key,f])=>`<div class="ntv4-perf-row"><div><strong>${esc(f.label)}</strong><small>${esc(f.desc)}</small></div>${ctx?.superAdmin?`<button class="ntv4-perf-toggle ${guard.features?.[key]?'on':''}" data-perf-feature="${key}">${guard.features?.[key]?'ACTIVADO':'BLOQUEADO'}</button>`:'<strong>Bloqueado</strong>'}</div>`).join('')}
async function openPanel(){
  if(!ready){try{await load()}catch(_){ready=true;guard=normalize(null)}}
  style();let m=$('ntV4PerfModal');if(m)m.remove();m=document.createElement('div');m.id='ntV4PerfModal';m.className='ntv4-perf-modal';const exceptions=Object.values(guard.features||{}).filter(Boolean).length;
  m.innerHTML=`<div class="ntv4-perf-box"><div class="ntv4-perf-head"><div><h3>🛡️ Rendimiento protegido</h3><div class="ntv4-perf-note">La protección general permanece siempre activa. Solo puedes abrir excepciones específicas.</div></div><button class="ntv4-perf-close" id="ntv4PerfClose">✕</button></div><div class="ntv4-perf-banner"><strong>Estado: Protección activa</strong><br>${ctx?.superAdmin?`Tienes ${exceptions} excepción(es) de alto consumo activada(s).`:'Solo el Súper Administrador puede activar funciones de alto consumo.'}</div>${ctx?.superAdmin?`<div class="ntv4-perf-master"><button class="btn light" id="ntv4PerfLockAll">Bloquear nuevamente todo lo pesado</button></div>`:''}<div class="ntv4-perf-list">${featureRows()}</div><div id="ntv4PerfStatus" class="status"></div></div>`;
  document.body.appendChild(m);$('ntv4PerfClose').onclick=()=>m.remove();m.addEventListener('click',e=>{if(e.target===m)m.remove()});
  if(ctx?.superAdmin){$('ntv4PerfLockAll').onclick=async()=>{try{await save({protected:true,features:{...DEFAULT_GUARD.features}});openPanel()}catch(e){const st=$('ntv4PerfStatus');if(st){st.textContent=e.message||String(e);st.style.color='#933'}}};m.querySelectorAll('[data-perf-feature]').forEach(b=>b.onclick=async()=>{const k=b.dataset.perfFeature;try{await save({protected:true,features:{...guard.features,[k]:!guard.features[k]}});openPanel()}catch(e){const st=$('ntv4PerfStatus');if(st){st.textContent=e.message||String(e);st.style.color='#933'}}})}
}
function markHeavy(selector,feature){document.querySelectorAll(selector).forEach(el=>el.dataset.ntHeavyFeature=feature)}
function clickGuard(e){const el=e.target.closest?.('[data-nt-heavy-feature]');if(!el)return;const feature=el.dataset.ntHeavyFeature;if(!isAllowed(feature)){e.preventDefault();e.stopImmediatePropagation();requireFeature(feature,el.textContent?.trim())}}
function boot(){
  style();document.addEventListener('click',clickGuard,true);
  // Stabilization 2026-09-09: no startup polling and no automatic cloud query.
  // Load the guard only when the Modules view is actually opened.
  document.addEventListener('click',function(e){const b=e.target.closest?.('.nav button[data-view="modules"]');if(!b)return;ensureCard();if(!ready&&!loading)load().catch(()=>{ready=true;guard=normalize(null);updateCards()})},{passive:true});
}
window.NT_V4_PERFORMANCE_GUARD={load,isAllowed,require:requireFeature,getState:state,open:openPanel,markHeavy,features:FEATURES,version:'1.2.0-stable'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
