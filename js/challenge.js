// Coding Challenge Rooms + Code-Input Battle Questions

// ═══════════════════════════════════
//  CODING CHALLENGES (gold terminals)
// ═══════════════════════════════════
// Format: question shows a Python task + template code.
// Player writes Python in their editor, runs it, then types the OUTPUT here.
const CODE_CHALLENGES=[
  // Easy
  {diff:'easy',xp:30,
   q:'以下のコードを完成させて実行し、出力結果を入力せよ',
   code:'numbers = [3, 1, 4, 1, 5]\ntotal = _____ # ← numbers の合計を求める\nprint(total)',
   answer:'14',
   hint:'sum() 関数を使う'},
  {diff:'easy',xp:30,
   q:'以下のコードを完成させて実行し、出力結果を入力せよ',
   code:'text = "hello"\nresult = _____ # ← text を大文字に変換\nprint(result)',
   answer:'HELLO',
   hint:'.upper() メソッド'},
  {diff:'easy',xp:35,
   q:'以下のコードを完成させて実行し、出力結果を入力せよ',
   code:'nums = list(range(1, 6))\nprint(len(nums))',
   answer:'5',
   hint:'range(1,6) は [1,2,3,4,5]'},
  {diff:'easy',xp:30,
   q:'以下のコードを完成させて実行し、出力結果を入力せよ',
   code:'word = "Python"\nprint(word[0] + word[-1])',
   answer:'Pn',
   hint:'[0]は最初、[-1]は最後の文字'},
  // Normal
  {diff:'normal',xp:50,
   q:'以下のコードを完成させて実行し、出力結果を入力せよ',
   code:'data = [5, 2, 8, 1, 9]\nresult = sorted(data, reverse=True)\nprint(result[0])',
   answer:'9',
   hint:'降順ソートの最初の要素'},
  {diff:'normal',xp:50,
   q:'以下のコードを完成させて実行し、出力結果を入力せよ',
   code:'text = "banana"\ncount = text.count("a")\nprint(count)',
   answer:'3',
   hint:'.count() で出現回数'},
  {diff:'normal',xp:55,
   q:'以下のコードを完成させて実行し、出力結果を入力せよ',
   code:'d = {"x": 10, "y": 20, "z": 30}\nprint(sum(d.values()))',
   answer:'60',
   hint:'d.values() で値のリスト → sum()'},
  {diff:'normal',xp:50,
   q:'以下のコードの出力結果を入力せよ',
   code:'words = ["apple", "banana", "cherry"]\nresult = "-".join(words)\nprint(len(result))',
   answer:'20',
   hint:'"apple-banana-cherry" の文字数'},
  // Hard
  {diff:'hard',xp:80,
   q:'以下のコードを完成させて実行し、出力結果を入力せよ',
   code:'nums = [1, 2, 3, 4, 5]\nsquares = [x**2 for x in nums]\nprint(sum(squares))',
   answer:'55',
   hint:'1+4+9+16+25'},
  {diff:'hard',xp:80,
   q:'以下のコードを完成させて実行し、出力結果を入力せよ',
   code:'text = "Python"\nresult = ",".join(text)\nprint(result)',
   answer:'P,y,t,h,o,n',
   hint:'各文字をカンマで結合'},
  {diff:'hard',xp:90,
   q:'以下のコードを完成させて実行し、出力結果を入力せよ',
   code:'fizzbuzz = [x for x in range(1, 31) if x % 15 == 0]\nprint(len(fizzbuzz))',
   answer:'2',
   hint:'15と30の2つが15の倍数'},
  {diff:'hard',xp:85,
   q:'以下のコードを完成させて実行し、出力結果を入力せよ',
   code:'def factorial(n):\n    if n <= 1: return 1\n    return n * factorial(n-1)\nprint(factorial(6))',
   answer:'720',
   hint:'6! = 6*5*4*3*2*1'},
];

let challengeTerminals=[];
let challengeActive=false;

