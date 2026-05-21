// ═══════════════════════════════════
//  ITEM TERMINAL — Floor 1〜5 に 1 基ずつ
//  プレイヤーが近づくと選択肢から 1 つアイテムを選んで入手。
// ═══════════════════════════════════

var itemTerminals = [];
var itemActive = false;
var currentItemTerminal = null;

// ── Spawn one item terminal in a room ──
function spawnItemTerminal(rm){
  var cat = getCategoryForFloor(floor);
  if(!cat) return;                   // EXTRA (floor 6+) はアイテム配置なし
  if(inventory[floor]) return;       // 既に取得済みならスポーンしない

  var cx=(rm.x+~~(rm.w/2))*TILE, cz=(rm.y+~~(rm.h/2))*TILE;
  var sx=dungeon.stairX*TILE,    sz=dungeon.stairY*TILE;
  var tx=dungeon.termX*TILE,     tz=dungeon.termY*TILE;
  function tooClose(x,z){
    var ds=(x-sx)*(x-sx)+(z-sz)*(z-sz);
    var dt=(x-tx)*(x-tx)+(z-tz)*(z-tz);
    return ds<9*TILE*TILE || dt<9*TILE*TILE;
  }
  // 既存の repair terminal とも被らないように
  function nearRepair(x,z){
    if(typeof repairTerminals==='undefined') return false;
    for(var i=0;i<repairTerminals.length;i++){
      var rt=repairTerminals[i];
      var dd=(x-rt.x)*(x-rt.x)+(z-rt.z)*(z-rt.z);
      if(dd<9) return true;
    }
    return false;
  }
  var px=cx, pz=cz, ok=false;
  for(var attempt=0; attempt<25; attempt++){
    var ox=(Math.random()-.5)*rm.w*.5*TILE;
    var oz=(Math.random()-.5)*rm.h*.5*TILE;
    px=cx+ox; pz=cz+oz;
    if(!isWall(px,pz) && !tooClose(px,pz) && !nearRepair(px,pz)){ ok=true; break; }
  }
  if(!ok){ px=cx; pz=cz; if(isWall(px,pz)||tooClose(px,pz)||nearRepair(px,pz)) return; }

  // ── Visual: 紫～マゼンタ系のターミナル（修理: 黄色, 暗号: 緑 と差別化）──
  var tg=new THREE.Group();
  var col=cat.color, emCol=cat.emissive;
  var base=new THREE.Mesh(new THREE.CylinderGeometry(.75,.9,.25,8),
    new THREE.MeshStandardMaterial({color:col,emissive:emCol,emissiveIntensity:.6,metalness:.4}));
  base.position.y=.13; tg.add(base);
  // クリスタル状の本体
  var crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.7,0),
    new THREE.MeshStandardMaterial({color:col,emissive:emCol,emissiveIntensity:1.8,transparent:true,opacity:.85}));
  crystal.position.y=1.3; tg.add(crystal);
  // 浮遊する上部のオーブ
  var orb=new THREE.Mesh(new THREE.SphereGeometry(.25,12,12),
    new THREE.MeshStandardMaterial({color:col,emissive:emCol,emissiveIntensity:4,transparent:true,opacity:.9}));
  orb.position.y=2.4; tg.add(orb);
  // リング
  var ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.06,6,16),
    new THREE.MeshStandardMaterial({color:col,emissive:emCol,emissiveIntensity:2.5,transparent:true,opacity:.6}));
  ring.position.y=1.3; ring.rotation.x=Math.PI/2; tg.add(ring);
  // 光の柱
  var beam=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,5,8),
    new THREE.MeshStandardMaterial({color:col,emissive:emCol,emissiveIntensity:3,transparent:true,opacity:.3}));
  beam.position.y=2.5; tg.add(beam);
  var glow=new THREE.Mesh(new THREE.SphereGeometry(1.0,12,12),
    new THREE.MeshStandardMaterial({color:col,emissive:emCol,emissiveIntensity:2,transparent:true,opacity:.15}));
  glow.position.y=1.4; tg.add(glow);

  var light=new THREE.PointLight(col,4,15);
  light.position.set(px,2.5,pz); scene.add(light);
  tg.position.set(px,0,pz); scene.add(tg);
  itemTerminals.push({mesh:tg,light:light,orb:orb,crystal:crystal,x:px,z:pz,category:cat,solved:false,phase:Math.random()*6});
  if(typeof decoBlocks!=='undefined') decoBlocks.push({x:px,z:pz,r:.9});
}

// ── Animate item terminals ──
function updateItemTerminals(ts){
  for(var i=0;i<itemTerminals.length;i++){
    var it=itemTerminals[i];
    if(it.solved||!it.mesh) continue;
    var dx=it.x-player.x, dz=it.z-player.z;
    if(dx*dx+dz*dz>500) continue;
    it.phase += 0.05;
    if(it.orb)     it.orb.position.y     = 2.4 + Math.sin(it.phase)*0.2;
    if(it.crystal) it.crystal.rotation.y += 0.03;
    if(it.light)   it.light.intensity     = 3.5 + Math.sin(it.phase*1.5)*1;
  }
}

