// Game Flow - Start, Mob Timer, Reset, Restart
function startGame(){
  // DEBUG MODE: 完全に新規データで開始（既存セーブは無視・破壊しない）
  if(window.__debugMode){
    startTime=Date.now();
    // フィールド状態をリセット
    floor=1; currentCipherStage=0; cipherSolved=false;
    if(typeof cipherPhase1Solved!=='undefined') cipherPhase1Solved=false;
    if(typeof escapeCount!=='undefined') escapeCount=0;
    // プレイヤーをデバッグ用にレベル 6 にブースト
    applyDebugPlayerStats();
    document.getElementById('title-screen').style.opacity='0';
    setTimeout(()=>{
      document.getElementById('title-screen').style.display='none';
      dungeon=genDungeon();buildScene();
      actualStart(false);
      showMessage('🐛 DEBUG MODE: Lv.6 でスタート / 全ターミナルを近接配置','#ff44ff');
    },800);
    return;
  }
  const hasSave=loadProgress();
  if(!hasSave)startTime=Date.now();
  document.getElementById('title-screen').style.opacity='0';
  setTimeout(()=>{
    document.getElementById('title-screen').style.display='none';
    if(hasSave){
      // Saved game: skip tutorial, start immediately
      dungeon=genDungeon();buildScene();
      actualStart(true);
    }else{
      // New game: show tutorial first
      document.getElementById('tutorial-screen').classList.add('show');
    }
  },1000);
}

// DEBUG: Lv.6 相当の初期ステータスを付与（通常レベルアップ式と同じ加算）
function applyDebugPlayerStats(){
  player.level=6;
  player.xp=0; player.xpNext=Math.ceil(100*Math.pow(1.5,5));
  // 5 回分のレベルアップ加算
  player.maxHp = 100 + 5*20;  player.hp = player.maxHp;
  player.maxMp = 50  + 5*10;  player.mp = player.maxMp;
  player.attackPower = 22 + 5*8;
  player.defense     = 5  + 5*2;
  player.kills = 0;
}

function closeTutorial(){
  document.getElementById('tutorial-screen').classList.remove('show');
  actualStart(false);
}

function actualStart(hasSave){
  gameState='playing';canvas.requestPointerLock();
  if(hasSave){
    showMessage(`セーブデータをロード！ Stage ${currentCipherStage+1} / Floor ${floor}`,'#ffcc44');
  }else{
    showMessage('\u26A0 \u30B9\u30AD\u30EB\u30B7\u30B9\u30C6\u30E0\u304C\u5168\u505C\u6B62\uFF01','#ff4444');
    showMessage('\uD83D\uDD27 \u4FEE\u7406\u30BF\u30FC\u30DF\u30CA\u30EB\u3092\u63A2\u3057\u3066Python\u3067\u4FEE\u7406\u305B\u3088\uFF01','#ffcc00');
    showMessage(`1\u968E\u300C${FLOOR_THEMES[0].name}\u300D\u2014 \u4FEE\u7406\u30BF\u30FC\u30DF\u30CA\u30EB\u3092\u63A2\u305D\u3046`,'#00ff41');
  }
  updateHUD();updateSkillsHUD();
  if(typeof updateInventoryHUD==='function')updateInventoryHUD();
  startMobTimer();
  startBGM(floor);
}

// ═══════════════════════════════════
//  MOB PROGRAMMING ROTATION TIMER
// ═══════════════════════════════════
const MOB_PLAYERS=['Player 1','Player 2','Player 3'];
const MOB_ROTATE_SEC=300; // 5 minutes per driver
let mobCurrentIdx=0, mobTimeLeft=MOB_ROTATE_SEC, mobTimerInt=null, mobActive=false, mobTotalRotations=0;

