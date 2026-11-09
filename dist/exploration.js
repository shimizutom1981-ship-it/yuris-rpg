// Original Norvik vignette. Uses flags only, preserving version-1 saves.
export const people={
 victor:{name:'ヴィクトル',topics:[['町の暮らし','鉱石だけでは町は動きません。パンを焼く人も、道を照らす人も必要です。'],['消えた街灯','南の街灯が消えています。宿に予備の巻線があるはずですが、まず持ち主に聞いてください。']]},
 inn:{name:'宿の人',topics:[['宿の仕事','帰ってきた人が、いつもの椅子に座れる。それがいちばんうれしいね。'],['消えた街灯','うちの予備の巻線を貸すよ。南の作業台で配線を確認してから使ってね。','lampBorrowed']]},
 smith:{name:'リネア',topics:[['工房の仕事','新しい物を作るだけじゃない。古い物の使い道を見つけるのも、工房の仕事。'],['消えた街灯','南の資材箱には廃材があるよ。使っていい。作業台の図面を見れば、巻線を作れるはず。']]},
 finn:{name:'フィン',topics:[['町の遊び','明るい道の石だけ踏んで帰るんだ。街灯が消えてから、最後の一歩がなくなっちゃった。'],['消えた街灯','南の街灯だよ。直ったら、もう一回道を歩きたいな。']]},
 oscar:{name:'オスカー',topics:[['見回り','強い敵を倒すより、誰も困らず家に帰れるほうがいい。'],['消えた街灯','頼まれる前に気づく人もいる。解決する順番は、君が決めていいんだ。']]}
};
export function topics(s,id){return (people[id]?.topics||[]).map(([label,line,flag])=>({label,line:s.flags.lampFixed&&label==='消えた街灯'?'南の道が明るくなったね。今夜は安心して歩けそうだ。':line,flag:s.flags.lampFixed?null:flag}));}
export function hearTopic(s,id,index){const t=topics(s,id)[index];if(!t)return null;if(t.flag)s.flags[t.flag]=true;if(t.label==='消えた街灯')s.flags.lampKnown=true;return t.line;}
export function options(s,id){switch(id){case 'townNotice':return [['read','掲示を読む']];case 'worktable':return [['study','図面を調べる'],...(!s.flags.lampCoil&&s.flags.lampScrap&&s.flags.lampPlan?[['craft','廃材から巻線を作る']]:[])];case 'scrapbox':return s.flags.lampScrap?[['inspect','箱を調べる']]:[['salvage','使用許可のある廃材を取る']];case 'southlamp':return s.flags.lampFixed?[['toggle',s.flags.lampDark?'灯りをつける':'灯りを消して確かめる']]:[['inspect','故障を調べる'],...(s.flags.lampPlan&&s.flags.lampBorrowed?[['borrow','借りた巻線で直す']]:[]),...(s.flags.lampPlan&&s.flags.lampCoil?[['crafted','作った巻線で直す']]:[])];default:return [];}}
export function actOnWorld(s,id,action){if(!options(s,id).some(([a])=>a===action))return '今はその操作をできない。';
 if(action==='read'){s.flags.lampKnown=true;return '町の掲示：南の街灯が故障中。宿に予備部品、工房の南に作業台と自由に使える廃材があります。手伝いは任意です。';}
 if(action==='study'){s.flags.lampPlan=true;return '配線図を記録した。巻線を交換すれば直る。宿で借りるか、廃材から作るか。どちらでもよさそうだ。';}
 if(action==='salvage'){s.flags.lampScrap=true;return '「使ってよい廃材」と書かれた箱から銅線を受け取った。作業台の図面と組み合わせられそうだ。';}
 if(action==='craft'){s.flags.lampCoil=true;return 'エドと図面を確かめ、廃材から巻線を作った。南の街灯へ持っていこう。';}
 if(action==='borrow'||action==='crafted'){s.flags.lampFixed=true;s.flags.lampDark=false;s.flags[action==='borrow'?'lampUsedLoan':'lampUsedCraft']=true;s.gold+=15;return '街灯に暖かな光が戻った。ノア「マスター。帰り道が、一本つながったね。」町の修繕費として銀貨15枚を受け取った。灯りは調べて切り替えられる。';}
 if(action==='toggle'){s.flags.lampDark=!s.flags.lampDark;return s.flags.lampDark?'点検のため灯りを消した。もう一度調べればつけられる。':'街灯をつけた。南の道に暖かな光が広がる。';}
 return id==='southlamp'?'巻線が切れている。作業台の図面と交換用の巻線があれば直せる。':'必要な廃材はもう受け取った。箱の残りは町の人のために置いておこう。';
}
export function explorationNote(s){return s.flags.lampFixed?`✓ 南の街灯：${s.flags.lampUsedLoan?'宿で借りた':'廃材から作った'}巻線で修繕。${s.flags.lampDark?'点検で消灯中。':'点灯中。'}`:s.flags.lampKnown||s.flags.lampPlan||s.flags.lampScrap?'◇ 南の街灯：作業台で図面を調べ、宿で巻線を借りるか、廃材から作って修繕。戦闘は不要。':'◇ 町の寄り道：南の掲示や作業台を調べ、人の近くで「話題」を選んでみよう。';}
