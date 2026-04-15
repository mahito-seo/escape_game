// Scene Building - Terrain, Portal, Terminal, Enemies, Torches, Items
function buildScene(){
  scene.children.slice().forEach(c=>{if(c.isMesh||c.isGroup||c.isPointLight)scene.remove(c);});
  torches=[];items=[];enemies=[];projectiles=[];challengeTerminals=[];decoBlocks=[];
  // Apply floor theme
  const theme=FLOOR_THEMES[(floor-1)%FLOOR_THEMES.length];
  // Richer materials with emissive tint for depth
  const wallEmit=new THREE.Color(theme.wall).multiplyScalar(.08);
  const floorEmit=new THREE.Color(theme.floor).multiplyScalar(.05);
  wallMat=new THREE.MeshStandardMaterial({color:theme.wall,emissive:wallEmit,roughness:.75,metalness:.15,bumpScale:.3});
  floorMat=new THREE.MeshStandardMaterial({color:theme.floor,emissive:floorEmit,roughness:.9,metalness:.05});
  ceilMat=new THREE.MeshStandardMaterial({color:theme.ceil,emissive:floorEmit,roughness:.95});
  scene.fog=new THREE.Fog(theme.fog,theme.fogNear,theme.fogFar);
  const{map,rooms,stairX,stairY,termX,termY}=dungeon;
  const dummy=new THREE.Object3D();
  const fgeo=new THREE.PlaneGeometry(TILE,TILE),wgeo=new THREE.BoxGeometry(TILE,TILE*1.2,TILE);
  const fi=new THREE.InstancedMesh(fgeo,floorMat,MAP_W*MAP_H);
  const ci=new THREE.InstancedMesh(fgeo,ceilMat,MAP_W*MAP_H);
  const wi=new THREE.InstancedMesh(wgeo,wallMat,MAP_W*MAP_H);
  // shadows disabled for perf
  let fc=0,cc=0,wc=0;
  for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
    const wx=x*TILE,wz=y*TILE;
    if(map[y][x]===0){
      dummy.position.set(wx,0,wz);dummy.rotation.x=-Math.PI/2;dummy.updateMatrix();fi.setMatrixAt(fc++,dummy.matrix);
      dummy.position.set(wx,TILE*1.2,wz);dummy.rotation.x=Math.PI/2;dummy.updateMatrix();ci.setMatrixAt(cc++,dummy.matrix);
    }else{
      dummy.position.set(wx,TILE*.6,wz);dummy.rotation.set(0,0,0);dummy.updateMatrix();wi.setMatrixAt(wc++,dummy.matrix);
    }
  }
  fi.count=fc;ci.count=cc;wi.count=wc;scene.add(fi,ci,wi);

  // ── Exit Portal (epic) ──
  const sx=stairX*TILE,sz=stairY*TILE;
  const portalGroup=new THREE.Group();
  // Base platform (stone ring)
  const baseMat=new THREE.MeshStandardMaterial({color:cipherSolved?0x3a6a3a:0x3a2a2a,roughness:.6,metalness:.3});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.2,.15,8,16),baseMat);
  ring.rotation.x=-Math.PI/2;ring.position.y=.05;portalGroup.add(ring);
  const platform=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.2,.12,12),baseMat);
  platform.position.y=.06;portalGroup.add(platform);
  // 4 pillars
  const pillarMat=new THREE.MeshStandardMaterial({color:cipherSolved?0x446644:0x442222,emissive:cipherSolved?0x1a3a1a:0x1a0a0a,emissiveIntensity:.4,roughness:.5,metalness:.2});
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2;
    const p=new THREE.Mesh(new THREE.BoxGeometry(.18,2.2,.18),pillarMat);
    p.position.set(Math.cos(a)*1.0,1.1,Math.sin(a)*1.0);portalGroup.add(p);
    // Pillar top orb
    const orb=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),
      new THREE.MeshStandardMaterial({color:cipherSolved?0x44ff44:0x442222,emissive:cipherSolved?0x22ff22:0x220000,emissiveIntensity:cipherSolved?3:0.5,transparent:true,opacity:.8}));
    orb.position.set(Math.cos(a)*1.0,2.3,Math.sin(a)*1.0);portalGroup.add(orb);
  }
  // Central beam (only when solved)
  if(cipherSolved){
    const beamMat=new THREE.MeshStandardMaterial({color:0x44ff88,emissive:0x22ff44,emissiveIntensity:3,transparent:true,opacity:.3});
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,3,8),beamMat);
    beam.position.y=1.5;portalGroup.add(beam);
    const beam2=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,2.5,8),beamMat.clone());
    beam2.material.opacity=.1;beam2.position.y=1.5;portalGroup.add(beam2);
  }
  portalGroup.position.set(sx,0,sz);scene.add(portalGroup);
  stairMesh=portalGroup;
  stairLight=new THREE.PointLight(cipherSolved?0x44ff44:0x442222,cipherSolved?4:1,cipherSolved?12:5);
  stairLight.position.set(sx,2.5,sz);scene.add(stairLight);

  // Cipher Terminal
  terminalX=termX*TILE;terminalZ=termY*TILE;
  if(!cipherSolved){
    const tg=new THREE.Group();
    const base=new THREE.Mesh(new THREE.CylinderGeometry(.5,.6,.2,6),new THREE.MeshStandardMaterial({color:0x1a3a1a,emissive:0x00aa41,emissiveIntensity:.3,metalness:.5}));
    base.position.y=.1;
    const scr=new THREE.Mesh(new THREE.BoxGeometry(.8,1.2,.1),new THREE.MeshStandardMaterial({color:0x001a0a,emissive:0x00ff41,emissiveIntensity:1.5,transparent:true,opacity:.85}));
    scr.position.y=.9;
    const sm=new THREE.MeshStandardMaterial({color:0x00ff41,emissive:0x00ff41,emissiveIntensity:3,transparent:true,opacity:.6});
    for(let i=0;i<3;i++){const s=new THREE.Mesh(new THREE.OctahedronGeometry(.12,0),sm);s.position.set(Math.sin(i*2.1)*.5,1.5+i*.2,Math.cos(i*2.1)*.5);tg.add(s);}
    tg.add(base,scr);tg.position.set(terminalX,0,terminalZ);scene.add(tg);terminalMesh=tg;
    terminalLight=new THREE.PointLight(0x00ff41,3,10);terminalLight.position.set(terminalX,1.5,terminalZ);scene.add(terminalLight);
    terminalGlow=new THREE.Mesh(new THREE.SphereGeometry(.3,8,8),new THREE.MeshStandardMaterial({color:0x00ff41,emissive:0x00ff41,emissiveIntensity:4,transparent:true,opacity:.3}));
    terminalGlow.position.set(terminalX,1.6,terminalZ);scene.add(terminalGlow);
  }else{terminalMesh=null;terminalLight=null;terminalGlow=null;}

  scene.add(new THREE.AmbientLight(theme.ambient,theme.ambientI));

  rooms.forEach((r,i)=>{
    if(i%2===0)placeTorch(r.x*TILE+.5,r.y*TILE+.5);
    if(r.w>4&&r.h>4)placeTorch((r.x+r.w-1)*TILE-.5,(r.y+r.h-1)*TILE-.5);
  });

  const r0=rooms[0];
  player.x=(r0.x+~~(r0.w/2))*TILE;player.z=(r0.y+~~(r0.h/2))*TILE;
  player.yaw=0;player.pitch=0;camera.position.set(player.x,1.2,player.z);

  // Enemies
  // Minecraft-style blocky monsters
  const ETYPES=[
    {name:'スケルトン',avatar:'💀',sz:.4,hp:40,atk:8,spd:.025,xp:20,xpBonus:5,build:'skeleton',
     body:0xd4c8a0,bodyEm:0x332211,head:0xe0d8b0,shirt:0x888888,pants:0x555555,eye:0x111111,eyeEm:0x000000},
    {name:'ゴブリン',avatar:'👺',sz:.38,hp:30,atk:6,spd:.04,xp:15,xpBonus:8,build:'goblin',
     body:0x2a8a1a,bodyEm:0x0a2a00,head:0x3aaa2a,shirt:0x553311,pants:0x442200,eye:0xff2200,eyeEm:0xff0000},
    {name:'オーク',avatar:'👹',sz:.55,hp:80,atk:15,spd:.02,xp:35,xpBonus:12,build:'orc',
     body:0x5a6a3a,bodyEm:0x1a2a0a,head:0x6a7a4a,shirt:0x3a2a10,pants:0x2a1a08,eye:0xff4400,eyeEm:0xff2200},
    {name:'ゾンビ',avatar:'🧟',sz:.44,hp:60,atk:10,spd:.015,xp:25,xpBonus:6,build:'zombie',
     body:0x4a7a5a,bodyEm:0x0a2a10,head:0x5a8a6a,shirt:0x2a6a6a,pants:0x2a2a5a,eye:0x111111,eyeEm:0x000000},
    {name:'デーモン',avatar:'😈',sz:.6,hp:120,atk:25,spd:.03,xp:60,xpBonus:25,build:'demon',
     body:0x8a1a1a,bodyEm:0x4a0000,head:0x6a0a0a,shirt:0x1a1a1a,pants:0x0a0a0a,eye:0xff0000,eyeEm:0xff0000},
  ];
  function buildEnemyMesh(t){
    const g=new THREE.Group();
    const S=t.sz;
    // Materials
    const headM=new THREE.MeshStandardMaterial({color:t.head,emissive:t.bodyEm,roughness:.85});
    const bodyM=new THREE.MeshStandardMaterial({color:t.shirt,emissive:t.bodyEm,roughness:.85});
    const legM=new THREE.MeshStandardMaterial({color:t.pants,emissive:t.bodyEm,roughness:.9});
    const skinM=new THREE.MeshStandardMaterial({color:t.body,emissive:t.bodyEm,roughness:.85});
    const eyeM=new THREE.MeshStandardMaterial({color:t.eye,emissive:t.eyeEm,emissiveIntensity:3});
    // ── Head (box, slightly wider) ──
    const head=new THREE.Mesh(new THREE.BoxGeometry(S*.7,S*.7,S*.7),headM);
    head.position.y=S*1.05;g.add(head);
    // Eyes (flat boxes on face)
    const eyeGeo=new THREE.BoxGeometry(S*.12,S*.08,S*.04);
    const e1=new THREE.Mesh(eyeGeo,eyeM); e1.position.set(-S*.15,S*1.08,S*.36); g.add(e1);
    const e2=new THREE.Mesh(eyeGeo,eyeM); e2.position.set(S*.15,S*1.08,S*.36); g.add(e2);
    // Mouth (dark slit)
    const mouth=new THREE.Mesh(new THREE.BoxGeometry(S*.25,S*.05,S*.04),
      new THREE.MeshStandardMaterial({color:0x111111}));
    mouth.position.set(0,S*.88,S*.36); g.add(mouth);
    // ── Torso (box) ──
    const torso=new THREE.Mesh(new THREE.BoxGeometry(S*.7,S*.8,S*.4),bodyM);
    torso.position.y=S*.3;g.add(torso);
    // ── Arms (boxes, pivot at shoulder) ──
    const armGeo=new THREE.BoxGeometry(S*.22,S*.75,S*.22);
    const arm1=new THREE.Mesh(armGeo,skinM.clone()); arm1.position.set(-S*.46,S*.25,0);g.add(arm1);
    const arm2=new THREE.Mesh(armGeo,skinM.clone()); arm2.position.set(S*.46,S*.25,0);g.add(arm2);
    // ── Legs (boxes) ──
    const legGeo=new THREE.BoxGeometry(S*.25,S*.75,S*.25);
    const l1=new THREE.Mesh(legGeo,legM); l1.position.set(-S*.18,-S*.5,0);g.add(l1);
    const l2=new THREE.Mesh(legGeo,legM); l2.position.set(S*.18,-S*.5,0);g.add(l2);
    // ── Type-specific features ──
    if(t.build==='skeleton'){
      // Thinner body, visible "ribs" as lines on torso
      torso.scale.set(.8,1,.6);
      arm1.scale.set(.7,1,.7); arm2.scale.set(.7,1,.7);
      l1.scale.set(.7,1,.7); l2.scale.set(.7,1,.7);
      // Dark eye sockets (bigger eyes)
      e1.scale.set(1.3,1.5,1); e2.scale.set(1.3,1.5,1);
      // Jaw gap
      mouth.scale.set(1.2,1.5,1);
    }else if(t.build==='goblin'){
      // Big pointy ears
      const earGeo=new THREE.BoxGeometry(S*.08,S*.3,S*.15);
      const ear1=new THREE.Mesh(earGeo,skinM); ear1.position.set(-S*.4,S*1.15,0); ear1.rotation.z=.6; g.add(ear1);
      const ear2=new THREE.Mesh(earGeo,skinM); ear2.position.set(S*.4,S*1.15,0); ear2.rotation.z=-.6; g.add(ear2);
      // Big nose
      const nose=new THREE.Mesh(new THREE.BoxGeometry(S*.12,S*.1,S*.15),skinM);
      nose.position.set(0,S*.95,S*.4); g.add(nose);
    }else if(t.build==='orc'){
      // Tusks (small white boxes from jaw)
      const tuskM=new THREE.MeshStandardMaterial({color:0xeeeedd,roughness:.4});
      const tu1=new THREE.Mesh(new THREE.BoxGeometry(S*.06,S*.15,S*.06),tuskM);
      tu1.position.set(-S*.18,S*.78,S*.35); g.add(tu1);
      const tu2=new THREE.Mesh(new THREE.BoxGeometry(S*.06,S*.15,S*.06),tuskM);
      tu2.position.set(S*.18,S*.78,S*.35); g.add(tu2);
      // Shoulder armor (small boxes)
      const armorM=new THREE.MeshStandardMaterial({color:0x4a3a1a,emissive:0x1a0a00,roughness:.6,metalness:.3});
      const sp1=new THREE.Mesh(new THREE.BoxGeometry(S*.3,S*.12,S*.3),armorM);
      sp1.position.set(-S*.46,S*.65,0); g.add(sp1);
      const sp2=new THREE.Mesh(new THREE.BoxGeometry(S*.3,S*.12,S*.3),armorM);
      sp2.position.set(S*.46,S*.65,0); g.add(sp2);
      // Wider body
      torso.scale.x=1.15;
    }else if(t.build==='zombie'){
      // Arms extended forward (classic zombie pose)
      arm1.rotation.x=-1.2; arm1.position.z=S*.25; arm1.position.y=S*.4;
      arm2.rotation.x=-1.2; arm2.position.z=S*.25; arm2.position.y=S*.4;
      // Torn shirt patches (dark spots on torso)
      const patchM=new THREE.MeshStandardMaterial({color:0x1a3a2a});
      for(let i=0;i<3;i++){
        const p=new THREE.Mesh(new THREE.BoxGeometry(S*.12,S*.1,S*.01),patchM);
        p.position.set((Math.random()-.5)*S*.4,S*.15+Math.random()*S*.3,S*.21);
        g.add(p);
      }
      // Head slightly tilted
      head.rotation.z=.15;
    }else if(t.build==='demon'){
      // Horns (angled boxes)
      const hornM=new THREE.MeshStandardMaterial({color:0x1a0000,emissive:0x330000,roughness:.5,metalness:.4});
      const h1=new THREE.Mesh(new THREE.BoxGeometry(S*.08,S*.35,S*.08),hornM);
      h1.position.set(-S*.25,S*1.45,0); h1.rotation.z=.35; g.add(h1);
      const h2=new THREE.Mesh(new THREE.BoxGeometry(S*.08,S*.35,S*.08),hornM);
      h2.position.set(S*.25,S*1.45,0); h2.rotation.z=-.35; g.add(h2);
      // Wings (flat boxes)
      const wingM=new THREE.MeshStandardMaterial({color:0x2a0000,emissive:0x1a0000,side:THREE.DoubleSide});
      const w1=new THREE.Mesh(new THREE.BoxGeometry(S*.6,S*.5,S*.03),wingM);
      w1.position.set(-S*.65,S*.45,-S*.1); w1.rotation.y=.3; g.add(w1);
      const w2=new THREE.Mesh(new THREE.BoxGeometry(S*.6,S*.5,S*.03),wingM);
      w2.position.set(S*.65,S*.45,-S*.1); w2.rotation.y=-.3; g.add(w2);
      // Tail (chain of small boxes)
      for(let i=0;i<4;i++){
        const tc=new THREE.Mesh(new THREE.BoxGeometry(S*.08,S*.08,S*.15),
          new THREE.MeshStandardMaterial({color:0x4a0a0a,emissive:0x2a0000}));
        tc.position.set(0,-S*.2-i*S*.08,-S*.25-i*S*.15);
        g.add(tc);
      }
      // Red glow
      // (no PointLight for perf - emissive glow only)
      // Bigger eyes
      e1.scale.set(1.4,1.6,1); e2.scale.set(1.4,1.6,1);
    }
    return{body:g,leg1:l1,leg2:l2,arm1,arm2};
  }
  // Determine which rooms are near terminal or exit (for extra spawns)
  const txC=dungeon.termX,tyC=dungeon.termY,sxC=dungeon.stairX,syC=dungeon.stairY;
  function isNearKey(rm){
    const rcx=rm.x+~~(rm.w/2),rcy=rm.y+~~(rm.h/2);
    const dt=Math.abs(rcx-txC)+Math.abs(rcy-tyC);
    const ds=Math.abs(rcx-sxC)+Math.abs(rcy-syC);
    return dt<=4||ds<=4;
  }
  for(let i=1;i<rooms.length;i++){
    const rm=rooms[i];
    const nearKey=isNearKey(rm);
    // More enemies near terminal/exit
    const baseCnt=nearKey?2+~~(Math.random()*2):1+~~(Math.random()*(floor+1));
    const cnt=Math.min(baseCnt,nearKey?5:3);
    for(let j=0;j<cnt;j++){
      const ti=Math.min(~~(Math.random()*(1+floor*.8)),ETYPES.length-1);
      const t=ETYPES[ti];
      const ex=(rm.x+1+Math.random()*(rm.w-2))*TILE,ez=(rm.y+1+Math.random()*(rm.h-2))*TILE;
      const{body,leg1,leg2,arm1,arm2}=buildEnemyMesh(t);
      body.position.set(ex,t.sz*1.1,ez);scene.add(body);
      const sc=1+(floor-1)*.25; // HP scales 25% per floor
      const spdSc=1+(floor-1)*.03; // speed scales 3% per floor (gentle)
      enemies.push({mesh:body,x:ex,z:ez,name:t.name,avatar:t.avatar,hp:~~(t.hp*sc),maxHp:~~(t.hp*sc),atk:~~(t.atk*(1+(floor-1)*.15)),speed:t.spd*spdSc,xp:~~(t.xp*(1+(floor-1)*.1)),xpBonus:t.xpBonus,size:t.sz,state:'idle',attackTimer:0,leg1,leg2,arm1,arm2,legPhase:0,alertTimer:0,inBattle:false,dying:false});
    }
    if(Math.random()<.4)spawnItemInRoom(rm);
    // Decorations
    spawnDecorations(rm);
    // Challenge terminal (15% chance per room, not in first 2 rooms)
    if(i>2&&Math.random()<.15)spawnChallengeTerminal(rm);
  }
  challengeTerminals=challengeTerminals||[];
}

