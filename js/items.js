// ═══════════════════════════════════
//  ITEM TERMINALS & ROBOT PARTS INVENTORY
//  Floor 1〜5 にそれぞれ 1 個ずつアイテムターミナルが配置される。
//  クリアすると 3 つの選択肢から 1 つ選んでロボットのパーツを入手。
//  Floor 6 (EXTRA) で 5 個のパーツを組み合わせてラスボスと自動戦闘する。
// ═══════════════════════════════════

// ── Inventory (5 slots) ──
// floor (1-5) → item id を保持。saveProgress 時に localStorage に永続化。
var inventory = { 1:null, 2:null, 3:null, 4:null, 5:null };
function inventoryCount(){
  var n=0; for(var k in inventory) if(inventory[k]) n++; return n;
}
function getInventoryItems(){
  // 並びは Floor 1→5 の順
  var out=[];
  for(var f=1; f<=5; f++) if(inventory[f]) out.push(getItemById(inventory[f]));
  return out;
}
function saveInventory(){
  try{ localStorage.setItem('cipherDungeonInventory', JSON.stringify(inventory)); }catch(e){}
}
function loadInventory(){
  try{
    var raw=localStorage.getItem('cipherDungeonInventory');
    if(!raw) return;
    var d=JSON.parse(raw);
    for(var k in inventory) if(d[k]) inventory[k]=d[k];
  }catch(e){}
}
function clearInventory(){
  for(var k in inventory) inventory[k]=null;
  try{ localStorage.removeItem('cipherDungeonInventory'); }catch(e){}
}

// ── Item Categories ──
// 1 floor = 1 category。各カテゴリに 3 つの選択肢。
// stats: ロボットの基礎ステータスへの加算値（後の戦闘で参照）
//   hp / atk / def / spd / energy
// passive: 戦闘中に効果を発動する固有スキル (id → robotBattle.js で実装)
//   ・effect: 効果の短い説明（UI 表示用）
//   ・key:    プログラム側で参照する識別子
const ITEM_CATEGORIES = [
  // ── Floor 1: ボディフレーム ──
  { floor:1, label:'🛡 ボディフレーム', color:0x44aaff, emissive:0x0066cc,
    items:[
      { id:'frame_light',  name:'軽量フレーム',   icon:'🦴', tag:'軽量',
        desc:'素早く動けるが脆い',
        stats:{hp:40,  atk:6,  def:1,  spd:14, energy:45},
        passive:{key:'dodge_boost', label:'⭐ 回避がとても得意'} },
      { id:'frame_heavy',  name:'重装フレーム',   icon:'🔩', tag:'重装',
        desc:'動きは鈍いが頑丈',
        stats:{hp:180, atk:10, def:14, spd:1,  energy:40},
        passive:{key:'damage_reduce', label:'⭐ 被ダメージを大きく軽減'} },
      { id:'frame_balance',name:'標準フレーム',   icon:'⚖️', tag:'標準',
        desc:'器用にどんな戦法でもこなす',
        stats:{hp:100, atk:9,  def:6,  spd:6,  energy:40},
        passive:{key:'crit_chance',   label:'⭐ 攻撃が時々クリティカル'} },
    ]
  },
  // ── Floor 2: メイン武器 ──
  { floor:2, label:'⚔ メイン武器', color:0xff8844, emissive:0xff4400,
    items:[
      { id:'wp_blade',  name:'プラズマブレード',   icon:'🗡', tag:'近接',
        desc:'接近戦の達人',
        stats:{hp:0,   atk:24, def:3,  spd:3,  energy:0},
        passive:{key:'melee_buff', label:'⭐ 通常攻撃が劇的に強化'} },
      { id:'wp_rifle',  name:'レーザーライフル',   icon:'🔫', tag:'遠距離',
        desc:'遠距離から削るのが得意',
        stats:{hp:0,   atk:13, def:0,  spd:5,  energy:15},
        passive:{key:'ranged_cheap', label:'⭐ 遠距離射撃のコストが大幅減'} },
      { id:'wp_hammer', name:'重力ハンマー',       icon:'🔨', tag:'超火力',
        desc:'一撃が重いが鈍重',
        stats:{hp:15,  atk:30, def:5,  spd:-3, energy:-10},
        passive:{key:'pierce_shield', label:'⭐ 防御を無視して攻撃が通る'} },
    ]
  },
  // ── Floor 3: サブ武器 ──
  { floor:3, label:'🎯 サブ武器', color:0xaa44ff, emissive:0x6622cc,
    items:[
      { id:'sub_missile', name:'ホーミングミサイル', icon:'💣', tag:'高威力',
        desc:'必殺技が桁違いの威力',
        stats:{hp:0,   atk:8,  def:0,  spd:0,  energy:20},
        passive:{key:'special_missile', label:'⭐ 必殺技が圧倒的な火力に'} },
      { id:'sub_beam',    name:'ビームキャノン',     icon:'⚡', tag:'省エネ',
        desc:'必殺技を多めに撃てる',
        stats:{hp:0,   atk:5,  def:0,  spd:0,  energy:20},
        passive:{key:'special_beam',    label:'⭐ 必殺技が省エネで連発可能'} },
      { id:'sub_flame',   name:'火炎放射器',         icon:'🔥', tag:'継続',
        desc:'じわじわダメージを与え続ける',
        stats:{hp:5,   atk:6,  def:2,  spd:0,  energy:15},
        passive:{key:'special_flame',   label:'⭐ 必殺技で持続ダメージ付与'} },
    ]
  },
  // ── Floor 4: 移動装置 ──
  { floor:4, label:'🦿 移動装置', color:0x44ff88, emissive:0x00aa44,
    items:[
      { id:'mv_jet',   name:'ジェットブースター',   icon:'🚀', tag:'回避',
        desc:'神速で攻撃をかわす',
        stats:{hp:0,   atk:0,  def:0,  spd:16, energy:0},
        passive:{key:'dodge_boost', label:'⭐ 回避がさらに強力に'} },
      { id:'mv_wheel', name:'高速ホイール',         icon:'🛞', tag:'エネルギー効率',
        desc:'エネルギーを稼ぐのが得意',
        stats:{hp:10,  atk:0,  def:2,  spd:8,  energy:15},
        passive:{key:'charge_boost', label:'⭐ チャージの回復量が大幅増'} },
      { id:'mv_hover', name:'ホバーユニット',       icon:'🪁', tag:'防御回復',
        desc:'防御するたび少し回復',
        stats:{hp:5,   atk:0,  def:4,  spd:6,  energy:5},
        passive:{key:'defend_heal', label:'⭐ 防御中に HP がそこそこ回復'} },
    ]
  },
  // ── Floor 5: パワーコア ──
  { floor:5, label:'💎 パワーコア', color:0xffdd00, emissive:0xaa8800,
    items:[
      { id:'core_fusion',  name:'核融合炉',         icon:'⚛', tag:'エネルギー自動回復',
        desc:'エネルギーがどんどん溜まっていく',
        stats:{hp:0,   atk:6,  def:0,  spd:0,  energy:55},
        passive:{key:'auto_en', label:'⭐ エネルギーが毎ターン勝手に回復'} },
      { id:'core_battery', name:'大容量バッテリー', icon:'🔋', tag:'HP 自動回復',
        desc:'HP がじわじわ戻る',
        stats:{hp:100, atk:0,  def:6,  spd:0,  energy:20},
        passive:{key:'auto_hp',  label:'⭐ 毎ターン HP が自動で回復'} },
      { id:'core_quantum', name:'量子コア',         icon:'🌀', tag:'万能',
        desc:'全方位に少しずつ強くなる',
        stats:{hp:40,  atk:6,  def:6,  spd:4,  energy:25},
        passive:{key:'quantum_buff', label:'⭐ 攻撃・防御・移動が均等に強化'} },
    ]
  },
];

