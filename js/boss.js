// ═══════════════════════════════════
//  BOSS SYSTEM — PHOENIX GUARDIAN
// ═══════════════════════════════════
var bossEntity=null;
var bossQIdx=0;
var bossProjectiles=[];
var bossShootTimer=0;

var BOSS_CHALLENGES=[
  {q:'【要件定義】成績処理関数\n\n引数: 点数のリスト scores\n処理:\n  1. 50点未満の不合格者を除外\n  2. 合格者の点数を昇順ソート\n  3. ソート済みリストを返す\n\n例: process([30,85,42,90,55]) → [55, 85, 90]',
   template:'def process(scores):\n    passed = [s for s in scores if _____]\n    passed.sort()\n    return passed\n\nprint(process([30, 85, 42, 90, 55, 10, 78, 63]))',
   answer:'[55, 63, 78, 85, 90]',hint:'フィルタ条件: 50点以上を残す'},
  {q:'【要件定義】暗号変換関数\n\n引数: 文字列 text, シフト数 n\n処理:\n  1. 各文字のASCIIコードに n を加算\n  2. 変換後の文字を結合して返す\n  3. アルファベット以外はそのまま\n\n例: encode("ABC", 3) → "DEF"\n     encode("XYZ", 3) → "ABC" (巡回する)',
   template:'def encode(text, n):\n    result = ""\n    for ch in text:\n        if ch >= "A" and ch <= "Z":\n            code = ord(ch) - ord("A")\n            new_code = _____ % 26\n            result += chr(new_code + ord("A"))\n        else:\n            result += ch\n    return result\n\nprint(encode("HELLO WORLD", 7))',
   answer:'OLSSV DVYSK',hint:'シフト後のコードを26で割った余りで巡回させる'},
  {q:'【要件定義】データ集計関数\n\n引数: 名前と点数のペアのリスト\n処理:\n  1. 各名前の合計点を計算\n  2. 合計点が最も高い人の名前を返す\n\n例: top_scorer([["A",80],["B",90],["A",70]]) → "A" (150点)',
   template:'names = [["Alice",80],["Bob",90],["Alice",70],["Bob",60],["Alice",50]]\ntotals = {}\nfor pair in names:\n    name = pair[0]\n    score = pair[1]\n    if name in totals:\n        totals[name] += score\n    else:\n        totals[name] = score\nbest = ""\nbest_score = 0\nfor name in totals:\n    if totals[name] > _____:\n        best = name\n        best_score = totals[name]\nprint(best)',
   answer:'Alice',hint:'現在のベストスコアと比較して更新する'},
];

