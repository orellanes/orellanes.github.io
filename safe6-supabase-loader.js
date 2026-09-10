(function(){'use strict';
const NT_PATH=String(location.pathname||'');

// Stable 173: intercept the legacy clinical HTML and remove exact duplicate
// inline scripts/styles before app-safe6 executes it. This changes only the
// in-memory copy delivered to the iframe; the clinical source file is untouched.
try{
 if(!window.__NT_STABLE_FETCH_DEDUPE__ && /(?:^|\/)(?:app-safe6|login-safe6)\.html$/i.test(NT_PATH)){
  window.__NT_STABLE_FETCH_DEDUPE__=true;
  const nativeFetch=window.fetch.bind(window);
  function dedupeLegacyHtml(text){
   const seenInline=new Set(),seenExternal=new Set(),seenStyles=new Set();
   const removed={inlineScripts:0,externalScripts:0,styles:0};
   text=text.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,function(all,attrs,body){
    const m=attrs.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
    if(m){const key=m[2];if(seenExternal.has(key)){removed.externalScripts++;return '<!-- NT stable173 duplicate external script removed -->';}seenExternal.add(key);return all;}
    const key=body.trim();if(key.length>120&&seenInline.has(key)){removed.inlineScripts++;return '<!-- NT stable173 duplicate inline script removed -->';}if(key.length>120)seenInline.add(key);return all;
   });
   text=text.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi,function(all,body){const key=body.trim();if(key.length>120&&seenStyles.has(key)){removed.styles++;return '<!-- NT stable173 duplicate style removed -->';}if(key.length>120)seenStyles.add(key);return all;});
   return {text:text,removed:removed};
  }
  window.fetch=async function(input,init){const response=await nativeFetch(input,init);try{const url=typeof input==='string'?input:((input&&input.url)||'');if(/(?:^|\/)index\.html\.html(?:[?#]|$)/i.test(url)&&response&&response.ok){const raw=await response.clone().text();const cleaned=dedupeLegacyHtml(raw);window.__NT_STABLE_DEDUPE_LAST__=cleaned.removed;return new Response(cleaned.text,{status:response.status,statusText:response.statusText,headers:response.headers});}}catch(e){window.__NT_STABLE_DEDUPE_ERROR__=String(e&&e.message||e);}return response;};
 }
}catch(_){}

if(!window.NT_loadSupabase){
 const SOURCES=['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.115.0/dist/umd/supabase.min.js','https://unpkg.com/@supabase/supabase-js@2.115.0/dist/umd/supabase.min.js'];
 let pending=null;
 function ready(){return !!(window.supabase&&typeof window.supabase.createClient==='function')}
 function loadOne(src){return new Promise(function(resolve,reject){if(ready())return resolve(window.supabase);const s=document.createElement('script');let done=false;const finish=function(ok){if(done)return;done=true;clearTimeout(timer);s.onload=s.onerror=null;if(ok&&ready())resolve(window.supabase);else{try{s.remove()}catch(_){}reject(new Error('sdk_load_failed'))}};s.src=src;s.async=true;s.crossOrigin='anonymous';s.referrerPolicy='no-referrer';s.onload=function(){finish(true)};s.onerror=function(){finish(false)};const timer=setTimeout(function(){finish(false)},6500);(document.head||document.documentElement).appendChild(s);})}
 window.NT_loadSupabase=function(){if(ready())return Promise.resolve(window.supabase);if(pending)return pending;pending=(async function(){let last=null;for(const src of SOURCES){try{return await loadOne(src)}catch(e){last=e}}throw last||new Error('supabase_sdk_unavailable')})().finally(function(){if(!ready())pending=null});return pending;};
}

// NurseTrack One: carga única y explícita de los módulos esenciales de v4.
try{
 if(/\/v4-beta\//i.test(NT_PATH)){
  const load=function(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;(document.head||document.documentElement).appendChild(s)};
  load('ntV4PatientRegistrationLoader','patient-registration.js?v=20260910-core-2');
  load('ntV4SmartNursingLoader','smart-nursing.js?v=20260910-age-core-2');
  load('ntV4PatientEditorLoader','patient-editor.js?v=20260910-edit-core-2');
  load('ntV4BocetoUiLoader','boceto-ui.js?v=20260910-core-2');
 }
}catch(_){}
})();