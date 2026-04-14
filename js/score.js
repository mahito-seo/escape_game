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
    // TRUE ENDING - S rank guaranteed + BIG fanfare
    playSound('truefanfare');
    document.getElementById('overlay-title').innerHTML=`🔥 TRUE ESCAPE 🔥`;
    document.getElementById('overlay-title').style.color='#ff8800';
    document.getElementById('overlay-sub').innerHTML=
      `<span style="font-size:80px;display:block;margin-bottom:12px;color:#ffdd00;text-shadow:0 0 40px #ffdd00;font-family:'Cinzel Decorative',serif;">RANK S</span>`+
      `<span style="font-size:28px;color:#ffdd00;">PERFECT CLEAR</span><br><br>`+
      statsLine+`<br><br>`+
      `<span style="color:#ff8800;font-size:16px;">エクストラステージクリア！真の脱出者です！</span>`;
    document.getElementById('overlay-btn').textContent='もう一度挑戦する';
    document.getElementById('overlay-btn').style.display='inline-block';
    document.getElementById('overlay-btn').onclick=restartGame;
  }else{
    // NORMAL ENDING - fanfare + looks like a final screen
    playSound('fanfare');
    document.getElementById('overlay-title').innerHTML=`🔓 ESCAPE SUCCESS 🔓`;
    document.getElementById('overlay-title').style.color='#00ff41';
    document.getElementById('overlay-sub').innerHTML=
      `<span style="font-size:72px;display:block;margin-bottom:12px;color:${sc.rankColor};text-shadow:0 0 30px ${sc.rankColor};font-family:'Cinzel Decorative',serif;">RANK ${sc.rank}</span>`+
      `<span style="font-size:28px;color:${sc.rankColor};">${sc.total}pts</span><br><br>`+
      statsLine+`<br><br>`+
      `<span style="font-size:16px;color:#88ffaa;">おめでとうございます！<br>全5ステージの暗号を解読し、ダンジョンから脱出しました！</span><br><br>`+
      `<span style="font-size:13px;color:#668866;">学んだ暗号技術：<br>・文字列の逆順（Stage 1）<br>・ASCIIオフセット（Stage 2）<br>・Base64+hex（Stage 3）<br>・XOR暗号（Stage 4）<br>・多重暗号（Stage 5）</span><br><br>`+
      `<span style="font-size:11px;color:#444;cursor:pointer;text-decoration:underline;" onclick="document.getElementById('extra-reveal').style.display='block'">…しかし、まだ隠されたステージがあるらしい</span>`+
      `<div id="extra-reveal" style="display:none;margin-top:16px;"><button onclick="startExtraStage()" style="font-family:'Cinzel',serif;font-size:14px;letter-spacing:3px;color:#000;background:linear-gradient(135deg,#ff8844,#cc4400);border:none;padding:12px 36px;cursor:pointer;border-radius:3px;box-shadow:0 0 20px rgba(255,100,0,.5);">🔥 EXTRA STAGE へ挑む 🔥</button></div>`;
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
  showMessage('🔥 EXTRA STAGE — 不死鳥の炉','#ff4400');
  showMessage('ここからが本当の試練だ…','#ff8844');
  dungeon=genDungeon();buildScene();
  gameState='playing';canvas.requestPointerLock();
  updateHUD();saveProgress();
  startBGM(floor);
}