function spawnBoss(){
  var sx=dungeon.stairX*TILE,sz=dungeon.stairY*TILE;
  var bg=new THREE.Group();
  var S=1.5;
  var bodyM=new THREE.MeshStandardMaterial({color:0x4a0000,emissive:0x3a0000,emissiveIntensity:.6,roughness:.6,metalness:.2});
  var armorM=new THREE.MeshStandardMaterial({color:0x1a1a1a,emissive:0x0a0a0a,roughness:.4,metalness:.6});
  var eyeM=new THREE.MeshStandardMaterial({color:0xff0000,emissive:0xff0000,emissiveIntensity:6});
  var fireM=new THREE.MeshStandardMaterial({color:0xff4400,emissive:0xff2200,emissiveIntensity:3,transparent:true,opacity:.6});
  var legM=new THREE.MeshStandardMaterial({color:0x2a0808,roughness:.7,metalness:.3});
  var l1=new THREE.Mesh(new THREE.BoxGeometry(S*.5,S*1.3,S*.5),legM);l1.position.set(-S*.4,S*.65,0);bg.add(l1);
  var l2=new THREE.Mesh(new THREE.BoxGeometry(S*.5,S*1.3,S*.5),legM);l2.position.set(S*.4,S*.65,0);bg.add(l2);
  var torso=new THREE.Mesh(new THREE.BoxGeometry(S*1.4,S*1.6,S*.9),bodyM);torso.position.y=S*2.1;bg.add(torso);
  var plate=new THREE.Mesh(new THREE.BoxGeometry(S*1.0,S*.8,S*.1),armorM);plate.position.set(0,S*2.2,S*.46);bg.add(plate);
  var sp1=new THREE.Mesh(new THREE.BoxGeometry(S*.6,S*.3,S*.6),armorM);sp1.position.set(-S*.85,S*2.8,0);bg.add(sp1);
  var sp2=new THREE.Mesh(new THREE.BoxGeometry(S*.6,S*.3,S*.6),armorM);sp2.position.set(S*.85,S*2.8,0);bg.add(sp2);
  var spkM=new THREE.MeshStandardMaterial({color:0x1a0000,emissive:0x330000,roughness:.5,metalness:.5});
  var sk1=new THREE.Mesh(new THREE.BoxGeometry(S*.1,S*.5,S*.1),spkM);sk1.position.set(-S*.85,S*3.2,0);bg.add(sk1);
  var sk2=new THREE.Mesh(new THREE.BoxGeometry(S*.1,S*.5,S*.1),spkM);sk2.position.set(S*.85,S*3.2,0);bg.add(sk2);
  var arm1=new THREE.Mesh(new THREE.BoxGeometry(S*.4,S*1.5,S*.4),bodyM);arm1.position.set(-S*1.0,S*1.8,0);bg.add(arm1);
  var arm2=new THREE.Mesh(new THREE.BoxGeometry(S*.4,S*1.5,S*.4),bodyM);arm2.position.set(S*1.0,S*1.8,0);bg.add(arm2);
  var fist1=new THREE.Mesh(new THREE.BoxGeometry(S*.5,S*.5,S*.5),armorM);fist1.position.set(-S*1.0,S*.9,0);bg.add(fist1);
  var fist2=new THREE.Mesh(new THREE.BoxGeometry(S*.5,S*.5,S*.5),armorM);fist2.position.set(S*1.0,S*.9,0);bg.add(fist2);
  var head=new THREE.Mesh(new THREE.BoxGeometry(S*.9,S*.9,S*.9),bodyM);head.position.y=S*3.4;bg.add(head);
  var e1=new THREE.Mesh(new THREE.BoxGeometry(S*.18,S*.1,S*.05),eyeM);e1.position.set(-S*.22,S*3.5,S*.46);bg.add(e1);
  var e2=new THREE.Mesh(new THREE.BoxGeometry(S*.18,S*.1,S*.05),eyeM);e2.position.set(S*.22,S*3.5,S*.46);bg.add(e2);
  var e3=new THREE.Mesh(new THREE.BoxGeometry(S*.12,S*.08,S*.05),eyeM);e3.position.set(0,S*3.7,S*.46);bg.add(e3);
  var hornM=new THREE.MeshStandardMaterial({color:0x0a0000,emissive:0x220000,roughness:.4,metalness:.5});
  var h1a=new THREE.Mesh(new THREE.BoxGeometry(S*.14,S*.5,S*.14),hornM);h1a.position.set(-S*.4,S*4.0,0);h1a.rotation.z=.2;bg.add(h1a);
  var h1b=new THREE.Mesh(new THREE.BoxGeometry(S*.1,S*.4,S*.1),hornM);h1b.position.set(-S*.55,S*4.4,0);h1b.rotation.z=.4;bg.add(h1b);
  var h2a=new THREE.Mesh(new THREE.BoxGeometry(S*.14,S*.5,S*.14),hornM);h2a.position.set(S*.4,S*4.0,0);h2a.rotation.z=-.2;bg.add(h2a);
  var h2b=new THREE.Mesh(new THREE.BoxGeometry(S*.1,S*.4,S*.1),hornM);h2b.position.set(S*.55,S*4.4,0);h2b.rotation.z=-.4;bg.add(h2b);
  var wingM=new THREE.MeshStandardMaterial({color:0x2a0000,emissive:0x1a0000,side:THREE.DoubleSide,transparent:true,opacity:.7});
  var w1=new THREE.Mesh(new THREE.BoxGeometry(S*1.5,S*1.2,S*.04),wingM);w1.position.set(-S*1.2,S*2.8,-S*.3);w1.rotation.y=.3;bg.add(w1);
  var w2=new THREE.Mesh(new THREE.BoxGeometry(S*1.5,S*1.2,S*.04),wingM);w2.position.set(S*1.2,S*2.8,-S*.3);w2.rotation.y=-.3;bg.add(w2);
  for(var ti=0;ti<5;ti++){
    var tc=new THREE.Mesh(new THREE.BoxGeometry(S*.12-ti*.01,S*.12-ti*.01,S*.2),bodyM);
    tc.position.set(0,S*.5-ti*S*.06,-S*.5-ti*S*.2);bg.add(tc);
  }
  var aura=new THREE.Mesh(new THREE.SphereGeometry(S*2.0,8,8),new THREE.MeshStandardMaterial({color:0xff2200,emissive:0xff0000,emissiveIntensity:2,transparent:true,opacity:.15}));
  aura.position.y=S*2;bg.add(aura);
  var aura2=new THREE.Mesh(new THREE.SphereGeometry(S*3.0,6,6),new THREE.MeshStandardMaterial({color:0xff4400,emissive:0xff2200,emissiveIntensity:1,transparent:true,opacity:.06}));
  aura2.position.y=S*2;bg.add(aura2);
  var fp1=new THREE.Mesh(new THREE.BoxGeometry(S*.2,S*.3,S*.2),fireM);fp1.position.set(-S*.85,S*3.4,0);bg.add(fp1);
  var fp2=new THREE.Mesh(new THREE.BoxGeometry(S*.2,S*.3,S*.2),fireM);fp2.position.set(S*.85,S*3.4,0);bg.add(fp2);
  bg.position.set(sx,0,sz);scene.add(bg);
  bossEntity={mesh:bg,x:sx,z:sz,hp:3,maxHp:3,defeated:false,aura:aura,aura2:aura2,
    arm1:arm1,arm2:arm2,head:head,fp1:fp1,fp2:fp2,l1:l1,l2:l2,phase:0};
  bossQIdx=0;
  showMessage('\uD83D\uDD25 \u30DC\u30B9\u300CPHOENIX GUARDIAN\u300D\u304C\u51FA\u73FE\u3057\u305F\uFF01','#ff2200');
  showMessage('\u8FD1\u3065\u3044\u3066\u30B3\u30FC\u30C7\u30A3\u30F3\u30B0\u30D0\u30C8\u30EB\u3067\u5012\u305B\uFF01','#ff8844');
}

