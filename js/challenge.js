// Coding Challenge Rooms + Code-Input Battle Questions

// ═══════════════════════════════════
//  SIMPLE PYTHON INTERPRETER (subset)
// ═══════════════════════════════════
// Evaluates a tiny subset of Python: print(), basic math, strings, lists, dicts
function miniPyEval(code){
  let output=[];
  try{
    // Convert common Python to JS
    let js=code
      .replace(/print\((.+)\)/g,'__out.push(String($1))')
      .replace(/\bTrue\b/g,'true').replace(/\bFalse\b/g,'false').replace(/\bNone\b/g,'null')
      .replace(/\blen\((.+?)\)/g,'($1).length')
      .replace(/\bstr\((.+?)\)/g,'String($1)')
      .replace(/\bint\((.+?)\)/g,'parseInt($1)')
      .replace(/\bfloat\((.+?)\)/g,'parseFloat($1)')
      .replace(/\babs\((.+?)\)/g,'Math.abs($1)')
      .replace(/\bmax\((.+?)\)/g,'Math.max($1)')
      .replace(/\bmin\((.+?)\)/g,'Math.min($1)')
      .replace(/\bsum\((.+?)\)/g,'($1).reduce((a,b)=>a+b,0)')
      .replace(/\bsorted\((.+?),\s*reverse\s*=\s*true\)/gi,'[...$1].sort((a,b)=>b-a)')
      .replace(/\bsorted\((.+?)\)/g,'[...$1].sort((a,b)=>a>b?1:a<b?-1:0)')
      .replace(/\brange\((\d+),\s*(\d+)\)/g,'Array.from({length:$2-$1},(_,i)=>i+$1)')
      .replace(/\brange\((\d+)\)/g,'Array.from({length:$1},(_,i)=>i)')
      .replace(/\.upper\(\)/g,'.toUpperCase()')
      .replace(/\.lower\(\)/g,'.toLowerCase()')
      .replace(/\.count\((.+?)\)/g,'.split($1).length-1')
      .replace(/\.replace\((.+?),\s*(.+?)\)/g,'.replaceAll($1,$2)')
      .replace(/\.split\((.+?)\)/g,'.split($1)')
      .replace(/\.join\((.+?)\)/g,'($1).join(this)')
      .replace(/"([^"]*)"\.join/g,'((s)=>(x)=>x.join(s))("$1")')
      .replace(/'([^']*)'\.join/g,"((s)=>(x)=>x.join(s))('$1')")
      .replace(/\.items\(\)/g,'.entries ? Object.entries($0_dict) : []') // partial
      .replace(/\.values\(\)/g,'.values ? Object.values($0_dict) : []') // partial
      .replace(/\.keys\(\)/g,'.keys ? Object.keys($0_dict) : []') // partial
      // dict.values/keys/items
      .replace(/(\w+)\.values\(\)/g,'Object.values($1)')
      .replace(/(\w+)\.keys\(\)/g,'Object.keys($1)')
      .replace(/(\w+)\.items\(\)/g,'Object.entries($1)')
      // ** power
      .replace(/(\d+)\s*\*\*\s*(\d+)/g,'Math.pow($1,$2)')
      // // integer division
      .replace(/(\w+)\s*\/\/\s*(\w+)/g,'Math.floor($1/$2)')
      // list comprehension: [expr for x in iter]
      .replace(/\[(.+?)\s+for\s+(\w+)\s+in\s+(.+?)\s+if\s+(.+?)\]/g,'($3).filter($2=>$4).map($2=>$1)')
      .replace(/\[(.+?)\s+for\s+(\w+)\s+in\s+(.+?)\]/g,'($3).map($2=>$1)')
      // Python join: ",".join(list) → list.join(",")
      ;
    // Fix join pattern: "x".join(y) → y.join("x")
    js=js.replace(/"([^"]*)"\s*\.\s*join\s*\(\s*(\w+)\s*\)/g,'$2.join("$1")');
    js=js.replace(/'([^']*)'\s*\.\s*join\s*\(\s*(\w+)\s*\)/g,"$2.join('$1')");
    // Handle def/return with simple single-line functions
    js=js.replace(/def\s+(\w+)\s*\(([^)]*)\)\s*:/g,'function $1($2){');
    js=js.replace(/^\s*return\s+/gm,'return ');
    // Add closing braces for functions (very rough)
    const lines=js.split('\n');
    let result=[];let inFunc=false;
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      if(line.match(/^function\s/)){
        if(inFunc)result.push('}');
        inFunc=true;result.push(line);
      }else if(inFunc&&line.match(/^\S/)&&!line.match(/^return/)){
        result.push('}');inFunc=false;result.push(line);
      }else{result.push(line);}
    }
    if(inFunc)result.push('}');
    js=result.join('\n');

    const __out=[];
    const fn=new Function('__out',js);
    fn(__out);
    output=__out;
  }catch(e){
    output=['Error: '+e.message];
  }
  return output.join('\n');
}

