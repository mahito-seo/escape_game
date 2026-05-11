// Game Loop, Input, Pause System

// Cache DOM elements (avoid getElementById every frame)
const _elApproach=document.getElementById('approach-indicator');
const _elApproachText=document.getElementById('approach-text');
const _elApproachRing=document.querySelector('.approach-ring');
const _elMinimap=document.getElementById('minimap');
const _elMinimapCD=document.getElementById('minimap-countdown');

function updateCDs(dt){
  player.skills.forEach((s,i)=>{
    if(s.cd>0)s.cd=Math.max(0,s.cd-dt);
    const slot=document.getElementById('skills-hud').children[i];
    let cdEl=slot.querySelector('.skill-cooldown');
    if(s.cd>0){if(!cdEl){cdEl=document.createElement('div');cdEl.className='skill-cooldown';slot.appendChild(cdEl);}cdEl.textContent=s.cd.toFixed(1);}
    else{if(cdEl)cdEl.remove();}
  });
}

function updateTorches(t){for(const tc of torches){
  if(tc.light)tc.light.intensity=tc.base+Math.sin(t*3+tc.base)*.4;
  tc.flame.scale.y=1+Math.cos(t*5)*.3;
}}

let lastTime=0;
let hudThrottle=0; // only update HUD every 5 frames
function loop(ts){
  requestAnimationFrame(loop);
  if(gameState!=='playing')return;
  const dt=Math.min((ts-lastTime)/1000,.05);lastTime=ts;

  // ── 視点回転: マウス（dx/dy）と矢印キーの両方で操作可
  player.yaw-=mouse.dx*MOUSE_SENSITIVITY;
  player.pitch=Math.max(-Math.PI/3,Math.min(Math.PI/3,player.pitch-mouse.dy*MOUSE_SENSITIVITY));
  mouse.dx=0;mouse.dy=0;
  // Arrow keys: 視点を一定速度で回す（マウスが効かない/使いたくない時用）
  var ARROW_YAW_SPEED=1.0;   // rad/秒（左右）
  var ARROW_PITCH_SPEED=0.7; // rad/秒（上下、ややゆっくり）
  if(keys['ArrowLeft'])  player.yaw+=ARROW_YAW_SPEED*dt;
  if(keys['ArrowRight']) player.yaw-=ARROW_YAW_SPEED*dt;
  if(keys['ArrowUp'])    player.pitch=Math.min(Math.PI/3, player.pitch+ARROW_PITCH_SPEED*dt);
  if(keys['ArrowDown'])  player.pitch=Math.max(-Math.PI/3, player.pitch-ARROW_PITCH_SPEED*dt);

  const spd=player.speed*(1+(player.level-1)*.12);
  let mx=0,mz=0;
  const fwd=player.yaw+Math.PI;
  // 移動は WASD のみ。矢印キーは視点回転に振り直し。
  if(keys['KeyW']){mx+=Math.sin(fwd)*spd;mz+=Math.cos(fwd)*spd;}
  if(keys['KeyS']){mx-=Math.sin(fwd)*spd;mz-=Math.cos(fwd)*spd;}
  if(keys['KeyA']){mx+=Math.cos(fwd)*spd;mz-=Math.sin(fwd)*spd;} // right
  if(keys['KeyD']){mx-=Math.cos(fwd)*spd;mz+=Math.sin(fwd)*spd;} // left
  const nx=player.x+mx,nz=player.z+mz;
  if(!isWall(nx+(mx>0?.4:-.4),player.z))player.x=nx;
  if(!isWall(player.x,nz+(mz>0?.4:-.4)))player.z=nz;

  camera.position.set(player.x,1.2,player.z);
  camera.rotation.order='YXZ';camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;camera.rotation.z=0;

  player.mp=Math.min(player.maxMp,player.mp+dt*1);
  updateEnemies(dt);updateProjectiles();checkTerminal();checkRepairTerminals();checkBoss();updateBossProjectiles();checkItems();checkStair();updateCDs(dt);

  // Animate torches every other frame
  if(ts%2<1){updateTorches(ts/1000);updateRepairTerminals(ts);}

  // Animate terminal (only if nearby)
  if(terminalMesh&&!cipherSolved){
    const tdx=terminalX-player.x,tdz=terminalZ-player.z;
    if(tdx*tdx+tdz*tdz<400){ // only animate if within ~20 tiles
      terminalMesh.children.forEach((c,i)=>{if(i>=3)return;c.position.y=1.5+Math.sin(ts/1000*2+i*2)*.2;c.rotation.y+=dt*(1+i*.5);});
      if(terminalGlow)terminalGlow.scale.setScalar(1+Math.sin(ts/500)*.3);
      if(terminalLight)terminalLight.intensity=3+Math.sin(ts/400)*.8;
    }
  }
  if(stairMesh)stairMesh.rotation.y+=dt*.3;

  // Approach indicator (cached DOM)
  if(approachTarget&&!battleActive&&!cipherActive&&!repairActive){
    _elApproach.classList.add('show');
    if(approachTarget==='terminal'){_elApproachText.textContent='🔓 DECRYPT!';_elApproachRing.style.borderColor='rgba(0,255,65,.8)';}
    else if(approachTarget&&approachTarget.type==='repair'){_elApproachText.textContent=approachTarget.icon+' '+approachTarget.name;_elApproachRing.style.borderColor='rgba(255,200,0,.8)';}
    else{_elApproachText.textContent='⚔ BATTLE!';_elApproachRing.style.borderColor='rgba(255,100,0,.8)';}
  }else _elApproach.classList.remove('show');

  // Item animation (skip far items)
  const t=ts/1000;
  for(const it of items){
    if(it.collected||!it.mesh)continue;
    const dx=it.x-player.x,dz=it.z-player.z;
    if(dx*dx+dz*dz<600){it.mesh.position.y=.4+Math.sin(t*2+it.x)*.15;it.mesh.rotation.y+=dt;}
  }

  // HUD: update every 5 frames instead of every frame
  if(++hudThrottle>=5){hudThrottle=0;updateHUD();}

  // Minimap only visible during reveal
  if(minimapRevealEnd>0){
    _elMinimap.style.display='block';
    drawMinimap();
    const rem=Math.max(0,Math.ceil((minimapRevealEnd-Date.now())/1000));
    _elMinimapCD.textContent=rem+'s';
    if(Date.now()>=minimapRevealEnd){minimapRevealEnd=0;_elMinimap.style.display='none';}
  }

  pCtx.clearRect(0,0,W,H);drawParticles();
  renderer.render(scene,camera);
}

