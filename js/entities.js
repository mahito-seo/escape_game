// Entities & UI - Kill, LevelUp, Particles, HUD, Minimap
function killEnemy(e){
  scene.remove(e.mesh);player.xp+=e.xp;player.gold+=e.gold;player.kills++;
  spawnParticles(e.x,e.z,'#ffaa00',25);checkLevelUp();updateHUD();
  // Always drop: 35% HP, 45% MP(=XP via MP regen), 20% gold
  const roll=Math.random();
  spawnItemAt(e.x,e.z,roll<.35?'hp':roll<.8?'mp':'gold');
  // Bonus XP drop (always)
  player.xp+=~~(e.xp*.3);
  showMessage(`+${~~(e.xp*.3)} Bonus XP`,'#aaffaa');
  e.hp=-1;
}

function checkLevelUp(){
  if(player.xp>=player.xpNext){
    player.xp-=player.xpNext;player.level++;player.xpNext=~~(player.xpNext*1.5);
    player.maxHp+=20;player.hp=player.maxHp;player.maxMp+=10;player.mp=player.maxMp;
    player.attackPower+=8;player.defense+=2;
    showMessage(`⬆ LEVEL UP! Lv.${player.level}`,'#aaffaa');playSound('levelup');
    spawnParticles(player.x,player.z,'#88ff88',40);
  }
}

function spawnParticles(x3,z3,color,n=15){
  const v=new THREE.Vector3(x3,1.2,z3);v.project(camera);if(v.z>1)return;
  const px=(v.x+1)/2*W,py=(1-v.y)/2*H;
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=1+Math.random()*4;pParticles.push({x:px,y:py,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,life:1,decay:.02+Math.random()*.03,size:2+Math.random()*4,color});}
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
  for(const it of items)if(!it.collected){mmCtx.fillStyle=it.type==='hp'?'#ff6666':it.type==='mp'?'#6666ff':'#ffcc00';mmCtx.fillRect(it.x/TILE*cw-1,it.z/TILE*ch-1,3,3);}
  if(!cipherSolved){mmCtx.fillStyle='#00ff41';mmCtx.fillRect(terminalX/TILE*cw-2,terminalZ/TILE*ch-2,5,5);}
  mmCtx.fillStyle=cipherSolved?'#44ff44':'#442222';mmCtx.fillRect(dungeon.stairX*cw-2,dungeon.stairY*ch-2,5,5);
  const ppx=player.x/TILE*cw,ppz=player.z/TILE*ch;
  mmCtx.fillStyle='#fff';mmCtx.beginPath();mmCtx.arc(ppx,ppz,3,0,Math.PI*2);mmCtx.fill();
  mmCtx.strokeStyle='#fff';mmCtx.lineWidth=1;mmCtx.beginPath();mmCtx.moveTo(ppx,ppz);mmCtx.lineTo(ppx+Math.sin(player.yaw+Math.PI)*8,ppz+Math.cos(player.yaw+Math.PI)*8);mmCtx.stroke();
}

function isWall(x,z){const mx=Math.round(x/TILE),mz=Math.round(z/TILE);if(mx<0||mx>=MAP_W||mz<0||mz>=MAP_H)return true;return dungeon.map[mz][mx]===1;}
