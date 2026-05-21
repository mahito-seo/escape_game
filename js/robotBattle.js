// ═══════════════════════════════════
//  ROBOT BATTLE — EXTRA STAGE のラスボス戦
//  Pokemon 風のターン制バトル: 毎ターン
//    1. ボスがランダムに行動を宣言
//    2. プレイヤーが Python コードを編集（できる）
//    3. 「▶ 実行」を押すと自機 → ボスの 1 ターンが解決
//    4. HP バー/ログが更新される
// ═══════════════════════════════════

var robotBattleActive = false;
var robotBattleState  = null;  // 戦闘中の state スナップショット
var robotBattleStats  = null;  // 計算済みプレイヤースタッツ
var robotBattleBoss   = null;  // ボスの max ステータス
var robotBattleEnded  = false; // 戦闘終了フラグ
var robotPendingBossAction = 'attack'; // バッチの 1 ターン目だけ事前公開
const TURNS_PER_STEP = 3;       // 1 回の「▶ 実行」で進めるターン数

function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

// バナー用に短く整えた行動ラベル (中央表示が長いとレイアウトが崩れるため)
function shortRobotActionLabel(a){
  switch((a||'').toLowerCase()){
    case 'attack': case 'melee':   return '⚔ 通常攻撃';
    case 'ranged': case 'shoot':   return '🔫 遠距離射撃';
    case 'defend': case 'block':   return '🛡 防御態勢';
    case 'dodge':  case 'evade':   return '💨 回避';
    case 'special': case 'missile': case 'ultimate': return '💥 必殺技';
    case 'charge': case 'recharge': case 'rest': return '⚡ チャージ';
    case 'error':  return '⚠ コードエラー';
  }
  return '？ 不明';
}

// 中央に「Nターン目 + 両者の行動」をドンと表示してから次の処理に進む
function showTurnBanner(turnNum, myAction, bossAction){
  var el = document.getElementById('ram-turn-banner');
  var num = document.getElementById('rtb-num');
  var youEl = document.getElementById('rtb-you-act');
  var bossEl = document.getElementById('rtb-boss-act');
  if(!el || !num) return Promise.resolve();
  num.textContent = turnNum;
  var myAct = (myAction && (myAction.action||'attack')) || '?';
  if(youEl)  youEl.textContent  = shortRobotActionLabel(myAct);
  if(bossEl) bossEl.textContent = bossActionLabel(bossAction);
  // 直前の表示を確実にリセットしてから再アニメーション
  el.classList.remove('show');
  // reflow を強制してアニメをやり直す
  void el.offsetWidth;
  el.classList.add('show');
  // CSS のアニメ尺 (1.5s) より少し短めに待って、行動演出にスムーズに繋ぐ
  return sleep(1350);
}

// ── ボスのステータス ──
// 戦略 + 装備パッシブ活用前提のバランス。
// 単純 attack 連打や special 連打だけでは勝てない（charge / heal が間に入って打ち負ける）。
const BOSS_BASE = {
  hp:    560,
  atk:   34,
  def:   12,
  spd:   7,
};

// ── ボス行動の重み（ランダム選択用）──
const BOSS_ACTION_WEIGHTS = [
  // action,            weight (relative)
  ['attack',            5],
  ['heavy',             2],
  ['charge',            2],
  ['heal',              2],
  ['shield',            2],
];

function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

function pickWeighted(items){
  var total=0; for(var i=0;i<items.length;i++) total+=items[i][1];
  var r=Math.random()*total;
  for(var j=0;j<items.length;j++){ r-=items[j][1]; if(r<=0) return items[j][0]; }
  return items[items.length-1][0];
}

function bossDecideNextAction(state){
  // charge 直後は heavy が来やすい
  if(state && state.boss_charged) return Math.random()<.80 ? 'heavy' : 'attack';
  // ── プレイヤーが special を 2 回以上使ったらシールド/チャージで対策 ──
  if(state && state.special_uses_recent >= 2 && Math.random() < 0.50){
    return Math.random() < 0.5 ? 'shield' : 'charge';
  }
  // HP 半分以下で heal を多めに（再生バトル）
  if(state && state.boss_hp < state.boss_max_hp*0.50 && Math.random() < 0.40){
    return Math.random() < 0.55 ? 'heal' : 'shield';
  }
  return pickWeighted(BOSS_ACTION_WEIGHTS);
}

function bossActionLabel(a){
  switch(a){
    case 'attack': return '⚔ 通常攻撃';
    case 'heavy':  return '💥 大攻撃！';
    case 'charge': return '🌀 力を溜めている';
    case 'heal':   return '💚 自己回復';
    case 'shield': return '🛡 シールド展開';
  }
  return a;
}

// ロボット行動の日本語ラベル（確認ダイアログ用）
function robotActionLabel(a){
  switch((a||'').toLowerCase()){
    case 'attack': case 'melee':   return '⚔ 通常攻撃';
    case 'ranged': case 'shoot':   return '🔫 遠距離射撃 (エネルギー -10)';
    case 'defend': case 'block':   return '🛡 防御態勢';
    case 'dodge':  case 'evade':   return '💨 回避';
    case 'special': case 'missile': case 'ultimate': return '💥 必殺技 (エネルギー -20 / クールタイム 3 ターン)';
    case 'charge': case 'recharge': case 'rest': return '⚡ エネルギー回復';
  }
  return '?';
}
function isKnownAction(a){ return robotActionLabel(a) !== '?'; }

// 「👹 次ターン」を改行で固定し、アクション部分だけ右側 / 下に表示する。
function bossIntentHTML(a){
  var pfx = '<div class="rai-pfx">👹 次のターン</div>';
  var act;
  switch(a){
    case 'attack': act='⚔ 通常攻撃';   break;
    case 'heavy':  act='💥 大攻撃！';   break;
    case 'charge': act='🌀 溜め';      break;
    case 'heal':   act='💚 自己回復';  break;
    case 'shield': act='🛡 シールド';  break;
    default:       act='?';           break;
  }
  return pfx + '<div class="rai-act">'+act+'</div>';
}