let minimapRevealEnd=0;
let minimapCooldownEnd=0;
const MINIMAP_COST=40; // MP cost
const MINIMAP_DURATION=5000; // 5s display
const MINIMAP_COOLDOWN=60000; // 1 min cooldown
function revealMinimap(){
  if(features.minimap<=0){showMessage('🔒 ミニマップは修理が必要！','#ff4444');return;}
  if(Date.now()<minimapCooldownEnd){
    const rem=Math.ceil((minimapCooldownEnd-Date.now())/1000);
    showMessage(`🗺️ クールダウン中… あと${rem}秒`,'#ff8888');return;
  }
  if(player.mp<MINIMAP_COST){showMessage('MPが不足！(30MP必要)','#ff8888');return;}
  player.mp-=MINIMAP_COST;
  const dur=[0,3000,5000,8000][features.minimap]||MINIMAP_DURATION;
  minimapRevealEnd=Date.now()+dur;
  minimapCooldownEnd=Date.now()+MINIMAP_COOLDOWN;
  _elMinimap.style.display='block';
  showMessage(`\uD83D\uDDFA\uFE0F \u30DE\u30C3\u30D7\u8868\u793A\uFF01(${dur/1000}\u79D2\u9593)`,'#66ccff');playSound('pickup');
  updateHUD();
}

