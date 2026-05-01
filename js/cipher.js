// Cipher System - Terminal Puzzle & Agent Phase
let cipherActive=false, currentCipherStage=0, cipherTimerVal=90, cipherTimerInt=null;
let cipherWrongCount=0, cipherSolved=false, startTime=0;
let cipherPhase=1; // 1=passphrase, 2=agent
let agentWrongCount=0, agentLockoutEnd=0, agentLockoutTimer=null;
const MAX_AGENT_WRONG=3, LOCKOUT_SEC=300;

function openCipherModal(){
  if(cipherActive||cipherSolved||battleActive)return;
  cipherActive=true;gameState='cipher';document.exitPointerLock();cipherPhase=1;muteBGM();
  const s=CIPHER_STAGES[currentCipherStage];
  document.getElementById('cm-avatar').textContent=s.avatar;
  document.getElementById('cm-name').textContent='暗号ターミナル';
  document.getElementById('cm-stage-sub').textContent=s.name;
  document.getElementById('cm-mission').textContent=s.mission;
  document.getElementById('cm-hint').textContent=s.hint;
  document.getElementById('cm-footer').textContent=s.footer;
  document.getElementById('cipher-close-btn').style.display='none';
  cipherCodeRan=false; // must run code before submitting
  // Show in-game editor if stage has template (hide raw data block)
  if(s.template){
    document.getElementById('cm-data').style.display='none';
    document.getElementById('code-editor-wrap').classList.add('show');
    initAceEditor();setEditorCode(s.template);setEditorReadOnly(false);
    document.getElementById('code-output-wrap').classList.remove('show');
    document.getElementById('code-run-btn').onclick=async()=>{
      try{
        const result=miniPyEval(getEditorCode());
        document.getElementById('code-output-wrap').classList.add('show');
        document.getElementById('code-output').textContent=result||'(出力なし)';
        if(result.startsWith('Error')){
          document.getElementById('code-output').style.color='#ff6666';
        }else{
          cipherCodeRan=true;
          // Check if output matches passphrase
          const h=await sha256(result.trim().toUpperCase());
          if(h===s.passHash){
            document.getElementById('code-output').style.color='#44ff88';
            document.getElementById('code-output').textContent=result+'\n\n✅ 正解！ このパスフレーズを下に入力してください';
            document.getElementById('c-input').value=result.trim();
            document.getElementById('c-input').focus();
            playSound('correct');
          }else{
            document.getElementById('code-output').style.color='#ffaa88';
          }
        }
      }catch(e){
        document.getElementById('code-output-wrap').classList.add('show');
        document.getElementById('code-output').textContent='Error: '+e.message;
        document.getElementById('code-output').style.color='#ff6666';
      }
    };
  }else{
    document.getElementById('cm-data').textContent=s.data;
    document.getElementById('cm-data').style.display='';
    document.getElementById('code-editor-wrap').classList.remove('show');
    document.getElementById('code-output-wrap').classList.remove('show');
    cipherCodeRan=true; // no template = no run required
  }
  document.getElementById('c-input').value='';document.getElementById('c-input').disabled=false;
  document.getElementById('c-submit').disabled=false;
  document.getElementById('c-result').style.display='none';document.getElementById('c-result').className='';
  document.getElementById('secret-reveal').classList.remove('show');
  document.getElementById('cm-input-row').style.display='flex';
  document.getElementById('agent-phase').classList.remove('show');
  document.getElementById('agent-result').style.display='none';
  document.getElementById('agent-lockout').classList.remove('show');
  cipherWrongCount=0;
  document.getElementById('cipher-modal').classList.add('open');
  startCipherTimer();
}
function startCipherTimer(){
  clearInterval(cipherTimerInt);cipherTimerVal=450+currentCipherStage*90; // 7.5min base + 1.5min per stage
  const el=document.getElementById('cipher-timer');el.classList.remove('danger');
  const fmtTime=(s)=>{const m=Math.floor(s/60);return m>0?`${m}:${String(s%60).padStart(2,'0')}`:String(s);};
  el.textContent=fmtTime(cipherTimerVal);
  cipherTimerInt=setInterval(()=>{cipherTimerVal--;el.textContent=fmtTime(cipherTimerVal);
    if(cipherTimerVal<=30)el.classList.add('danger');
    if(cipherTimerVal<=0){clearInterval(cipherTimerInt);cipherTimeOut();}
  },1000);
}
function stopCipherTimer(){clearInterval(cipherTimerInt);document.getElementById('cipher-timer').classList.remove('danger');}

