import assert from 'node:assert/strict';
import {fresh,validateSave} from './dist/core.js';
import {hearTopic,options,actOnWorld,explorationNote} from './dist/exploration.js';
import {createWorld} from './dist/world.js';
import {planRoute} from './dist/navigation.js';
for(const method of ['borrow','crafted']){
 const s=fresh(),gold=s.gold;
 assert.equal(actOnWorld(s,'southlamp',method),'今はその操作をできない。');
 if(method==='borrow')hearTopic(s,'inn',1);
 else {actOnWorld(s,'scrapbox','salvage');assert(!options(s,'worktable').some(([a])=>a==='craft'));}
 actOnWorld(s,'worktable','study');if(method==='crafted')actOnWorld(s,'worktable','craft');
 actOnWorld(s,'southlamp',method);assert(s.flags.lampFixed);assert.equal(s.gold,gold+15);
 for(let i=0;i<3;i++)actOnWorld(s,'southlamp',method);assert.equal(s.gold,gold+15,'no repeated reward');
 actOnWorld(s,'southlamp','toggle');assert(s.flags.lampDark);actOnWorld(s,'southlamp','toggle');assert(!s.flags.lampDark);
 const loaded=validateSave(JSON.parse(JSON.stringify(s)));assert(loaded.flags.lampFixed);assert.equal(explorationNote(loaded),explorationNote(s));
}
const map=createWorld().village,s=fresh();for(const o of map.objects.filter(o=>o.explore))assert(planRoute(map,s,o.x,o.y,o),`${o.id} is reachable`);
assert(!fresh().flags.lampFixed);assert(hearTopic(fresh(),'missing',0)===null);
console.log('PASS both noncombat solutions, prerequisites, reward idempotence, reversible light, legacy save and reachability');