let prevStateBeforePause=null;
let pauseStartedAt=0;
let totalPausedMs=0;
function togglePause(){
  if(gameState==='paused'){
    totalPausedMs+=Date.now()-pauseStartedAt;
    gameState=prevStateBeforePause||'playing';
    document.getElementById('pause-screen').classList.remove('show');
    if(gameState==='playing')canvas.requestPointerLock();
  }else if(gameState==='playing'){
    pauseStartedAt=Date.now();
    prevStateBeforePause=gameState;
    gameState='paused';
    document.exitPointerLock();
    document.getElementById('pause-screen').classList.add('show');
  }
}
document.addEventListener('keydown',e=>{
  keys[e.code]=true;
  // ゲーム中は矢印キーやスペースのデフォルト動作（ページスクロール）を抑止
  if(gameState==='playing'){
    if(e.code==='ArrowUp'||e.code==='ArrowDown'||e.code==='ArrowLeft'||e.code==='ArrowRight'||e.code==='Space'){
      e.preventDefault();
    }
  }
  if(e.code==='Escape'){
    if(gameState==='playing'||gameState==='paused'){togglePause();e.preventDefault();return;}
  }
  // DEBUG: Ctrl+Shift+L = skip floor / instant win in battle (TODO: remove later)
  if((e.metaKey||e.ctrlKey)&&e.shiftKey&&e.code==='KeyL'){
    e.preventDefault();
    if(gameState==='battle'){
      // Instant win
      stopBattleTimer();if(battleEnemy)killEnemy(battleEnemy);
      closeBattle();showMessage('⏩ DEBUG: 即勝利','#ff00ff');
      return;
    }
    if(gameState==='cipher'){
      // Boss active? Kill boss
      if(bossEntity&&!bossEntity.defeated){
        bossEntity.hp=0;bossEntity.defeated=true;scene.remove(bossEntity.mesh);
        for(var bi=0;bi<bossProjectiles.length;bi++)scene.remove(bossProjectiles[bi].mesh);
        bossProjectiles=[];
        closeBossModal();unlockPortal();
        showMessage('\u23E9 DEBUG: \u30DC\u30B9\u30B9\u30AD\u30C3\u30D7','#ff00ff');updateHUD();
        return;
      }
      // Close cipher and mark solved
      cipherSolved=true;closeCipherModal();
      if(stairMesh){scene.remove(stairMesh);if(stairLight)scene.remove(stairLight);}
      if(terminalMesh){scene.remove(terminalMesh);terminalMesh=null;}
      if(terminalLight){scene.remove(terminalLight);terminalLight=null;}
      if(terminalGlow){scene.remove(terminalGlow);terminalGlow=null;}
      showMessage('\u23E9 DEBUG: \u6697\u53F7\u30B9\u30AD\u30C3\u30D7','#ff00ff');updateHUD();
      return;
    }
    if(gameState==='playing'){
      // Extra stage (floor 6+): spawn boss or finish
      if(floor>=6&&currentCipherStage>=5){
        if(!bossEntity||bossEntity.defeated){
          // Boss already dead or not spawned yet → spawn
          spawnBoss();startBossBGM();
          showMessage('\u23E9 DEBUG: \u30DC\u30B9\u51FA\u73FE','#ff00ff');
        }else{
          // Boss alive → kill and true ending
          bossEntity.hp=0;bossEntity.defeated=true;scene.remove(bossEntity.mesh);
          for(var bi=0;bi<bossProjectiles.length;bi++)scene.remove(bossProjectiles[bi].mesh);
          bossProjectiles=[];
          currentCipherStage=6;gameComplete();
          showMessage('\u23E9 DEBUG: TRUE ENDING','#ff00ff');
        }
        return;
      }
      // Stage 5 clear → normal ending
      if(currentCipherStage>=4){
        currentCipherStage=5;gameComplete();
        showMessage('\u23E9 DEBUG: \u30AF\u30EA\u30A2','#ff00ff');
        return;
      }
      // Normal: skip to next floor
      currentCipherStage++;floor++;cipherSolved=false;escapeCount=0;
      dungeon=genDungeon();buildScene();
      player.hp=player.maxHp;player.mp=player.maxMp;
      updateHUD();showMessage(`\u23E9 DEBUG: Floor ${floor} \u3078\u30B9\u30AD\u30C3\u30D7`,'#ff00ff');
      startBGM(floor);saveProgress();
      return;
    }
  }
  if(gameState==='playing'){if(e.code==='Digit2')useSkill(0);if(e.code==='Digit3')useSkill(1);if(e.code==='Digit4')useSkill(2);if(e.code==='Digit5')revealMinimap();}
  if(gameState!=='battle'&&gameState!=='cipher')e.preventDefault();
});
document.addEventListener('keyup',e=>keys[e.code]=false);
// Clear stuck keys when window loses focus (Mac alt-tab can drop keyup events)
window.addEventListener('blur',()=>{for(var k in keys)keys[k]=false;});
// ── OS detection: Windows precision touchpads / high-DPI mice report larger
// jittery deltas than Mac, so the dead zone has to be bigger or the player
// silently rotates while pressing W and ends up walking diagonally.
var IS_WINDOWS=/Win(dows|32|64)/i.test(navigator.userAgent)||/^Win/.test(navigator.platform||'');
var IS_MAC=/Mac/i.test(navigator.platform||navigator.userAgent);
// Windows reports persistent ~5-12px micro-deltas from precision touchpads /
// high-DPI mice that silently drift yaw. The dead zone needs to be aggressive,
// and we should request unadjustedMovement (raw, no OS pointer acceleration).
var MOUSE_DEADZONE=IS_WINDOWS?12:3;
var MOUSE_SENSITIVITY=IS_WINDOWS?0.0012:0.002;
var POINTER_LOCK_COOLDOWN_MS=IS_WINDOWS?500:250;
var pointerLockJustAcquired=0; // timestamp to ignore initial spike
// Track stationary frames on Windows: if dx/dy stay below DZ for a while, also
// drop accumulated micro-noise that snuck through.
var lastSignificantMove=0;
document.addEventListener('mousemove',e=>{
  if(!pointerLocked||gameState!=='playing')return;
  // Ignore mouse spike right after pointer lock
  if(Date.now()-pointerLockJustAcquired<POINTER_LOCK_COOLDOWN_MS)return;
  var dx=e.movementX,dy=e.movementY;
  var DZ=MOUSE_DEADZONE;
  // Soft dead zone: subtract DZ instead of hard clipping so genuine motion still scales.
  if(Math.abs(dx)<DZ)dx=0;else dx-=Math.sign(dx)*DZ;
  if(Math.abs(dy)<DZ)dy=0;else dy-=Math.sign(dy)*DZ;
  if(dx===0&&dy===0)return;
  // Clamp extreme values
  dx=Math.max(-60,Math.min(60,dx));
  dy=Math.max(-60,Math.min(60,dy));
  mouse.dx+=dx;mouse.dy+=dy;
  lastSignificantMove=Date.now();
});

