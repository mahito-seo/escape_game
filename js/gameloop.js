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

  player.yaw-=mouse.dx*.002;
  player.pitch=Math.max(-Math.PI/3,Math.min(Math.PI/3,player.pitch-mouse.dy*.002));
  mouse.dx=0;mouse.dy=0;

  const spd=player.speed*(1+(player.level-1)*.12);
  let mx=0,mz=0;
  const fwd=player.yaw+Math.PI;
  if(keys['KeyW']||keys['ArrowUp']){mx+=Math.sin(fwd)*spd;mz+=Math.cos(fwd)*spd;}
  if(keys['KeyS']||keys['ArrowDown']){mx-=Math.sin(fwd)*spd;mz-=Math.cos(fwd)*spd;}
  if(keys['KeyA']){mx+=Math.cos(fwd)*spd;mz-=Math.sin(fwd)*spd;} // right
  if(keys['KeyD']){mx-=Math.cos(fwd)*spd;mz+=Math.sin(fwd)*spd;} // left
  const nx=player.x+mx,nz=player.z+mz;
  if(!isWall(nx+(mx>0?.4:-.4),player.z))player.x=nx;
  if(!isWall(player.x,nz+(mz>0?.4:-.4)))player.z=nz;

  camera.position.set(player.x,1.2,player.z);
  camera.rotation.order='YXZ';camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;

  player.mp=Math.min(player.maxMp,player.mp+dt*2);
  updateEnemies(dt);updateProjectiles();checkTerminal();checkItems();checkStair();updateCDs(dt);

  // Animate torches every other frame
  if(ts%2<1)updateTorches(ts/1000);

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
  if(approachTarget&&!battleActive&&!cipherActive){
    _elApproach.classList.add('show');
    if(approachTarget==='terminal'){_elApproachText.textContent='🔓 DECRYPT!';_elApproachRing.style.borderColor='rgba(0,255,65,.8)';}
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
const MINIMAP_COST=30; // MP cost
const MINIMAP_DURATION=5000; // 5s display
const MINIMAP_COOLDOWN=60000; // 1 min cooldown
function revealMinimap(){
  if(Date.now()<minimapCooldownEnd){
    const rem=Math.ceil((minimapCooldownEnd-Date.now())/1000);
    showMessage(`🗺️ クールダウン中… あと${rem}秒`,'#ff8888');return;
  }
  if(player.mp<MINIMAP_COST){showMessage('MPが不足！(30MP必要)','#ff8888');return;}
  player.mp-=MINIMAP_COST;
  minimapRevealEnd=Date.now()+MINIMAP_DURATION;
  minimapCooldownEnd=Date.now()+MINIMAP_COOLDOWN;
  _elMinimap.style.display='block';
  showMessage('🗺️ マップ表示！(5秒間)','#66ccff');playSound('pickup');
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
      // Close cipher and mark solved
      cipherSolved=true;closeCipherModal();
      if(stairMesh){scene.remove(stairMesh);if(stairLight)scene.remove(stairLight);}
      if(terminalMesh){scene.remove(terminalMesh);terminalMesh=null;}
      if(terminalLight){scene.remove(terminalLight);terminalLight=null;}
      if(terminalGlow){scene.remove(terminalGlow);terminalGlow=null;}
      showMessage('⏩ DEBUG: 暗号スキップ','#ff00ff');updateHUD();
      return;
    }
    if(gameState==='playing'){
      currentCipherStage++;
      if(currentCipherStage>=CIPHER_STAGES.length){gameComplete();return;}
      floor++;cipherSolved=false;escapeCount=0;
      dungeon=genDungeon();buildScene();
      player.hp=player.maxHp;player.mp=player.maxMp;
      updateHUD();showMessage(`⏩ DEBUG: Floor ${floor} へスキップ`,'#ff00ff');
      startBGM(floor);saveProgress();
      return;
    }
  }
  if(gameState==='playing'){if(e.code==='Digit2')useSkill(0);if(e.code==='Digit3')useSkill(1);if(e.code==='Digit4')useSkill(2);if(e.code==='Digit5')revealMinimap();}
  if(gameState!=='battle'&&gameState!=='cipher')e.preventDefault();
});
document.addEventListener('keyup',e=>keys[e.code]=false);
document.addEventListener('mousemove',e=>{if(!pointerLocked||gameState!=='playing')return;mouse.dx+=e.movementX;mouse.dy+=e.movementY;});
canvas.addEventListener('click',()=>{if(gameState==='playing')canvas.requestPointerLock();});
document.addEventListener('pointerlockchange',()=>pointerLocked=document.pointerLockElement===canvas);