// Room decoration spawner
function spawnDecorations(rm){
  const theme=FLOOR_THEMES[(floor-1)%FLOOR_THEMES.length];
  if(!theme.decos)return;
  const count=1+~~(Math.random()*2);
  for(let d=0;d<count;d++){
    const pool=theme.decos.filter(dc=>Math.random()<dc.chance);
    if(!pool.length)continue;
    const dc=pool[~~(Math.random()*pool.length)];
    const px=(rm.x+1+Math.random()*(rm.w-2))*TILE;
    const pz=(rm.y+1+Math.random()*(rm.h-2))*TILE;
    const mat=new THREE.MeshStandardMaterial({color:dc.col,emissive:dc.em||0x000000,emissiveIntensity:dc.em?1.5:0,roughness:.8});
    const g=new THREE.Group();
    let collR=dc.w*.5; // collision radius

    if(dc.type==='pillar'){
      // Stone pillar: base + column + broken top
      const base=new THREE.Mesh(new THREE.BoxGeometry(dc.w*1.2,.15,dc.w*1.2),mat);base.position.y=.08;g.add(base);
      const col=new THREE.Mesh(new THREE.BoxGeometry(dc.w,dc.h,dc.w),mat);col.position.y=dc.h*.5;g.add(col);
      const top=new THREE.Mesh(new THREE.BoxGeometry(dc.w*1.1,.12,dc.w*1.1),mat);top.position.y=dc.h;g.add(top);
      collR=dc.w*.7;
    }else if(dc.type==='tree'){
      // Dead tree: thick trunk + branches
      const trunk=new THREE.Mesh(new THREE.BoxGeometry(dc.w*1.5,dc.h,dc.w*1.5),mat);trunk.position.y=dc.h*.5;g.add(trunk);
      const br1=new THREE.Mesh(new THREE.BoxGeometry(dc.w,dc.h*.3,dc.w*.5),mat);br1.position.set(dc.w*.8,dc.h*.7,0);br1.rotation.z=-.5;g.add(br1);
      const br2=new THREE.Mesh(new THREE.BoxGeometry(dc.w*.5,dc.h*.25,dc.w),mat);br2.position.set(-dc.w*.6,dc.h*.5,dc.w*.3);br2.rotation.z=.4;g.add(br2);
      collR=dc.w;
    }else if(dc.type==='crate'){
      // Wooden crate with cross planks
      const box=new THREE.Mesh(new THREE.BoxGeometry(dc.w,dc.h,dc.w),mat);box.position.y=dc.h*.5;g.add(box);
      const plank=new THREE.Mesh(new THREE.BoxGeometry(dc.w*.1,dc.h*.8,dc.w*1.02),new THREE.MeshStandardMaterial({color:0x3a2a10,roughness:.9}));
      plank.position.y=dc.h*.5;plank.rotation.z=.7;g.add(plank);
      collR=dc.w*.5;
    }else if(dc.type==='crystal'||dc.type==='frost'){
      mat.transparent=true;mat.opacity=.7;mat.metalness=.3;
      const c1=new THREE.Mesh(new THREE.BoxGeometry(dc.w*.4,dc.h,dc.w*.4),mat);c1.position.y=dc.h*.5;c1.rotation.y=.3;g.add(c1);
      const c2=new THREE.Mesh(new THREE.BoxGeometry(dc.w*.3,dc.h*.7,dc.w*.3),mat);c2.position.set(dc.w*.3,dc.h*.35,dc.w*.2);c2.rotation.z=.2;g.add(c2);
      collR=dc.w*.4;
    }else if(dc.type==='server'||dc.type==='console'){
      // Server rack / console: tall box + screen
      const rack=new THREE.Mesh(new THREE.BoxGeometry(dc.w,dc.h,dc.w*.6),mat);rack.position.y=dc.h*.5;g.add(rack);
      const scrM=new THREE.MeshStandardMaterial({color:dc.em||0x44ff44,emissive:dc.em||0x44ff44,emissiveIntensity:2,transparent:true,opacity:.6});
      const scr=new THREE.Mesh(new THREE.BoxGeometry(dc.w*.7,dc.h*.35,.02),scrM);scr.position.set(0,dc.h*.65,dc.w*.31);g.add(scr);
      // Blinking lights
      for(let i=0;i<3;i++){
        const led=new THREE.Mesh(new THREE.BoxGeometry(.04,.04,.02),new THREE.MeshStandardMaterial({color:0x44ff44,emissive:0x44ff44,emissiveIntensity:3}));
        led.position.set(-dc.w*.25+i*.12,dc.h*.3,dc.w*.31);g.add(led);
      }
      collR=dc.w*.5;
    }else if(dc.type==='rock'){
      const r1=new THREE.Mesh(new THREE.BoxGeometry(dc.w,dc.h,dc.w*.8),mat);r1.position.y=dc.h*.5;r1.rotation.y=Math.random()*Math.PI;g.add(r1);
      const r2=new THREE.Mesh(new THREE.BoxGeometry(dc.w*.6,dc.h*.4,dc.w*.5),mat);r2.position.set(dc.w*.3,dc.h*.2,dc.w*.2);g.add(r2);
      collR=dc.w*.5;
    }else if(dc.type==='barrel'){
      const body=new THREE.Mesh(new THREE.CylinderGeometry(dc.w*.4,dc.w*.4,dc.h,8),mat);body.position.y=dc.h*.5;g.add(body);
      const rim1=new THREE.Mesh(new THREE.TorusGeometry(dc.w*.4,.02,4,8),new THREE.MeshStandardMaterial({color:0x4a4a4a,metalness:.5}));rim1.position.y=dc.h*.15;rim1.rotation.x=Math.PI/2;g.add(rim1);
      const rim2=rim1.clone();rim2.position.y=dc.h*.85;g.add(rim2);
      collR=dc.w*.4;
    }else if(dc.type==='pipe'){
      const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,dc.w*2,6),mat);p.position.y=.5;p.rotation.z=Math.PI/2;g.add(p);
      collR=.1; // thin, small collision
    }else if(dc.type==='mushroom'){
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(dc.w*.25,dc.w*.35,dc.h*.5,5),new THREE.MeshStandardMaterial({color:0xccccaa,roughness:.9}));
      stem.position.y=dc.h*.25;g.add(stem);
      const cap=new THREE.Mesh(new THREE.CylinderGeometry(dc.w*.1,dc.w*1.2,dc.h*.25,6),mat);
      cap.position.y=dc.h*.55;g.add(cap);
      collR=dc.w*.3;
    }else if(dc.type==='bones'){
      // Flat bones on ground
      for(let i=0;i<3;i++){
        const b=new THREE.Mesh(new THREE.BoxGeometry(dc.w*(0.5+Math.random()*.5),.04,.06),mat);
        b.position.set((Math.random()-.5)*dc.w,.02,(Math.random()-.5)*dc.w);b.rotation.y=Math.random()*Math.PI;g.add(b);
      }
      collR=0; // no collision for flat ground items
    }else if(dc.type==='altar'){
      const base=new THREE.Mesh(new THREE.BoxGeometry(dc.w,dc.h*.4,dc.w),mat);base.position.y=dc.h*.2;g.add(base);
      const slab=new THREE.Mesh(new THREE.BoxGeometry(dc.w*1.1,.08,dc.w*1.1),mat);slab.position.y=dc.h*.42;g.add(slab);
      if(dc.em){
        const orb=new THREE.Mesh(new THREE.SphereGeometry(.12,6,6),new THREE.MeshStandardMaterial({color:dc.em,emissive:dc.em,emissiveIntensity:3,transparent:true,opacity:.5}));
        orb.position.y=dc.h*.7;g.add(orb);
      }
      collR=dc.w*.6;
    }else if(dc.type==='statue'){
      // Blocky humanoid statue
      const pedestal=new THREE.Mesh(new THREE.BoxGeometry(dc.w*.8,.2,dc.w*.8),mat);pedestal.position.y=.1;g.add(pedestal);
      const body=new THREE.Mesh(new THREE.BoxGeometry(dc.w*.5,dc.h*.5,dc.w*.3),mat);body.position.y=dc.h*.35;g.add(body);
      const head=new THREE.Mesh(new THREE.BoxGeometry(dc.w*.35,dc.w*.35,dc.w*.35),mat);head.position.y=dc.h*.7;g.add(head);
      // One arm broken off
      const arm=new THREE.Mesh(new THREE.BoxGeometry(dc.w*.15,dc.h*.3,dc.w*.15),mat);arm.position.set(dc.w*.35,dc.h*.3,0);g.add(arm);
      collR=dc.w*.5;
    }else if(dc.type==='forge'){
      const body=new THREE.Mesh(new THREE.BoxGeometry(dc.w,dc.h,dc.w),mat);body.position.y=dc.h*.5;g.add(body);
      // Fire inside
      if(dc.em){
        const fire=new THREE.Mesh(new THREE.BoxGeometry(dc.w*.6,dc.h*.3,dc.w*.3),new THREE.MeshStandardMaterial({color:dc.em,emissive:dc.em,emissiveIntensity:3,transparent:true,opacity:.7}));
        fire.position.set(0,dc.h*.2,dc.w*.4);g.add(fire);
      }
      collR=dc.w*.5;
    }else if(dc.type==='chain'){
      // Hanging chain: series of small boxes
      for(let i=0;i<~~(dc.h/.15);i++){
        const link=new THREE.Mesh(new THREE.BoxGeometry(.06,.12,.06),mat);link.position.y=dc.h-i*.15;link.rotation.y=i%2?0:Math.PI/4;g.add(link);
      }
      collR=.1;
    }else if(dc.type==='anvil'){
      const base=new THREE.Mesh(new THREE.BoxGeometry(dc.w*.8,dc.h*.4,dc.w*.5),mat);base.position.y=dc.h*.2;g.add(base);
      const top=new THREE.Mesh(new THREE.BoxGeometry(dc.w,dc.h*.2,dc.w*.4),mat);top.position.y=dc.h*.5;g.add(top);
      const horn=new THREE.Mesh(new THREE.BoxGeometry(dc.w*.15,dc.h*.15,dc.w*.3),mat);horn.position.set(dc.w*.5,dc.h*.45,0);g.add(horn);
      collR=dc.w*.5;
    }

    g.position.set(px,0,pz);scene.add(g);
    // Add collision (except flat/thin items)
    if(collR>0.1)decoBlocks.push({x:px,z:pz,r:collR});
  }
}