function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── プレイヤーコードを 1 ターン実行 ───
async function getRobotAction(userCode, state){
  var safeState = JSON.stringify(state);
  var wrapped =
    userCode + '\n\n' +
    'import json\n' +
    '__state = json.loads(' + JSON.stringify(safeState) + ')\n' +
    '__result = robot_action(__state)\n' +
    'print(json.dumps(__result))\n';
  var out;
  try{ out = await miniPyEvalSafe(wrapped); }
  catch(e){ out = 'Error: '+e.message; }
  out = (out||'').trim();
  if(out.indexOf('Error')===0) return {action:'error', message:out};
  var lines = out.split('\n').map(function(l){return l.trim();}).filter(Boolean);
  var last = lines[lines.length-1] || '';
  try{
    var parsed = JSON.parse(last);
    if(typeof parsed==='string') return {action:parsed};
    if(typeof parsed==='object' && parsed!==null) return parsed;
  }catch(e){}
  return {action:last||'attack'};
}

// ─── 1 ターン解決 ───
// passives: 装備中のパッシブキー集合（items.js / getActivePassiveKeys() 由来）
function resolveOneTurn(state, myAction, myStats, bossAction, bossStats, passives){
  var log = [];
  var t = state.turn+1;
  log.push('━━━━ Turn '+t+' ━━━━');
  var has = function(k){ return passives && passives.indexOf(k)>=0; };

  // 燃焼継続ダメージ
  if(state.burn_turns>0){
    var burn = 8;
    state.boss_hp = Math.max(0, state.boss_hp - burn);
    log.push('🔥 燃焼継続: ボスに '+burn+' ダメージ');
    state.burn_turns--;
  }

  // ── パッシブ: 自動 HP 再生 (core_battery) ──
  if(has('auto_hp') && state.my_hp>0 && state.my_hp<state.my_max_hp){
    var aheal = Math.min(10, state.my_max_hp - state.my_hp);   // 5 → 10/ターン
    if(aheal>0){ state.my_hp += aheal; log.push('🔋 バッテリー: HP +'+aheal+' 自動回復'); }
  }

  // ── special クールダウンは「行動処理 後」に減らす ──
  //    こうすることで:
  //      ・user コードが見る state.special_cd と、必殺発動チェック (line ~237) が
  //        参照する state.special_cd が完全に一致する
  //      ・特殊使用ターン (cd を 3 にセット) では下の myAct 判定で減算をスキップして
  //        即座に 3 ターン待ちが始まる

  // 1) プレイヤーの行動
  var myAct = (myAction.action||'attack');
  var myDmgDealt = 0;
  var label='';
  state.my_defending=false; state.my_dodging=false;
  switch(myAct){
    case 'attack': case 'melee': {
      var base = myStats.atk - bossStats.def + rand(-2,4);
      if(has('melee_buff')) base = Math.floor(base*1.8);   // ブレード強化
      if(has('quantum_buff')) base = Math.floor(base*1.15);
      var crit = has('crit_chance') && Math.random()<0.25; // クリ率 15→25%
      if(crit) base = Math.floor(base*1.7);                // クリ倍率 1.5→1.7
      var dmg = Math.max(1, base);
      if(bossAction==='shield' && !has('pierce_shield')) dmg = Math.floor(dmg*0.5);
      myDmgDealt = dmg;
      label = '🤖 通常攻撃! ボスに '+dmg+' ダメージ'+(crit?' ✨CRITICAL':'')+(has('melee_buff')?' [ブレード]':'');
      if(bossAction==='shield'){
        label += has('pierce_shield') ? ' [🔨ハンマー貫通]' : ' (シールドで半減)';
      }
      log.push(label);
      break;
    }
    case 'ranged': case 'shoot': {
      var rangedCost = has('ranged_cheap') ? 6 : 10;  // ライフル装備で 10 → 6 (控えめに減)
      if(state.my_energy >= rangedCost){
        state.my_energy -= rangedCost;
        var base = Math.floor(myStats.atk*1.2) - Math.floor(bossStats.def*0.5) + rand(-2,4);
        if(has('quantum_buff')) base = Math.floor(base*1.15);
        var crit = has('crit_chance') && Math.random()<0.25;
        if(crit) base = Math.floor(base*1.7);
        var dmg = Math.max(1, base);
        if(bossAction==='shield') dmg = Math.floor(dmg*0.5);
        myDmgDealt = dmg;
        log.push('🔫 遠距離射撃! ボスに '+dmg+' ダメージ (エネルギー -'+rangedCost+')'+(crit?' ✨CRITICAL':'')+(bossAction==='shield'?' (シールド半減)':''));
      }else{
        var dmg = Math.max(1, myStats.atk - bossStats.def + rand(-2,4));
        if(bossAction==='shield') dmg = Math.floor(dmg*0.5);
        myDmgDealt = dmg;
        log.push('⚠ エネルギー不足 → 通常攻撃に: '+dmg+' ダメージ');
      }
      break;
    }
    case 'defend': case 'block':
      state.my_defending=true;
      log.push('🛡 防御態勢! 次の被ダメージを大幅軽減');
      if(has('defend_heal')){
        var dh = Math.min(14, state.my_max_hp-state.my_hp);   // ホバー回復 8→14
        if(dh>0){ state.my_hp += dh; log.push('🪁 ホバー: 防御中 HP +'+dh); }
      }
      break;
    case 'dodge': case 'evade': {
      var dodgeChance = 0.45 + (myStats.spd-6)*0.045;
      if(has('dodge_boost')) dodgeChance += 0.25;   // 軽量/ジェット スタック可
      if(Math.random() < Math.min(0.97, dodgeChance)){
        state.my_dodging=true;
        log.push('💨 回避成功! (spd '+myStats.spd+(has('dodge_boost')?' +回避特化':'')+')');
      }else{
        log.push('💨 回避失敗… (spd '+myStats.spd+')');
      }
      break;
    }
    case 'special': case 'missile': case 'ultimate': {
      // ── クールダウンチェック (連発防止) ──
      // CD 中 / EN 不足の時は「行動失敗」扱いでターンを浪費する。
      // 単に attack にフォールバックすると spam が成立してしまうので、
      // ペナルティとして無防備に被弾するだけのターンになる。
      if(state.special_cd > 0){
        log.push('💥 必殺技はクールタイム中! あと '+state.special_cd+' ターン (隙だらけ)');
        break;
      }
      var specialCost = has('special_beam') ? 12 : 20;
      if(state.my_energy < specialCost){
        log.push('💥 エネルギー不足! 必殺技はエネルギー '+specialCost+' 必要 (現在 '+state.my_energy+') (隙だらけ)');
        break;
      }
      state.my_energy -= specialCost;
      var spec = computeSpecialAttack(myStats, state, passives);
      var sdmg = spec.dmg;
      if(has('quantum_buff')) sdmg = Math.floor(sdmg*1.1);
      if(bossAction==='shield') sdmg = Math.floor(sdmg*0.5);
      myDmgDealt = sdmg;
      state.special_cd = 3; // 3 ターンのクールダウン
      state.__special_fired = true;  // 末尾の cd 減算をスキップするフラグ
      state.special_uses_recent = (state.special_uses_recent||0) + 1;
      log.push('💥 必殺! '+spec.label+' ボスに '+sdmg+' ダメージ (エネルギー -'+specialCost+')'+
               (spec.effect?'  ['+spec.effect+']':'')+
               (bossAction==='shield'?' (シールド半減)':'')+
               ' (クールタイム 3 ターン)');
      break;
    }
    case 'charge': case 'recharge': case 'rest': {
      var gain = 9 + Math.floor(myStats.spd/3);
      if(has('charge_boost')) gain += 12;   // ホイール (控えめ)
      state.my_energy = Math.min(state.my_max_energy, state.my_energy + gain);
      log.push('⚡ チャージ! エネルギー +'+gain+(has('charge_boost')?' [ホイール]':''));
      break;
    }
    case 'error':
      log.push('⚠ コードエラー: '+(myAction.message||''));
      log.push('🤖 今ターン行動できなかった');
      break;
    default: {
      log.push('🤖 未知の行動「'+myAct+'」→ 通常攻撃');
      var dmg = Math.max(1, myStats.atk - bossStats.def + rand(-2,4));
      if(bossAction==='shield') dmg = Math.floor(dmg*0.5);
      myDmgDealt = dmg;
      break;
    }
  }
  state.boss_hp = Math.max(0, state.boss_hp - myDmgDealt);

  // special 連続カウンタ減衰 (special 以外を選ぶと徐々に 0 へ)
  if(myAct !== 'special' && myAct !== 'missile' && myAct !== 'ultimate'){
    state.special_uses_recent = Math.max(0, (state.special_uses_recent||0) - 1);
  }

  // special クールタイムの減算: 今ターン実際に special が発動したときだけスキップ
  //   ・発動 (cd を 3 にセット) ターンは下げない → 次ターンから 3 → 2 → 1 → 0 (3 ターン待ち)
  //   ・cd 中に special を返してしまった場合は通常通り -1 する (待ち時間は進む)
  if(state.__special_fired){
    state.__special_fired = false;
  }else if(state.special_cd > 0){
    state.special_cd--;
  }

  // 2) ボスの行動
  var bossDmg = 0;
  if(state.boss_hp>0){
    switch(bossAction){
      case 'attack':
        bossDmg = Math.max(1, bossStats.atk - myStats.def + rand(-3,3));
        log.push('👹 ボス: ⚔ 通常攻撃');
        break;
      case 'heavy':
        bossDmg = Math.max(2, Math.floor(bossStats.atk*1.8) - myStats.def + rand(-2,5));
        log.push('👹 ボス: 💥 大攻撃!');
        break;
      case 'charge':
        bossDmg = 0;
        state.boss_charged = true;
        log.push('👹 ボス: 🌀 力を溜めている… 次の攻撃に注意!');
        break;
      case 'heal': {
        var bheal = 32 + rand(0,16);
        state.boss_hp = Math.min(state.boss_max_hp, state.boss_hp + bheal);
        log.push('👹 ボス: 💚 自己回復 +'+bheal);
        break;
      }
      case 'shield':
        log.push('👹 ボス: 🛡 シールド展開 (こちらの攻撃は半減)');
        break;
    }
    if(bossDmg>0){
      // パッシブ: 重装フレームの被ダメ軽減（顕著に）
      if(has('damage_reduce')) bossDmg = Math.max(1, bossDmg-6);   // 3 → 6
      if(has('quantum_buff')) bossDmg = Math.floor(bossDmg*0.85);  // 0.9 → 0.85
      if(state.my_dodging){ bossDmg=0; log.push('💨 完全回避! 被ダメ 0'); }
      else if(state.my_defending){
        bossDmg = Math.floor(bossDmg*0.35);
        log.push('🛡 防御で軽減: '+bossDmg+' ダメージ'+(has('damage_reduce')?' [🔩重装-3適用済]':''));
      }else{
        log.push('💢 被弾: '+bossDmg+' ダメージ'+(has('damage_reduce')?' [🔩重装-3適用済]':''));
      }
      state.my_hp = Math.max(0, state.my_hp - bossDmg);
    }
  }
  if(bossAction!=='charge') state.boss_charged = false;

  // 3) 自動 EN 回復 (パッシブ次第)
  var autoEN = has('auto_en') ? 5 : 1;    // 核融合炉あり 5, 通常 1 (控えめ)
  state.my_energy = Math.min(state.my_max_energy, state.my_energy + autoEN);
  state.boss_action = bossAction;
  state.turn = t;
  return log;
}