// ── Proximity check ──
function checkItemTerminals(){
  if(itemActive||repairActive||challengeActive||cipherActive||battleActive) return;
  if(Date.now()<challengeCooldownEnd) return;
  for(var i=0;i<itemTerminals.length;i++){
    var it=itemTerminals[i];
    if(it.solved) continue;
    var dx=it.x-player.x, dz=it.z-player.z;
    var dist=Math.sqrt(dx*dx+dz*dz);
    if(dist<3.5 && !approachTarget) approachTarget={type:'item',name:it.category.label,icon:'📦'};
    if(dist<2.0){ openItemPicker(it); return; }
  }
}

// ── Open item-picker modal ──
// terminal は省略可。指定なし（暗号クリア報酬など）の場合は currentItemTerminal=null。
function openItemPicker(terminalOrFloor){
  if(gameState!=='playing' && gameState!=='cipher') return;
  // 引数が数字なら floor 指定モード、オブジェクトなら terminal 指定モード
  var targetFloor, cat, terminal=null;
  if(typeof terminalOrFloor === 'number'){
    targetFloor = terminalOrFloor;
    cat = getCategoryForFloor(targetFloor);
  }else{
    terminal = terminalOrFloor;
    targetFloor = floor;
    cat = terminal && terminal.category ? terminal.category : getCategoryForFloor(floor);
  }
  if(!cat) return;
  if(inventory[targetFloor]) return;  // 既に取得済み

  itemActive=true; currentItemTerminal=terminal;
  gameState='cipher';
  document.exitPointerLock();
  if(typeof muteBGM==='function') muteBGM();

  var modal=document.getElementById('item-picker-modal');
  document.getElementById('ipm-title').textContent = '✨ アイテムが落ちている… 一つだけ持っていこう';
  document.getElementById('ipm-subtitle').textContent =
    'Floor '+targetFloor+'：'+cat.label+' から 1 つ選択（後で変更不可） — 収集: '+(inventoryCount())+'/5';

  var grid=document.getElementById('ipm-grid');
  grid.innerHTML='';
  cat.items.forEach(function(item){
    var card=document.createElement('div');
    card.className='ipm-card';
    var passiveBox = (item.passive && item.passive.label)
      ? '<div class="ipm-passive">'+item.passive.label+'</div>'
      : '';
    card.innerHTML =
      '<div class="ipm-icon">'+item.icon+'</div>'+
      '<div class="ipm-name">'+item.name+'</div>'+
      '<div class="ipm-tag">'+item.tag+'</div>'+
      '<div class="ipm-desc">'+item.desc+'</div>'+
      passiveBox +
      '<div class="ipm-stats">'+
        statBar('HP',     item.stats.hp,     80) +
        statBar('攻撃',   item.stats.atk,    25) +
        statBar('防御',   item.stats.def,    12) +
        statBar('速度',   item.stats.spd,    15) +
        statBar('EN',     item.stats.energy, 60) +
      '</div>'+
      '<button class="ipm-pick">これを選ぶ</button>';
    card.querySelector('.ipm-pick').onclick=function(){ pickItem(item.id); };
    grid.appendChild(card);
  });
  modal.classList.add('open');
}

function statBar(label,val,max){
  if(val===0) return '<div class="ipm-stat"><span class="ipm-stat-l">'+label+'</span><span class="ipm-stat-v" style="color:#888;">±0</span></div>';
  var sign = val>0?'+':'';
  var color = val>0?'#88ffaa':'#ff8888';
  var pct = Math.min(100, Math.abs(val)/max*100);
  return '<div class="ipm-stat"><span class="ipm-stat-l">'+label+'</span>'+
         '<span class="ipm-stat-v" style="color:'+color+'">'+sign+val+'</span>'+
         '<div class="ipm-stat-bar"><div class="ipm-stat-fill" style="width:'+pct+'%;background:'+color+'"></div></div></div>';
}

function pickItem(itemId){
  // 暗号報酬モードでは currentItemTerminal は null
  inventory[floor] = itemId;
  saveInventory();
  if(typeof saveProgress==='function') saveProgress();
  // 旧 3D ターミナルが残っていれば消す（後方互換用）
  if(currentItemTerminal){
    currentItemTerminal.solved = true;
    if(currentItemTerminal.mesh)  scene.remove(currentItemTerminal.mesh);
    if(currentItemTerminal.light) scene.remove(currentItemTerminal.light);
  }
  closeItemPicker();
  var picked = getItemById(itemId);
  if(typeof showMessage==='function'){
    showMessage('📦 '+picked.icon+' '+picked.name+' を入手！','#ffaa44');
    if(inventoryCount()>=5){
      playAssembleCinematic();
    }
  }
  if(typeof playSound==='function') playSound('pickup');
  if(typeof updateInventoryHUD==='function') updateInventoryHUD();
}

