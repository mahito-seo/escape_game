// Score Calculation, Game Completion, Extra Stage
function calcScore(){
  const elapsed=~~((Date.now()-startTime)/1000);
  // Time score: max 400pts. Very lenient: under 30min=400, 45min=300, 60min=200, 90min=100, 90min+=50
  const timeScore=elapsed<1800?400:elapsed<2700?Math.max(0,400-((elapsed-1800)/900)*100):elapsed<3600?Math.max(0,300-((elapsed-2700)/900)*100):elapsed<5400?Math.max(0,200-((elapsed-3600)/1800)*100):50;
  // XP score: max 350pts based on level and kills
  const xpScore=Math.min(350,(player.level-1)*35+player.kills*8);
  // Streak bonus: max 250pts
  const streakScore=Math.min(250,totalStreak*12);
  const total=~~(timeScore+xpScore+streakScore);
  let rank,rankColor;
  if(total>=750){rank='S';rankColor='#ffdd00';}
  else if(total>=600){rank='A';rankColor='#00ff41';}
  else if(total>=450){rank='B';rankColor='#44aaff';}
  else if(total>=300){rank='C';rankColor='#ff8844';}
  else if(total>=150){rank='D';rankColor='#cc88cc';}
  else{rank='E';rankColor='#888888';}
  return{elapsed,timeScore:~~timeScore,xpScore:~~xpScore,streakScore:~~streakScore,total,rank,rankColor};
}

function gameComplete(){
  gameState='complete';document.exitPointerLock();playSound('clear');
  const sc=calcScore();
  const min=~~(sc.elapsed/60),sec=sc.elapsed%60;
  const isExtra=currentCipherStage>=6; // completed extra stage
  if(isExtra){
    // True ending
    document.getElementById('overlay-title').innerHTML=`🔥 TRUE ESCAPE 🔥`;
    document.getElementById('overlay-title').style.color='#ff8800';
    document.getElementById('overlay-sub').innerHTML=
      `<span style="font-size:72px;display:block;margin-bottom:12px;color:${sc.rankColor};text-shadow:0 0 30px ${sc.rankColor};font-family:'Cinzel Decorative',serif;">RANK ${sc.rank}</span>`+
      `<span style="font-size:28px;color:${sc.rankColor};">${sc.total}pts</span><br><br>`+
      `<span style="font-size:14px;color:#888;">タイム: ${min}分${sec}秒 (${sc.timeScore}pts) | 戦闘XP (${sc.xpScore}pts) | 連続正解 (${sc.streakScore}pts)</span><br>`+
      `<span style="font-size:14px;color:#888;">Lv.${player.level} | ${player.kills}体撃破 | 🔥${totalStreak}連続正解</span><br><br>`+
      `<span style="color:#ff8800;font-size:16px;">エクストラステージを含む全ステージ完全クリア！</span><br>`+
      `<span style="font-size:13px;">おめでとうございます！真の脱出者です！</span>`;
    document.getElementById('overlay-btn').textContent='もう一度挑戦する';
    document.getElementById('overlay-btn').style.display='inline-block';
    document.getElementById('overlay-btn').onclick=restartGame;
  }else{
    // Stage 5 clear → offer extra stage
    document.getElementById('overlay-title').innerHTML=`🔓 ESCAPE SUCCESS 🔓`;
    document.getElementById('overlay-title').style.color='#00ff41';
    document.getElementById('overlay-sub').innerHTML=
      `<span style="font-size:72px;display:block;margin-bottom:12px;color:${sc.rankColor};text-shadow:0 0 30px ${sc.rankColor};font-family:'Cinzel Decorative',serif;">RANK ${sc.rank}</span>`+
      `<span style="font-size:28px;color:${sc.rankColor};">${sc.total}pts</span><br><br>`+
      `<span style="font-size:14px;color:#888;">タイム: ${min}分${sec}秒 (${sc.timeScore}pts) | 戦闘XP (${sc.xpScore}pts) | 連続正解 (${sc.streakScore}pts)</span><br>`+
      `<span style="font-size:14px;color:#888;">Lv.${player.level} | ${player.kills}体撃破 | 🔥${totalStreak}連続正解</span><br><br>`+
      `<span style="color:#ff8800;font-size:18px;text-shadow:0 0 15px rgba(255,120,0,.6);">⚠ しかし… まだ終わりではない</span>`;
    document.getElementById('overlay-btn').textContent='🔥 EXTRA STAGE へ挑む 🔥';
    document.getElementById('overlay-btn').style.display='inline-block';
    document.getElementById('overlay-btn').onclick=startExtraStage;
  }
  document.getElementById('overlay-screen').classList.add('show');
}

function startExtraStage(){
  document.getElementById('overlay-screen').classList.remove('show');
  document.getElementById('overlay-btn').onclick=restartGame;
  // currentCipherStage is already 5 (pointing to extra stage index)
  floor++;cipherSolved=false;escapeCount=0;
  playSound('battle');
  showMessage('🔥 EXTRA STAGE — 不死鳥の炉','#ff4400');
  showMessage('ここからが本当の試練だ…','#ff8844');
  dungeon=genDungeon();buildScene();
  gameState='playing';canvas.requestPointerLock();
  updateHUD();saveProgress();
}