function spawnChallengeTerminal(rm){
  const cx=(rm.x+~~(rm.w/2))*TILE;
  const cz=(rm.y+~~(rm.h/2))*TILE;
  const tg=new THREE.Group();
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.4,.5,.15,6),
    new THREE.MeshStandardMaterial({color:0x8a7a20,emissive:0x443a00,emissiveIntensity:.5,metalness:.4}));
  base.position.y=.08;tg.add(base);
  const screen=new THREE.Mesh(new THREE.BoxGeometry(.6,.9,.08),
    new THREE.MeshStandardMaterial({color:0x1a1a00,emissive:0xffcc00,emissiveIntensity:1.5,transparent:true,opacity:.8}));
  screen.position.y=.65;tg.add(screen);
  const star=new THREE.Mesh(new THREE.OctahedronGeometry(.1,0),
    new THREE.MeshStandardMaterial({color:0xffdd00,emissive:0xffaa00,emissiveIntensity:3,transparent:true,opacity:.7}));
  star.position.y=1.2;tg.add(star);
  tg.position.set(cx,0,cz);scene.add(tg);
  challengeTerminals.push({mesh:tg,x:cx,z:cz,solved:false});
}

function checkChallengeTerminals(){
  if(challengeActive||cipherActive||battleActive)return;
  for(const ct of challengeTerminals){
    if(ct.solved)continue;
    const dx=ct.x-player.x,dz=ct.z-player.z;
    if(Math.sqrt(dx*dx+dz*dz)<2.0){
      openCodingChallenge(ct);
      return;
    }
  }
}

function openCodingChallenge(ct){
  if(gameState!=='playing')return;
  challengeActive=true;
  gameState='cipher';document.exitPointerLock();muteBGM();

  // Pick challenge based on floor
  let pool;
  if(floor<=2)pool=CODE_CHALLENGES.filter(c=>c.diff==='easy');
  else if(floor<=4)pool=CODE_CHALLENGES.filter(c=>c.diff!=='hard');
  else pool=[...CODE_CHALLENGES];
  const ch=pool[~~(Math.random()*pool.length)];

  const modal=document.getElementById('cipher-modal');
  document.getElementById('cm-avatar').textContent='⭐';
  document.getElementById('cm-name').textContent='コーディングチャレンジ';
  document.getElementById('cm-stage-sub').textContent=`オプション課題（${ch.diff.toUpperCase()}）— 正解で XP +${ch.xp}`;
  document.getElementById('cm-mission').textContent=ch.q;
  document.getElementById('cm-data').textContent=ch.code;
  document.getElementById('cm-hint').textContent=`ヒント: ${ch.hint}\n\n📝 上のコードをPythonエディタにコピーして実行し、\n出力された結果をそのまま下の入力欄に入力してください。`;
  document.getElementById('cm-footer').textContent=`⭐ XP +${ch.xp} | 💡 スキップしてもペナルティなし`;

  document.getElementById('c-input').value='';
  document.getElementById('c-input').disabled=false;
  document.getElementById('c-input').placeholder='Pythonの実行結果を入力…';
  document.getElementById('c-submit').disabled=false;
  document.getElementById('c-result').style.display='none';
  document.getElementById('cm-input-row').style.display='flex';
  document.getElementById('secret-reveal').classList.remove('show');
  document.getElementById('agent-phase').classList.remove('show');

  // Timer (90s)
  clearInterval(cipherTimerInt);cipherTimerVal=90;
  const el=document.getElementById('cipher-timer');el.classList.remove('danger');
  const fmtT=(s)=>{const m=Math.floor(s/60);return m>0?`${m}:${String(s%60).padStart(2,'0')}`:String(s);};
  el.textContent=fmtT(cipherTimerVal);
  cipherTimerInt=setInterval(()=>{cipherTimerVal--;el.textContent=fmtT(cipherTimerVal);
    if(cipherTimerVal<=15)el.classList.add('danger');
    if(cipherTimerVal<=0){clearInterval(cipherTimerInt);closeChallengeModal();showMessage('⏰ 時間切れ','#ff8844');}
  },1000);

  modal.classList.add('open');

  // Submit handler
  const submitHandler=()=>{
    const val=document.getElementById('c-input').value.trim();
    if(!val)return;
    clearInterval(cipherTimerInt);
    const r=document.getElementById('c-result');
    if(val===ch.answer||val.toUpperCase()===ch.answer.toUpperCase()){
      r.style.display='flex';r.className='correct-res';
      document.getElementById('cr-icon').textContent='⭐';
      document.getElementById('cr-msg').innerHTML=`<strong>正解！ XP +${ch.xp}</strong>`;
      player.xp+=ch.xp;checkLevelUp();updateHUD();
      ct.solved=true;scene.remove(ct.mesh);
      playSound('correct');spawnParticles(player.x,player.z,'#ffdd44',20);
      document.getElementById('c-input').disabled=true;document.getElementById('c-submit').disabled=true;
      showCloseBtn();
    }else{
      r.style.display='flex';r.className='wrong-res';
      document.getElementById('cr-icon').textContent='❌';
      document.getElementById('cr-msg').innerHTML=`不正解（入力: "${val}"）<br>もう一度Pythonで実行して確認しよう`;
      playSound('wrong');
      document.getElementById('c-continue-btn').style.display='inline-block';
      document.getElementById('c-continue-btn').textContent='再挑戦';
      document.getElementById('c-continue-btn').onclick=()=>{
        r.style.display='none';document.getElementById('c-input').value='';
        cipherTimerVal=90;el.textContent=fmtT(90);el.classList.remove('danger');
        cipherTimerInt=setInterval(()=>{cipherTimerVal--;el.textContent=fmtT(cipherTimerVal);
          if(cipherTimerVal<=15)el.classList.add('danger');
          if(cipherTimerVal<=0){clearInterval(cipherTimerInt);closeChallengeModal();showMessage('⏰ 時間切れ','#ff8844');}
        },1000);
        document.getElementById('c-input').focus();
      };
    }
  };

  function showCloseBtn(){
    document.getElementById('c-continue-btn').style.display='inline-block';
    document.getElementById('c-continue-btn').textContent='閉じる';
    document.getElementById('c-continue-btn').onclick=()=>closeChallengeModal();
  }

  document.getElementById('c-submit').onclick=submitHandler;
  document.getElementById('c-input').onkeydown=(e)=>{if(e.key==='Enter')submitHandler();};

  // Show skip/close button in footer area
  document.getElementById('c-continue-btn').style.display='inline-block';
  document.getElementById('c-continue-btn').textContent='スキップ（ペナルティなし）';
  document.getElementById('c-continue-btn').onclick=()=>closeChallengeModal();

  setTimeout(()=>document.getElementById('c-input').focus(),100);
}

