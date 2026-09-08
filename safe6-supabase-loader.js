(function(){'use strict';
if(window.NT_loadSupabase)return;
const SOURCES=[
 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.115.0/dist/umd/supabase.min.js',
 'https://unpkg.com/@supabase/supabase-js@2.115.0/dist/umd/supabase.min.js'
];
let pending=null;
function ready(){return !!(window.supabase&&typeof window.supabase.createClient==='function')}
function loadOne(src){return new Promise(function(resolve,reject){
 if(ready())return resolve(window.supabase);
 const s=document.createElement('script');let done=false;
 const finish=function(ok){if(done)return;done=true;clearTimeout(timer);s.onload=s.onerror=null;if(ok&&ready())resolve(window.supabase);else{try{s.remove()}catch(_){}reject(new Error('sdk_load_failed'))}};
 s.src=src;s.async=true;s.crossOrigin='anonymous';s.referrerPolicy='no-referrer';
 s.onload=function(){finish(true)};s.onerror=function(){finish(false)};
 const timer=setTimeout(function(){finish(false)},6500);
 (document.head||document.documentElement).appendChild(s);
 })}
window.NT_loadSupabase=function(){
 if(ready())return Promise.resolve(window.supabase);
 if(pending)return pending;
 pending=(async function(){let last=null;for(const src of SOURCES){try{return await loadOne(src)}catch(e){last=e}}throw last||new Error('supabase_sdk_unavailable')})().finally(function(){if(!ready())pending=null});
 return pending;
};
})();
