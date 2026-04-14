// Death Penalty & Game Over
const DEATH_PENALTY_SEC=300; // 5 minutes
let deathTimerInt=null;
let deathStartedAt=0;

function gameOver(){
  // Clear any existing death timer
  if(deathTimerInt){clearInterval(deathTimerInt);deathTimerInt=null;}

  gameState='dead';
  deathStartedAt=Date.now();
  document.exitPointerLock();
  playSound('wrong');

  document.getElementById('overlay-title').textContent='☠ DEAD';
  document.getElementById('overlay-title').style.color='#cc2222';
  document.getElementById('overlay-btn').style.display='none';

  const endTime=Date.now()+DEATH_PENALTY_SEC*1000;

  function updateDeathTimer(){
    const remaining=Math.max(0,Math.ceil((endTime-Date.now())/1000));
    const m=Math.floor(remaining/60);
    const s=remaining%60;
    document.getElementById('overlay-sub').innerHTML=
      `<span style="font-size:14px;">Floor ${floor} | Lv.${player.level} | ${player.kills}体撃破 | Stage ${Math.min(currentCipherStage+1,CIPHER_STAGES.length)}/${CIPHER_STAGES.length}</span><br><br>`+
      `<span style="color:#ff4444;font-size:16px;">☕ 休憩タイム：5分間の強制休憩です</span><br>`+
      `<span style="font-size:48px;font-family:'Cinzel Decorative',serif;color:#ffcc00;text-shadow:0 0 15px rgba(255,200,0,.5);">${m}:${String(s).padStart(2,'0')}</span><br><br>`+
      `<span style="color:#aaa;font-size:14px;">HPが0になりました。<br>少し休憩して、リフレッシュしましょう！<br>復活後はスポーン地点に戻ります。</span>`;

    if(remaining<=0){
      clearInterval(deathTimerInt);deathTimerInt=null;
      // Add death time to paused time (don't count toward score)
      totalPausedMs+=Date.now()-deathStartedAt;
      // Revive
      player.hp=~~(player.maxHp*.5);player.mp=~~(player.maxMp*.5);
      player.xp=Math.max(0,player.xp-~~(player.xpNext*.2));
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
  }

  updateDeathTimer();
  document.getElementById('overlay-screen').classList.add('show');
  deathTimerInt=setInterval(updateDeathTimer,1000);
}