// ═══════════════════════════════════
//  CODING CHALLENGES (gold terminals)
// ═══════════════════════════════════
const CODE_CHALLENGES=[
  {diff:'easy',xp:30,answer:'14',
   q:'リスト [3,1,4,1,5] の合計を print で出力せよ',
   template:'numbers = [3, 1, 4, 1, 5]\ntotal = sum(numbers)\nprint(total)',
   hint:'sum() 関数を使う'},
  {diff:'easy',xp:30,answer:'HELLO',
   q:'文字列 "hello" を大文字にして print で出力せよ',
   template:'text = "hello"\nresult = text.upper()\nprint(result)',
   hint:'.upper() メソッド'},
  {diff:'easy',xp:35,answer:'5',
   q:'リスト [1,2,3,4,5] の要素数を print で出力せよ',
   template:'nums = [1, 2, 3, 4, 5]\nprint(len(nums))',
   hint:'len() 関数'},
  {diff:'easy',xp:30,answer:'Pn',
   q:'以下のコードの出力結果は？ 実行して確認せよ',
   template:'word = "Python"\nprint(word[0] + word[-1])',
   hint:'[0]は最初、[-1]は最後'},
  {diff:'normal',xp:50,answer:'9',
   q:'リストを降順ソートし、最大値を print で出力せよ',
   template:'data = [5, 2, 8, 1, 9]\nresult = sorted(data, reverse=True)\nprint(result[0])',
   hint:'sorted() + reverse=True'},
  {diff:'normal',xp:50,answer:'3',
   q:'"banana" に "a" が何回含まれるか print で出力せよ',
   template:'text = "banana"\nprint(text.count("a"))',
   hint:'.count() メソッド'},
  {diff:'normal',xp:55,answer:'60',
   q:'辞書の値の合計を print で出力せよ',
   template:'d = {"x": 10, "y": 20, "z": 30}\nprint(sum(d.values()))',
   hint:'d.values() + sum()'},
  {diff:'normal',xp:50,answer:'20',
   q:'以下のコードの出力結果は？ 実行して確認せよ',
   template:'words = ["apple", "banana", "cherry"]\nresult = "-".join(words)\nprint(len(result))',
   hint:'"apple-banana-cherry" の文字数'},
  {diff:'hard',xp:80,answer:'55',
   q:'リスト内包表記で二乗のリストを作り、合計を出力せよ',
   template:'nums = [1, 2, 3, 4, 5]\nsquares = [x**2 for x in nums]\nprint(sum(squares))',
   hint:'1+4+9+16+25'},
  {diff:'hard',xp:80,answer:'P,y,t,h,o,n',
   q:'文字列の各文字をカンマで結合して出力せよ',
   template:'text = "Python"\nresult = ",".join(text)\nprint(result)',
   hint:'join() メソッド'},
  {diff:'hard',xp:90,answer:'2',
   q:'FizzBuzz: 1-30で15の倍数はいくつ？ 個数を出力せよ',
   template:'fizz = [x for x in range(1, 31) if x % 15 == 0]\nprint(len(fizz))',
   hint:'15と30の2つ'},
  {diff:'hard',xp:85,answer:'720',
   q:'階乗関数を定義し、6! を出力せよ',
   template:'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\nprint(factorial(6))',
   hint:'6! = 6*5*4*3*2*1'},
];

