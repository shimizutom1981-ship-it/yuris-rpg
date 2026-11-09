// Keep each deployed copy scoped; never delete other games' caches on github.io.
const PREFIX='yuris-rpg:'+new URL(self.registration.scope).pathname+':';
const CACHE=PREFIX+'2026-11-09-free-exploration-v1';
const FILES=['./','./index.html','./style.css','./game.js','./core.js','./exploration.js','./world.js','./render.js','./navigation.js','./pwa.js','./icon.svg','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 // Reload avoids assembling a new release from stale HTTP-cache files.
 await cache.addAll(FILES.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})));
})());});
// No skipWaiting: an update must never reload or replace a running battle.
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})());});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(event.request.mode==='navigate'){
  event.respondWith((async()=>{const cache=await caches.open(CACHE);const shell=await cache.match(new URL('./index.html',scope));return shell||fetch(event.request);})());return;
 }
 // Only our application assets are cached, and all come from the same release.
 if(!FILES.some(path=>new URL(path,scope).pathname===url.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(event.request,{ignoreSearch:true})||fetch(event.request);})());
});
