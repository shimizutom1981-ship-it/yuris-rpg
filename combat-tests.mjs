import assert from 'node:assert/strict';
import {fresh,beginBattle,battleTurn,rest,rank,validateSave,maxHp,maxEd} from './dist/core.js';
const rng=()=>0;
let s=fresh(),b=beginBattle('sentinel','group',['crawler','moth']);
battleTurn(s,b,'flare',rng);assert(b.foes.every(e=>e.currentHp<e.hp),'area magic hits every enemy');assert.equal(s.mastery.magic,1);
s=fresh();b=beginBattle('sentinel','target',['crawler']);b.target=1;battleTurn(s,b,'attack',rng);assert.equal(b.foes[0].currentHp,b.foes[0].hp);assert(b.foes[1].currentHp<b.foes[1].hp);
s=fresh();s.hp=1;s.edHp=0;b=beginBattle('sentinel','heal');const r=battleTurn(s,b,'cure',rng);assert(!r.invalid&&s.hp>1&&s.edHp>0);assert.equal(s.mp,19);assert.equal(s.mastery.healing,1);
s=fresh();b=beginBattle('sentinel','invalid');assert(battleTurn(s,b,'cure').invalid);assert.equal(b.turn,0);assert.deepEqual(s.mastery,{});s.mp=0;assert(battleTurn(s,b,'flare').invalid);assert.equal(b.turn,0);
// Compare the same heavy attack with and without temporary support; all spells consume their turn.
const heavy=action=>{const s=fresh(),b=beginBattle('sentinel','buff');b.turn=1;battleTurn(s,b,action,rng);return {s,b,damage:maxHp(s)-s.hp};};
const raw=heavy('listen'),shield=heavy('barrier'),weak=heavy('break');assert(shield.damage<raw.damage);assert(weak.damage<raw.damage);assert.equal(shield.b.barrier,2);assert.equal(weak.b.foes[0].weaken,2);
for(let i=0;i<2;i++)battleTurn(shield.s,shield.b,'guard',rng);assert.equal(shield.b.barrier,0);
s=fresh();s.mastery.sword=4;b=beginBattle('bear','rank');battleTurn(s,b,'skill',rng);assert.equal(rank(s,'sword'),2);assert.equal(validateSave(JSON.parse(JSON.stringify(s))).mastery.sword,5);
const legacy=fresh();delete legacy.mastery;const migrated=validateSave(legacy);assert.equal(rank(migrated,'magic'),1);assert.equal(migrated.map,'village');
assert.equal(validateSave({...fresh(),mastery:{sword:Infinity,magic:-3,support:999}}).mastery.support,50);
// A defeated enemy cannot retaliate; the surviving target is chosen automatically next turn.
s=fresh();b=beginBattle('moth','kill',['sentinel']);b.foes[0].currentHp=1;let before=s.hp;battleTurn(s,b,'attack',rng);assert.equal(s.hp,before,'only surviving sentinel charges');assert.equal(b.foes[0].currentHp,0);battleTurn(s,b,'skill',rng);assert.equal(b.target,1);
// Stronger learned magic and offensive support deal measurably more damage.
function magicDamage(master=0,buff=false){const s=fresh();s.mastery.magic=master;const b=beginBattle('bear','power');if(buff){battleTurn(s,b,'rally',rng);rest(s);}const hp=b.currentHp;battleTurn(s,b,'flare',rng);return hp-b.currentHp;}
assert(magicDamage(50)>magicDamage(0));assert(magicDamage(0,true)>magicDamage(0));
// Seeded second-episode groups: strategy uses healing, area attacks, guard and refills.
for(let seed=0;seed<60;seed++){let n=seed+1;const random=()=>((n=(n*1664525+1013904223)>>>0)/2**32);s=fresh();s.level=5;s.weapon=1;s.armor=1;rest(s);b=beginBattle('wolf','ridge',['moth','wolf']);for(const e of b.foes){e.hp=Math.round(e.hp*1.55);e.currentHp=e.hp;e.atk=Math.round(e.atk*1.2);}b.hp=b.currentHp=b.foes.reduce((v,e)=>v+e.hp,0);for(let t=0;t<80&&!b.result;t++){const heavy=b.foes.some(e=>e.currentHp>0&&e.intent[b.turn%e.intent.length]==='heavy');const action=s.hp<70&&s.mp>=7?'cure':s.hp<35?'potion':heavy?'guard':b.foes.filter(e=>e.currentHp>0).length>1&&s.mp>=12?'flare':s.mp>=6?'skill':'guard';battleTurn(s,b,action,random);}assert.equal(b.result,'win',`group strategy seed ${seed}`);}
console.log('PASS area/target magic, recovery/revival, buffs/debuffs/expiry, mastery, legacy saves, 60 seeded group battles');