function closeChallengeModal(){
  clearInterval(cipherTimerInt);
  challengeActive=false;
  document.getElementById('cipher-modal').classList.remove('open');
  document.getElementById('c-submit').onclick=null;
  document.getElementById('c-input').onkeydown=null;
  gameState='playing';unmuteBGM();
  setTimeout(()=>canvas.requestPointerLock(),350);
}

// ═══════════════════════════════════
//  CODE-INPUT BATTLE QUESTIONS
// ═══════════════════════════════════
// These mix into normal battle. Player writes Python, runs it, types result.
const CODE_BATTLE_QS=[
  {cat:'コード実行',diff:'normal',type:'code',
   q:'以下を実行した結果は？（数値で答えよ）',
   code:'print(len("Hello World"))',
   ans:'11',expl:'スペース含めて11文字',hint:'スペースも1文字'},
  {cat:'コード実行',diff:'normal',type:'code',
   q:'以下を実行した結果は？（数値で答えよ）',
   code:'nums = [1, 2, 3, 4, 5]\nprint(sum(nums))',
   ans:'15',expl:'1+2+3+4+5 = 15',hint:'sum() で合計'},
  {cat:'コード実行',diff:'normal',type:'code',
   q:'以下を実行した結果は？',
   code:'text = "abcdef"\nprint(text[2:5])',
   ans:'cde',expl:'インデックス2から4 → cde',hint:'スライス [2:5]'},
  {cat:'コード実行',diff:'hard',type:'code',
   q:'以下を実行した結果は？（数値で答えよ）',
   code:'result = [x for x in range(1, 21) if x % 3 == 0]\nprint(len(result))',
   ans:'6',expl:'3,6,9,12,15,18 の6個',hint:'3の倍数の個数'},
  {cat:'コード実行',diff:'hard',type:'code',
   q:'以下を実行した結果は？',
   code:'d = {"a": 1, "b": 2, "c": 3}\nkeys = sorted(d.keys(), reverse=True)\nprint("".join(keys))',
   ans:'cba',expl:'逆順ソート → c,b,a → 結合',hint:'キーの逆順'},
  {cat:'コード実行',diff:'hard',type:'code',
   q:'以下を実行した結果は？（数値で答えよ）',
   code:'def f(n):\n    return n * 2 + 1\nprint(f(f(3)))',
   ans:'15',expl:'f(3)=7, f(7)=15',hint:'関数の二重適用'},
];