function checkBoss(){
  if(!bossEntity||bossEntity.defeated)return;
  if(cipherActive||challengeActive||battleActive||repairActive)return;
  var b=bossEntity;
  var dx=player.x-b.x,dz=player.z-b.z;
  var dist=Math.sqrt(dx*dx+dz*dz);
  b.phase+=.02;
  b.mesh.rotation.y=Math.atan2(-dx,-dz);
  if(b.aura)b.aura.scale.setScalar(1+Math.sin(b.phase*2)*.1);
  if(b.aura2)b.aura2.rotation.y+=.005;
  if(b.fp1){b.fp1.scale.y=1+Math.sin(b.phase*4)*.4;b.fp2.scale.y=1+Math.cos(b.phase*4)*.4;}
  b.mesh.position.y=Math.sin(b.phase*.8)*.15;
  var bossSpeed=.05;
  if(dist>4&&dist<30){
    var ndx=dx/dist,ndz=dz/dist;
    var nx=b.x+ndx*bossSpeed,nz=b.z+ndz*bossSpeed;
    if(!isWallOnly(nx,b.z))b.x=nx;
    if(!isWallOnly(b.x,nz))b.z=nz;
    b.mesh.position.x=b.x;b.mesh.position.z=b.z;
    for(var ei=0;ei<enemies.length;ei++){
      var en=enemies[ei];if(en.hp<=0)continue;
      var edx=en.x-b.x,edz=en.z-b.z;
      if(edx*edx+edz*edz<2.5){killEnemy(en);showMessage('\uD83D\uDC79 \u30DC\u30B9\u304C\u30E2\u30D6\u3092\u8E0F\u307F\u6F70\u3057\u305F\uFF01','#ff8844');}
    }
    if(b.l1){b.l1.rotation.x=Math.sin(b.phase*3)*.3;b.l2.rotation.x=-Math.sin(b.phase*3)*.3;}
    if(b.arm1){b.arm1.rotation.x=-Math.sin(b.phase*3)*.4;b.arm2.rotation.x=Math.sin(b.phase*3)*.4;}
  }else{
    if(b.arm1){b.arm1.rotation.x=Math.sin(b.phase*1.5)*.2;b.arm2.rotation.x=-Math.sin(b.phase*1.5)*.2;}
    if(b.l1){b.l1.rotation.x=Math.sin(b.phase)*.1;b.l2.rotation.x=-Math.sin(b.phase)*.1;}
  }
  bossShootTimer-=.016;
  if(bossShootTimer<=0&&dist<25&&dist>3){
    bossShootTimer=2+Math.random()*1.5;
    bossShootFireball(b,dx,dz,dist);
  }
  if(dist<2.5&&battleCooldown<=0){openBossBattle();}
}