// 1.2.1: descriptions and damage share the same support values.
const {skills,skillDescription,supportEffects,currentIntent,staggerRidge,stabilizationGain}=await import('./dist/core.js');
assert.equal(skills.break.cost,5);
for(const [uses,expected] of [[0,[45,35,40]],[5,[48,39,43]],[50,[57,51,52]]]){
 const s=fresh();s.mastery.support=uses;const fx=supportEffects(s);
 assert.deepEqual([fx.barrier,fx.rally,fx.weaken],expected);
 for(const [id,value] of [['barrier',fx.barrier],['rally',fx.rally],['break',fx.weaken]])assert(skillDescription(s,id).includes(`${value}%`));
 assert(skillDescription(s,'rally').includes('エドの援護を除く'));
}
// The old fixed five-action tower solution no longer ends the fight.
s=fresh();s.level=5;rest(s);b=beginBattle('warden','timing');
for(const a of ['listen','guard','stabilize','stabilize','stabilize'])battleTurn(s,b,a,rng);
assert.equal(b.result,null);assert.equal(b.stability,5);assert.equal(stabilizationGain(b),2);
battleTurn(s,b,'stabilize',rng);assert.equal(b.result,'win');
// Re-listening cannot bypass the tower's timing; the first episode stays unchanged.
for(const type of ['bear','warden']){s=fresh();rest(s);b=beginBattle(type,'listen');battleTurn(s,b,'listen',rng);battleTurn(s,b,'listen',rng);assert.equal(b.stability,type==='bear'?2:1);}
for(const effect of ['barrier','weaken']){b=beginBattle('warden','protected');b.turn=2;assert.equal(stabilizationGain(b),1);if(effect==='barrier')b.barrier=1;else b.foes[0].weaken=1;assert.equal(stabilizationGain(b),2);}
// Real ridge setup, including staggered enemy previews, at legacy-clear level/equipment.
for(const lead of ['wolf','moth'])for(let seed=1;seed<=100;seed++){
 let n=seed;const random=()=>((n=(1664525*n+1013904223)>>>0)/2**32);
 s=fresh();s.level=5;s.armor=1;rest(s);b=staggerRidge(beginBattle(lead,'ridge',['moth','wolf']));
 assert.deepEqual(b.foes.map(e=>e.intentOffset),[0,1,2]);assert.equal(currentIntent(b,b.foes[2]),'heavy');
 for(const e of b.foes){e.hp=Math.round(e.hp*1.55);e.currentHp=e.hp;e.atk=Math.round(e.atk*1.2);}b.hp=b.currentHp=b.foes.reduce((n,e)=>n+e.hp,0);
 for(let turn=0;turn<40&&!b.result;turn++){
  const alive=b.foes.filter(e=>e.currentHp>0);b.target=(alive.find(e=>currentIntent(b,e)==='heavy')||alive[0]).index;
  const action=s.hp<80&&s.mp>=7?'cure':s.mp>=12?'flare':s.mp>=6?'skill':'guard';battleTurn(s,b,action,random);
 }
 assert.equal(b.result,'win',`staggered ridge ${lead}/${seed}`);
}
// All four rank thresholds survive serialization without changing save version/key.
for(const uses of [5,15,30,50]){s=fresh();s.mastery={sword:uses,magic:uses,healing:uses,support:uses};assert.deepEqual(validateSave(JSON.parse(JSON.stringify(s))).mastery,s.mastery);}
console.log('PASS dynamic support descriptions, tower timing/protection, 200 staggered ridge battles, mastery persistence');
