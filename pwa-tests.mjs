import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';import vm from 'node:vm';
const manifest=JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));
assert.equal(manifest.display,'standalone');assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./');
for(const icon of manifest.icons){const b=await readFile('dist/'+icon.src);const [w,h]=icon.sizes.split('x').map(Number);assert.equal(b.readUInt32BE(16),w);assert.equal(b.readUInt32BE(20),h);}
const scope='https://example.com/yuris-rpg/',events={},stores=new Map(),deleted=[];let online=true,claimed=false;
const body=new Map();const cacheFor=name=>{if(!stores.has(name))stores.set(name,new Map());const entries=stores.get(name);return {async addAll(requests){for(const r of requests){const u=new URL(r.url);const path=u.pathname.replace('/yuris-rpg/','')||'index.html';await access('dist/'+path);entries.set(r.url,new Response(await readFile('dist/'+path)));}},async match(req,{ignoreSearch=false}={}){let url=typeof req==='string'?req:req.url||req.href;if(ignoreSearch){const u=new URL(url);u.search='';url=u.href;}return entries.get(url)?.clone();}};};
const prefix='yuris-rpg:/yuris-rpg/:';stores.set(prefix+'old',new Map());stores.set('math-garden-cache',new Map());stores.set('yuris-rpg:/another-project/:old',new Map());
const ctx={URL,Request,Response,caches:{async open(name){return cacheFor(name);},async keys(){return [...stores.keys()];},async delete(name){deleted.push(name);return stores.delete(name);}},self:{registration:{scope},clients:{async claim(){claimed=true;}},addEventListener(name,fn){events[name]=fn;}},fetch:async()=>{if(!online)throw Error('offline');return new Response('network');}};
vm.runInNewContext(await readFile('dist/sw.js','utf8'),ctx);
let pending;events.install({waitUntil(p){pending=p;}});await pending;events.activate({waitUntil(p){pending=p;}});await pending;assert(claimed);assert.deepEqual(deleted,[prefix+'old']);assert(stores.has('math-garden-cache'));assert(stores.has('yuris-rpg:/another-project/:old'));
online=false;
for(const path of ['','index.html','game.js','navigation.js','pwa.js','manifest.webmanifest','icons/icon-192.png']){let reply;events.fetch({request:{url:scope+path,mode:path===''?'navigate':'cors',method:'GET'},respondWith(p){reply=p;}});assert(reply,'fetch intercepted');const res=await reply;assert(res.ok);assert((await res.arrayBuffer()).byteLength>0,'offline content exists');}
let intercepted=false;events.fetch({request:{url:'https://example.com/math-garden/',method:'GET',mode:'navigate'},respondWith(){intercepted=true;}});assert(!intercepted,'service worker does not intercept other apps');
console.log('PASS PWA manifest, PNG dimensions, complete precache, offline navigation/assets, and cache isolation');
