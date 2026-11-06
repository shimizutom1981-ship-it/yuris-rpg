import assert from 'node:assert/strict';
import {fresh,validateSave} from './dist/core.js';
import {createWorld,solid} from './dist/world.js';
import {planRoute,walkBlocked,tappedObject,encounterAfterStep,DIRECTIONS} from './dist/navigation.js';
const maps=createWorld();let count=0;const ok=(v,m)=>{assert.ok(v,m);count++;};
for(const [name,map]of Object.entries(maps)){
 const s=fresh();s.map=name;[s.x,s.y]=name==='village'?[14,15]:name==='forest'?[3,18]:name==='mine'?[16,22]:name==='ruins'?[16,22]:[16,21];
 ok(!map.objects.some(o=>o.type==='enemy'),'no fixed regular enemies');
 for(const o of map.objects.filter(o=>!['house','tree','well','crystal'].includes(o.type))){
  const route=planRoute(map,s,o.x,o.y,o);ok(route,`${name}/${o.id} reachable by tap`);
  const at={...s};for(const dir of route.steps){const [,dx,dy]=DIRECTIONS.find(v=>v[0]===dir);at.x+=dx;at.y+=dy;ok(!walkBlocked(map,at.x,at.y,s),'route never crosses obstacles or NPCs');}
  ok(Math.abs(at.x-o.x)+Math.abs(at.y-o.y)<=1,'ends beside object');
 }
}
let s=fresh(),map=maps.village;ok(!planRoute(map,s,5,8),'house interior unreachable');ok(!planRoute(map,s,-1,1),'outside map unreachable');ok(planRoute(map,s,s.x,s.y).steps.length===0,'already at destination');const npc=map.objects.find(o=>o.id==='victor');ok(tappedObject(map,s,npc.x*16+8,npc.y*16-6)?.id==='victor','tapping head selects NPC');
s.map='forest';s.x=14;s.y=12;for(let i=0;i<9;i++)ok(!encounterAfterStep(maps.forest,s,()=>0),'post-battle grace');ok(encounterAfterStep(maps.forest,s,()=>0)==='wolf','encounter triggered after grace');ok(s.encounterSteps===0,'reset after encounter');for(let i=0;i<27;i++)ok(!encounterAfterStep(maps.forest,s,()=>.999),'probabilistic encounter');ok(encounterAfterStep(maps.forest,s,()=>.999)==='moth','bounded maximum interval');s.map='village';for(let i=0;i<100;i++)ok(!encounterAfterStep(map,s,()=>0),'town always safe');s.map='forest';s.x=21;s.y=12;s.encounterSteps=27;ok(!encounterAfterStep(maps.forest,s,()=>0),'spring safe');
let old=fresh();delete old.encounterSteps;delete old.battlesWon;old.defeated=['f1'];ok(validateSave(old).battlesWon===1,'old saves migrate');old.battlesWon=500;ok(validateSave(old).battlesWon===500,'random victories do not break old defeated-list limit');
console.log(`PASS ${count} tap routing, encounters and save-compatibility checks`);
