// Game Flow - Start, Mob Timer, Reset, Restart
function startGame(){
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
  // Don't count down during pause, swap, death, battle, or cipher
  if(gameState==='paused'||gameState==='swap'||gameState==='dead'||gameState==='battle'||gameState==='cipher')return;
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

function resetToTitle(){
  // Close any open modals
  document.getElementById('battle-modal').classList.remove('open');
  document.getElementById('cipher-modal').classList.remove('open');
  document.getElementById('overlay-screen').classList.remove('show');
  battleActive=false;cipherActive=false;
  clearInterval(battleTimerInt);clearInterval(cipherTimerInt);
  if(agentLockoutTimer)clearInterval(agentLockoutTimer);
  if(deathTimerInt){clearInterval(deathTimerInt);deathTimerInt=null;}
  stopMobTimer();stopBGM();
  clearSave();
  document.exitPointerLock();
  // Reset state
  floor=1;currentCipherStage=0;cipherSolved=false;totalStreak=0;battleCooldown=0;escapeCount=0;
  player=mkPlayer();agentWrongCount=0;agentLockoutEnd=0;
  clearFeatures();
  dungeon=genDungeon();buildScene();updateHUD();updateSkillsHUD();
  // Show title
  const ts=document.getElementById('title-screen');
  ts.style.display='flex';ts.style.opacity='1';
  gameState='title';
}

function restartGame(){
  document.getElementById('overlay-screen').classList.remove('show');
  if(deathTimerInt){clearInterval(deathTimerInt);deathTimerInt=null;}
  floor=1;currentCipherStage=0;cipherSolved=false;totalStreak=0;battleCooldown=0;
  player=mkPlayer();startTime=Date.now();
  clearFeatures();
  dungeon=genDungeon();buildScene();gameState='playing';canvas.requestPointerLock();
  updateHUD();updateSkillsHUD();showMessage('再挑戦！','#88ffaa');
}

window.addEventListener('resize',()=>{
  W=window.innerWidth;H=window.innerHeight;
  renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();
  canvas.width=W;canvas.height=H;pCanvas.width=W;pCanvas.height=H;
});

dungeon=genDungeon();buildScene();updateHUD();
requestAnimationFrame(loop);
