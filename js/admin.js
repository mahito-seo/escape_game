// ═══════════════════════════════════
//  ADMIN CONSOLE TOOLS — クラッシュ復旧 & 遠隔操作の代替
// ═══════════════════════════════════
// 使い方:
//   F12 / Cmd+Opt+I で DevTools を開き、Console タブで以下を実行:
//     admin.help()           → 全コマンド一覧
//     admin.state()          → 現在の状態を表示
//     admin.setLevel(5)      → プレイヤーレベルを5に
//   復旧用:
//     admin.exportLog()      → スナップショットを JSON で保存（ダウンロード）
//     admin.importSave(text) → 別 PC からエクスポートした save を流し込む
//     admin.rollback(N)      → N 個前のスナップショットに戻す
//
// 設計方針: 各 PC の localStorage に「直近 100 件のスナップショット」を
// 自動保存しておくので、サーバーが落ちてもクライアントだけで復旧できる。

const ADMIN_HISTORY_KEY = 'cipherDungeonHistory';
const ADMIN_MAX_HISTORY = 100;

(function setupAdmin(){

function snapshot(){
  return {
    ts: Date.now(),
    iso: new Date().toISOString(),
    floor: (typeof floor!=='undefined')?floor:1,
    stage: (typeof currentCipherStage!=='undefined')?currentCipherStage:0,
    cipherSolved: (typeof cipherSolved!=='undefined')?!!cipherSolved:false,
    totalStreak: (typeof totalStreak!=='undefined')?totalStreak:0,
    startTime: (typeof startTime!=='undefined')?startTime:0,
    player: (typeof player!=='undefined')?{
      level: player.level, xp: player.xp, xpNext: player.xpNext,
      hp: player.hp, maxHp: player.maxHp, mp: player.mp, maxMp: player.maxMp,
      kills: player.kills,
      attackPower: player.attackPower, defense: player.defense,
    }:{},
    features: (typeof features!=='undefined')?Object.assign({},features):{},
    gameState: (typeof gameState!=='undefined')?gameState:'unknown',
  };
}

function readHistory(){
  try{return JSON.parse(localStorage.getItem(ADMIN_HISTORY_KEY)||'[]');}catch(e){return [];}
}
function writeHistory(h){
  try{localStorage.setItem(ADMIN_HISTORY_KEY,JSON.stringify(h));}catch(e){}
}
function appendSnapshot(reason){
  const h = readHistory();
  const s = snapshot();
  s.reason = reason || 'tick';
  h.push(s);
  while(h.length > ADMIN_MAX_HISTORY) h.shift();
  writeHistory(h);
}

// ─── saveProgress() に自動スナップショットをフック ───
if (typeof saveProgress === 'function') {
  const _orig = saveProgress;
  window.saveProgress = function(){
    _orig.apply(this, arguments);
    appendSnapshot('save');
  };
}

// ─── プレイ中 1 分ごとにもスナップショットを残す（保険） ───
setInterval(()=>appendSnapshot('interval'), 60000);

// 起動時にも 1 回
setTimeout(()=>appendSnapshot('boot'), 1000);

// ─── 重要な節目で localStorage が消えても困らないよう、
//     プレイヤーの PC に JSON ファイルを自動ダウンロードする ───
// サーバー側に永続化されるようになったので、定期ダウンロードは無効。
// 重要な節目（ステージクリア / ゲームクリア）のみ呼ばれる。
const AUTO_DOWNLOAD_INTERVAL_MS = 0; // 0 = 定期ダウンロード無効
let lastAutoDownloadAt = 0;

function isMeaningfulProgress(){
  // 始めたばかり / 何も解放されてない場合はダウンロードしない（無駄ファイル防止）
  try{
    if(typeof player==='undefined')return false;
    if(player.level>1) return true;
    if(player.kills>0) return true;
    if(typeof currentCipherStage!=='undefined'&&currentCipherStage>0) return true;
    if(typeof floor!=='undefined'&&floor>1) return true;
    if(typeof features!=='undefined'){
      for(const k in features) if(features[k]>0) return true;
    }
  }catch(e){}
  return false;
}

function autoDownload(reason){
  if(!isMeaningfulProgress()) return;
  if(Date.now() - lastAutoDownloadAt < 30000) return; // 連投ガード（30秒以内は無視）
  lastAutoDownloadAt = Date.now();
  // Windows Chrome ではダウンロード処理が in-flight な fetch を中断する事象あり。
  // 直前に上り送信を完了させてから少し待ってダウンロードする。
  try{appendSnapshot('auto-download:'+reason);}catch(e){}
  if(typeof uploadProgress==='function'){
    try{uploadProgress(true);}catch(e){}
  }
  setTimeout(function(){
    try{
      if(typeof window.admin === 'object' && typeof window.admin.exportLog === 'function'){
        window.admin.exportLog();
        if(typeof showMessage === 'function'){
          showMessage('💾 進捗バックアップを自動ダウンロードしました ('+reason+')', '#88ccff');
        }
      }
    }catch(e){
      console.warn('auto-download failed:', e);
    }
  }, 1500);  // 1.5秒待ってからダウンロード（uploadProgress を確実に終わらせる）
}

// 定期バックアップ（無効化中、節目イベントだけが呼ぶ）
if (AUTO_DOWNLOAD_INTERVAL_MS > 0) {
  setInterval(()=>autoDownload('interval'), AUTO_DOWNLOAD_INTERVAL_MS);
}

// 重要な節目: ステージクリア / ボス撃破 / ゲームクリア時
// — saveProgress フックの中で reason を判定するのは難しいので、
//   各イベント側で window.adminAutoBackup() を呼んでもらう
window.adminAutoBackup = autoDownload;

function _hud(){if(typeof updateHUD==='function')updateHUD();}
function _skills(){if(typeof updateSkillsHUD==='function')updateSkillsHUD();}
function _save(){if(typeof saveProgress==='function')saveProgress();}

// ═══════════════════════════════════
//  公開コマンド (window.admin)
// ═══════════════════════════════════
window.admin = {

  // ── ヘルプ ──
  help(){
    const cmds = [
      ['admin.state()',         '現在の状態を表示'],
      ['admin.history()',       'スナップショット履歴（直近100件）'],
      ['admin.lastSnapshot()',  '最新のスナップショット 1 件'],
      '',
      '── プレイヤーのステータス ──',
      ['admin.setLevel(n)',     'レベルを n に'],
      ['admin.setHP(n)',        '現在 HP を n に'],
      ['admin.setMaxHP(n)',     '最大 HP を n に'],
      ['admin.setMP(n)',        '現在 MP を n に'],
      ['admin.setMaxMP(n)',     '最大 MP を n に'],
      ['admin.setXP(n)',        'XP を n に'],
      ['admin.setKills(n)',     'キル数を n に'],
      ['admin.setAttack(n)',    '攻撃力を n に'],
      ['admin.setDefense(n)',   '防御力を n に'],
      ['admin.heal()',          'HP/MP 全回復'],
      ['admin.god()',           '無敵モード（HP/MP/攻撃力 9999）'],
      '',
      '── 進行状況 ──',
      ['admin.setStage(n)',     '暗号ステージを n に (1〜6)'],
      ['admin.setFloor(n)',     'フロアを n に'],
      ['admin.solveCipher()',   '現ステージの暗号をクリア扱い + 脱出口出現'],
      ['admin.skipFloor()',     '次の階層へ強制移動'],
      '',
      '── 修理機能 ──',
      ['admin.unlock(id, ★)',   '指定の機能を解放 (★=1〜3, 例: admin.unlock("attack", 3))'],
      ['admin.unlockAll(★)',   '全機能を解放（★=3 で最強）'],
      '',
      '── 復旧 / バックアップ ──',
      ['admin.exportLog()',     '履歴を JSON ファイルにダウンロード（バックアップ）'],
      ['admin.exportSave()',    '現在のセーブを JSON 文字列で返す（コピー用）'],
      ['admin.importSave(json)','エクスポートした JSON を流し込む（復元）'],
      ['admin.rollback(n=1)',   'n 個前のスナップショットに戻る'],
      '',
      '── その他 ──',
      ['admin.clear()',         'セーブ全消去（最初から）'],
    ];
    console.log('%c🛠️  ADMIN CONSOLE — 操作可能なコマンド','color:#88ff88;font-weight:bold;font-size:14px;');
    for(const c of cmds){
      if(Array.isArray(c)) console.log('  %c'+c[0].padEnd(28),'color:#ffcc44','— '+c[1]);
      else console.log('%c'+c,'color:#88ccff;font-weight:bold;');
    }
  },

  // ── 状態確認 ──
  state(){
    const s = snapshot();
    console.table({
      Level: s.player.level, HP: `${s.player.hp}/${s.player.maxHp}`, MP: `${s.player.mp}/${s.player.maxMp}`,
      XP: s.player.xp, Kills: s.player.kills,
      Floor: s.floor, Stage: s.stage + 1, CipherSolved: s.cipherSolved,
      State: s.gameState,
    });
    return s;
  },
  history(){return readHistory();},
  lastSnapshot(){const h=readHistory();return h[h.length-1];},

  // ── プレイヤー ──
  setLevel(n){player.level=+n;_hud();_save();return admin.state();},
  setHP(n){player.hp=Math.min(+n,player.maxHp);_hud();_save();return admin.state();},
  setMaxHP(n){player.maxHp=+n;player.hp=Math.min(player.hp,+n);_hud();_save();return admin.state();},
  setMP(n){player.mp=Math.min(+n,player.maxMp);_hud();_save();return admin.state();},
  setMaxMP(n){player.maxMp=+n;player.mp=Math.min(player.mp,+n);_hud();_save();return admin.state();},
  setXP(n){player.xp=+n;_hud();_save();return admin.state();},
  setKills(n){player.kills=+n;_hud();_save();return admin.state();},
  setAttack(n){player.attackPower=+n;_hud();_save();return admin.state();},
  setDefense(n){player.defense=+n;_hud();_save();return admin.state();},
  heal(){player.hp=player.maxHp;player.mp=player.maxMp;_hud();return '✅ HP/MP 全回復';},
  god(){
    player.maxHp=9999;player.hp=9999;
    player.maxMp=9999;player.mp=9999;
    player.attackPower=999;player.defense=999;
    _hud();_save();
    return '😎 無敵モード ON';
  },

  // ── 進行 ──
  setStage(n){
    if(n<1||n>6){console.warn('1〜6 で指定してください');return;}
    currentCipherStage = (+n) - 1;
    _save();
    return '✅ Stage ' + n + ' にセット（次の暗号ターミナルから反映）';
  },
  setFloor(n){floor=+n;_save();return '✅ Floor ' + n + ' にセット';},
  solveCipher(){
    cipherSolved = true;
    if(typeof unlockPortal==='function')unlockPortal();
    _save();
    return '✅ 暗号クリア + 脱出口出現';
  },
  skipFloor(){
    if(typeof floor==='undefined'){console.warn('ゲームがロードされていません');return;}
    floor++;cipherSolved=false;
    if(typeof escapeCount!=='undefined')escapeCount=0;
    if(typeof currentCipherStage!=='undefined')currentCipherStage++;
    if(typeof genDungeon==='function'&&typeof buildScene==='function'){
      window.dungeon = genDungeon();
      buildScene();
    }
    player.hp=player.maxHp;player.mp=player.maxMp;
    _hud();_save();
    return '⏩ Floor ' + floor + ' へ移動';
  },

  // ── 修理機能 ──
  unlock(id, stars){
    stars = (stars==null) ? 3 : Math.max(1, Math.min(3, +stars));
    if(!(id in features)){
      console.warn('未知の機能 ID:', id);
      console.log('利用可能:', Object.keys(features).join(', '));
      return;
    }
    features[id]=stars;
    _skills();
    if(typeof saveFeatures==='function')saveFeatures();
    _save();
    return '✅ '+id+' を ★'+stars+' で解放';
  },
  unlockAll(stars){
    stars = (stars==null) ? 3 : Math.max(1, Math.min(3, +stars));
    for(const k in features) features[k]=stars;
    _skills();
    if(typeof saveFeatures==='function')saveFeatures();
    _save();
    return '✅ 全機能を ★'+stars+' で解放';
  },

  // ── バックアップ / 復元 ──
  exportLog(){
    const data = {
      exportedAt: Date.now(),
      iso: new Date().toISOString(),
      teamName: (function(){try{return JSON.parse(localStorage.getItem('cipherDungeonTracker')||'{}').teamName||'';}catch(e){return '';}})(),
      history: readHistory(),
      currentSave: localStorage.getItem('cipherDungeonSave'),
      currentFeatures: localStorage.getItem('cipherDungeonFeatures'),
    };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
    a.href = url;
    a.download = `cipher-dungeon-log-${data.teamName||'team'}-${stamp}.json`;
    document.body.appendChild(a);a.click();
    setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},100);
    return '✅ ダウンロード開始: '+a.download;
  },
  exportSave(){
    const s = {
      save: localStorage.getItem('cipherDungeonSave'),
      features: localStorage.getItem('cipherDungeonFeatures'),
    };
    return JSON.stringify(s);
  },
  importSave(json){
    try{
      const parsed = (typeof json==='string') ? JSON.parse(json) : json;
      // 受け付ける形式:
      //   { save, features }                       … exportSave() の出力
      //   { currentSave, currentFeatures, ... }    … exportLog() の出力
      const save = parsed.save || parsed.currentSave;
      const features = parsed.features || parsed.currentFeatures;
      if(!save && !features){
        return '❌ 形式が不正です。save / features または currentSave / currentFeatures が必要';
      }
      if(save) localStorage.setItem('cipherDungeonSave', save);
      if(features) localStorage.setItem('cipherDungeonFeatures', features);
      if(typeof loadProgress==='function') loadProgress();
      _hud();_skills();
      return '✅ インポート完了。ページを再読み込みすると確実に反映されます';
    }catch(e){
      console.error(e);
      return '❌ インポート失敗: '+e.message;
    }
  },
  rollback(n){
    n = (n==null) ? 1 : Math.max(1, +n);
    const h = readHistory();
    if(h.length < n+1){
      return '❌ '+n+' 個前のスナップショットが見つかりません（履歴 '+h.length+' 件）';
    }
    const target = h[h.length - 1 - n];
    if(target.player){
      Object.assign(player, target.player);
    }
    if(typeof floor!=='undefined') window.floor = target.floor;
    if(typeof currentCipherStage!=='undefined') window.currentCipherStage = target.stage;
    if(typeof cipherSolved!=='undefined') window.cipherSolved = target.cipherSolved;
    if(target.features){
      for(const k in features){if(target.features[k]!==undefined) features[k]=target.features[k];}
    }
    _hud();_skills();_save();
    return '⏪ '+n+' 個前のスナップショット ('+target.iso+') に戻しました';
  },

  // ── 全消去 ──
  clear(){
    if(typeof clearSave==='function') clearSave();
    localStorage.removeItem(ADMIN_HISTORY_KEY);
    return '✅ 全データ消去。リロードしてください';
  },
};

