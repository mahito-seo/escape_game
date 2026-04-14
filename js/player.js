// Player Actions, Skills, Enemy AI, World Interactions
function useSkill(idx){
  if(gameState!=='playing')return;const s=player.skills[idx];
  if(s.cd>0)return;if(player.mp<s.cost){showMessage('MPが不足！','#ff8888');return;}
  player.mp-=s.cost;s.cd=s.maxCd;
  if(idx===0)spawnProj('fire');else if(idx===1)spawnProj('lightning');
  else{const h=~~(player.maxHp*.3);player.hp=Math.min(player.maxHp,player.hp+h);showMessage(`💊 +${h}HP`,'#44ff44');spawnParticles(player.x,player.z,'#44ff88',20);}
  updateHUD();
}
function spawnProj(type){
  const dir=new THREE.Vector3(Math.sin(player.yaw+Math.PI)*Math.cos(player.pitch),-Math.sin(player.pitch),Math.cos(player.yaw+Math.PI)*Math.cos(player.pitch));
  const cfg={fire:{c:0xff6600,e:0xff3300,s:.2,sp:.25,dmg:35+floor*5,r:20},lightning:{c:0x8888ff,e:0x4444ff,s:.15,sp:.4,dmg:55+floor*8,r:30}}[type];
  const m=new THREE.Mesh(new THREE.SphereGeometry(cfg.s,8,8),new THREE.MeshStandardMaterial({color:cfg.c,emissive:cfg.e,emissiveIntensity:3,transparent:true,opacity:.9}));
  m.position.set(player.x,1.2,player.z);scene.add(m);
  const l=new THREE.PointLight(cfg.c,2,5);l.position.copy(m.position);scene.add(l);
  projectiles.push({mesh:m,light:l,dir,speed:cfg.sp,damage:cfg.dmg,range:cfg.r,traveled:0,type});
}
function updateProjectiles(){
  projectiles=projectiles.filter(p=>{
    p.mesh.position.x+=p.dir.x*p.speed;p.mesh.position.y+=p.dir.y*p.speed;p.mesh.position.z+=p.dir.z*p.speed;
    p.light.position.copy(p.mesh.position);p.traveled+=p.speed;p.mesh.rotation.x+=.1;p.mesh.rotation.y+=.1;
    if(p.traveled>p.range||isWall(p.mesh.position.x,p.mesh.position.z)){scene.remove(p.mesh,p.light);spawnParticles(p.mesh.position.x,p.mesh.position.z,p.type==='fire'?'#ff6600':'#8888ff',20);return false;}
    for(const e of enemies){
      if(e.hp<=0||e.inBattle)continue;
      const dx=e.x-p.mesh.position.x,dz=e.z-p.mesh.position.z;
      if(Math.sqrt(dx*dx+dz*dz)<e.size*1.0){
        // Projectile hit: deal damage directly without opening battle
        const dmg=p.damage;e.hp=Math.max(0,e.hp-dmg);
        showMessage(`🔥 ${e.name}に${dmg}ダメージ！`,'#ff8844');
        spawnParticles(e.x,e.z,p.type==='fire'?'#ff6600':'#8888ff',15);
        if(e.hp<=0){killEnemy(e);}
        scene.remove(p.mesh,p.light);return false;
      }
    }
    return true;
  });
}

let approachTarget=null; // enemy or 'terminal'
function updateEnemies(dt){
  battleCooldown=Math.max(0,battleCooldown-dt);
  approachTarget=null;
  const TRIGGER_DIST=1.6;
  for(const e of enemies){
    if(e.hp<=0)continue;
    const dx=player.x-e.x,dz=player.z-e.z,dist=Math.sqrt(dx*dx+dz*dz);
    e.mesh.position.set(e.x,e.mesh.position.y,e.z);e.mesh.rotation.y=Math.atan2(-dx,-dz);
    if(dist<18){e.state='chase';e.alertTimer=1;}
    if(e.alertTimer>0)e.alertTimer-=dt;if(e.alertTimer<=0&&dist>18)e.state='idle';
    if(e.state==='chase'&&!e.inBattle){
      const spd=e.speed*(1+(floor-1)*.05);
      const nx=e.x+(dx/dist)*spd,nz=e.z+(dz/dist)*spd;
      if(!isWall(nx,e.z))e.x=nx;if(!isWall(e.x,nz))e.z=nz;
      e.legPhase=(e.legPhase||0)+dt*8;
      if(e.leg1)e.leg1.rotation.x=Math.sin(e.legPhase)*.5;
      if(e.leg2)e.leg2.rotation.x=-Math.sin(e.legPhase)*.5;
      if(e.arm1)e.arm1.rotation.x=-Math.sin(e.legPhase)*.4;
      if(e.arm2)e.arm2.rotation.x=Math.sin(e.legPhase)*.4;
      e.mesh.position.y=e.size*1.1+Math.abs(Math.sin(e.legPhase*.5))*.05;
      if(dist<TRIGGER_DIST+1.5&&!battleActive&&!cipherActive)approachTarget=e;
      if(dist<TRIGGER_DIST&&!battleActive&&!cipherActive&&battleCooldown<=0){battleCooldown=2.5;openBattle(e);return;}
    }
  }
}

function checkTerminal(){
  if(cipherSolved||cipherActive||battleActive)return;
  const dx=terminalX-player.x,dz=terminalZ-player.z,dist=Math.sqrt(dx*dx+dz*dz);
  if(dist<3.5&&!approachTarget)approachTarget='terminal';
  if(dist<2.0)openCipherModal();
}

function checkItems(){
  for(const it of items){
    if(it.collected)continue;
    const dx=it.x-player.x,dz=it.z-player.z;
    if(Math.sqrt(dx*dx+dz*dz)<1.2){
      it.collected=true;scene.remove(it.mesh,it.light);
      if(it.type==='hp'){const a=~~(player.maxHp*.25);player.hp=Math.min(player.maxHp,player.hp+a);showMessage(`❤️ HP +${a}`,'#ff6666');}
      else if(it.type==='mp'){const a=~~(player.maxMp*.4);player.mp=Math.min(player.maxMp,player.mp+a);showMessage(`💧 MP +${a}`,'#6666ff');}
      else if(it.type==='xp'){const a=10+~~(Math.random()*15*floor);player.xp+=a;showMessage(`⭐ XP +${a}`,'#44ff44');checkLevelUp();}
      spawnParticles(it.x,it.z,it.type==='hp'?'#ff4444':it.type==='mp'?'#4444ff':'#ffcc00',15);playSound('pickup');updateHUD();
    }
  }
}

function checkStair(){
  if(!stairMesh)return;
  const dx=dungeon.stairX*TILE-player.x,dz=dungeon.stairY*TILE-player.z;
  if(Math.sqrt(dx*dx+dz*dz)<1.5){
    if(!cipherSolved){showMessage('暗号を解読してから来い！','#ff8844');return;}
    currentCipherStage++;
    if(currentCipherStage>=CIPHER_STAGES.length){gameComplete();return;}
    floor++;cipherSolved=false;escapeCount=0;
    playSound('portal');
    const nextTheme=FLOOR_THEMES[(floor-1)%FLOOR_THEMES.length];
    showMessage(`⬇ ${floor}階「${nextTheme.name}」へ！`,'#44ffaa');
    dungeon=genDungeon();buildScene();
    player.hp=Math.min(player.maxHp,player.hp+~~(player.maxHp*.3));
    player.mp=Math.min(player.maxMp,player.mp+~~(player.maxMp*.5));
    updateHUD();spawnParticles(player.x,player.z,'#44ffaa',30);
    saveProgress();
  }
}