// Request pointer lock with unadjustedMovement to bypass OS pointer acceleration
// (helps with Windows touchpad jitter that survives the dead zone).
function requestLockOptions(){
  return IS_WINDOWS?{unadjustedMovement:true}:undefined;
}
canvas.addEventListener('click',()=>{
  if(gameState!=='playing')return;
  try{var p=canvas.requestPointerLock(requestLockOptions());if(p&&p.catch)p.catch(()=>{});}catch(e){}
});
// Mouse buttons as alternate skill cast (左クリック=火球, 右クリック=雷撃) —
// only when pointer is locked, so the very first click that acquires lock isn't consumed.
canvas.addEventListener('mousedown',e=>{
  if(gameState!=='playing'||!pointerLocked)return;
  if(e.button===0){useSkill(0);e.preventDefault();}
  else if(e.button===2){useSkill(1);e.preventDefault();}
});
// Suppress the browser context menu on the canvas so right-click can be used as an attack.
canvas.addEventListener('contextmenu',e=>{e.preventDefault();});
document.addEventListener('pointerlockchange',()=>{
  var wasLocked=pointerLocked;
  pointerLocked=document.pointerLockElement===canvas;
  if(pointerLocked&&!wasLocked){
    pointerLockJustAcquired=Date.now();
    mouse.dx=0;mouse.dy=0;
    lastSignificantMove=Date.now();
  }
});

// Press 'R' to recenter view (pitch=0, yaw unchanged) — escape hatch if drift
// has tilted the world before the player notices.
document.addEventListener('keydown',function(e){
  if(e.code==='KeyR'&&gameState==='playing'){player.pitch=0;mouse.dx=0;mouse.dy=0;}
});
