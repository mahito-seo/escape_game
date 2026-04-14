// Battle System - Python Quiz Battles
let battleActive=false, battleEnemy=null, battleQList=[], battleQIdx=0;
let battleTimer=30, battleTimerInt=null, totalStreak=0, roundCorrect=0;
const BATTLE_QCOUNT=3, BATTLE_TIME=30;

function pickQuestions(fl){
  let pool;
  if(fl<=1) pool=QUESTIONS.filter(q=>q.diff==='easy');
  else if(fl<=2) pool=QUESTIONS.filter(q=>q.diff!=='hard');
  else if(fl<=3) pool=[...QUESTIONS]; // mix of all
  else if(fl<=5) pool=QUESTIONS.filter(q=>q.diff!=='easy'); // normal+hard
  else pool=QUESTIONS.filter(q=>q.diff==='hard'); // Extra stage: hard only
  return[...pool].sort(()=>Math.random()-.5).slice(0,BATTLE_QCOUNT);
}

function openBattle(e){
  if(battleActive||cipherActive)return;
  battleActive=true; battleEnemy=e; e.inBattle=true;
  battleQList=pickQuestions(floor); battleQIdx=0; roundCorrect=0;
  gameState='battle'; document.exitPointerLock(); playSound('battle'); muteBGM();
  const ef=document.getElementById('encounter-flash');
  [0,200,400].forEach(t=>{setTimeout(()=>{ef.classList.add('flash');setTimeout(()=>ef.classList.remove('flash'),120);},t);});
  document.getElementById('b-enemy-avatar').textContent=e.avatar||'👹';
  document.getElementById('b-enemy-name').textContent=e.name;
  updateBattleHP();
  document.getElementById('battle-modal').classList.add('open');
  document.getElementById('battle-result').style.display='none';
  // Disable escape if limit reached
  const skipBtn=document.getElementById('battle-skip-btn');
  if(escapeCount>=MAX_ESCAPES){
    skipBtn.disabled=true;skipBtn.textContent='🚫 逃走不可（上限到達）';skipBtn.style.opacity='.3';
  }else{
    skipBtn.disabled=false;skipBtn.textContent=`💨 逃げる（HP-25%＋XP減 残り${MAX_ESCAPES-escapeCount}回）`;skipBtn.style.opacity='1';
  }
  loadQ();
}

function updateBattleHP(){
  if(!battleEnemy)return;
  const pct=Math.max(0,battleEnemy.hp/battleEnemy.maxHp*100);
  document.getElementById('b-enemy-hp-txt').textContent=`HP ${battleEnemy.hp} / ${battleEnemy.maxHp}`;
  document.getElementById('b-enemy-hp-bar').style.width=pct+'%';
}

function loadQ(){
  const q=battleQList[battleQIdx];
  if(!q){doVictory();return;}
  document.getElementById('b-q-num').textContent=`Q${battleQIdx+1}/${battleQList.length}`;
  document.getElementById('b-q-category').textContent=q.cat;
  const d=document.getElementById('b-q-diff');
  d.className='diff-badge diff-'+q.diff;
  d.textContent={easy:'EASY',normal:'NORMAL',hard:'HARD'}[q.diff];
  document.getElementById('b-question-text').textContent=q.q;
  const c=document.getElementById('b-code-block');
  if(q.code){c.style.display='block';c.textContent=q.code;}else c.style.display='none';
  document.getElementById('battle-result').style.display='none';
  const cg=document.getElementById('b-choices-grid'),ia=document.getElementById('b-input-area');
  if(q.type==='choice'){
    cg.style.display='grid';ia.style.display='none';cg.innerHTML='';
    ['A','B','C','D'].forEach((l,i)=>{
      if(i>=q.choices.length)return;
      const b=document.createElement('button');b.className='choice-btn';
      b.innerHTML=`<span class="choice-letter">${l}</span><code>${q.choices[i]}</code>`;
      b.onclick=()=>submitChoice(i);cg.appendChild(b);
    });
  }else{
    cg.style.display='none';ia.style.display='flex';
    const inp=document.getElementById('battle-input');inp.value='';inp.disabled=false;
    inp.placeholder=q.hint?`ヒント: ${q.hint}`:'答えを入力…';
    document.getElementById('battle-submit').disabled=false;
    setTimeout(()=>inp.focus(),80);
  }
  document.getElementById('b-hint').textContent=q.hint?`💡 ${q.hint}`:'💡';
  startBattleTimer();
}

function startBattleTimer(){
  clearInterval(battleTimerInt); battleTimer=BATTLE_TIME;
  const el=document.getElementById('battle-timer');el.classList.remove('danger');el.textContent=battleTimer;
  battleTimerInt=setInterval(()=>{battleTimer--;el.textContent=battleTimer;if(battleTimer<=8)el.classList.add('danger');if(battleTimer<=0){clearInterval(battleTimerInt);bTimeOut();}},1000);
}
function stopBattleTimer(){clearInterval(battleTimerInt);document.getElementById('battle-timer').classList.remove('danger');}

function submitChoice(idx){
  const q=battleQList[battleQIdx];stopBattleTimer();
  const bs=document.querySelectorAll('.choice-btn');bs.forEach(b=>b.classList.add('disabled'));
  bs[q.ans].classList.add('correct');
  if(idx===q.ans){bs[idx].classList.add('correct');onCorrect(q);}
  else{bs[idx].classList.add('wrong');onWrong(q);}
}
function submitFreeAnswer(){
  const q=battleQList[battleQIdx],v=document.getElementById('battle-input').value.trim();
  if(!v)return;stopBattleTimer();
  document.getElementById('battle-input').disabled=true;document.getElementById('battle-submit').disabled=true;
  if(v.toLowerCase()===String(q.ans).toLowerCase())onCorrect(q);else onWrong(q);
}
document.getElementById('battle-input').addEventListener('keydown',e=>{if(e.key==='Enter')submitFreeAnswer();});