let challengeTerminals=[];
let challengeActive=false;
let currentChallenge=null;

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
      openCodingChallenge(ct);return;
    }
  }
}

function openCodingChallenge(ct){
  if(gameState!=='playing')return;
  challengeActive=true;
  gameState='cipher';document.exitPointerLock();muteBGM();

  let pool;
  if(floor<=2)pool=CODE_CHALLENGES.filter(c=>c.diff==='easy');
  else if(floor<=4)pool=CODE_CHALLENGES.filter(c=>c.diff!=='hard');
  else pool=[...CODE_CHALLENGES];
  const ch=pool[~~(Math.random()*pool.length)];
  currentChallenge={ch,ct};

  const modal=document.getElementById('cipher-modal');
  document.getElementById('cm-avatar').textContent='⭐';
  document.getElementById('cm-name').textContent='コーディングチャレンジ';
  document.getElementById('cm-stage-sub').textContent=`${ch.diff.toUpperCase()} — XP +${ch.xp}`;
  document.getElementById('cm-mission').textContent=ch.q;
  document.getElementById('cm-data').style.display='none';
  document.getElementById('cm-hint').textContent=`ヒント: ${ch.hint}`;
  document.getElementById('cm-footer').textContent=`⭐ XP +${ch.xp}`;

  // Show editor with template
  const editorWrap=document.getElementById('code-editor-wrap');
  editorWrap.classList.add('show');
  const editor=document.getElementById('code-editor');
  editor.value=ch.template;
  editor.disabled=false;
  document.getElementById('code-output-wrap').classList.remove('show');

  // Answer input
  document.getElementById('c-input').value='';
  document.getElementById('c-input').disabled=false;
  document.getElementById('c-input').placeholder='実行結果を入力して「解読」を押す';
  document.getElementById('c-submit').disabled=false;
  document.getElementById('c-result').style.display='none';
  document.getElementById('cm-input-row').style.display='flex';
  document.getElementById('c-continue-btn').style.display='none';
  document.getElementById('secret-reveal').classList.remove('show');
  document.getElementById('agent-phase').classList.remove('show');

  // Close button
  document.getElementById('cipher-close-btn').style.display='inline-block';

  // Run button
  document.getElementById('code-run-btn').onclick=()=>{
    const code=editor.value;
    const result=miniPyEval(code);
    document.getElementById('code-output-wrap').classList.add('show');
    document.getElementById('code-output').textContent=result||'(出力なし)';
  };

  // Timer (120s)
  clearInterval(cipherTimerInt);cipherTimerVal=120;
  const el=document.getElementById('cipher-timer');el.classList.remove('danger');
  const fmtT=(s)=>{const m=Math.floor(s/60);return m>0?`${m}:${String(s%60).padStart(2,'0')}`:String(s);};
  el.textContent=fmtT(cipherTimerVal);
  cipherTimerInt=setInterval(()=>{cipherTimerVal--;el.textContent=fmtT(cipherTimerVal);
    if(cipherTimerVal<=15)el.classList.add('danger');
    if(cipherTimerVal<=0){clearInterval(cipherTimerInt);closeChallengeModal();showMessage('⏰ 時間切れ','#ff8844');}
  },1000);

  // Submit handler
  document.getElementById('c-submit').onclick=submitChallengeAnswer;
  document.getElementById('c-input').onkeydown=(e)=>{if(e.key==='Enter')submitChallengeAnswer();};

  modal.classList.add('open');
  setTimeout(()=>editor.focus(),100);
}

