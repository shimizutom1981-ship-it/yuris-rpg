const install=document.getElementById('installBtn'),status=document.getElementById('offlineStatus'),panel=document.getElementById('installHelp');
let pending=null;
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
function updateInstall(){install.textContent=standalone()?'✓ アプリで起動中':pending?'↓ インストール':'↓ アプリとして追加';}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();pending=event;updateInstall();});
window.addEventListener('appinstalled',()=>{pending=null;install.textContent='✓ インストール済み';panel.hidden=true;});
install.addEventListener('click',async()=>{
 if(standalone()){panel.hidden=!panel.hidden;return;}
 if(pending){const event=pending;pending=null;try{await event.prompt();const result=await event.userChoice;if(result.outcome==='accepted'){install.textContent='✓ インストール済み';panel.hidden=true;return;}}catch{}updateInstall();}
 panel.hidden=!panel.hidden;
});
updateInstall();
if('serviceWorker' in navigator){
 navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(reg=>{
  const waiting=()=>{if(reg.waiting)status.textContent='更新あり：ゲームを閉じて開き直すと反映';};
  waiting();reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed')waiting();});});
  navigator.serviceWorker.ready.then(()=>{if(!reg.waiting)status.textContent='✓ オフライン準備完了';});
 }).catch(()=>{status.textContent='オフライン準備未完了：通信中に開き直してください';});
}else status.textContent='このブラウザではオンラインで遊べます';