console.log('%c🛠️  Admin console ready. Type %cadmin.help()%c to see all commands.',
  'color:#88ff88;font-weight:bold;','color:#ffcc44;font-weight:bold;','color:#88ff88;');

// ─── タイトル画面の「💾 セーブを復元」ボタンから呼ばれる ───
// 自動ダウンロードした JSON ファイル or 講師から渡された JSON を
// drag-drop / file input で受け取り、admin.importSave() に流す。
window.restoreFromFile = function(event){
  const file = event.target.files && event.target.files[0];
  if(!file){return;}
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const text = e.target.result;
      // exportLog() の出力（currentSave / currentFeatures を含む）に対応
      // また、サーバー /export-all の出力（teams[].snapshot）から
      // 自分のチームを選んで復元できるパターンにも対応
      const data = JSON.parse(text);
      let target = null;
      if(data.currentSave || data.save){
        target = data;
      }else if(Array.isArray(data.teams)){
        // /export-all 形式 — チーム選択
        const names = data.teams.map(t => t.teamName).filter(Boolean);
        if(!names.length){alert('❌ JSON 内にチームデータが見つかりません');return;}
        const picked = prompt('復元するチーム名を入力してください:\n' + names.join(' / '));
        if(!picked){return;}
        const team = data.teams.find(t => t.teamName === picked);
        if(!team || !team.snapshot){alert('❌ チーム「' + picked + '」のスナップショットが見つかりません');return;}
        target = team.snapshot;
      }else{
        alert('❌ 認識できない JSON 形式です');
        return;
      }
      const result = admin.importSave(target);
      alert((result || '✅ 復元完了') + '\n\nページをリロードします。');
      location.reload();
    }catch(err){
      alert('❌ ファイル読み込み失敗: ' + err.message);
    }
  };
  reader.readAsText(file);
};

})();