function computeSpecialAttack(myStats, state, passives){
  var has = function(k){ return passives && passives.indexOf(k)>=0; };
  if(has('special_missile')){
    return {dmg: 35 + Math.floor(myStats.atk*1.2), label:'💣 ホーミング全弾発射!', effect:''};
  }
  if(has('special_beam')){
    return {dmg: 22 + Math.floor(myStats.atk*1.0), label:'⚡ 貫通ビームキャノン!', effect:'低コスト'};
  }
  if(has('special_flame')){
    state.burn_turns += 3;
    return {dmg: 14 + Math.floor(myStats.atk*0.7), label:'🔥 全力火炎放射!', effect:'燃焼3ターン付与'};
  }
  return {dmg: 20 + Math.floor(myStats.atk*1.0), label:'💢 全力攻撃!', effect:''};
}

// ─── 戦闘開始エントリ ───
function openRobotArena(){
  if(gameState!=='playing') return;
  // 1. まずブリーフィングを開く
  showPreBattleBriefing();
}

function showPreBattleBriefing(){
  var m=document.getElementById('prebattle-modal');
  if(!m){ startActualRobotBattle(); return; }
  gameState='cipher'; document.exitPointerLock();
  if(typeof muteBGM==='function') muteBGM();
  // ── タイトルとボタンを「初回案内」モードに ──
  var titleEl=document.getElementById('prb-title-text'); if(titleEl) titleEl.textContent='⚔ バトル説明';
  var cancelBtn=document.getElementById('prb-cancel');
  var startBtn =document.getElementById('prb-start');
  cancelBtn.style.display=''; cancelBtn.textContent='後で（離れる）';
  startBtn.textContent='🤖 戦闘を始める →';
  m.classList.add('open');
  cancelBtn.onclick = function(){
    m.classList.remove('open');
    robotBattleActive=false; gameState='playing';
    if(typeof unmuteBGM==='function') unmuteBGM();
    setTimeout(function(){canvas.requestPointerLock();},300);
  };
  startBtn.onclick = function(){
    m.classList.remove('open');
    startActualRobotBattle();
  };
}