function startMobTimer(){
  mobActive=true; mobCurrentIdx=0; mobTimeLeft=MOB_ROTATE_SEC;
  document.getElementById('mob-timer').classList.add('active');
  updateMobDisplay();
  mobTimerInt=setInterval(tickMob,1000);
}
function stopMobTimer(){
  mobActive=false;
  clearInterval(mobTimerInt);
  document.getElementById('mob-timer').classList.remove('active');
}
function tickMob(){
  // Don't count down during pause, swap, death, battle, cipher, or cinematic
  if(gameState==='paused'||gameState==='swap'||gameState==='dead'||gameState==='battle'||gameState==='cipher'||gameState==='cinematic')return;
  mobTimeLeft--;
  if(mobTimeLeft<=0){
    mobCurrentIdx=(mobCurrentIdx+1)%MOB_PLAYERS.length;
    mobTimeLeft=MOB_ROTATE_SEC;
    mobTotalRotations++;
    // 2周目完了(6回交代)で休憩リマインダー、以降3周ごと
    if(mobTotalRotations>0&&mobTotalRotations%(MOB_PLAYERS.length*2)===0){
      showBreakReminder();
    }
    showMobBanner();
  }
  updateMobDisplay();
}
function updateMobDisplay(){
  const m=Math.floor(mobTimeLeft/60),s=mobTimeLeft%60;
  document.getElementById('mob-driver').textContent=MOB_PLAYERS[mobCurrentIdx];
  const cdEl=document.getElementById('mob-countdown');
  cdEl.textContent=`${m}:${String(s).padStart(2,'0')}`;
  cdEl.className=mobTimeLeft<=30?'mob-countdown warn':'mob-countdown';
  document.getElementById('mob-next').textContent=`次: ${MOB_PLAYERS[(mobCurrentIdx+1)%MOB_PLAYERS.length]}`;
}
let prevStateBeforeSwap=null;
let swapStartedAt=0;
function showMobBanner(){
  prevStateBeforeSwap=gameState;
  gameState='swap';
  swapStartedAt=Date.now();
  document.exitPointerLock();
  playSound('swap');
  // Show swap overlay using pause screen
  const ps=document.getElementById('pause-screen');
  ps.querySelector('h1').textContent='🔄 DRIVER交代！';
  ps.querySelector('p').textContent=`${MOB_PLAYERS[mobCurrentIdx]} の番です！ キーボード・マウスを交代してください`;
  const btn=ps.querySelector('.pause-btn');
  btn.textContent='✅ 交代完了';
  btn.onclick=()=>{
    ps.classList.remove('show');
    totalPausedMs+=Date.now()-swapStartedAt; // don't count swap time
    ps.querySelector('h1').textContent='⏸ PAUSE';
    ps.querySelector('p').textContent='ESCキーで再開';
    btn.textContent='▶ 再開';
    btn.onclick=()=>togglePause();
    gameState=prevStateBeforeSwap||'playing';
    if(gameState==='playing')canvas.requestPointerLock();
  };
  ps.classList.add('show');
}

function showBreakReminder(){
  var el=document.createElement('div');
  el.style.cssText='position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:300;background:linear-gradient(135deg,rgba(0,80,40,.95),rgba(0,40,20,.95));border:2px solid #44ffaa;border-radius:8px;padding:16px 32px;text-align:center;pointer-events:none;animation:msgFade 10s ease forwards;';
  el.innerHTML='<div style="font-size:18px;color:#44ffaa;margin-bottom:6px;">\u2615 \u4F11\u61A9\u306F\u3068\u3063\u3066\u3044\u307E\u3059\u304B\uFF1F</div><div style="font-size:13px;color:#88ccaa;">ESC\u3092\u62BC\u3057\u3066\u3044\u3064\u3067\u3082\u4F11\u61A9\u3067\u304D\u307E\u3059\uFF01</div>';
  document.body.appendChild(el);
  setTimeout(function(){el.remove();},10000);
}

function pauseSave(){
  saveProgress();
  var p=document.getElementById('pause-screen');
  var msg=document.createElement('div');
  msg.textContent='\u2705 \u30BB\u30FC\u30D6\u3057\u307E\u3057\u305F\uFF01';
  msg.style.cssText='color:#88ffaa;font-size:14px;letter-spacing:2px;margin-top:8px;animation:fadeIn .3s ease;';
  p.appendChild(msg);
  setTimeout(function(){msg.remove();},2000);
}