function bossShootFireball(b,dx,dz,dist){
  var ndx=dx/dist,ndz=dz/dist;
  var projMat=new THREE.MeshStandardMaterial({color:0xff2200,emissive:0xff0000,emissiveIntensity:3,transparent:true,opacity:.8});
  var proj=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.3),projMat);
  proj.position.set(b.x,1.5,b.z);scene.add(proj);
  bossProjectiles.push({mesh:proj,x:b.x,z:b.z,dx:ndx*.15,dz:ndz*.15,life:120});
  playSound('hit');
}

function updateBossProjectiles(){
  for(var i=bossProjectiles.length-1;i>=0;i--){
    var p=bossProjectiles[i];
    p.x+=p.dx;p.z+=p.dz;p.life--;
    p.mesh.position.set(p.x,1.5+Math.sin(p.life*.2)*.1,p.z);
    p.mesh.rotation.x+=.15;p.mesh.rotation.y+=.1;
    var pdx=p.x-player.x,pdz=p.z-player.z;
    if(pdx*pdx+pdz*pdz<.8){
      var dmg=40+~~(Math.random()*25);
      player.hp=Math.max(0,player.hp-dmg);
      showMessage('\uD83D\uDD25 \u30DC\u30B9\u306E\u653B\u6483\uFF01 -'+dmg+'HP','#ff4444');
      playSound('wrong');scene.remove(p.mesh);bossProjectiles.splice(i,1);
      updateHUD();if(player.hp<=0){gameOver();}continue;
    }
    if(p.life<=0||isWall(p.x,p.z)){scene.remove(p.mesh);bossProjectiles.splice(i,1);}
  }
}

