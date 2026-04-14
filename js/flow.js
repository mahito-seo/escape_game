// Game Flow - Start, Mob Timer, Reset, Restart
function startGame(){
  // Try to load save
  const hasSave=loadProgress();
  if(!hasSave)startTime=Date.now();
  document.getElementById('title-screen').style.opacity='0';
  setTimeout(()=>{
    document.getElementById('title-screen').style.display='none';
    if(hasSave){dungeon=genDungeon();buildScene();}
    gameState='playing';canvas.requestPointerLock();
    if(hasSave){
      showMessage(`セーブデータをロード！ Stage ${currentCipherStage+1} / Floor ${floor}`,'#ffcc44');
    }else{
      showMessage('暗号の迷宮へようこそ！','#88ffaa');
      showMessage(`1階「${FLOOR_THEMES[0].name}」- 暗号ターミナルを探せ！`,'#00ff41');
    }
    updateHUD();
    startMobTimer();
  },1000);
}

// ═══════════════════════════════════
//  MOB PROGRAMMING ROTATION TIMER
// ═══════════════════════════════════
const MOB_PLAYERS=['Player 1','Player 2','Player 3'];
const MOB_ROTATE_SEC=300; // 5 minutes per driver
let mobCurrentIdx=0, mobTimeLeft=MOB_ROTATE_SEC, mobTimerInt=null, mobActive=false;

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
  mobTimeLeft--;
  if(mobTimeLeft<=0){
    // Rotation!
    mobCurrentIdx=(mobCurrentIdx+1)%MOB_PLAYERS.length;
    mobTimeLeft=MOB_ROTATE_SEC;
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
function showMobBanner(){
  // Fully pause game and show swap screen
  prevStateBeforeSwap=gameState;
  gameState='swap';
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
    // Restore original pause behavior
    ps.querySelector('h1').textContent='⏸ PAUSE';
    ps.querySelector('p').textContent='ESCキーで再開';
    btn.textContent='▶ 再開';
    btn.onclick=()=>togglePause();
    gameState=prevStateBeforeSwap||'playing';
    if(gameState==='playing')canvas.requestPointerLock();
  };
  ps.classList.add('show');
}

function resetToTitle(){
  // Close any open modals
  document.getElementById('battle-modal').classList.remove('open');
  document.getElementById('cipher-modal').classList.remove('open');
  document.getElementById('overlay-screen').classList.remove('show');
  battleActive=false;cipherActive=false;
  clearInterval(battleTimerInt);clearInterval(cipherTimerInt);
  if(agentLockoutTimer)clearInterval(agentLockoutTimer);
  stopMobTimer();
  clearSave();
  document.exitPointerLock();
  // Reset state
  floor=1;currentCipherStage=0;cipherSolved=false;totalStreak=0;battleCooldown=0;escapeCount=0;
  player=mkPlayer();agentWrongCount=0;agentLockoutEnd=0;
  dungeon=genDungeon();buildScene();updateHUD();
  // Show title
  const ts=document.getElementById('title-screen');
  ts.style.display='flex';ts.style.opacity='1';
  gameState='title';
}

function restartGame(){
  document.getElementById('overlay-screen').classList.remove('show');
  floor=1;currentCipherStage=0;cipherSolved=false;totalStreak=0;battleCooldown=0;
  player=mkPlayer();startTime=Date.now();
  dungeon=genDungeon();buildScene();gameState='playing';canvas.requestPointerLock();
  updateHUD();showMessage('再挑戦！','#88ffaa');
}

window.addEventListener('resize',()=>{
  W=window.innerWidth;H=window.innerHeight;
  renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();
  canvas.width=W;canvas.height=H;pCanvas.width=W;pCanvas.height=H;
});

dungeon=genDungeon();buildScene();updateHUD();
requestAnimationFrame(loop);
