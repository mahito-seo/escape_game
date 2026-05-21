// ═══════════════════════════════════
//  進捗トラッカー（講師PCへ自動アップロード）
// ═══════════════════════════════════
// チーム名と URL を設定しておくと、saveProgress() のたびに状態を POST します。
// 設定はタイトル画面の「📡 進捗共有」ボタンから。失敗しても無音（ゲームを止めない）。

const TRACKER_KEY='cipherDungeonTracker';
function trackerConfig(){
  try{return JSON.parse(localStorage.getItem(TRACKER_KEY)||'{}');}catch(e){return {};}
}
function setTrackerConfig(cfg){
  localStorage.setItem(TRACKER_KEY,JSON.stringify(cfg));
}

let lastUploadAt=0;
let lastUploadFail=false;
let consecutiveFails=0;
function uploadProgress(force){
  const cfg=trackerConfig();
  if(!cfg.url||!cfg.teamName)return;            // 未設定なら何もしない
  if(!force && Date.now()-lastUploadAt<800)return;  // 連投防止（force で回避可）
  lastUploadAt=Date.now();

  // 進捗オブジェクト構築
  let repairsSolved=0,totalRepairs=0;
  if(typeof features!=='undefined'){
    for(const k in features){totalRepairs++;if(features[k]>0)repairsSolved++;}
  }
  let repairsRemaining=0;
  if(typeof repairTerminals!=='undefined'){
    for(const rt of repairTerminals)if(!rt.solved)repairsRemaining++;
  }
  let phase='exploring';
  if(typeof gameState!=='undefined'){
    if(gameState==='battle')phase='battle';
    // 修理ターミナル中（gameState='cipher' でも repairActive が優先）
    else if(typeof repairActive!=='undefined'&&repairActive)phase='repair';
    // 金色のコーディングチャレンジ（暗号でも修理でもない）
    else if(typeof challengeActive!=='undefined'&&challengeActive)phase='challenge';
    // 暗号ターミナル（緑）の Phase 1（コード入力）or Phase 2（Agent）
    else if(gameState==='cipher')phase=(typeof cipherPhase!=='undefined'&&cipherPhase===2)?'agent':'coding';
    else if(gameState==='complete')phase='complete';
    else if(gameState==='dead')phase='resting';
    else if(gameState==='paused')phase='paused';
  }
  const elapsedSec=(typeof startTime!=='undefined'&&startTime)?Math.floor((Date.now()-startTime-(typeof totalPausedMs!=='undefined'?totalPausedMs:0))/1000):0;
  // 完全復元用のスナップショット（admin.importSave() がそのまま受け取れる形式）
  // 文字列のまま送ることで localStorage への書き戻しが容易になる
  const snapshot={
    save:localStorage.getItem('cipherDungeonSave'),
    features:localStorage.getItem('cipherDungeonFeatures'),
  };
  const payload={
    teamName:cfg.teamName,
    stage:(typeof currentCipherStage!=='undefined'?currentCipherStage+1:1),
    floor:(typeof floor!=='undefined'?floor:1),
    level:(typeof player!=='undefined'?player.level:1),
    kills:(typeof player!=='undefined'?player.kills:0),
    hp:(typeof player!=='undefined'?player.hp:0),
    maxHp:(typeof player!=='undefined'?player.maxHp:0),
    cipherSolved:(typeof cipherSolved!=='undefined'?!!cipherSolved:false),
    cipherPhase:phase,
    repairsSolved,totalRepairs,repairsRemaining,
    bossActive:(typeof bossEntity!=='undefined'&&bossEntity&&!bossEntity.defeated),
    gameComplete:(typeof gameState!=='undefined'&&gameState==='complete'),
    elapsed:elapsedSec,
    // Mode selected on the title screen (easy/normal/hard). 出現量だけが変わる
    mobDensity:(typeof window!=='undefined'&&window.mobDensity)||'normal',
    // Debug mode flag (hidden trigger — Ns clicked on title screen)
    debugMode:!!(typeof window!=='undefined'&&window.__debugMode),
    clientTime:Date.now(),
    snapshot,
  };
  // keepalive:true は Windows Chrome で auto-download と相性が悪く、
  // 連続アップロードがブロックされることがある（64KB 制限 + page lifecycle）。
  // 通常の fetch にすると安定する。
  const bodyText = JSON.stringify(payload);
  function send(attempt){
    let timedOut=false;
    const controller=(typeof AbortController!=='undefined')?new AbortController():null;
    const timer=setTimeout(()=>{timedOut=true;if(controller)controller.abort();},8000);
    try{
      fetch(cfg.url,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:bodyText,
        mode:'cors',
        cache:'no-store',
        signal:controller?controller.signal:undefined,
      }).then(r=>{
        clearTimeout(timer);
        if(r.ok){lastUploadFail=false;consecutiveFails=0;}
        else{lastUploadFail=true;consecutiveFails++;if(attempt<1)setTimeout(()=>send(attempt+1),700);}
      }).catch(()=>{
        clearTimeout(timer);
        lastUploadFail=true;consecutiveFails++;
        if(attempt<1)setTimeout(()=>send(attempt+1),700);  // 一度だけリトライ
      });
    }catch(e){clearTimeout(timer);lastUploadFail=true;consecutiveFails++;}
  }
  send(0);
}