function openBossBattle(){
  if(gameState!=='playing'||!bossEntity)return;
  gameState='cipher';document.exitPointerLock();
  startBossBGM();
  var ch=BOSS_CHALLENGES[bossQIdx];
  var modal=document.getElementById('cipher-modal');
  document.getElementById('cm-avatar').textContent='\uD83D\uDC79';
  document.getElementById('cm-name').textContent='PHOENIX GUARDIAN';
  document.getElementById('cm-stage-sub').textContent='\u30DC\u30B9\u30D0\u30C8\u30EB '+(bossQIdx+1)+'/'+BOSS_CHALLENGES.length+' \u2014 \u8981\u4EF6\u3092\u6E80\u305F\u3059\u95A2\u6570\u3092\u66F8\u3051';
  document.getElementById('cm-mission').textContent=ch.q;
  document.getElementById('cm-data').style.display='none';
  document.getElementById('cm-hint').textContent='\u30D2\u30F3\u30C8: '+ch.hint;
  document.getElementById('cm-footer').textContent='\uD83D\uDC79 \u30DC\u30B9 HP: '+bossEntity.hp+'/'+bossEntity.maxHp;
  document.getElementById('code-editor-wrap').classList.add('show');
  initAceEditor();setEditorCode(ch.template);setEditorReadOnly(false);
  document.getElementById('code-output-wrap').classList.remove('show');
  document.getElementById('cm-input-row').style.display='none';
  document.getElementById('c-result').style.display='none';
  document.getElementById('c-continue-btn').style.display='none';
  document.getElementById('secret-reveal').classList.remove('show');
  document.getElementById('agent-phase').classList.remove('show');
  document.getElementById('cipher-close-btn').style.display='none';
  document.getElementById('code-run-btn').onclick=function(){
    try{
      var code=getEditorCode();
      var result=miniPyEval(code);
      document.getElementById('code-output-wrap').classList.add('show');
      document.getElementById('code-output').textContent=result||'(\u51FA\u529B\u306A\u3057)';
      if(result.trim()===ch.answer){
        document.getElementById('code-output').style.color='#44ff88';
        bossEntity.hp--;bossQIdx++;
        playSound('correct');
        var r=document.getElementById('c-result');r.style.display='flex';r.className='correct-res';
        document.getElementById('cr-icon').textContent='\u2694';
        if(bossEntity.hp<=0){
          document.getElementById('cr-msg').innerHTML='<strong>\u30DC\u30B9\u64C3\u7834\uFF01\uFF01</strong>';
          bossEntity.defeated=true;scene.remove(bossEntity.mesh);
          for(var pi=0;pi<bossProjectiles.length;pi++)scene.remove(bossProjectiles[pi].mesh);
          bossProjectiles=[];
          playSound('clear');
          setTimeout(function(){closeBossModal();unlockPortal();
            showMessage('\uD83D\uDD25 PHOENIX GUARDIAN \u3092\u64C3\u7834\uFF01','#ff8800');
            showMessage('\u8131\u51FA\u53E3\u304C\u51FA\u73FE\u3057\u305F\uFF01','#44ffaa');},2500);
        }else{
          document.getElementById('cr-msg').innerHTML='<strong>\u30C0\u30E1\u30FC\u30B8\uFF01 \u30DC\u30B9 HP: '+bossEntity.hp+'/'+bossEntity.maxHp+'</strong><br>\u6B21\u306E\u30C1\u30E3\u30EC\u30F3\u30B8\u3078\u2026';
          setTimeout(function(){closeBossModal();battleCooldown=2;},2000);
        }
      }else if(result.indexOf('Error')===0){
        document.getElementById('code-output').style.color='#ff6666';
      }else{
        document.getElementById('code-output').style.color='#ffaa88';
        showMessage('\u51FA\u529B\u304C\u9055\u3046\u2026 \u30B3\u30FC\u30C9\u3092\u4FEE\u6B63\u3057\u3066\u518D\u5B9F\u884C','#ff8844');
      }
    }catch(e){
      document.getElementById('code-output-wrap').classList.add('show');
      document.getElementById('code-output').textContent='Error: '+e.message;
      document.getElementById('code-output').style.color='#ff6666';
    }
  };
  clearInterval(cipherTimerInt);cipherTimerVal=600;
  var el=document.getElementById('cipher-timer');el.classList.remove('danger');
  var fmtT=function(s){var m=Math.floor(s/60);return m>0?m+':'+('0'+s%60).slice(-2):String(s);};
  el.textContent=fmtT(cipherTimerVal);
  cipherTimerInt=setInterval(function(){cipherTimerVal--;el.textContent=fmtT(cipherTimerVal);
    if(cipherTimerVal<=30)el.classList.add('danger');
    if(cipherTimerVal<=0){clearInterval(cipherTimerInt);closeBossModal();showMessage('\u23F0 \u6642\u9593\u5207\u308C\u2026\u518D\u6311\u6226\u3057\u3088\u3046','#ff8844');battleCooldown=3;}
  },1000);
  modal.classList.add('open');
  // Don't auto-focus editor — user clicks to start typing
}

function closeBossModal(){
  clearInterval(cipherTimerInt);
  document.getElementById('cipher-modal').classList.remove('open');
  document.getElementById('code-editor-wrap').classList.remove('show');
  document.getElementById('code-output-wrap').classList.remove('show');
  document.getElementById('cm-data').style.display='';
  document.getElementById('cipher-close-btn').style.display='none';
  document.getElementById('c-submit').onclick=function(){submitCipherAnswer();};
  document.getElementById('c-input').onkeydown=function(e){if(e.key==='Enter')submitCipherAnswer();};
  gameState='playing';
  if(bossEntity&&!bossEntity.defeated){startBossBGM();}
  else{stopBGM();startBGM(floor);}
  setTimeout(function(){canvas.requestPointerLock();},350);
}