let cipherCodeRan=false;
async function submitCipherAnswer(){
  const v=document.getElementById('c-input').value.trim().toUpperCase();if(!v)return;
  if(!cipherCodeRan){showMessage('⚠ まずコードを実行してください！','#ff8844');return;}
  stopCipherTimer();const s=CIPHER_STAGES[currentCipherStage],h=await sha256(v);
  const r=document.getElementById('c-result');
  if(h===s.passHash){
    r.style.display='flex';r.className='correct-res';
    document.getElementById('cr-icon').textContent='✅';
    document.getElementById('cr-msg').innerHTML=`<strong>パスフレーズ認証成功！</strong> 機密情報を表示します…`;
    document.getElementById('c-input').disabled=true;document.getElementById('c-submit').disabled=true;
    document.getElementById('cm-input-row').style.display='none';
    document.getElementById('c-continue-btn').style.display='none';
    spawnParticles(player.x,player.z,'#44ff88',20);
    showMessage(`✅ Phase1クリア！`,'#44ff88');
    // Show secret data + agent phase after delay
    setTimeout(()=>{
      document.getElementById('secret-title').textContent=s.secretTitle;
      document.getElementById('encoding-hint').textContent=s.encodingHint||'';
      document.getElementById('secret-data').textContent=s.secretData;
      document.getElementById('secret-instruction').textContent=s.secretInstruction||'';
      document.getElementById('secret-reveal').classList.add('show');
      // Show agent phase
      document.getElementById('agent-instruction').textContent=s.agentInstruction;
      document.getElementById('agent-phase').classList.add('show');
      document.getElementById('agent-input').value='';
      document.getElementById('agent-input').disabled=false;
      document.getElementById('agent-submit').disabled=false;
      document.getElementById('agent-result').style.display='none';
      document.getElementById('agent-input-row').style.display='flex';
      agentWrongCount=0;
      cipherPhase=2;
      // Restart timer for Phase 2 (10 min)
      startCipherTimer();
      // User clicks to focus agent input
    },700);
  }else{
    cipherWrongCount++;r.style.display='flex';r.className='wrong-res';
    document.getElementById('cr-icon').textContent='❌';
    const remain=3-cipherWrongCount;
    if(remain>0){
      document.getElementById('cr-msg').innerHTML=`不正解… (${cipherWrongCount}/3回) あと${remain}回で休憩`;
      document.getElementById('c-continue-btn').style.display='inline-block';
      document.getElementById('c-continue-btn').textContent='再挑戦 ▶';
      document.getElementById('c-continue-btn').onclick=()=>{
        r.style.display='none';document.getElementById('c-input').value='';startCipherTimer();document.getElementById('c-input').focus();
      };
    }else{
      // 3回不正解 → 強制休憩
      document.getElementById('cr-msg').innerHTML='3回不正解… 休憩してからもう一度挑戦しよう。';
      document.getElementById('c-continue-btn').style.display='inline-block';
      document.getElementById('c-continue-btn').textContent='閉じる';
      document.getElementById('c-continue-btn').onclick=()=>{
        closeCipherModal();cipherWrongCount=0;
        // Trigger death-like rest (but shorter - 2 min)
        gameState='dead';document.exitPointerLock();
        document.getElementById('overlay-title').textContent='☕ 休憩タイム';
        document.getElementById('overlay-title').style.color='#ffcc00';
        document.getElementById('overlay-btn').style.display='none';
        const endTime=Date.now()+120000; // 2 minutes
        const restInt=setInterval(()=>{
          const rem=Math.max(0,Math.ceil((endTime-Date.now())/1000));
          const m=Math.floor(rem/60),s=rem%60;
          document.getElementById('overlay-sub').innerHTML=
            `<span style="font-size:16px;color:#ffcc00;">暗号解読に3回失敗しました</span><br><br>`+
            `<span style="font-size:48px;font-family:'Cinzel Decorative',serif;color:#ffcc00;">${m}:${String(s).padStart(2,'0')}</span><br><br>`+
            `<span style="color:#aaa;font-size:14px;">少し休憩して、コードを見直しましょう！</span>`;
          if(rem<=0){
            clearInterval(restInt);
            totalPausedMs+=120000;
            document.getElementById('overlay-title').textContent='🔄 再挑戦！';
            document.getElementById('overlay-title').style.color='#44ff88';
            document.getElementById('overlay-sub').innerHTML='休憩完了！ ターミナルに近づいて再挑戦しよう。';
            document.getElementById('overlay-btn').style.display='inline-block';
            document.getElementById('overlay-btn').textContent='続行する';
            document.getElementById('overlay-btn').onclick=()=>{
              document.getElementById('overlay-screen').classList.remove('show');
              document.getElementById('overlay-btn').onclick=restartGame;
              gameState='playing';canvas.requestPointerLock();updateHUD();
            };
          }
        },1000);
        document.getElementById('overlay-screen').classList.add('show');
      };
    }
  }
}

