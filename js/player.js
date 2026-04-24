// Player Actions, Skills, Enemy AI, World Interactions
function useSkill(idx){
  if(gameState!=='playing')return;
  // Feature lock checks
  if(idx===0&&features.skillFire<=0){showMessage('🔒 火炎スキルは修理が必要！','#ff4444');return;}
  if(idx===1&&features.skillLightning<=0){showMessage('🔒 雷撃スキルは修理が必要！','#ff4444');return;}
  if(idx===2&&features.skillHeal<=0){showMessage('\uD83D\uDD12 \u56DE\u5FA9\u30B9\u30AD\u30EB\u306F\u4FEE\u7406\u304C\u5FC5\u8981\uFF01','#ff4444');return;}
  const s=player.skills[idx];
  if(s.cd>0)return;if(player.mp<s.cost){showMessage('MP\u304C\u4E0D\u8DB3\uFF01','#ff8888');return;}
  player.mp-=s.cost;s.cd=s.maxCd;
  if(idx===0){
    const fireMult=[0,1,1.5,2][features.skillFire]||1;
    if(features.fireEvo>0){
      spawnProj('fire_evo',fireMult); // Explosive fireball
      showMessage('\uD83C\uDF0B \u7206\u88C2\u706B\u7403\uFF01','#ff4400');
    }else{
      spawnProj('fire',fireMult);
    }
  }else if(idx===1){
    const ltMult=[0,1,1.5,2][features.skillLightning]||1;
    if(features.lightningEvo>0){
      spawnProj('lightning_evo',ltMult); // Chain lightning
      showMessage('\u26A1\u26A1 \u9023\u9396\u96F7\u6483\uFF01','#8888ff');
    }else{
      spawnProj('lightning',ltMult);
    }
  }else{
    if(features.healEvo>0){
      // Regen: heal over 5 ticks
      startRegen();
      showMessage('\uD83D\uDC9A \u30EA\u30B8\u30A7\u30CD\u767A\u52D5\uFF01','#22ff88');
    }else{
      const healPct=[0,.2,.3,.4][features.skillHeal]||.3;
      const h=~~(player.maxHp*healPct);player.hp=Math.min(player.maxHp,player.hp+h);
      showMessage(`\uD83D\uDC8A +${h}HP`,'#44ff44');
    }
    spawnParticles(player.x,player.z,'#44ff88',20);
  }
  updateHUD();
}
function spawnProj(type,mult){
  mult=mult||1;
  // Get direction from camera's actual facing (avoids yaw offset bugs)
  const dir=new THREE.Vector3(0,0,-1);
  dir.applyQuaternion(camera.quaternion);
  const cfgs={
    fire:{c:0xff6600,e:0xff3300,s:.2,sp:.25,dmg:~~((35+floor*5)*mult),r:20},
    fire_evo:{c:0xff2200,e:0xff0000,s:.35,sp:.22,dmg:~~((35+floor*5)*mult),r:22},
    lightning:{c:0x8888ff,e:0x4444ff,s:.15,sp:.4,dmg:~~((55+floor*8)*mult),r:30},
    lightning_evo:{c:0x4444ff,e:0x2222ff,s:.2,sp:.45,dmg:~~((55+floor*8)*mult),r:32},
  };
  const cfg=cfgs[type]||cfgs.fire;
  const m=new THREE.Mesh(new THREE.SphereGeometry(cfg.s,8,8),new THREE.MeshStandardMaterial({color:cfg.c,emissive:cfg.e,emissiveIntensity:3,transparent:true,opacity:.9}));
  m.position.set(player.x,1.2,player.z);scene.add(m);
  const l=new THREE.PointLight(cfg.c,2,5);l.position.copy(m.position);scene.add(l);
  projectiles.push({mesh:m,light:l,dir,speed:cfg.sp,damage:cfg.dmg,range:cfg.r,traveled:0,type});
}