function unlockPortal(){
  cipherSolved=true;
  if(stairMesh){scene.remove(stairMesh);if(stairLight)scene.remove(stairLight);}
  var sx=dungeon.stairX*TILE,sz=dungeon.stairY*TILE;
  var pg=new THREE.Group();
  var isFinal=(currentCipherStage>=5);
  if(isFinal){
    var H=TILE*1.2;
    var goldM=new THREE.MeshStandardMaterial({color:0xddaa22,emissive:0xaa7700,emissiveIntensity:1,roughness:.3,metalness:.6});
    var plat=new THREE.Mesh(new THREE.CylinderGeometry(2.5,3.0,.2,12),goldM);plat.position.y=.1;pg.add(plat);
    var ring=new THREE.Mesh(new THREE.TorusGeometry(2.0,.12,8,20),goldM);ring.rotation.x=-Math.PI/2;ring.position.y=.25;pg.add(ring);
    for(var i=0;i<8;i++){
      var a=i*Math.PI/4;
      var pil=new THREE.Mesh(new THREE.BoxGeometry(.25,H,.25),goldM);pil.position.set(Math.cos(a)*2.2,H/2,Math.sin(a)*2.2);pg.add(pil);
      var orb=new THREE.Mesh(new THREE.SphereGeometry(.15,6,6),new THREE.MeshStandardMaterial({
        color:i%2===0?0xffdd44:0x44ffaa,emissive:i%2===0?0xffaa00:0x22ff88,emissiveIntensity:4,transparent:true,opacity:.8}));
      orb.position.set(Math.cos(a)*2.2,H+.2,Math.sin(a)*2.2);pg.add(orb);
    }
    var arch=new THREE.Mesh(new THREE.TorusGeometry(2.2,.15,8,20),goldM);arch.rotation.x=-Math.PI/2;arch.position.y=H;pg.add(arch);
    var beamM=new THREE.MeshStandardMaterial({color:0xffffaa,emissive:0xffff44,emissiveIntensity:4,transparent:true,opacity:.4});
    var beam=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,H*1.5,8),beamM);beam.position.y=H*.75;pg.add(beam);
    var glowM=new THREE.MeshStandardMaterial({color:0xffdd44,emissive:0xffaa00,emissiveIntensity:2,transparent:true,opacity:.1});
    var glow=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,H*1.2,8),glowM);glow.position.y=H*.6;pg.add(glow);
    for(var j=0;j<6;j++){
      var pc=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1),new THREE.MeshStandardMaterial({
        color:0xffdd44,emissive:0xffaa00,emissiveIntensity:3,transparent:true,opacity:.7}));
      pc.position.set((Math.random()-.5)*2,1+Math.random()*H,(Math.random()-.5)*2);pg.add(pc);
    }
    pg.position.set(sx,0,sz);scene.add(pg);stairMesh=pg;
    stairLight=new THREE.PointLight(0xffdd44,6,20);stairLight.position.set(sx,H,sz);scene.add(stairLight);
    var sl2=new THREE.PointLight(0xffffaa,3,15);sl2.position.set(sx,1,sz);scene.add(sl2);
  }else{
    var bm=new THREE.MeshStandardMaterial({color:0x3a6a3a,roughness:.6,metalness:.3});
    var ring2=new THREE.Mesh(new THREE.TorusGeometry(1.2,.15,8,16),bm);ring2.rotation.x=-Math.PI/2;ring2.position.y=.05;pg.add(ring2);
    var plat2=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.2,.12,12),bm);plat2.position.y=.06;pg.add(plat2);
    var pm=new THREE.MeshStandardMaterial({color:0x446644,emissive:0x1a3a1a,emissiveIntensity:.4,roughness:.5,metalness:.2});
    for(var i=0;i<4;i++){var a=i*Math.PI/2;var p=new THREE.Mesh(new THREE.BoxGeometry(.18,2.2,.18),pm);p.position.set(Math.cos(a)*1.0,1.1,Math.sin(a)*1.0);pg.add(p);var orb=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),new THREE.MeshStandardMaterial({color:0x44ff44,emissive:0x22ff22,emissiveIntensity:3,transparent:true,opacity:.8}));orb.position.set(Math.cos(a)*1.0,2.3,Math.sin(a)*1.0);pg.add(orb);}
    var beamMat=new THREE.MeshStandardMaterial({color:0x44ff88,emissive:0x22ff44,emissiveIntensity:3,transparent:true,opacity:.3});
    pg.add(new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,3,8),beamMat));pg.children[pg.children.length-1].position.y=1.5;
    var bm2=beamMat.clone();bm2.opacity=.1;pg.add(new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,2.5,8),bm2));pg.children[pg.children.length-1].position.y=1.5;
    pg.position.set(sx,0,sz);scene.add(pg);stairMesh=pg;
    stairLight=new THREE.PointLight(0x44ff44,4,12);stairLight.position.set(sx,2.5,sz);scene.add(stairLight);
  }
  updateHUD();saveProgress();
}

function startBossBGM(){
  stopBGM();bgmCurrentFloor=-99;
  var a=new Audio('audio/bgm_boss.mp3');
  a.loop=true;a.volume=BGM_VOL*1.5;
  a.play().then(function(){bgmAudio=a;bgmPlaying=true;}).catch(function(){});
}