async function submitAgentAnswer(){
  if(agentLockoutEnd>Date.now())return;
  const v=document.getElementById('agent-input').value.trim().toUpperCase();if(!v)return;
  const s=CIPHER_STAGES[currentCipherStage],h=await sha256(v);
  const r=document.getElementById('agent-result');
  if(h===s.ansHash){
    // Stop the timer immediately on success so a stale timeout can't fire
    // while the player reads the success message / clicks 次へ進む.
    stopCipherTimer();
    r.style.display='flex';r.className='correct-res';
    document.getElementById('ar-icon').textContent='✅';
    document.getElementById('ar-msg').innerHTML=`<strong>正解！</strong> 次のステージへ進みます…`;
    document.getElementById('agent-input').disabled=true;document.getElementById('agent-submit').disabled=true;
    document.getElementById('agent-input-row').style.display='none';
    cipherSolved=true;agentWrongCount=0;
    spawnParticles(player.x,player.z,'#44ff88',30);
    showMessage(`🔓 STAGE ${currentCipherStage+1} 完全クリア！`,'#44ff88');
  }else{
    agentWrongCount++;const remain=MAX_AGENT_WRONG-agentWrongCount;
    if(remain>0){
      r.style.display='flex';r.className='wrong-res';
      document.getElementById('ar-icon').textContent='❌';
      document.getElementById('ar-msg').innerHTML=`不正解… 残り${remain}回（3回間違えると5分間ロック）`;
      document.getElementById('agent-continue-btn').style.display='none';
    }else{
      r.style.display='none';startAgentLockout();
    }
  }
}

function startAgentLockout(){
  agentLockoutEnd=Date.now()+LOCKOUT_SEC*1000;
  document.getElementById('agent-input-row').style.display='none';
  document.getElementById('agent-lockout').classList.add('show');
  tickAgentLockout();
  if(agentLockoutTimer)clearInterval(agentLockoutTimer);
  agentLockoutTimer=setInterval(tickAgentLockout,1000);
}
function tickAgentLockout(){
  const rem=Math.max(0,Math.ceil((agentLockoutEnd-Date.now())/1000));
  const m=Math.floor(rem/60),s=rem%60;
  document.getElementById('lock-timer').textContent=`${m}:${String(s).padStart(2,'0')}`;
  if(rem<=0){
    clearInterval(agentLockoutTimer);agentLockoutTimer=null;agentLockoutEnd=0;agentWrongCount=0;
    document.getElementById('agent-lockout').classList.remove('show');
    document.getElementById('agent-input-row').style.display='flex';
    document.getElementById('agent-input').value='';document.getElementById('agent-input').disabled=false;
    document.getElementById('agent-submit').disabled=false;
    document.getElementById('agent-result').style.display='none';
  }
}

document.getElementById('agent-input').addEventListener('keydown',e=>{if(e.key==='Enter')submitAgentAnswer();});

function agentComplete(){
  stopCipherTimer();
  closeCipherModal();
  const b=document.createElement('div');b.className='stage-clear-banner';
  b.innerHTML=`<h2>\uD83D\uDD13 STAGE ${currentCipherStage+1} CLEAR!</h2><p>${CIPHER_STAGES[currentCipherStage].name} \u2014 \u5B8C\u5168\u89E3\u8AAD</p>`;
  document.body.appendChild(b);setTimeout(()=>b.remove(),3000);
  if(terminalMesh){scene.remove(terminalMesh);terminalMesh=null;}
  if(terminalLight){scene.remove(terminalLight);terminalLight=null;}
  if(terminalGlow){scene.remove(terminalGlow);terminalGlow=null;}
  // Stage 6 (Extra, floor 6+): spawn boss
  if(currentCipherStage>=5&&floor>=6){
    spawnBoss();playSound('battle');startBossBGM();return;
  }
  // Normal stages: open portal
  unlockPortal();playSound('clear');
  showMessage('\u8131\u51FA\u53E3\u304C\u958B\u653E\u3055\u308C\u305F\uFF01\u5149\u306E\u67F1\u3078\u5411\u304B\u3048\uFF01','#44ffaa');
}