// pause 画面の「🔌 サーバー再接続」ボタンから呼ぶ。
// 接続が予期せず切れた場合のリカバリー用。
function reconnectFromPause(){
  var statusEl=document.getElementById('pause-reconnect-status');
  if(statusEl)statusEl.textContent='🔄 再接続中...';
  if(statusEl)statusEl.style.color='#ffcc88';
  // tracker.js が無効なら何もしない
  if(typeof window.reconnectTracker!=='function'){
    if(statusEl){statusEl.textContent='⚠ 接続設定が未登録です（タイトル画面で 📡 進捗共有を設定）';statusEl.style.color='#ffaa44';}
    return;
  }
  // 設定が空ならその旨を伝える
  try{
    var cfg=JSON.parse(localStorage.getItem('cipherDungeonTracker')||'{}');
    if(!cfg.url||!cfg.teamName){
      if(statusEl){statusEl.textContent='⚠ 設定が未登録です（タイトル画面で 📡 進捗共有を設定）';statusEl.style.color='#ffaa44';}
      return;
    }
  }catch(e){}
  window.reconnectTracker();
  // 1.2秒後に成功/失敗を表示
  setTimeout(function(){
    var fail=(typeof lastUploadFail!=='undefined')?lastUploadFail:false;
    if(statusEl){
      if(fail){statusEl.textContent='❌ 再接続失敗（URL やネットワークを確認）';statusEl.style.color='#ff8844';}
      else{statusEl.textContent='✅ 再接続成功（直近の状態をサーバーへ送信しました）';statusEl.style.color='#88ffaa';}
    }
    setTimeout(function(){if(statusEl)statusEl.textContent='';},4000);
  },1200);
}

var tutFromPause=false;
function openTutorialFromPause(){
  document.getElementById('pause-screen').classList.remove('show');
  document.getElementById('tutorial-screen').classList.add('show');
  tutFromPause=true;
  tutCurrentPage=0;tutPage(0);
}

function resetToTitle(){
  // Close any open modals — including newer ones for items / robot arena / briefing
  document.getElementById('battle-modal').classList.remove('open');
  document.getElementById('cipher-modal').classList.remove('open');
  document.getElementById('overlay-screen').classList.remove('show');
  ['item-picker-modal','robot-arena-modal','prebattle-modal','ram-action-confirm','boss-victory-banner'].forEach(function(id){
    var el=document.getElementById(id); if(!el) return;
    el.classList.remove('open');
    el.classList.remove('show');
  });
  battleActive=false;cipherActive=false;
  if(typeof itemActive!=='undefined') itemActive=false;
  if(typeof robotBattleActive!=='undefined') robotBattleActive=false;
  if(typeof robotBattleEnded!=='undefined') robotBattleEnded=true;
  clearInterval(battleTimerInt);clearInterval(cipherTimerInt);
  if(agentLockoutTimer)clearInterval(agentLockoutTimer);
  if(deathTimerInt){clearInterval(deathTimerInt);deathTimerInt=null;}
  stopMobTimer();stopBGM();
  clearSave();
  document.exitPointerLock();
  // Reset state
  floor=1;currentCipherStage=0;cipherSolved=false;totalStreak=0;battleCooldown=0;escapeCount=0;
  player=mkPlayer();agentWrongCount=0;agentLockoutEnd=0;cipherPhase1Solved=false;
  clearFeatures();
  if(typeof clearInventory==='function') clearInventory();
  if(typeof robotAssembledHUD!=='undefined') robotAssembledHUD=false;
  if(typeof cinematicActive!=='undefined') cinematicActive=false;
  document.body.classList.remove('all-cleared');
  dungeon=genDungeon();buildScene();updateHUD();updateSkillsHUD();
  if(typeof updateInventoryHUD==='function') updateInventoryHUD();
  // Show title
  const ts=document.getElementById('title-screen');
  ts.style.display='flex';ts.style.opacity='1';
  gameState='title';
}

function restartGame(){
  document.getElementById('overlay-screen').classList.remove('show');
  if(deathTimerInt){clearInterval(deathTimerInt);deathTimerInt=null;}
  floor=1;currentCipherStage=0;cipherSolved=false;cipherPhase1Solved=false;totalStreak=0;battleCooldown=0;
  player=mkPlayer();startTime=Date.now();
  clearFeatures();
  dungeon=genDungeon();buildScene();gameState='playing';canvas.requestPointerLock();
  updateHUD();updateSkillsHUD();showMessage('再挑戦！','#88ffaa');
}

window.addEventListener('resize',()=>{
  W=window.innerWidth;H=window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();
  // Only the 2D particle canvas needs manual size updates — leave the WebGL
  // canvas alone so renderer.setSize keeps its pixelRatio-aware drawing buffer.
  pCanvas.width=W;pCanvas.height=H;
});

dungeon=genDungeon();buildScene();updateHUD();
requestAnimationFrame(loop);
