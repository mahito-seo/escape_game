// Game Loop, Input, Pause System
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
  tc.light.intensity=tc.base+Math.sin(t*3+tc.base)*.4;
  tc.flame.scale.set(1+Math.sin(t*7)*.2,1+Math.cos(t*5)*.3,1+Math.sin(t*6)*.2);
  tc.flame.rotation.z=Math.sin(t*4)*.15;
  if(tc.flame2){tc.flame2.scale.set(1+Math.sin(t*9)*.25,1+Math.cos(t*6)*.35,1+Math.sin(t*8)*.25);tc.flame2.rotation.z=Math.cos(t*5)*.2;}
  if(tc.ember){tc.ember.material.opacity=.3+Math.sin(t*4+tc.base)*.15;}
}}

let lastTime=0;
function loop(ts){
  requestAnimationFrame(loop);
  if(gameState==='battle'||gameState==='cipher'||gameState==='title'||gameState==='dead'||gameState==='complete'||gameState==='paused'||gameState==='swap')return;
  const dt=Math.min((ts-lastTime)/1000,.05);lastTime=ts;

  player.yaw-=mouse.dx*.002;
  player.pitch=Math.max(-Math.PI/3,Math.min(Math.PI/3,player.pitch-mouse.dy*.002));
  mouse.dx=0;mouse.dy=0;

  const spd=player.speed*(1+(player.level-1)*.12); // bigger speed boost per level
  let mx=0,mz=0;
  if(keys['KeyW']||keys['ArrowUp']){mx+=Math.sin(player.yaw+Math.PI)*spd;mz+=Math.cos(player.yaw+Math.PI)*spd;}
  if(keys['KeyS']||keys['ArrowDown']){mx-=Math.sin(player.yaw+Math.PI)*spd;mz-=Math.cos(player.yaw+Math.PI)*spd;}
  if(keys['KeyA']||keys['ArrowRight']){mx+=Math.sin(player.yaw+Math.PI+Math.PI/2)*spd;mz+=Math.cos(player.yaw+Math.PI+Math.PI/2)*spd;}
  if(keys['KeyD']||keys['ArrowLeft']){mx+=Math.sin(player.yaw+Math.PI-Math.PI/2)*spd;mz+=Math.cos(player.yaw+Math.PI-Math.PI/2)*spd;}
  const nx=player.x+mx,nz=player.z+mz;
  if(!isWall(nx+(mx>0?.4:-.4),player.z))player.x=nx;
  if(!isWall(player.x,nz+(mz>0?.4:-.4)))player.z=nz;

  camera.position.set(player.x,1.2,player.z);
  camera.rotation.order='YXZ';camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;

  player.mp=Math.min(player.maxMp,player.mp+dt*2);
  updateEnemies(dt);updateProjectiles();checkTerminal();checkItems();checkStair();updateCDs(dt);updateTorches(ts/1000);

  // Animate terminal
  if(terminalMesh&&!cipherSolved){
    terminalMesh.children.forEach((c,i)=>{if(i>=3)return;c.position.y=1.5+Math.sin(ts/1000*2+i*2)*.2;c.rotation.y+=dt*(1+i*.5);c.rotation.x+=dt*.5;});
    if(terminalGlow)terminalGlow.scale.setScalar(1+Math.sin(ts/500)*.3);
    if(terminalLight)terminalLight.intensity=3+Math.sin(ts/400)*.8;
  }
  if(stairMesh)stairMesh.rotation.y+=dt*.3;

  // Approach indicator
  const ai=document.getElementById('approach-indicator'),at=document.getElementById('approach-text');
  if(approachTarget&&!battleActive&&!cipherActive){
    ai.classList.add('show');
    if(approachTarget==='terminal'){at.textContent='🔓 DECRYPT!';document.querySelector('.approach-ring').style.borderColor='rgba(0,255,65,.8)';}
    else{at.textContent='⚔ BATTLE!';document.querySelector('.approach-ring').style.borderColor='rgba(255,100,0,.8)';}
  }else ai.classList.remove('show');

  const t=ts/1000;
  for(const it of items)if(!it.collected&&it.mesh){it.mesh.position.y=.4+Math.sin(t*2+it.x)*.15;it.mesh.rotation.y+=dt;}
  updateHUD();
  // Minimap only visible during reveal
  if(minimapRevealEnd>0){
    document.getElementById('minimap').style.display='block';
    drawMinimap();
    const rem=Math.max(0,Math.ceil((minimapRevealEnd-Date.now())/1000));
    document.getElementById('minimap-countdown').textContent=rem+'s';
    if(Date.now()>=minimapRevealEnd){minimapRevealEnd=0;document.getElementById('minimap').style.display='none';}
  }
  pCtx.clearRect(0,0,W,H);drawParticles();
  renderer.render(scene,camera);
}

let minimapRevealEnd=0;
const MINIMAP_COST=15; // MP cost to reveal map
const MINIMAP_DURATION=5000; // 5 seconds
function revealMinimap(){
  if(player.mp<MINIMAP_COST){showMessage('MPが不足！','#ff8888');return;}
  player.mp-=MINIMAP_COST;
  minimapRevealEnd=Date.now()+MINIMAP_DURATION;
  document.getElementById('minimap').style.display='block';
  showMessage('🗺️ マップ表示！(5秒間)','#66ccff');playSound('pickup');
  updateHUD();
}

let prevStateBeforePause=null;
let pauseStartedAt=0;
let totalPausedMs=0; // accumulated pause+swap time to subtract from score
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
  if(gameState==='playing'){if(e.code==='Digit2')useSkill(0);if(e.code==='Digit3')useSkill(1);if(e.code==='Digit4')useSkill(2);if(e.code==='Digit5')revealMinimap();}
  if(gameState!=='battle'&&gameState!=='cipher')e.preventDefault();
});
document.addEventListener('keyup',e=>keys[e.code]=false);
document.addEventListener('mousemove',e=>{if(!pointerLocked||gameState!=='playing')return;mouse.dx+=e.movementX;mouse.dy+=e.movementY;});
canvas.addEventListener('click',()=>{if(gameState==='playing')canvas.requestPointerLock();});
document.addEventListener('pointerlockchange',()=>pointerLocked=document.pointerLockElement===canvas);

// ═══════════════════════════════════
//  SOUND SYSTEM (Web Audio API)