function startActualRobotBattle(){
  robotBattleActive=true; robotBattleEnded=false;
  if(typeof startBossBGM==='function') startBossBGM();

  // ステータス計算
  robotBattleStats = computeRobotStats();
  // パーツが足りない場合の最低保証
  if(robotBattleStats.hp<=0) robotBattleStats.hp = 100;
  if(robotBattleStats.atk<=0) robotBattleStats.atk = 10;
  if(robotBattleStats.energy<=0) robotBattleStats.energy = 20;

  robotBattleBoss = Object.assign({}, BOSS_BASE);

  var passives = (typeof getActivePassiveKeys==='function') ? getActivePassiveKeys() : [];
  robotBattleState = {
    // ── 基本ステータス ──
    my_hp:         robotBattleStats.hp,
    my_max_hp:     robotBattleStats.hp,
    my_atk:        robotBattleStats.atk,
    my_def:        robotBattleStats.def,
    my_spd:        robotBattleStats.spd,
    my_energy:     Math.max(20, robotBattleStats.energy),
    my_max_energy: Math.max(20, robotBattleStats.energy),
    // ── ボス情報 ──
    boss_hp:       robotBattleBoss.hp,
    boss_max_hp:   robotBattleBoss.hp,
    boss_atk:      robotBattleBoss.atk,
    boss_def:      robotBattleBoss.def,
    boss_action:   'unknown',
    boss_charged:  false,
    // ── 状態 ──
    turn:          0,
    items:         (typeof getInventoryItems==='function'?getInventoryItems():[]).map(function(i){return i.id;}),
    passives:      passives.slice(),   // 装備パッシブ一覧（ロボコードから参照可能）
    my_defending:  false,
    my_dodging:    false,
    burn_turns:    0,
    special_cd:    0,
    special_uses_recent: 0,
  };

  // 初期ボスインテント
  robotPendingBossAction = bossDecideNextAction(robotBattleState);

  // モーダル表示
  var modal=document.getElementById('robot-arena-modal');
  modal.classList.add('open');

  // 自機名 = チーム名 + " ロボット"。トラッカー未設定なら "あなた"。
  var teamName = 'あなた';
  try{
    if(typeof trackerConfig==='function'){
      var tn = (trackerConfig().teamName||'').trim();
      if(tn) teamName = tn;
    }
  }catch(e){}
  var youNameEl=document.getElementById('ram-you-name');
  if(youNameEl){
    youNameEl.innerHTML = '🤖 '+escapeHtml(teamName)+' ロボット <span class="ram-stat-mini" id="ram-stat-mini"></span>';
  }
  // 装備のミニ表示
  var miniEl=document.getElementById('ram-stat-mini');
  var pieces=(typeof getInventoryItems==='function'?getInventoryItems():[]).map(function(i){return i.icon;}).join('');
  miniEl.textContent = '体力'+robotBattleStats.hp+' / 攻撃'+robotBattleStats.atk+' / 防御'+robotBattleStats.def+' / 速さ'+robotBattleStats.spd+'   '+pieces;

  // エディタ準備
  if(typeof initRobotEditor==='function') initRobotEditor();
  if(typeof setRobotCode==='function') setRobotCode(ROBOT_TEMPLATE);

  // ログ初期化
  document.getElementById('ram-log').innerHTML = '';
  appendArenaLog('═══ 戦闘開始 ═══','--header');
  appendArenaLog('🤖 自機ロボット 体力 '+robotBattleStats.hp+' / 攻撃 '+robotBattleStats.atk+' / 防御 '+robotBattleStats.def+' / 速さ '+robotBattleStats.spd+' / エネルギー '+Math.max(20,robotBattleStats.energy));
  appendArenaLog('👹 フェニックスガーディアン 体力 '+robotBattleBoss.hp+' / 攻撃 '+robotBattleBoss.atk+' / 防御 '+robotBattleBoss.def);
  appendArenaLog('━━━━━━━━━━');
  appendArenaLog('💡 ▶ 実行で '+TURNS_PER_STEP+' ターン進む。1 ターン目だけ予告されている（上部の「次のターン」）。');
  appendArenaLog('💡 2〜3 ターン目はボスがランダムに動く ─ どんな状況にも耐えるコードを書こう。');
  appendArenaLog('');

  // 結果欄/ボタンリセット
  document.getElementById('ram-result-msg').textContent='';
  document.getElementById('ram-close').style.display='none';
  document.getElementById('ram-restart').style.display='none';
  var stepBtn=document.getElementById('ram-step');
  stepBtn.style.display='';
  stepBtn.disabled=false; stepBtn.textContent='▶ 実行（'+TURNS_PER_STEP+' ターン進む）';
  stepBtn.onclick = stepRobotTurn;

  // ヘルプボタン (ヘッダーのみ)
  document.getElementById('ram-help-btn').onclick = function(){ showPreBattleBriefingAsHelp(); };
  document.getElementById('ram-reset-code').onclick = function(){
    if(confirm('コードを初期テンプレートに戻しますか？')) setRobotCode(ROBOT_TEMPLATE);
  };

  // アクション一覧: クリックでクリップボードへコピー
  var actEls = document.querySelectorAll('#robot-arena-modal .ram-action-item[data-action]');
  actEls.forEach(function(el){
    el.onclick = function(){
      var act = el.getAttribute('data-action');
      var text = '"'+act+'"';
      try{
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(text);
        }else{
          var ta=document.createElement('textarea'); ta.value=text;
          document.body.appendChild(ta); ta.select();
          try{document.execCommand('copy');}catch(e){}
          document.body.removeChild(ta);
        }
        el.classList.add('copied');
        setTimeout(function(){ el.classList.remove('copied'); }, 600);
      }catch(e){}
    };
  });

  refreshArenaHpUI();
}

