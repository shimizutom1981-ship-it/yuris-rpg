import {W,H,solid,visibleObject} from './world.js';
export const DIRECTIONS=[['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]];
export function walkBlocked(map,x,y,state){return solid(map,x,y,state)||map.objects.some(o=>visibleObject(o,state)&&o.x===x&&o.y===y&&['npc','valve','tablet','sign','boss'].includes(o.type));}
// An object destination ends beside it. Interactions happen only on arrival.
export function planRoute(map,state,x,y,target=null){
 if(x<0||x>=W||y<0||y>=H)return null;
 const goal=(a,b)=>target?Math.abs(a-target.x)+Math.abs(b-target.y)<=1:a===x&&b===y;
 const queue=[[state.x,state.y]],seen=new Map([[`${state.x},${state.y}`,null]]);let end=null;
 for(let i=0;i<queue.length;i++){
  const [a,b]=queue[i];if(goal(a,b)){end=[a,b];break;}
  for(const [dir,dx,dy]of DIRECTIONS){const nx=a+dx,ny=b+dy,k=`${nx},${ny}`;
   if(seen.has(k)||walkBlocked(map,nx,ny,state))continue;
   // Do not cross an exit or unrelated dialogue-triggering chest to reach a target.
   if(map.objects.some(o=>visibleObject(o,state)&&o.x===nx&&o.y===ny&&['exit','chest'].includes(o.type)&&o.id!==target?.id))continue;
   seen.set(k,{previous:`${a},${b}`,dir});queue.push([nx,ny]);
  }
 }
 if(!end)return null;let key=end.join(','),steps=[];while(seen.get(key)){const item=seen.get(key);steps.push(item.dir);key=item.previous;}
 return {steps:steps.reverse(),x:end[0],y:end[1],targetId:target?.id||null};
}
export function tappedObject(map,state,px,py){
 return map.objects.filter(o=>visibleObject(o,state)&&!['tree','house','well','crystal'].includes(o.type)).map(o=>{
  const ox=o.x*16+8,oy=o.y*16+8;
  const top=o.type==='npc'?o.y*16-10:o.type==='boss'?o.y*16-28:o.y*16-6;
  const half=o.type==='boss'?26:10;
  return {o,d:Math.hypot(px-ox,py-oy),hit:Math.abs(px-ox)<=half&&py>=top&&py<=o.y*16+20};
 }).filter(v=>v.hit).sort((a,b)=>a.d-b.d)[0]?.o||null;
}
const pools={forest:['wolf','moth'],mine:['crawler','moth'],ruins:['sentinel','crawler']};
export function encounterAfterStep(map,state,rng=Math.random){
 if(!pools[state.map])return null;
 if(map.objects.some(o=>['npc','spring','exit'].includes(o.type)&&Math.abs(o.x-state.x)+Math.abs(o.y-state.y)<=2))return null;
 state.encounterSteps=(state.encounterSteps||0)+1;
 if(state.encounterSteps<10)return null;
 if(state.encounterSteps<28&&rng()>=.085)return null;
 state.encounterSteps=0;const pool=pools[state.map];return pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];
}