function submitChallengeAnswer(){
  if(!currentChallenge)return;
  const{ch,ct}=currentChallenge;
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
    document.getElementById('code-editor').disabled=true;
  }else{
    r.style.display='flex';r.className='wrong-res';
    document.getElementById('cr-icon').textContent='❌';
    document.getElementById('cr-msg').textContent=`不正解（入力: "${val}"）— 実行ボタンで結果を確認しよう`;
    playSound('wrong');
    // Restart timer
    cipherTimerVal=120;
    const el=document.getElementById('cipher-timer');el.classList.remove('danger');
    const fmtT=(s)=>{const m=Math.floor(s/60);return m>0?`${m}:${String(s%60).padStart(2,'0')}`:String(s);};
    el.textContent=fmtT(cipherTimerVal);
    cipherTimerInt=setInterval(()=>{cipherTimerVal--;el.textContent=fmtT(cipherTimerVal);
      if(cipherTimerVal<=15)el.classList.add('danger');
      if(cipherTimerVal<=0){clearInterval(cipherTimerInt);closeChallengeModal();showMessage('⏰ 時間切れ','#ff8844');}
    },1000);
  }
}

function closeChallengeModal(){
  clearInterval(cipherTimerInt);
  challengeActive=false;currentChallenge=null;
  document.getElementById('cipher-modal').classList.remove('open');
  document.getElementById('code-editor-wrap').classList.remove('show');
  document.getElementById('code-output-wrap').classList.remove('show');
  document.getElementById('cm-data').style.display='';
  document.getElementById('cipher-close-btn').style.display='none';
  document.getElementById('c-submit').onclick=null;
  document.getElementById('c-input').onkeydown=null;
  gameState='playing';unmuteBGM();
  setTimeout(()=>canvas.requestPointerLock(),350);
}

// ═══════════════════════════════════
//  CODE-INPUT BATTLE QUESTIONS
// ═══════════════════════════════════
const CODE_BATTLE_QS=[
  {cat:'コード実行',diff:'normal',type:'code',
   q:'以下を実行した結果は？',code:'print(len("Hello World"))',
   ans:'11',expl:'スペース含めて11文字',hint:'スペースも1文字'},
  {cat:'コード実行',diff:'normal',type:'code',
   q:'以下を実行した結果は？',code:'nums = [1, 2, 3, 4, 5]\nprint(sum(nums))',
   ans:'15',expl:'1+2+3+4+5 = 15',hint:'sum() で合計'},
  {cat:'コード実行',diff:'normal',type:'code',
   q:'以下を実行した結果は？',code:'text = "abcdef"\nprint(text[2:5])',
   ans:'cde',expl:'インデックス2から4 → cde',hint:'スライス [2:5]'},
  {cat:'コード実行',diff:'hard',type:'code',
   q:'以下を実行した結果は？（数値で）',code:'result = [x for x in range(1, 21) if x % 3 == 0]\nprint(len(result))',
   ans:'6',expl:'3,6,9,12,15,18 の6個',hint:'3の倍数の個数'},
  {cat:'コード実行',diff:'hard',type:'code',
   q:'以下を実行した結果は？',code:'d = {"a":1,"b":2,"c":3}\nkeys = sorted(d.keys(), reverse=True)\nprint("".join(keys))',
   ans:'cba',expl:'逆順ソート → c,b,a → 結合',hint:'キーの逆順'},
  {cat:'コード実行',diff:'hard',type:'code',
   q:'以下を実行した結果は？（数値で）',code:'def f(n):\n    return n * 2 + 1\nprint(f(f(3)))',
   ans:'15',expl:'f(3)=7, f(7)=15',hint:'関数の二重適用'},
];
