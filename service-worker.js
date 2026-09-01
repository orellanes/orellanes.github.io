const NT_SW_VERSION='safe36b';
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith('nursetrack-')).map(n=>caches.delete(n)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;const u=new URL(req.url);if(u.origin!==self.location.origin)return;event.respondWith(fetch(req,{cache:'no-store'}).catch(()=>new Response('NurseTrack requiere conexión para esta función.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})))});