// 手動で「今すぐ再接続」させるための公開関数。
// pause 画面の「サーバー再接続」ボタンや admin.reconnect() から呼ぶ。
window.reconnectTracker=function(){
  consecutiveFails=0;
  uploadProgress(true);  // force=true で 800ms ガードを無視
  return '🔌 再接続を実行しました';
};

// 同一オリジン（tracker サーバー経由でロードされている場合）は URL 自動推定
function defaultTrackerUrl(){
  if(location.protocol==='http:'||location.protocol==='https:'){
    return location.origin+'/status';
  }
  return '';
}

// タイトル画面から呼ぶ設定 UI（prompt ベースのシンプルな実装）
function openTrackerSettings(){
  const cur=trackerConfig();
  const teamName=prompt('チーム名を入力してください（例: チームA）',cur.teamName||'');
  if(teamName===null)return; // cancel
  const suggested=cur.url||defaultTrackerUrl();
  const hint=defaultTrackerUrl()?
    '（このページのアドレスから自動入力されています）':
    '（例: http://192.168.1.10:9876/status）';
  const url=prompt('講師PCのアップロード URL を入力してください\n'+hint+'\n空欄にすると共有を停止します',suggested);
  if(url===null)return;
  setTrackerConfig({teamName:teamName.trim(),url:url.trim()});
  if(teamName.trim()&&url.trim()){
    showMessage('📡 進捗共有を有効にしました: '+teamName.trim(),'#88ccff');
    uploadProgress();
  }else{
    showMessage('📡 進捗共有を停止しました','#888888');
  }
}

// 5秒ごとに ping（プレイヤーが何もしていない間も「生きている」を伝える）
// — ダッシュボードの 2 秒ポーリングと合わせて、ほぼリアルタイム表示に。
//   uploadProgress() 自体に 800ms の連投ガードがあるので、saveProgress() の
//   イベント発火と被っても重複送信にはならない。
setInterval(function(){if(typeof saveProgress==='function')uploadProgress();},5000);

// タイトル画面のボタンに現在の状態を反映する
function refreshTrackerBtn(){
  const btn=document.getElementById('tracker-btn');
  if(!btn)return;
  const cfg=trackerConfig();
  if(cfg.url&&cfg.teamName){
    btn.textContent='📡 共有中: '+cfg.teamName+'（変更）';
    btn.style.background='rgba(0,80,40,.6)';
    btn.style.borderColor='#2ea043';
    btn.style.color='#7ee787';
  }else{
    btn.textContent='📡 進捗共有を設定';
    btn.style.background='rgba(0,40,80,.6)';
    btn.style.borderColor='#2868a8';
    btn.style.color='#88ccff';
  }
}
window.addEventListener('DOMContentLoaded',refreshTrackerBtn);
// 設定後にもボタン表示を更新
const _origSet=setTrackerConfig;
setTrackerConfig=function(c){_origSet(c);refreshTrackerBtn();};