// ── Regen system ──
var regenTimer=null,regenTicks=0;
function startRegen(){
  if(regenTimer)clearInterval(regenTimer);
  regenTicks=0;
  const healPct=[0,.2,.3,.4][features.skillHeal]||.3;
  const totalHeal=~~(player.maxHp*healPct);
  const perTick=~~(totalHeal/5)||1;
  regenTimer=setInterval(function(){
    regenTicks++;
    var h=Math.min(perTick,player.maxHp-player.hp);
    if(h>0){player.hp=Math.min(player.maxHp,player.hp+h);spawnParticles(player.x,player.z,'#22ff88',5);showMessage(`\uD83D\uDC9A +${h}HP`,'#22ff88');}
    updateHUD();
    if(regenTicks>=5){clearInterval(regenTimer);regenTimer=null;}
  },1000);
}
function updateProjectiles(){
  projectiles=projectiles.filter(p=>{
    p.mesh.position.x+=p.dir.x*p.speed;p.mesh.position.y+=p.dir.y*p.speed;p.mesh.position.z+=p.dir.z*p.speed;
    p.light.position.copy(p.mesh.position);p.traveled+=p.speed;p.mesh.rotation.x+=.1;p.mesh.rotation.y+=.1;
    var pColor=p.type.indexOf('fire')>=0?'#ff6600':'#8888ff';
    if(p.traveled>p.range||isWall(p.mesh.position.x,p.mesh.position.z)){scene.remove(p.mesh,p.light);spawnParticles(p.mesh.position.x,p.mesh.position.z,pColor,20);return false;}
    for(const e of enemies){
      if(e.hp<=0||e.inBattle)continue;
      const dx=e.x-p.mesh.position.x,dz=e.z-p.mesh.position.z;
      if(Math.sqrt(dx*dx+dz*dz)<e.size*1.0){
        const dmg=p.damage;e.hp=Math.max(0,e.hp-dmg);
        showMessage(`\uD83D\uDD25 ${e.name}\u306B${dmg}\u30C0\u30E1\u30FC\u30B8\uFF01`,'#ff8844');
        spawnParticles(e.x,e.z,pColor,15);
        if(e.hp<=0){killEnemy(e);}
        // Explosion (fire_evo): AoE damage to nearby enemies
        if(p.type==='fire_evo'){
          var ex=p.mesh.position.x,ez=p.mesh.position.z;
          spawnParticles(ex,ez,'#ff2200',30);
          for(const e2 of enemies){
            if(e2===e||e2.hp<=0)continue;
            var d2=Math.sqrt((e2.x-ex)*(e2.x-ex)+(e2.z-ez)*(e2.z-ez));
            if(d2<5){
              var splashDmg=~~(dmg*(1-d2/5)*.7);
              if(splashDmg>0){e2.hp=Math.max(0,e2.hp-splashDmg);showMessage(`\uD83C\uDF0B ${e2.name}\u306B${splashDmg}\u7206\u98A8\uFF01`,'#ff4400');if(e2.hp<=0)killEnemy(e2);}
            }
          }
        }
        // Chain (lightning_evo): jump to nearby enemies
        if(p.type==='lightning_evo'){
          var chainDmg=dmg,lastX=e.x,lastZ=e.z,hit=[e];
          for(var ci=0;ci<2;ci++){
            chainDmg=~~(chainDmg*.7);if(chainDmg<1)break;
            var closest=null,closestDist=8;
            for(var ei2=0;ei2<enemies.length;ei2++){
              var e3=enemies[ei2];if(e3.hp<=0||hit.indexOf(e3)>=0)continue;
              var cd=Math.sqrt((e3.x-lastX)*(e3.x-lastX)+(e3.z-lastZ)*(e3.z-lastZ));
              if(cd<closestDist){closestDist=cd;closest=e3;}
            }
            if(!closest)break;
            hit.push(closest);closest.hp=Math.max(0,closest.hp-chainDmg);
            showMessage(`\u26A1 ${closest.name}\u306B${chainDmg}\u9023\u9396\uFF01`,'#8888ff');
            spawnParticles(closest.x,closest.z,'#4444ff',10);
            if(closest.hp<=0)killEnemy(closest);
            lastX=closest.x;lastZ=closest.z;
          }
        }
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
  // Freeze enemies during cipher/challenge
  if(cipherActive||challengeActive)return;
  for(const e of enemies){
    if(e.hp<=0)continue;
    const dx=player.x-e.x,dz=player.z-e.z,dist=Math.sqrt(dx*dx+dz*dz);
    e.mesh.position.set(e.x,e.mesh.position.y,e.z);e.mesh.rotation.y=Math.atan2(-dx,-dz);
    if(dist<18){e.state='chase';e.alertTimer=1;}
    if(e.alertTimer>0)e.alertTimer-=dt;if(e.alertTimer<=0&&dist>18)e.state='idle';
    if(e.state==='chase'&&!e.inBattle){
      const spd=e.speed;
      const nx=e.x+(dx/dist)*spd,nz=e.z+(dz/dist)*spd;
      if(!isWall(nx,e.z))e.x=nx;if(!isWall(e.x,nz))e.z=nz;
      e.legPhase=(e.legPhase||0)+dt*8;
      if(e.leg1)e.leg1.rotation.x=Math.sin(e.legPhase)*.5;
      if(e.leg2)e.leg2.rotation.x=-Math.sin(e.legPhase)*.5;
      if(e.arm1)e.arm1.rotation.x=-Math.sin(e.legPhase)*.4;
      if(e.arm2)e.arm2.rotation.x=Math.sin(e.legPhase)*.4;
      e.mesh.position.y=e.size*1.1+Math.abs(Math.sin(e.legPhase*.5))*.05;
      // Hitbox proportional to enemy size
      const triggerDist=0.6+e.size;
      const approachDist=triggerDist+1.2;
      if(dist<approachDist&&!battleActive&&!cipherActive)approachTarget=e;
      if(dist<triggerDist&&!battleActive&&!cipherActive&&battleCooldown<=0){battleCooldown=2.5;openBattle(e);return;}
    }
  }
}

function checkTerminal(){
  if(cipherSolved||cipherActive||battleActive)return;
  const dx=terminalX-player.x,dz=terminalZ-player.z,dist=Math.sqrt(dx*dx+dz*dz);
  if(dist<3.5&&!approachTarget)approachTarget='terminal';
  if(dist<2.0){
    // Require player level >= floor to use terminal
    const reqLevel=floor;
    if(player.level<reqLevel){
      showMessage(`⚠ レベルが足りない！ Lv.${reqLevel} 以上が必要（現在 Lv.${player.level}）`,'#ff4444');
      battleCooldown=3; // prevent spamming
      return;
    }
    openCipherModal();
  }
}

function checkItems(){
  for(const it of items){
    if(it.collected)continue;
    const dx=it.x-player.x,dz=it.z-player.z;
    if(Math.sqrt(dx*dx+dz*dz)<1.2){
      it.collected=true;scene.remove(it.mesh);if(it.light)scene.remove(it.light);
      const effMult=features.itemEffect>0?[0,.7,1,1.5][features.itemEffect]||1:1;
      if(it.type==='mp'){const a=~~(player.maxMp*.4*effMult);player.mp=Math.min(player.maxMp,player.mp+a);showMessage(`\uD83D\uDCA7 MP +${a}`,'#6666ff');}
      else if(it.type==='xp'){const a=~~((10+Math.random()*15*floor)*effMult);player.xp+=a;showMessage(`\u2B50 XP +${a}`,'#44ff44');checkLevelUp();}
      spawnParticles(it.x,it.z,it.type==='mp'?'#4444ff':'#44ff44',15);playSound('pickup');updateHUD();
    }
  }
}

function checkStair(){
  if(!stairMesh)return;
  const dx=dungeon.stairX*TILE-player.x,dz=dungeon.stairY*TILE-player.z;
  if(Math.sqrt(dx*dx+dz*dz)<1.5){
    if(bossEntity&&!bossEntity.defeated){showMessage('\u30DC\u30B9\u3092\u5012\u3055\u306A\u3051\u308C\u3070\u8131\u51FA\u3067\u304D\u306A\u3044\uFF01','#ff4444');return;}
    if(!cipherSolved){showMessage('\u6697\u53F7\u3092\u89E3\u8AAD\u3057\u3066\u304B\u3089\u6765\u3044\uFF01','#ff8844');return;}
    currentCipherStage++;
    // Stage 5 clear (index 5) = normal ending, Stage 6 clear (index 6+) = extra ending
    if(currentCipherStage>=5){gameComplete();return;}
    floor++;cipherSolved=false;escapeCount=0;
    playSound('portal');
    const nextTheme=FLOOR_THEMES[(floor-1)%FLOOR_THEMES.length];
    const storyMsg=['','','さらに深くへ… データの核心に近づいている','連絡プロトコルが見えてきた… あと少しだ','最深部だ。すべてがここで繋がる'];
    showMessage(`⬇ ${floor}階「${nextTheme.name}」`,'#44ffaa');
    if(storyMsg[floor-1])showMessage(storyMsg[floor-1],'#ffcc88');
    dungeon=genDungeon();buildScene();
    player.hp=Math.min(player.maxHp,player.hp+50); // +50 HP on stage clear
    player.mp=player.maxMp; // full MP restore
    updateHUD();spawnParticles(player.x,player.z,'#44ffaa',30);
    saveProgress();
    startBGM(floor);
  }
}