function cipherTimeOut(){
  document.getElementById('c-input').disabled=true;document.getElementById('c-submit').disabled=true;
  // Capture the mission text and the user's code BEFORE closing the modal,
  // so we can show them on the review overlay (otherwise the player only sees a countdown).
  const _stage=CIPHER_STAGES[currentCipherStage]||{};
  const _missionText=(document.getElementById('cm-mission').textContent||_stage.mission||'').trim();
  const _hintText=(document.getElementById('cm-hint').textContent||_stage.hint||'').trim();
  let _userCode='';
  try{_userCode=(typeof getEditorCode==='function')?getEditorCode():'';}catch(e){_userCode='';}
  if(!_userCode&&_stage.template)_userCode=_stage.template;
  const _esc=(s)=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  closeCipherModal();
  // 3 minute review time
  gameState='dead';document.exitPointerLock();
  document.getElementById('overlay-title').textContent='⏰ 時間切れ';
  document.getElementById('overlay-title').style.color='#ffcc00';
  document.getElementById('overlay-btn').style.display='none';
  // Render static content (problem + code) once so the countdown tick
  // doesn't reset the code-block scroll position every second.
  document.getElementById('overlay-sub').innerHTML=
    `<span style="font-size:16px;color:#ffcc00;">暗号の制限時間を超えました</span><br><br>`+
    `<span id="cipher-rest-countdown" style="font-size:48px;font-family:'Cinzel Decorative',serif;color:#ffcc00;">3:00</span><br><br>`+
    `<span style="color:#aaa;font-size:14px;">📝 プログラムを見直す時間です！</span><br><br>`+
    `<div style="max-width:760px;margin:0 auto;text-align:left;letter-spacing:0;">`+
      `<div style="background:rgba(40,30,0,.6);border:1px solid #aa8800;border-radius:6px;padding:12px 16px;margin-bottom:12px;">`+
        `<div style="font-size:13px;color:#ffcc44;letter-spacing:2px;margin-bottom:6px;">📜 問題</div>`+
        `<div style="font-size:13px;color:#e8e0c0;line-height:1.6;white-space:pre-wrap;">${_esc(_missionText)}</div>`+
        (_hintText?`<div style="margin-top:8px;font-size:12px;color:#ffcc88;line-height:1.5;">💡 ${_esc(_hintText)}</div>`:'')+
      `</div>`+
      `<div style="background:rgba(0,20,30,.7);border:1px solid #4488aa;border-radius:6px;padding:12px 16px;">`+
        `<div style="font-size:13px;color:#88ccff;letter-spacing:2px;margin-bottom:6px;">💻 あなたのコード</div>`+
        `<pre style="font-family:'SF Mono','Menlo','Consolas',monospace;font-size:12px;color:#cce8ff;line-height:1.5;margin:0;white-space:pre-wrap;word-break:break-word;max-height:280px;overflow-y:auto;">${_esc(_userCode||'(コードなし)')}</pre>`+
      `</div>`+
    `</div>`;
  const endTime=Date.now()+180000;
  const revInt=setInterval(()=>{
    const rem=Math.max(0,Math.ceil((endTime-Date.now())/1000));
    const m=Math.floor(rem/60),s=rem%60;
    const cdEl=document.getElementById('cipher-rest-countdown');
    if(cdEl)cdEl.textContent=`${m}:${String(s).padStart(2,'0')}`;
    if(rem<=0){
      clearInterval(revInt);
      totalPausedMs+=180000;
      document.getElementById('overlay-title').textContent='🔄 再挑戦！';
      document.getElementById('overlay-title').style.color='#44ff88';
      document.getElementById('overlay-sub').innerHTML='見直し完了！ ターミナルに近づいて再挑戦しよう。';
      document.getElementById('overlay-btn').style.display='inline-block';
      document.getElementById('overlay-btn').textContent='続行する';
      document.getElementById('overlay-btn').onclick=()=>{
        document.getElementById('overlay-screen').classList.remove('show');
        document.getElementById('overlay-btn').onclick=restartGame;
        gameState='playing';canvas.requestPointerLock();updateHUD();
      };
    }
  },1000);
  document.getElementById('overlay-screen').classList.add('show');
}

function closeCipherModal(){
  // Always kill the timer on close — leaving it running can fire cipherTimeOut
  // after the puzzle was already solved, triggering a spurious 休憩 overlay.
  stopCipherTimer();
  cipherActive=false;cipherPhase=1;
  document.getElementById('cipher-modal').classList.remove('open');
  document.getElementById('code-editor-wrap').classList.remove('show');
  document.getElementById('code-output-wrap').classList.remove('show');
  document.getElementById('cm-data').style.display='';
  gameState='playing';
  battleCooldown=3; // 3s enemy cooldown after cipher
  setTimeout(function(){canvas.requestPointerLock();},350);
  unmuteBGM();
}
document.getElementById('c-input').addEventListener('keydown',e=>{if(e.key==='Enter')submitCipherAnswer();});

// ═══════════════════════════════════
//  THREE.JS 3D ENGINE
// ═══════════════════════════════════
