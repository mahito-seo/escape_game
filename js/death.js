// Death Penalty & Game Over
const DEATH_PENALTY_SEC=300; // 5 minutes
let deathTimerInt=null;
function gameOver(){
  gameState='dead';document.exitPointerLock();playSound('wrong');
  document.getElementById('overlay-title').textContent='☠ DEAD';
  document.getElementById('overlay-title').style.color='#cc2222';
  document.getElementById('overlay-btn').style.display='none';
  let deathTimeLeft=DEATH_PENALTY_SEC;
  function updateDeathTimer(){
    const m=Math.floor(deathTimeLeft/60),s=deathTimeLeft%60;
    document.getElementById('overlay-sub').innerHTML=
      `<span style="font-size:14px;">Floor ${floor} | Lv.${player.level} | ${player.kills}体撃破 | Stage ${currentCipherStage+1}/5</span><br><br>`+
      `<span style="color:#ff4444;font-size:16px;">☕ 休憩タイム：5分間の強制休憩です</span><br>`+
      `<span style="font-size:42px;color:#ffcc00;">${m}:${String(s).padStart(2,'0')}</span><br><br>`+
      `<span style="color:#aaa;font-size:14px;">HPが0になりました。<br>少し休憩して、リフレッシュしましょう！<br>復活後はスポーン地点に戻ります。</span>`;
  }
  updateDeathTimer();
  document.getElementById('overlay-screen').classList.add('show');
  deathTimerInt=setInterval(()=>{
    deathTimeLeft--;updateDeathTimer();
    if(deathTimeLeft<=0){
      clearInterval(deathTimerInt);deathTimerInt=null;
      // Revive with partial HP, respawn at start
      player.hp=~~(player.maxHp*.5);player.mp=~~(player.maxMp*.5);
      player.xp=Math.max(0,player.xp-~~(player.xpNext*.2));
      // Move to spawn room
      const r0=dungeon.rooms[0];
      player.x=(r0.x+~~(r0.w/2))*TILE;player.z=(r0.y+~~(r0.h/2))*TILE;
      player.yaw=0;player.pitch=0;
      camera.position.set(player.x,1.2,player.z);
      document.getElementById('overlay-title').textContent='🔄 復活！';
      document.getElementById('overlay-title').style.color='#44ff88';
      document.getElementById('overlay-sub').innerHTML=
        `HP 50% / MP 50% で復活しました。<br>XP -20% のペナルティ。<br>スポーン地点に戻りました。<br><br>気を取り直して先に進みましょう！`;
      document.getElementById('overlay-btn').style.display='inline-block';
      document.getElementById('overlay-btn').textContent='続行する';
      document.getElementById('overlay-btn').onclick=()=>{
        document.getElementById('overlay-screen').classList.remove('show');
        document.getElementById('overlay-btn').onclick=restartGame;
        gameState='playing';canvas.requestPointerLock();
        updateHUD();showMessage('復活！ スポーン地点から再出発！','#44ff88');playSound('levelup');
      };
    }
  },1000);
}

