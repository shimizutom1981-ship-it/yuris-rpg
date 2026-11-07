export const VERSION=1;
export const fresh=()=>({version:VERSION,map:'village',x:14,y:15,dir:'up',level:1,xp:0,gold:20,potions:5,hp:92,mp:26,edHp:78,ed:true,weapon:0,armor:0,ore:0,herbs:0,flags:{},defeated:[],collected:[],lore:[],valves:[],steps:0,played:0,chapter:0,encounterSteps:0,battlesWon:0,mastery:{}});
export const maxHp=s=>92+(s.level-1)*18;export const maxMp=s=>26+(s.level-1)*5;export const maxEd=s=>78+(s.level-1)*15;
export const levelNeed=s=>s.level*28;
export function reward(s,xp,gold){s.xp+=xp;s.gold+=gold;let levels=0;while(s.xp>=levelNeed(s)&&s.level<12){s.xp-=levelNeed(s);s.level++;levels++;s.hp=maxHp(s);s.mp=maxMp(s);s.edHp=maxEd(s);}return levels;}
export function heal(s){if(s.potions<1)return false;if(s.hp===maxHp(s)&&s.edHp===maxEd(s))return false;s.potions--;s.hp=Math.min(maxHp(s),s.hp+65);s.edHp=Math.min(maxEd(s),s.edHp+50);return true;}
export function rest(s){s.hp=maxHp(s);s.mp=maxMp(s);s.edHp=maxEd(s);}
export const enemies={wolf:{name:'霜牙の狼',hp:42,atk:12,xp:16,gold:12,kind:'wolf',intent:['bite','charge','heavy']},moth:{name:'霊光の蛾',hp:38,atk:10,xp:14,gold:10,kind:'moth',intent:['drain','charge','heavy']},crawler:{name:'坑道の石殻蟲',hp:61,atk:14,xp:22,gold:18,kind:'crawler',intent:['bite','guard','heavy']},sentinel:{name:'遺跡の自動守衛',hp:86,atk:17,xp:32,gold:25,kind:'sentinel',intent:['charge','heavy','guard','bite']},bear:{name:'過負荷の熊型機霊',hp:150,atk:19,xp:65,gold:60,kind:'bear',intent:['charge','heavy','drain','heavy'],boss:true}};
// Skill experience is saved separately from character levels. Rank 1–5: 0/5/15/30/50 successful uses.
export const skills={
 attack:{name:'こうげき',cost:0,desc:'選んだ敵1体。エドが援護'},
 skill:{name:'踏み込み',cost:6,desc:'敵1体に強い剣撃',track:'sword'},
 sweep:{name:'旋風斬り',cost:9,desc:'敵全体に剣撃',track:'sword'},
 flare:{name:'霊光の波',cost:12,desc:'敵全体。装甲を無視',track:'magic'},
 cure:{name:'癒しの光',cost:7,desc:'二人を回復・エドも復帰',track:'healing'},
 barrier:{name:'守護の幕',cost:8,desc:'3ターン、二人の被害を45%軽減',track:'support'},
 rally:{name:'勇気の詠唱',cost:7,desc:'3ターン、与えるダメージを35%増加',track:'support'},
 break:{name:'霊鎖',cost:5,desc:'敵1体の攻撃を3ターン40%低下',track:'support'}
};
export const masteryNames={sword:'剣技',magic:'攻撃魔法',healing:'回復魔法',support:'補助魔法'};
export const rank=(s,k)=>1+[5,15,30,50].filter(n=>(s.mastery?.[k]||0)>=n).length;
export const supportEffects=s=>({barrier:45+(rank(s,'support')-1)*3,rally:35+(rank(s,'support')-1)*4,weaken:40+(rank(s,'support')-1)*3});
export function skillDescription(s,id){const fx=supportEffects(s);return id==='barrier'?`使用ターン込み3ターン、二人の被害を${fx.barrier}%軽減`:id==='rally'?`次の3ターン、ユリスの与えるダメージを${fx.rally}%増加（エドの援護を除く）`:id==='break'?`敵1体の攻撃を使用ターン込み3ターン${fx.weaken}%低下`:skills[id].desc;}
export const currentIntent=(b,e)=>e.intent[(b.turn+(e.intentOffset||0))%e.intent.length];
export function staggerRidge(b){b.foes.forEach((e,i)=>{e.intentOffset=i%e.intent.length;});return b;}
export function stabilizationGain(b){if(b.type!=='warden')return 2;return ['charge','guard'].includes(currentIntent(b,b.foes[0]))||b.barrier>0||b.foes[0].weaken>0?2:1;}
enemies.warden={name:'中継塔の守り手',hp:280,atk:28,xp:140,gold:120,kind:'sentinel',intent:['charge','heavy','drain','guard','heavy'],boss:true};
export function beginBattle(type,id,companions=[]){const e=enemies[type];const foes=[type,...companions].map((t,i)=>({...enemies[t],type:t,currentHp:enemies[t].hp,index:i,weaken:0}));return {...e,type,id,foes,target:0,currentHp:foes.reduce((n,e)=>n+e.hp,0),hp:foes.reduce((n,e)=>n+e.hp,0),xp:foes.reduce((n,e)=>n+e.xp,0),gold:foes.reduce((n,e)=>n+e.gold,0),turn:0,focus:0,barrier:0,rally:0,stability:0,heard:false,result:null};}
const intentText={bite:'通常攻撃',charge:'力をためる',heavy:'強攻撃！',guard:'装甲を固める',drain:'霊流の乱れ'};
export const intentName=b=>b.foes.filter(e=>e.currentHp>0).map(e=>e.name+'：'+intentText[currentIntent(b,e)]).join(' ／ ');
export function battleTurn(s,b,action,rng=Math.random){
 if(b.result)return {result:b.result,lines:[]};const spec=skills[action];
 if(spec&&s.mp<spec.cost)return {invalid:'集中力が足りない。防御で回復しよう。'};
 if(action==='cure'&&s.hp===maxHp(s)&&s.edHp===maxEd(s))return {invalid:'体力は十分に回復している。'};
 if(action==='stabilize'&&(!b.boss||!b.heard))return {invalid:'まず「声を聴く」で機霊の願いを確かめよう。'};
 if(action==='escape'){if(b.boss)return {invalid:'機霊を置いていくことはできない。'};b.result='escape';return {result:'escape',lines:['安全な場所まで退いた。']};}
 if(!spec&&!['listen','guard','potion','stabilize'].includes(action))return {invalid:'行動を選んでください。'};
 if(action==='potion'&&!heal(s))return {invalid:s.potions<1?'薬草がない。':'体力は十分に回復している。'};
 const lines=[],jitter=()=>Math.floor(rng()*4),atk=13+s.level*3+s.weapon*6;
 const mastery=spec?.track?rank(s,spec.track):1,bonus=1+(mastery-1)*.12;
 let target=b.foes[b.target];if(!target||target.currentHp<=0)target=b.foes.find(e=>e.currentHp>0);b.target=target.index;
 if(spec)s.mp-=spec.cost;
 let power=0,all=false,guarding=action==='guard';
 if(action==='attack'){power=atk+jitter();lines.push('ユリスの剣撃！');}
 if(action==='skill'){power=Math.round(atk*1.85*bonus)+jitter();lines.push('動きを見極め、踏み込んだ！');}
 if(action==='sweep'){power=Math.round(atk*1.05*bonus)+jitter();all=true;lines.push('旋風斬り！ 敵全体を薙ぎ払う。');}
 if(action==='flare'){power=Math.round((22+s.level*4)*bonus)+jitter();all=true;lines.push('霊光の波！ 装甲を越えて響く。');}
 if(action==='cure'){const amount=Math.round((38+s.level*6)*bonus);s.hp=Math.min(maxHp(s),s.hp+amount);s.edHp=Math.min(maxEd(s),s.edHp+amount);lines.push(`癒しの光。二人のHPを最大${amount}回復。`);}
 if(action==='barrier'){b.barrier=3;lines.push('守護の幕！ このターンを含む3ターン、被害を軽減。');}
 if(action==='rally'){b.rally=4;lines.push('勇気の詠唱！ 次の3ターン、攻撃を強化。');}
 if(action==='break'){target.weaken=3;lines.push(`${target.name}を霊鎖で包む。3ターン、攻撃力低下。`);}
 if(action==='listen'){if(b.boss){const gain=b.type==='warden'&&b.heard?0:1;b.heard=true;b.stability+=gain;lines.push(gain?'ノアと手を重ね、願いを聴いた。「流れを……つないで……」 安定度 +1':'願いは届いている。予告を見て霊流を整えよう。');}else{b.focus=2;lines.push('次の2回の攻撃を強化。');}s.mp=Math.min(maxMp(s),s.mp+3);}
 if(action==='guard'){s.mp=Math.min(maxMp(s),s.mp+5);lines.push('二人は身を守った。集中力 +5');}
 if(action==='potion')lines.push('薬草で二人を回復した。');
 if(action==='stabilize'){const gain=stabilizationGain(b);b.stability+=gain;power=18;lines.push(`霊流を整えた。安定度 +${gain}`);}
 if(power){if(b.focus>0){power=Math.round(power*1.5);b.focus--;}if(b.rally>0)power=Math.round(power*(1+supportEffects(s).rally/100));
 for(const e of all?b.foes.filter(e=>e.currentHp>0):[target]){let hit=power;if(currentIntent(b,e)==='guard'&&action!=='flare')hit=Math.round(hit*.55);if(e.boss&&action!=='stabilize')hit=Math.round(hit*.55);e.currentHp=Math.max(0,e.currentHp-hit);lines.push(`${e.name} −${hit}`);}
 if(s.edHp>0&&['attack','skill','sweep'].includes(action)){const assist=5+s.level*2+s.weapon*2;target.currentHp=Math.max(0,target.currentHp-assist);lines.push(`エドの援護 −${assist}`);}}
 if(spec?.track){s.mastery??={};const before=rank(s,spec.track);s.mastery[spec.track]=Math.min(50,(s.mastery[spec.track]||0)+1);if(rank(s,spec.track)>before)lines.push(`${masteryNames[spec.track]}の熟練度が Lv.${rank(s,spec.track)} に！`);}
 b.currentHp=b.foes.reduce((n,e)=>n+e.currentHp,0);
 if(b.boss&&(b.stability>=7||(b.heard&&b.foes[0].currentHp===0))){b.result='win';return {result:'win',lines:[...lines,'機霊の苦しみが静まった。']};}
 if(!b.boss&&b.currentHp===0){b.result='win';return {result:'win',lines};}
 if(b.boss&&b.foes[0].currentHp===0){b.foes[0].currentHp=1;b.currentHp=1;lines.push('力だけでは救えない。「声を聴く」を使おう。');}
 for(const e of b.foes.filter(e=>e.currentHp>0)){const intent=currentIntent(b,e);
 if(intent==='charge')lines.push(`${e.name}が力をためる。`);
 else if(intent==='guard')lines.push(`${e.name}が身を固める。`);
 else{let hit=Math.max(2,e.atk+jitter()-s.armor*3);if(intent==='heavy')hit=Math.round(hit*1.9);if(e.weaken>0)hit=Math.round(hit*(1-supportEffects(s).weaken/100));if(b.barrier>0)hit=Math.round(hit*(1-supportEffects(s).barrier/100));if(guarding)hit=Math.round(hit*.28);hit=Math.max(1,hit);s.hp=Math.max(0,s.hp-hit);if(s.edHp>0)s.edHp=Math.max(0,s.edHp-Math.round(hit*.55));if(intent==='drain')s.mp=Math.max(0,s.mp-2);lines.push(`${e.name}の攻撃 −${hit} HP`);}
 if(e.weaken>0)e.weaken--;}
 if(b.barrier>0)b.barrier--;if(b.rally>0)b.rally--;b.turn++;
 if(s.hp===0){b.result='lose';return {result:'lose',lines:[...lines,'ノアとエドがユリスを安全な場所へ運んだ。']};}return {lines};
}
export function validateSave(v){if(!v||v.version!==VERSION||!['village','forest','mine','ruins','heart','ridge','canal','spire'].includes(v.map))return null;let s=fresh();for(const k of ['x','y','level','xp','gold','potions','hp','mp','edHp','weapon','armor','ore','herbs','steps','played','chapter']){if(!Number.isFinite(v[k])||v[k]<0||v[k]>1e7)return null;s[k]=Math.floor(v[k]);}if(s.level<1||s.level>12||s.x>33||s.y>25||s.weapon>2||s.armor>2||s.chapter>4)return null;for(const k of ['defeated','collected','lore','valves']){if(!Array.isArray(v[k])||v[k].some(a=>typeof a!=='string')||v[k].length>200)return null;s[k]=v[k];}if(!v.flags||typeof v.flags!=='object'||Array.isArray(v.flags))return null;s.flags=Object.fromEntries(Object.entries(v.flags).filter(([k,val])=>/^[a-zA-Z0-9_]+$/.test(k)&&typeof val==='boolean'));s.encounterSteps=Number.isFinite(v.encounterSteps)?Math.max(0,Math.min(28,Math.floor(v.encounterSteps))):0;s.battlesWon=Number.isFinite(v.battlesWon)?Math.max(s.defeated.length,Math.min(1e7,Math.floor(v.battlesWon))):s.defeated.length;s.mastery=Object.fromEntries(Object.keys(masteryNames).map(k=>[k,Number.isFinite(v.mastery?.[k])?Math.max(0,Math.min(50,Math.floor(v.mastery[k]))):0]));s.map=v.map;s.dir=['up','down','left','right'].includes(v.dir)?v.dir:'down';s.hp=Math.min(maxHp(s),s.hp);s.mp=Math.min(maxMp(s),s.mp);s.edHp=Math.min(maxEd(s),s.edHp);return s;}
export function quest(s){
if(s.flags.episode2Done)return {title:'第二話・風の記憶 完',text:'風の中継塔は静かに動き始めた。山の記録を探したり、技の熟練度を育てよう。',items:[['山の機霊と中継塔を救う',true]]};
if(s.flags.episode2)return {title:s.flags.spireSaved?'風の便りを町へ':s.flags.canalOpen?'風の中継塔':s.flags.ridgeKey?'沈黙の水路':'第二話・風の記憶',text:s.flags.spireSaved?'町のヴィクトルに、塔の修復を報告しよう。':s.flags.canalOpen?'水路の北から中継塔へ。暴れる守り手の声を聴き、霊流を整えよう。':s.flags.ridgeKey?'水路の調律盤を「山 → 川 → 空」の順に調整しよう。': '町の西から風見の峠へ。調査員ミラを訪ね、機霊たちの異変を調べよう。',items:[['ミラから中継塔の鍵を受け取る',!!s.flags.ridgeKey],['水路を調律する',!!s.flags.canalOpen],['塔の守り手を救う',!!s.flags.spireSaved]]};
if(s.flags.ending)return {title:'灯りの戻った町',text:'第一話クリア。ヴィクトルに話しかけて第二話「風の記憶」へ進もう。',items:[['機霊を救い、町に帰る',true]]};if(s.flags.bear)return {title:'この灯りを、みんなへ',text:'町へ帰り、広場のヴィクトルに報告しよう。',items:[['熊型機霊の霊流を整える',true],['ヴィクトルに報告',false]]};if(s.flags.gate)return {title:'大地の心臓',text:'最深部で苦しむ機霊を救おう。「声を聴く」が鍵になる。',items:[['三つの予備弁を開く',true],['機霊の願いを聴く',false]]};if(s.flags.pump)return {title:'眠れるものの声',text:'排水された坑道の北、古代遺跡へ。石碑を読み、予備弁を正しい順序で開こう。',items:[['坑道のポンプを修復',true],[`予備弁を開く ${s.valves.length}/3`,s.flags.gate]]};if(s.flags.quest)return {title:'止まったポンプ',text:'森と坑道で霊晶片を3つ集め、坑道入口のドーランへ届けよう。',items:[[ `霊晶片を集める ${s.ore}/3`,s.ore>=3],['ドーランとポンプを修復',false]]};return {title:'雪解けの声',text:'広場のヴィクトルに話しかけよう。ノアは地下から小さな震えを感じている。',items:[['広場で事情を聞く',false]]};}