function calcDmg(q){
  const base=player.attackPower,dm={easy:1,normal:1.6,hard:2.5}[q.diff];
  const streak=1+roundCorrect*.25,speed=battleTimer>=20?1.4:battleTimer>=10?1:.75;
  return Math.floor(base*dm*streak*speed);
}
function onCorrect(q){
  roundCorrect++;totalStreak++;const dmg=calcDmg(q);
  battleEnemy.hp=Math.max(0,battleEnemy.hp-dmg);updateBattleHP();
  const sp=battleTimer>=20?' ⚡スピードボーナス！':'',st=roundCorrect>=2?` 🔥${roundCorrect}連続！`:'';
  showBattleResult(true,`正解！ ${battleEnemy.name}に<strong>${dmg}ダメージ！</strong>${sp}${st}`,q.expl);
  spawnParticles(player.x,player.z,'#44ff88',20);showMessage(`✅ 正解！ -${dmg}HP`,'#44ff88');playSound('correct');
  if(battleEnemy.hp<=0)battleEnemy.dying=true;updateHUD();
}
function onWrong(q){
  totalStreak=Math.max(0,totalStreak-1);roundCorrect=0;
  const dmg=Math.floor(8+battleEnemy.atk*.6);player.hp=Math.max(0,player.hp-dmg);
  const df=document.getElementById('damage-flash');df.classList.add('flash');setTimeout(()=>df.classList.remove('flash'),200);
  const ca=q.type==='choice'?q.choices[q.ans]:q.ans;
  showBattleResult(false,`不正解… <strong>${dmg}ダメージ！</strong>`,`正解: ${ca}　${q.expl}`);
  showMessage('❌ 不正解…','#ff6666');playSound('wrong');updateHUD();
  if(player.hp<=0)setTimeout(()=>{closeBattle();gameOver();},1500);
}
function bTimeOut(){
  // Time out: fixed 50 damage instead of normal wrong damage
  const q=battleQList[battleQIdx];
  totalStreak=Math.max(0,totalStreak-1);roundCorrect=0;
  const dmg=50;player.hp=Math.max(0,player.hp-dmg);
  const df=document.getElementById('damage-flash');df.classList.add('flash');setTimeout(()=>df.classList.remove('flash'),200);
  const ca=q.type==='choice'?q.choices[q.ans]:q.ans;
  showBattleResult(false,`時間切れ… <strong>${dmg}ダメージ！</strong>`,`正解: ${ca}　${q.expl}`);
  showMessage('⏰ 時間切れ…','#ff6666');playSound('wrong');updateHUD();
  if(player.hp<=0)setTimeout(()=>{closeBattle();gameOver();},1500);
}

function showBattleResult(ok,msg,detail){
  const el=document.getElementById('battle-result');el.style.display='flex';
  el.className=ok?'correct-res':'wrong-res';
  document.getElementById('r-icon').textContent=ok?'✅':'❌';
  document.getElementById('r-msg').innerHTML=msg;
  document.getElementById('r-detail').textContent=detail;
}
function battleContinue(){
  if(battleEnemy&&battleEnemy.dying){doVictory();return;}
  battleQIdx++;
  if(battleQIdx>=battleQList.length){
    if(battleEnemy&&battleEnemy.hp<=0){doVictory();}
    else if(floor>=5){
      // Floor 5+: enemy doesn't flee, load more questions
      battleQList=pickQuestions(floor);battleQIdx=0;
      showMessage('敵はまだ倒れない！ 追加問題！','#ff8844');
      loadQ();
    }else{battleEnd();}
  }else loadQ();
}
function doVictory(){
  stopBattleTimer();if(battleEnemy)killEnemy(battleEnemy);
  closeBattle();showMessage(`⚔ 撃破！ 連続正解: ${roundCorrect}回`,'#ffdd44');
}
function battleEnd(){
  // Enemy survived - battle ends, enemy stays alive
  stopBattleTimer();
  if(battleEnemy){battleEnemy.inBattle=false;}
  battleEnemy=null;
  closeBattle();
  showMessage('敵が逃げた… HPを削りきれなかった！','#ff8844');
}
let escapeCount=0;
const MAX_ESCAPES=2; // per floor
function battleSkip(){
  stopBattleTimer();
  escapeCount++;
  // Escalating penalty: 25% HP + loses XP
  const hpPen=Math.floor(player.maxHp*(.25+escapeCount*.05));
  const xpPen=Math.floor(player.xp*.15);
  player.hp=Math.max(1,player.hp-hpPen);
  player.xp=Math.max(0,player.xp-xpPen);
  totalStreak=0;
  if(battleEnemy)battleEnemy.inBattle=false;battleEnemy=null;
  closeBattle();playSound('wrong');
  showMessage(`💨 逃げた！ HP -${hpPen}, XP -${xpPen}`,'#ff8888');
  if(escapeCount>=MAX_ESCAPES){
    showMessage(`⚠ 逃走回数上限！次から逃げられません！`,'#ff4444');
  }
  updateHUD();
}
function closeBattle(){
  battleActive=false;battleEnemy=null;
  document.getElementById('battle-modal').classList.remove('open');
  gameState='playing';setTimeout(()=>canvas.requestPointerLock(),350);
  unmuteBGM();
}

// ═══════════════════════════════════
//  CIPHER STATE
// ═══════════════════════════════════