function showPreBattleBriefingAsHelp(){
  // 戦闘中のヘルプ表示: タイトルを「ルール」に。
  // 戻る先は両方同じなので「閉じる」ボタンは隠して 1 ボタンに統一。
  var m=document.getElementById('prebattle-modal');
  var titleEl=document.getElementById('prb-title-text'); if(titleEl) titleEl.textContent='📖 バトルルール';
  document.getElementById('prb-cancel').style.display='none';
  var startBtn=document.getElementById('prb-start');
  startBtn.textContent='戦闘に戻る';
  startBtn.onclick = function(){ m.classList.remove('open'); };
  m.classList.add('open');
}

// ─── 確認ダイアログ: Promise で true/false を返す ───
function confirmRobotAction(action){
  return new Promise(function(resolve){
    var dlg = document.getElementById('ram-action-confirm');
    var act = (action.action||'attack').toString();
    var known = isKnownAction(act);
    var isError = action.action === 'error';
    document.getElementById('rac-action-name').textContent = '"'+act+'"';
    document.getElementById('rac-action-jp').textContent = known ? robotActionLabel(act) : '不明な行動';
    var warnEl = document.getElementById('rac-warn');
    var warnMsg = '';
    if(isError){
      warnMsg = '⚠ コードエラーです: <br><code style="color:#ff8866;font-size:11px;">'+escapeHtml(action.message||'').slice(0,200)+'</code><br>このまま実行するとロボットは何もできずボスから攻撃を受けます。';
    }else if(!known){
      warnMsg = '⚠ <b>「'+escapeHtml(act)+'」は未知の行動</b>です。<br>スペルミスの可能性？ 左の一覧から正しい文字列をコピーできます。<br>このまま実行すると通常攻撃にフォールバックします。';
    }
    if(warnMsg){ warnEl.innerHTML = warnMsg; warnEl.classList.add('show'); }
    else { warnEl.innerHTML=''; warnEl.classList.remove('show'); }
    document.getElementById('rac-go').onclick = function(){ dlg.classList.remove('show'); resolve(true); };
    document.getElementById('rac-cancel').onclick = function(){ dlg.classList.remove('show'); resolve(false); };
    dlg.classList.add('show');
  });
}

