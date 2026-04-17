// Score Calculation, Game Completion, Extra Stage
function calcScore(forceS){
  const elapsed=~~((Date.now()-startTime-totalPausedMs)/1000);
  const timeScore=elapsed<1800?400:elapsed<2700?Math.max(0,400-((elapsed-1800)/900)*100):elapsed<3600?Math.max(0,300-((elapsed-2700)/900)*100):elapsed<5400?Math.max(0,200-((elapsed-3600)/1800)*100):50;
  const xpScore=Math.min(350,(player.level-1)*35+player.kills*8);
  const streakScore=Math.min(250,totalStreak*12);
  let total=~~(timeScore+xpScore+streakScore);
  let rank,rankColor;
  if(forceS){rank='S';rankColor='#ffdd00';total=1000;}
  else if(total>=750){rank='S';rankColor='#ffdd00';}
  else if(total>=600){rank='A';rankColor='#00ff41';}
  else if(total>=450){rank='B';rankColor='#44aaff';}
  else if(total>=300){rank='C';rankColor='#ff8844';}
  else if(total>=150){rank='D';rankColor='#cc88cc';}
  else{rank='E';rankColor='#888888';}
  return{elapsed,timeScore:~~timeScore,xpScore:~~xpScore,streakScore:~~streakScore,total,rank,rankColor};
}

function gameComplete(){
  gameState='complete';document.exitPointerLock();stopBGM();
  const isExtra=currentCipherStage>=6;
  const sc=calcScore(isExtra); // Extra clear = forced S rank
  const min=~~(sc.elapsed/60),sec=sc.elapsed%60;
  const statsLine=`<span style="font-size:14px;color:#888;">タイム: ${min}分${sec}秒 (${sc.timeScore}pts) | 戦闘XP (${sc.xpScore}pts) | 連続正解 (${sc.streakScore}pts)</span><br>`+
    `<span style="font-size:14px;color:#888;">Lv.${player.level} | ${player.kills}体撃破 | 🔥${totalStreak}連続正解</span>`;

  if(isExtra){
    // TRUE ENDING
    playSound('truefanfare');
    document.getElementById('overlay-title').innerHTML=`🔥 TRUE ESCAPE 🔥`;
    document.getElementById('overlay-title').style.color='#ff8800';
    document.getElementById('overlay-sub').innerHTML=
      `<span style="font-size:80px;display:block;margin-bottom:12px;color:#ffdd00;text-shadow:0 0 40px #ffdd00;font-family:'Cinzel Decorative',serif;">RANK S</span>`+
      `<span style="font-size:28px;color:#ffdd00;">PERFECT CLEAR</span><br><br>`+
      statsLine+`<br><br>`+
      `<span style="color:#ffcc88;font-size:15px;line-height:1.8;">全エージェントの帰還指令を復号した。<br>`+
      `SHADOW NETWORKの全データを奪還し、<br>`+
      `攻撃者の痕跡を突き止めた。<br><br>`+
      `<span style="color:#ff8800;">君は真のエージェントだ。</span></span>`;
    document.getElementById('overlay-btn').textContent='もう一度挑戦する';
    document.getElementById('overlay-btn').style.display='inline-block';
    document.getElementById('overlay-btn').onclick=restartGame;
  }else{
    // NORMAL ENDING
    playSound('fanfare');
    document.getElementById('overlay-title').innerHTML=`🔓 MISSION COMPLETE 🔓`;
    document.getElementById('overlay-title').style.color='#00ff41';
    document.getElementById('overlay-sub').innerHTML=
      `<span style="font-size:72px;display:block;margin-bottom:12px;color:${sc.rankColor};text-shadow:0 0 30px ${sc.rankColor};font-family:'Cinzel Decorative',serif;">RANK ${sc.rank}</span>`+
      `<span style="font-size:28px;color:${sc.rankColor};">${sc.total}pts</span><br><br>`+
      statsLine+`<br><br>`+
      `<span style="font-size:15px;color:#88ffaa;line-height:1.8;">ミッション完了。<br>`+
      `5つの暗号を解読し、脱出コードを手に入れた。<br>`+
      `エージェントの配置情報、作戦データ、優先度マップ、<br>`+
      `緊急連絡プロトコル… すべてのデータを繋ぎ、<br>`+
      `SHADOW NETWORKからの脱出に成功した。</span><br><br>`+
      `<span style="font-size:13px;color:#668866;">習得スキル：リスト操作 / chr関数 / 辞書ソート / 文字列処理 / 関数パイプライン</span><br><br>`+
      `<span style="font-size:11px;color:#555;cursor:pointer;text-decoration:underline;" onclick="document.getElementById('extra-reveal').style.display='block'">…しかし、施設の最深部にもう一つの階層があるという噂が…</span>`+
      `<div id="extra-reveal" style="display:none;margin-top:16px;">`+
      `<p style="color:#ff8844;font-size:12px;margin-bottom:10px;">帰還指令がまだ復号されていない。全エージェントが危険な状態だ。</p>`+
      `<button onclick="startExtraStage()" style="font-family:'Cinzel',serif;font-size:14px;letter-spacing:3px;color:#000;background:linear-gradient(135deg,#ff8844,#cc4400);border:none;padding:12px 36px;cursor:pointer;border-radius:3px;box-shadow:0 0 20px rgba(255,100,0,.5);">🔥 EXTRA STAGE — 帰還指令を復号する 🔥</button></div>`;
    document.getElementById('overlay-btn').textContent='終了する';
    document.getElementById('overlay-btn').style.display='inline-block';
    document.getElementById('overlay-btn').onclick=resetToTitle;
  }
  document.getElementById('overlay-screen').classList.add('show');
}

function startExtraStage(){
  document.getElementById('overlay-screen').classList.remove('show');
  document.getElementById('overlay-btn').onclick=restartGame;
  floor++;cipherSolved=false;escapeCount=0;
  playSound('battle');
  showMessage('🔥 最高機密区画「不死鳥の炉」','#ff4400');
  showMessage('帰還指令を復号せよ。全エージェントの命がかかっている。','#ff8844');
  dungeon=genDungeon();buildScene();
  gameState='playing';canvas.requestPointerLock();
  updateHUD();saveProgress();
  startBGM(floor);
}
