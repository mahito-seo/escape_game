// Entities & UI - Kill, LevelUp, Particles, HUD, Minimap
function killEnemy(e){
  scene.remove(e.mesh);player.xp+=e.xp;player.kills++;
  // Auto HP recovery based on enemy strength
  const hpRecover=Math.min(~~(e.maxHp*.2),~~(player.maxHp*.15)); // 20% of enemy maxHP, capped at 15% of player maxHP
  player.hp=Math.min(player.maxHp,player.hp+hpRecover);
  showMessage(`❤️ +${hpRecover} HP`,'#ff8888');
  spawnParticles(e.x,e.z,'#ffaa00',25);checkLevelUp();updateHUD();
  // Drop: 50% MP, 50% XP (no HP drop - auto recovered)
  const roll=Math.random();
  spawnItemAt(e.x,e.z,roll<.5?'mp':'xp');
  e.hp=-1;
}

function checkLevelUp(){
  if(player.xp>=player.xpNext){
    player.xp-=player.xpNext;player.level++;player.xpNext=~~(player.xpNext*1.5);
    player.maxHp+=20;player.hp=player.maxHp;player.maxMp+=10;player.mp=player.maxMp;
    player.attackPower+=8;player.defense+=2;
    showMessage(`⬆ LEVEL UP! Lv.${player.level}`,'#aaffaa');playSound('levelup');
    spawnParticles(player.x,player.z,'#88ff88',15);
  }
}

function spawnParticles(x3,z3,color,n){
  if(pParticles.length>80)return; // cap total particles for perf
  const v=new THREE.Vector3(x3,1.2,z3);v.project(camera);if(v.z>1)return;
  const px=(v.x+1)/2*W,py=(1-v.y)/2*H;
  const count=Math.min(n,15); // max 15 per burst
  for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,sp=1+Math.random()*3;pParticles.push({x:px,y:py,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,life:1,decay:.03+Math.random()*.04,size:2+Math.random()*3,color});}
}
function drawParticles(){
  pParticles=pParticles.filter(p=>p.life>0);
  for(const p of pParticles){p.x+=p.vx;p.y+=p.vy;p.vy+=.15;p.life-=p.decay;pCtx.globalAlpha=p.life;pCtx.fillStyle=p.color;pCtx.beginPath();pCtx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);pCtx.fill();}
  pCtx.globalAlpha=1;
}

const msgEl=document.getElementById('messages');
function showMessage(text,color='#88ffaa'){const el=document.createElement('div');el.className='msg';el.style.color=color;el.textContent=text;msgEl.appendChild(el);setTimeout(()=>el.remove(),2000);}

function updateHUD(){
  document.getElementById('floor-val').textContent=floor;
  document.getElementById('stage-val').textContent=currentCipherStage>=5?'EX':`${currentCipherStage+1}/5`;
  document.getElementById('level-val').textContent=player.level;
  document.getElementById('kills-val').textContent=player.kills;
  document.getElementById('cipher-val').textContent=cipherSolved?'✅':'🔒';
  document.getElementById('hp-fill').style.width=(player.hp/player.maxHp*100)+'%';
  document.getElementById('mp-fill').style.width=(player.mp/player.maxMp*100)+'%';
  document.getElementById('hp-text').textContent=`${Math.max(0,player.hp)} / ${player.maxHp}`;
  document.getElementById('mp-text').textContent=`${~~player.mp} / ${player.maxMp}`;
  document.getElementById('xp-fill').style.width=(player.xp/player.xpNext*100)+'%';
  const s=CIPHER_STAGES[Math.min(currentCipherStage,CIPHER_STAGES.length-1)];
  document.getElementById('stage-hint-title').textContent=currentCipherStage>=CIPHER_STAGES.length?'ALL CLEAR':s.name;
  document.getElementById('stage-hint-text').textContent=cipherSolved?'脱出口（緑の柱）へ向かえ！':'暗号ターミナル（緑の光）を探せ';
}

const mmCtx=document.getElementById('minimap-canvas').getContext('2d');
function drawMinimap(){
  const{map}=dungeon,cw=120/MAP_W,ch=120/MAP_H;
  mmCtx.fillStyle='#000';mmCtx.fillRect(0,0,120,120);
  for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++)if(map[y][x]===0){mmCtx.fillStyle='#2a2a1a';mmCtx.fillRect(x*cw,y*ch,cw,ch);}
  for(const e of enemies)if(e.hp>0){mmCtx.fillStyle=e.inBattle?'#ff8800':'#ff3333';mmCtx.fillRect(e.x/TILE*cw-1,e.z/TILE*ch-1,3,3);}
  for(const it of items)if(!it.collected){mmCtx.fillStyle=it.type==='hp'?'#ff6666':it.type==='mp'?'#6666ff':'#44ff44';mmCtx.fillRect(it.x/TILE*cw-1,it.z/TILE*ch-1,3,3);}
  if(!cipherSolved){mmCtx.fillStyle='#00ff41';mmCtx.fillRect(terminalX/TILE*cw-2,terminalZ/TILE*ch-2,5,5);}
  mmCtx.fillStyle=cipherSolved?'#44ff44':'#442222';mmCtx.fillRect(dungeon.stairX*cw-2,dungeon.stairY*ch-2,5,5);
  const ppx=player.x/TILE*cw,ppz=player.z/TILE*ch;
  mmCtx.fillStyle='#fff';mmCtx.beginPath();mmCtx.arc(ppx,ppz,3,0,Math.PI*2);mmCtx.fill();
  mmCtx.strokeStyle='#fff';mmCtx.lineWidth=1;mmCtx.beginPath();mmCtx.moveTo(ppx,ppz);mmCtx.lineTo(ppx+Math.sin(player.yaw+Math.PI)*8,ppz+Math.cos(player.yaw+Math.PI)*8);mmCtx.stroke();
}

function isWall(x,z){
  const mx=Math.round(x/TILE),mz=Math.round(z/TILE);
  if(mx<0||mx>=MAP_W||mz<0||mz>=MAP_H)return true;
  if(dungeon.map[mz][mx]===1)return true;
  // Check decoration collisions
  for(const db of decoBlocks){
    const dx=x-db.x,dz=z-db.z;
    if(dx*dx+dz*dz<db.r*db.r)return true;
  }
  return false;
}