// ─── ターン進行 (3 ターンバッチ) ───
// バッチ仕様:
//  ・1 回押すと TURNS_PER_STEP (=3) ターン進める
//  ・1 ターン目: 上部に予告されている `robotPendingBossAction` を使う
//  ・2〜3 ターン目: ボスはランダムに行動（事前予告なし）
//  ・各ターン間に短い間を入れて視覚的に確認できるようにする
//  ・終了したらバッチ終了
async function stepRobotTurn(){
  if(robotBattleEnded || !robotBattleState) return;
  var stepBtn=document.getElementById('ram-step');
  var userCode = (typeof getRobotCode==='function') ? getRobotCode() : '';

  // ── 1 ターン目の行動を先取りして確認ダイアログを出す ──
  // state["boss_action"] は「これから出るボス行動」と一致させる (全ターン)
  robotBattleState.boss_action = robotPendingBossAction;
  var firstAction = await getRobotAction(userCode, JSON.parse(JSON.stringify(robotBattleState)));
  var skipCb = document.getElementById('ram-skip-confirm');
  if(!skipCb || !skipCb.checked){
    var ok = await confirmRobotAction(firstAction);
    if(!ok) return;   // キャンセル — ボタンも再活性化されている (disabled なし状態)
  }

  stepBtn.disabled=true;
  var passives = (typeof getActivePassiveKeys==='function') ? getActivePassiveKeys() : [];

  for(var i=0; i<TURNS_PER_STEP; i++){
    stepBtn.textContent = '⚙ 進行中… ('+(i+1)+'/'+TURNS_PER_STEP+')';

    // ── このターンのボス行動を先に決め、state["boss_action"] に注入してから user コードを呼ぶ
    //    こうすることで コード上の boss == このターン実際に出るボス行動 が常に一致する
    //    (画面上の「次のターン」予告は 1 ターン目分だけだが、コード側は全ターン読める)
    var bossAction;
    if(i===0){
      bossAction = robotPendingBossAction;
    }else{
      bossAction = bossDecideNextAction(robotBattleState);
    }
    robotBattleState.boss_action = bossAction;

    // 1 ターン目は確認ダイアログで決まった firstAction を使う。
    // 2-3 ターン目は新しい boss_action を反映してこのタイミングで robot_action を呼ぶ。
    var myAction;
    if(i===0){
      myAction = firstAction;
    }else{
      myAction = await getRobotAction(userCode, JSON.parse(JSON.stringify(robotBattleState)));
    }

    // ── ターン開始バナー: 中央に「Nターン目 + 両者の行動」を出してから行動を流す ──
    var thisTurnNum = robotBattleState.turn + 1;
    await showTurnBanner(thisTurnNum, myAction, bossAction);

    // 上部インテント: 2/3 と 3/3 は「？」で隠す
    if(i<TURNS_PER_STEP-1){
      document.getElementById('ram-intent').innerHTML = '<div class="rai-pfx">👹 ターン進行中</div><div class="rai-act">＊ ＊ ＊</div>';
    }

    var turnLog = resolveOneTurn(robotBattleState, myAction, robotBattleStats, bossAction, robotBattleBoss, passives);

    // ── ハラハラ演出: ログを 1 行ずつ流す ──
    //   ・"━━━━ Turn N ━━━━" ヘッダは即時表示
    //   ・以降の行は少し間を空けて流す (HP/EN バーもその都度更新)
    for(var j=0; j<turnLog.length; j++){
      appendArenaLog(turnLog[j]);
      refreshArenaHpUI(/*updateIntent=*/false);
      // ヘッダ行 (j===0) は早めに、それ以外は少しゆっくり
      var lineDelay = (j===0) ? 220 : 520;
      await sleep(lineDelay);
      // ログ流し途中に HP が 0 を切ったら以降の行も流すが、終了処理を即時走らせる
    }

    // 終了判定 — どちらか倒れたら即終了
    if(robotBattleState.boss_hp<=0 || robotBattleState.my_hp<=0) break;

    // ターン間の間 — 視覚的にゆっくり進むように。次ターン頭に大きなバナーが入るので少し短めで OK
    if(i<TURNS_PER_STEP-1) await sleep(600);
  }

  // ── 勝敗判定 ──
  if(robotBattleState.boss_hp<=0){
    appendArenaLog('','--break');
    appendArenaLog('🏆 ボス撃破!','--win');
    robotBattleEnded=true;
    stepBtn.style.display='none';
    if(typeof playSound==='function') playSound('clear');
    showBossVictoryBanner();
    return;
  }
  if(robotBattleState.my_hp<=0){
    appendArenaLog('','--break');
    appendArenaLog('💀 ロボット撃破… 戦闘に敗北','--lose');
    appendArenaLog('💡 「もう一度」: 同じ装備で再戦できます (アイテムやステージは保持)','--info');
    appendArenaLog('💡 「離れる」  : ダンジョンに戻る。後でもう一度ボスに挑めます','--info');
    robotBattleEnded=true;
    stepBtn.style.display='none';
    document.getElementById('ram-result-msg').textContent='💀 敗北…';
    var restartBtn=document.getElementById('ram-restart');
    restartBtn.style.display=''; restartBtn.onclick = function(){
      document.getElementById('robot-arena-modal').classList.remove('open');
      setTimeout(startActualRobotBattle, 200);
    };
    var leaveBtn=document.getElementById('ram-close');
    leaveBtn.style.display=''; leaveBtn.textContent='離れる';
    leaveBtn.onclick = leaveRobotBattle;
    if(typeof playSound==='function') playSound('wrong');
    return;
  }

  // ── バッチ終了 → 次バッチの 1 ターン目の予告を確定 ──
  robotPendingBossAction = bossDecideNextAction(robotBattleState);
  refreshArenaHpUI(/*updateIntent=*/true);
  appendArenaLog('','--break');
  appendArenaLog('▼ 次のバッチ ・1 ターン目: '+bossActionLabel(robotPendingBossAction)+'  ・2-3 ターン目: ランダム');
  appendArenaLog('');

  stepBtn.disabled=false;
  stepBtn.textContent='▶ 実行（'+TURNS_PER_STEP+' ターン進む）';
}

// ─── UI helpers ───
// updateIntent=false の場合は上部「次のボス行動」表示を変更しない（HP/EN だけ更新）。
function refreshArenaHpUI(updateIntent){
  if(updateIntent===undefined) updateIntent=true;
  if(!robotBattleState) return;
  var s=robotBattleState;
  document.getElementById('ram-you-hp').textContent=s.my_hp;
  document.getElementById('ram-you-maxhp').textContent=s.my_max_hp;
  document.getElementById('ram-you-en').textContent=s.my_energy;
  document.getElementById('ram-you-maxen').textContent=s.my_max_energy;
  document.getElementById('ram-boss-hp').textContent=s.boss_hp;
  document.getElementById('ram-boss-maxhp').textContent=s.boss_max_hp;
  document.getElementById('ram-you-hp-fill').style.width   = (s.my_hp/s.my_max_hp*100).toFixed(1)+'%';
  document.getElementById('ram-you-en-fill').style.width   = (s.my_energy/s.my_max_energy*100).toFixed(1)+'%';
  document.getElementById('ram-boss-hp-fill').style.width  = (s.boss_hp/s.boss_max_hp*100).toFixed(1)+'%';
  document.getElementById('ram-turn').textContent = 'TURN '+s.turn;
  if(updateIntent) document.getElementById('ram-intent').innerHTML = bossIntentHTML(robotPendingBossAction);
  refreshArenaStatStrip();
}