function placeTorch(x,z){
  const theme=FLOOR_THEMES[(floor-1)%FLOOR_THEMES.length];
  // Simple torch: stick + flame (minimal meshes)
  const stick=new THREE.Mesh(new THREE.BoxGeometry(.08,.5,.08),new THREE.MeshStandardMaterial({color:0x4a2a08,roughness:.9}));
  stick.position.set(x,.25,z);scene.add(stick);
  const flameM=new THREE.MeshStandardMaterial({color:theme.torch,emissive:theme.torch,emissiveIntensity:4,transparent:true,opacity:.85});
  const f1=new THREE.Mesh(new THREE.ConeGeometry(.08,.2,4),flameM);
  f1.position.set(x,.6,z);scene.add(f1);
  // Only 1 PointLight per 3 torches for perf
  let l=null;
  if(torches.length%3===0){l=new THREE.PointLight(theme.torch,theme.torchI,8);l.position.set(x,.8,z);scene.add(l);}
  torches.push({light:l,flame:f1,base:theme.torchI});
}

function spawnItemInRoom(rm){
  const types=['mp','xp'],type=types[~~(Math.random()*2)];
  spawnItemAt((rm.x+1+Math.random()*(rm.w-2))*TILE,(rm.y+1+Math.random()*(rm.h-2))*TILE,type);
}
function spawnItemAt(ix,iz,type){
  const c={hp:{col:0xff4444,em:0xff0000,s:.22},mp:{col:0x4444ff,em:0x0000ff,s:.22},xp:{col:0x44ff44,em:0x00aa00,s:.22}}[type];
  const m=new THREE.Mesh(new THREE.OctahedronGeometry(c.s,0),new THREE.MeshStandardMaterial({color:c.col,emissive:c.em,emissiveIntensity:1.5,metalness:.4,roughness:.3}));
  m.position.set(ix,.4,iz);scene.add(m);
  items.push({mesh:m,x:ix,z:iz,type,collected:false});
}