// 装備中の passive キーのリストを取得（戦闘ロジックで参照）
function getActivePassiveKeys(){
  var keys=[];
  if(typeof inventory==='undefined') return keys;
  for(var f=1; f<=5; f++){
    if(!inventory[f]) continue;
    var it=getItemById(inventory[f]);
    if(it && it.passive && it.passive.key) keys.push(it.passive.key);
  }
  return keys;
}
function hasPassive(key){ return getActivePassiveKeys().indexOf(key)>=0; }

function getItemById(id){
  for(var c of ITEM_CATEGORIES) for(var it of c.items) if(it.id===id) return it;
  return null;
}
function getCategoryForFloor(f){
  for(var c of ITEM_CATEGORIES) if(c.floor===f) return c;
  return null;
}

// ── Compute robot's combined stats from inventory ──
function computeRobotStats(){
  var totals = { hp:0, atk:0, def:0, spd:0, energy:0 };
  for(var f=1; f<=5; f++){
    if(!inventory[f]) continue;
    var it=getItemById(inventory[f]); if(!it) continue;
    for(var k in totals) totals[k] += (it.stats[k]||0);
  }
  return totals;
}

// ── Inventory HUD ──
// 組み立て完了後は 5 スロットの代わりに 1 つのロボットアイコンを表示する
var robotAssembledHUD = false;
function updateInventoryHUD(){
  var hud=document.getElementById('inventory-hud');
  if(!hud) return;
  hud.innerHTML='';
  if(robotAssembledHUD){
    var robo=document.createElement('div');
    robo.className='inv-slot filled robot';
    robo.innerHTML='<div class="inv-icon">🤖</div>';
    robo.title='完成したロボット';
    hud.appendChild(robo);
    return;
  }
  for(var f=1; f<=5; f++){
    var slot=document.createElement('div');
    slot.className='inv-slot';
    var it = inventory[f] && getItemById(inventory[f]);
    if(it){
      slot.classList.add('filled');
      slot.innerHTML = '<div class="inv-icon">'+it.icon+'</div>';
      slot.title = it.name + ' — ' + it.desc;
    }else{
      slot.classList.add('empty');
      slot.innerHTML = '<div class="inv-icon" style="opacity:.3;">？</div>';
      slot.title = 'Floor '+f+' のアイテム未取得';
    }
    hud.appendChild(slot);
  }
}