// シーン中は無敵 (battle 起動をブロック) にする
var cinematicActive = false;
var cinematicGraceUntil = 0;
var cinematicStartedAt = 0;
var cinematicPrevState = null;

// 5 アイテム揃ったときの組み立て演出
// 期間中:
//   - gameState='cinematic' で全プレイヤー操作・モブ移動・タイマー停止
//   - 画面を薄暗くしてロボット完成に注目させる
//   - 経過時間は totalPausedMs に加算してプレイ時間に含めない
function playAssembleCinematic(){
  if(typeof showMessage!=='function') return;
  cinematicActive = true;
  cinematicStartedAt = Date.now();
  cinematicPrevState = (typeof gameState!=='undefined') ? gameState : null;
  if(typeof gameState!=='undefined') gameState = 'cinematic';
  try{ document.exitPointerLock(); }catch(e){}
  var overlay = document.getElementById('cinematic-overlay');
  if(overlay) overlay.classList.add('show');

  var lines = [
    {t:'✨ アイテムが全て集まった…',     c:'#ffdd66', d:1800},
    {t:'🔧 組み立てれそうだ…',           c:'#ffcc77', d:2200},
    {t:'⚙ パーツが噛み合っていく…',      c:'#ffbb55', d:2200},
    {t:'🤖 ロボットが完成した！',         c:'#88ffaa', d:2400, assemble:true},
    {t:'…これ、何に使うんだろう？',       c:'#aaccff', d:2400},
  ];
  var delay = 1200;
  lines.forEach(function(l){
    setTimeout(function(){
      showMessage(l.t, l.c);
      // 「ロボットが完成した！」のタイミングで右上のスロットをロボットアイコンに
      if(l.assemble){
        robotAssembledHUD = true;
        if(typeof updateInventoryHUD==='function') updateInventoryHUD();
      }
    }, delay);
    delay += l.d;
  });
  // 全表示が終わった後 3 秒間は無敵を継続（接触中の敵から離れる猶予）
  var graceMs = 3000;
  setTimeout(function(){
    // 暗転オーバーレイを消し、操作とモブを再開
    if(overlay) overlay.classList.remove('show');
    // 経過時間をプレイ時間から除外
    if(typeof totalPausedMs!=='undefined'){
      totalPausedMs += Date.now() - cinematicStartedAt;
    }
    if(typeof gameState!=='undefined' && gameState==='cinematic'){
      gameState = cinematicPrevState || 'playing';
      if(gameState==='playing' && typeof canvas!=='undefined'){
        setTimeout(function(){ try{canvas.requestPointerLock();}catch(e){} }, 100);
      }
    }
    cinematicActive = false;
    cinematicGraceUntil = Date.now() + graceMs;
    if(typeof battleCooldown!=='undefined') battleCooldown = Math.max(battleCooldown, graceMs/1000);
  }, delay);
}

function closeItemPicker(){
  itemActive=false; currentItemTerminal=null;
  document.getElementById('item-picker-modal').classList.remove('open');
  gameState='playing';
  if(typeof unmuteBGM==='function') unmuteBGM();
  challengeCooldownEnd = Date.now()+2000;
  setTimeout(function(){ canvas.requestPointerLock(); },350);
}

// ── Spawn item terminal for current floor in a free room ──
function spawnFloorItemTerminal(rooms){
  if(floor<1||floor>5) return;
  if(inventory[floor]) return;
  // 同じ部屋に階段/暗号端末があると spawnItemTerminal の近接ブロックに弾かれて
  // 結果として「アイテムターミナルが置かれない」フロアが発生する。
  // → スタート部屋・階段部屋・暗号端末部屋は除外したリストを優先プールにする。
  function roomContains(rm,gx,gy){return gx>=rm.x&&gx<rm.x+rm.w&&gy>=rm.y&&gy<rm.y+rm.h;}
  var clean = [];
  for(var i=1;i<rooms.length;i++){
    var rm=rooms[i];
    if(roomContains(rm,dungeon.stairX,dungeon.stairY))continue;
    if(roomContains(rm,dungeon.termX,dungeon.termY))continue;
    if(rm.w>=3&&rm.h>=3) clean.push(rm);
  }
  // フォールバック: clean が空なら 1 ルーム目以外のすべて、それも無ければ全ルーム
  var pool = clean.length ? clean : rooms.slice(1).filter(function(r){return r.w>=3&&r.h>=3;});
  if(!pool.length) pool=rooms.slice(1);
  if(!pool.length) pool=rooms;
  if(!pool.length) return;
  // ランダムにシャッフルし、配置に成功する（itemTerminals.length が増える）まで
  // 複数ルームを順に試行する。
  var shuffled = pool.slice().sort(function(){return Math.random()-.5;});
  for(var k=0;k<shuffled.length;k++){
    var before = itemTerminals.length;
    spawnItemTerminal(shuffled[k]);
    if(itemTerminals.length > before) return; // 成功
  }
}