// 詳細ステータス表示の更新
function refreshArenaStatStrip(){
  if(!robotBattleStats || !robotBattleState) return;
  var st = robotBattleStats, s = robotBattleState;
  var passives = (typeof getActivePassiveKeys==='function') ? getActivePassiveKeys() : [];
  var has = function(k){ return passives.indexOf(k) >= 0; };

  // 回避率（dodge action 実行時）
  var dodgeChance = 0.45 + (st.spd-6)*0.045;
  if(has('dodge_boost')) dodgeChance += 0.25;
  dodgeChance = Math.max(0, Math.min(0.97, dodgeChance));

  function setText(id,val){ var el=document.getElementById(id); if(el) el.textContent=val; }
  function setShow(id,show){ var el=document.getElementById(id); if(el) el.style.display = show?'inline-flex':'none'; }

  setText('rss-atk', st.atk);
  setText('rss-def', st.def);
  setText('rss-spd', st.spd);
  setText('rss-dodge', Math.round(dodgeChance*100)+'%');

  // クリ率: balance frame のみ
  if(has('crit_chance')){ setText('rss-crit','25%');  setShow('rss-crit-wrap',true); }
  else                  { setShow('rss-crit-wrap',false); }

  // 軽減: heavy frame のみ
  if(has('damage_reduce')){ setText('rss-dr','-6');  setShow('rss-dr-wrap',true); }
  else                    { setShow('rss-dr-wrap',false); }

  // 必殺技のクールタイム
  setText('rss-cd', s.special_cd>0 ? ('あと '+s.special_cd+' ターン') : '✓ 使用可能');

  // 燃焼ターン
  if(s.burn_turns>0){ setText('rss-burn', s.burn_turns+' ターン'); setShow('rss-burn-wrap',true); }
  else              { setShow('rss-burn-wrap',false); }
}

function appendArenaLog(line, cls){
  var logEl=document.getElementById('ram-log');
  if(!logEl) return;
  var div=document.createElement('div');
  var style='padding:2px 0;';
  if(cls==='--win')  style+='color:#ffdd44;font-weight:bold;font-size:16px;text-shadow:0 0 8px rgba(255,200,0,.6);padding:6px 0;';
  else if(cls==='--lose') style+='color:#ff6666;font-weight:bold;font-size:15px;padding:4px 0;';
  else if(cls==='--header') style+='color:#ffcc44;font-weight:bold;letter-spacing:2px;';
  else if(cls==='--info') style+='color:#aabbcc;font-size:12px;font-style:italic;';
  else if(line.indexOf('━━━━ Turn')===0) style+='color:#88ffaa;font-weight:bold;margin-top:10px;padding:5px 8px;background:rgba(40,80,60,.25);border-left:3px solid #44ffaa;border-radius:3px;';
  else if(line.indexOf('🤖 通常攻撃')>=0 || line.indexOf('🔫')>=0 || line.indexOf('💨 回避成功')>=0) style+='color:#88ccff;font-weight:600;';
  else if(line.indexOf('🤖')>=0 || line.indexOf('💨')>=0) style+='color:#88ccff;';
  else if(line.indexOf('💢 被弾')>=0) style+='color:#ff7777;font-weight:600;';
  else if(line.indexOf('👹')>=0) style+='color:#ff8888;font-weight:600;';
  else if(line.indexOf('🛡')>=0) style+='color:#aaccff;';
  else if(line.indexOf('💥 必殺')>=0) style+='color:#ffaa44;font-weight:bold;text-shadow:0 0 6px rgba(255,150,0,.4);';
  else if(line.indexOf('🔥')>=0) style+='color:#ffaa44;';
  else if(line.indexOf('⚡')>=0) style+='color:#aaccff;';
  else if(line.indexOf('💚')>=0) style+='color:#88ff88;';
  else if(line.indexOf('🔋')>=0) style+='color:#88ff88;font-size:12px;';
  else if(line.indexOf('🪁')>=0) style+='color:#88ffcc;font-size:12px;';
  else if(line.indexOf('▼ 次のボス行動')>=0) style+='color:#ff9966;font-weight:bold;padding:4px 8px;background:rgba(80,30,0,.3);border-left:3px solid #ff8844;border-radius:3px;margin-top:4px;';
  else if(line.indexOf('═══')===0) style+='color:#ffcc44;font-weight:bold;letter-spacing:2px;';
  else if(line.indexOf('💡')>=0) style+='color:#cccccc;font-style:italic;font-size:12px;';
  else if(line.indexOf('⚠')>=0) style+='color:#ffaa66;font-size:12px;';
  else if(line.indexOf('✨CRITICAL')>=0) style+='color:#ffee88;font-weight:bold;';
  div.style.cssText=style;
  div.innerHTML = line ? escapeHtml(line) : '&nbsp;';
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

function showBossVictoryBanner(){
  var b = document.getElementById('boss-victory-banner');
  if(b){ b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); }
  // ~2.4 秒後にアリーナを自動で閉じてゲームに復帰、~4 秒後にバナーが消える
  setTimeout(function(){ winRobotBattle(); }, 2400);
  setTimeout(function(){ if(b) b.classList.remove('show'); }, 4200);
}

function winRobotBattle(){
  document.getElementById('robot-arena-modal').classList.remove('open');
  robotBattleActive=false;
  if(bossEntity){
    bossEntity.hp=0; bossEntity.defeated=true;
    if(bossEntity.mesh) scene.remove(bossEntity.mesh);
    for(var pi=0;pi<bossProjectiles.length;pi++) scene.remove(bossProjectiles[pi].mesh);
    bossProjectiles=[];
  }
  // ── ボス撃破に連動して全モブを消滅させる演出 ──
  var mobsCleared = 0;
  if(typeof enemies !== 'undefined'){
    for(var ei=enemies.length-1; ei>=0; ei--){
      var en = enemies[ei];
      if(en.hp<=0) continue;
      // mesh とパーツを scene から削除
      if(en.mesh) scene.remove(en.mesh);
      if(en.leg1) scene.remove(en.leg1);
      if(en.leg2) scene.remove(en.leg2);
      if(en.arm1) scene.remove(en.arm1);
      if(en.arm2) scene.remove(en.arm2);
      en.hp = 0; en.dying = true;
      mobsCleared++;
    }
    enemies.length = 0;
  }
  gameState='playing';
  if(typeof unlockPortal==='function') unlockPortal();
  if(typeof showMessage==='function'){
    showMessage('🏆 ロボットがボスを撃破!','#ffdd44');
    if(mobsCleared>0){
      showMessage('💨 モブも全て消えた…ボスの支配が解けた','#cc99ff');
    }
    showMessage('脱出口が開放されました!','#44ffaa');
  }
  if(typeof stopBGM==='function') stopBGM();
  if(typeof startBGM==='function') startBGM(floor);
  setTimeout(function(){ canvas.requestPointerLock(); },350);
}

// ── 敗北時に「離れる」を押した場合: ボスは生きたまま、ダンジョンに復帰 ──
function leaveRobotBattle(){
  document.getElementById('robot-arena-modal').classList.remove('open');
  robotBattleActive=false;
  // 旧 boss の battleCooldown 相当: ボスから少し離れる猶予を作る
  if(typeof battleCooldown!=='undefined') battleCooldown=4;
  gameState='playing';
  if(typeof showMessage==='function'){
    showMessage('🏃 戦闘から離脱。コードを書き直してもう一度挑もう','#ffaa66');
  }
  if(typeof unmuteBGM==='function') unmuteBGM();
  setTimeout(function(){ canvas.requestPointerLock(); }, 350);
}

// ─── ロボットコードのテンプレート ───
// 「条件」も「行動」も全部チームで決めるオープン設計。
// 既に用意された if 文は単なる雛形。<条件> も <行動> も自由に書き換えて自分達の戦略を作る。
const ROBOT_TEMPLATE =
'# ═══════════════════════════════════════════════\n'+
'# ロボットの戦闘 AI を自由に設計しよう\n'+
'# ═══════════════════════════════════════════════\n'+
'#\n'+
'# 戻り値 action の候補（左の一覧からクリックでコピー可）:\n'+
'#   "attack" / "ranged" / "defend" / "dodge" / "special" / "charge"\n'+
'#\n'+
'# state の主な中身:\n'+
'#   boss               = このターンに実際に出るボス行動 (毎ターン参照可能)\n'+
'#                          "attack"  "heavy"  "charge"  "heal"  "shield"\n'+
'#                        ※ 画面上部の「次のターン」表示はバッチ 1 ターン目だけ\n'+
'#                          だが、コード側は 2-3 ターン目も読めるので毎ターン反応可\n'+
'#   hp_ratio           = 自分 HP の残り割合 (1.0 = 満タン, 0.5 = 半分)\n'+
'#   state["special_cd"]  必殺技のクールダウン残り (0 で発動可能)\n'+
'#   state["my_energy"]   エネルギー残量\n'+
'#   state["my_hp"]       自分 HP の絶対値\n'+
'#   state["boss_hp"]     ボス HP の絶対値\n'+
'#\n'+
'# 💡 if 文は上から評価される。最初に該当した return が採用される\n'+
'# 💡 ルールは自由に追加・削除・並べ替え OK\n'+
'# 💡 「閾値」も「条件」も「行動」も自分のチームで決めよう\n'+
'#    例: HP 50% で守りたいチーム / HP 20% でこそ必殺を撃ちたいチーム ―\n'+
'#    どっちが正解？ 試してみよう。\n'+
'\n'+
'def robot_action(state):\n'+
'    boss = state["boss_action"]\n'+
'    hp_ratio = state["my_hp"] / state["my_max_hp"]\n'+
'\n'+
'    # ── ルール ①: ボスがこのターンに出す行動への対策 (毎ターン読める) ──\n'+
'    if boss == "????":               # どのボス行動に反応する？\n'+
'        return {"action": "???"}    # その時どう動く？\n'+
'\n'+
'    # ── ルール ②: HP が一定値を下回ったら ──\n'+
'    if hp_ratio < 0.0:               # 何%で発動？  0.3 なら 30% 未満で発動\n'+
'        return {"action": "???"}\n'+
'\n'+
'    # ── ルール ③: 必殺技を打てる時 ──\n'+
'    if state["special_cd"] == 0 and state["my_energy"] >= 20:\n'+
'        return {"action": "???"}\n'+
'\n'+
'    # ── ルール ④: 上のどれにも当てはまらない普段の行動 ──\n'+
'    return {"action": "???"}\n'+
'\n'+
'\n'+
'# ─── サンプル戦略 (参考まで・コピペしても自由に改造しても OK) ────────────\n'+
'#\n'+
'# 【🛡 安定型】 ボスを読んでコツコツ削る\n'+
'#   boss == "charge" → "dodge"      hp_ratio < 0.3  → "defend"\n'+
'#   cd == 0          → "special"    普段は "ranged"\n'+
'#\n'+
'# 【⚔ 攻撃型】 とにかく攻めて速攻決着\n'+
'#   boss == "shield" → "charge"     hp_ratio < 0.5  → "defend"\n'+
'#   cd == 0          → "special"    普段は "attack"\n'+
'#\n'+
'# 【💥 ピーキー型】 ピンチほど火力で押し切る\n'+
'#   boss == "charge" → "defend"     hp_ratio < 0.2  → "special"\n'+
'#   cd == 0          → "ranged"     普段は "charge"\n'+
'#\n'+
'# 【🌀 燃焼放置型 (火炎放射器 装備時)】 燃焼継続で勝つ\n'+
'#   cd == 0          → "special"    boss == "charge" → "dodge"\n'+
'#   普段は "defend"  (燃焼ダメージを稼ぐ間に粘る)\n'+
'#\n'+
'# 自分達の装備の特殊効果 (⭐ マークの行) と相談しながら、好きに組み合わせて挑もう！\n';
