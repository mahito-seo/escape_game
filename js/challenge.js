// Coding Challenge Rooms + Code-Input Battle Questions

// ═══════════════════════════════════
//  SIMPLE PYTHON INTERPRETER (subset)
// ═══════════════════════════════════
// Evaluates a tiny subset of Python: print(), basic math, strings, lists, dicts
function miniPyEval(code){
  let output=[];
  try{
    // ── Pre-process: fix common input errors ──
    // Full-width characters → half-width
    code=code.replace(/\uff08/g,'(').replace(/\uff09/g,')').replace(/\uff0b/g,'+').replace(/\uff0d/g,'-').replace(/\uff0a/g,'*').replace(/\uff0f/g,'/').replace(/\uff1a/g,':').replace(/\uff1d/g,'=').replace(/\uff0c/g,',').replace(/\u3000/g,' ').replace(/\u201c/g,'"').replace(/\u201d/g,'"').replace(/\u2018/g,"'").replace(/\u2019/g,"'").replace(/\uff3b/g,'[').replace(/\uff3d/g,']').replace(/\uff5b/g,'{').replace(/\uff5d/g,'}');
    // Tab → 4 spaces
    code=code.replace(/\t/g,'    ');
    // Strip trailing whitespace per line
    code=code.split('\n').map(l=>l.trimEnd()).join('\n');
    // Strip Python comments first (# ...)
    let js=code.split('\n').map(line=>{
      // Remove # comments (skip if inside string)
      var inQ=false,qc='';
      for(var ci=0;ci<line.length;ci++){
        var ch=line[ci];
        if(inQ){if(ch===qc&&line[ci-1]!=='\\')inQ=false;}
        else if(ch==='"'||ch==="'"){inQ=true;qc=ch;}
        else if(ch==='#')return line.substring(0,ci);
      }
      return line;
    }).join('\n');
    // Convert common Python to JS
    js=js
      .replace(/\bTrue\b/g,'true').replace(/\bFalse\b/g,'false').replace(/\bNone\b/g,'null').replace(/^\s*pass\s*$/gm,'')
      .replace(/\band\b/g,'&&').replace(/\bor\b/g,'||').replace(/\bnot\s+/g,'!')
      .replace(/\blen\((.+?)\)/g,'($1).length')
      .replace(/\bstr\((.+?)\)/g,'String($1)')
      .replace(/\bint\((.+?)\)/g,'parseInt($1)')
      .replace(/\bfloat\((.+?)\)/g,'parseFloat($1)')
      .replace(/\bchr\((.+?)\)/g,'String.fromCharCode($1)')
      .replace(/\bord\((.+?)\)/g,'($1).charCodeAt(0)')
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
      .replace(/\.sort\(\)/g,'.sort((a,b)=>a>b?1:a<b?-1:0)')
      .replace(/\.replace\((.+?),\s*(.+?)\)/g,'.split($1).join($2)')
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
      // [::-1] reverse for strings/arrays
      .replace(/(\w+)\[::\s*-1\]/g,'(typeof $1==="string"?$1.split("").reverse().join(""):$1.slice().reverse())')
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
    // Convert print() — match balanced parens per line
    js=js.split('\n').map(function(ln){
      var m=ln.match(/^(\s*)print\((.+)\)\s*$/);
      if(m){
        var indent=m[1],arg=m[2];
        return indent+'__out.push((function(v){return Array.isArray(v)?JSON.stringify(v).replace(/,/g,", "):typeof v==="number"&&v!==~~v?String(v):String(v);})('+arg+'))';
      }
      return ln;
    }).join('\n');
    // for x in range(a,b): → special handling (convert range inline)
    js=js.replace(/^(\s*)for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\)\s*:/gm,
      '$1for(let $2=$3;$2<$4;$2++){');
    js=js.replace(/^(\s*)for\s+(\w+)\s+in\s+range\((\d+)\)\s*:/gm,
      '$1for(let $2=0;$2<$3;$2++){');
    // for x in variable: → for(const x of ...)
    js=js.replace(/^(\s*)for\s+(\w+)\s+in\s+(\w+)\s*:/gm,'$1for(const $2 of (Array.isArray($3)?$3:Object.keys($3))){');
    js=js.replace(/^(\s*)for\s+(\w+)\s+in\s+(.+?)\s*:/gm,'$1for(const $2 of $3){');
    // if condition: → if(condition){
    js=js.replace(/^(\s*)if\s+(.+?)\s*:/gm,'$1if($2){');
    // elif → }else if
    js=js.replace(/^(\s*)elif\s+(.+?)\s*:/gm,'$1}else if($2){');
    // else: → }else{
    js=js.replace(/^(\s*)else\s*:/gm,'$1}else{');
    // Handle def/return
    js=js.replace(/def\s+(\w+)\s*\(([^)]*)\)\s*:/g,'function $1($2){');
    js=js.replace(/^(\s*)return\s+/gm,'$1return ');
    // += for strings (Python: result += x, JS same but need no change)
    // Handle indentation-based blocks → add closing braces
    const lines=js.split('\n');
    let result=[];
    let blockStack=[]; // track indent levels that opened blocks
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      const trimmed=line.trimStart();
      const indent=line.length-trimmed.length;
      // Close blocks when indent decreases
      while(blockStack.length>0&&indent<=blockStack[blockStack.length-1]&&trimmed.length>0){
        blockStack.pop();
        result.push(' '.repeat(indent)+'}');
      }
      // Track block openers
      if(trimmed.match(/^(for|if|else|function|def)\b/)&&line.includes('{')){
        blockStack.push(indent);
      }
      result.push(line);
    }
    // Close remaining blocks
    while(blockStack.length>0){blockStack.pop();result.push('}');}
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
  // Easy: _____ を埋める
  {diff:'easy',xp:60,answer:'14',
   q:'_____ を埋めてリストの合計を出力せよ',
   template:'numbers = [3, 1, 4, 1, 5]\ntotal = _____  # ← numbers の合計を求める関数は？\nprint(total)',
   hint:'sum() 関数を使う'},
  {diff:'easy',xp:60,answer:'HELLO',
   q:'_____ を埋めて文字列を大文字にして出力せよ',
   template:'text = "hello"\nresult = _____  # ← text を大文字にするには？\nprint(result)',
   hint:'.upper() メソッド'},
  {diff:'easy',xp:70,answer:'5',
   q:'_____ を埋めてリストの要素数を出力せよ',
   template:'nums = [1, 2, 3, 4, 5]\ncount = _____  # ← nums の要素数を返す関数は？\nprint(count)',
   hint:'len() 関数'},
  {diff:'easy',xp:60,answer:'Pn',
   q:'_____ を埋めて最初と最後の文字を結合して出力せよ',
   template:'word = "Python"\nfirst = _____  # ← 最初の文字を取り出すには？\nlast = _____   # ← 最後の文字を取り出すには？\nprint(first + last)',
   hint:'[0]は最初、[-1]は最後の文字'},
  // Normal: もう少し考える必要あり
  {diff:'normal',xp:100,answer:'9',
   q:'_____ を埋めてリストを降順ソートし、最大値を出力せよ',
   template:'data = [5, 2, 8, 1, 9]\nresult = sorted(data, _____)  # ← 降順にするオプションは？\nprint(result[0])',
   hint:'reverse=True'},
  {diff:'normal',xp:100,answer:'3',
   q:'_____ を埋めて "a" の出現回数を出力せよ',
   template:'text = "banana"\ncount = text._____  # ← 特定の文字の出現回数を数えるメソッドは？\nprint(count)',
   hint:'.count("a")'},
  {diff:'normal',xp:110,answer:'60',
   q:'_____ を埋めて辞書の値の合計を出力せよ',
   template:'d = {"x": 10, "y": 20, "z": 30}\nvalues = _____  # ← 辞書の値の一覧を取得するには？\nprint(sum(values))',
   hint:'d.values()'},
  {diff:'normal',xp:100,answer:'apple-banana-cherry',
   q:'_____ を埋めてリストの要素をハイフンで結合して出力せよ',
   template:'words = ["apple", "banana", "cherry"]\nresult = _____  # ← "-" で結合するには？\nprint(result)',
   hint:'"-".join(リスト)'},
  // Hard: 複数箇所を埋める / ロジックを書く
  {diff:'hard',xp:150,answer:'55',
   q:'_____ を埋めて各要素の二乗の合計を出力せよ',
   template:'nums = [1, 2, 3, 4, 5]\nsquares = [_____ for x in nums]  # ← x の二乗は？\nprint(sum(squares))',
   hint:'x**2'},
  {diff:'hard',xp:150,answer:'P,y,t,h,o,n',
   q:'_____ を埋めて文字列の各文字をカンマで結合して出力せよ',
   template:'text = "Python"\nresult = _____.join(_____)  # ← 区切り文字.join(対象)\nprint(result)',
   hint:'",".join(text)'},
  {diff:'hard',xp:170,answer:'2',
   q:'_____ を埋めて1〜30で15の倍数の個数を出力せよ',
   template:'fizz = [x for x in range(1, 31) if _____]  # ← 15の倍数の条件は？\nprint(len(fizz))',
   hint:'x % 15 == 0'},
  {diff:'hard',xp:160,answer:'720',
   q:'_____ を埋めて階乗関数を完成させ、6! を出力せよ',
   template:'def factorial(n):\n    if n <= 1:\n        return 1\n    return _____  # ← n と factorial を使った再帰は？\nprint(factorial(6))',
   hint:'n * factorial(n - 1)'},
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
  // Guard pillars flanking the terminal
  const pilMat=new THREE.MeshStandardMaterial({color:0x6a5a20,emissive:0x332a00,emissiveIntensity:.3,roughness:.6,metalness:.3});
  for(let side=-1;side<=1;side+=2){
    const px=cx+side*1.2,pz=cz;
    const p=new THREE.Mesh(new THREE.BoxGeometry(.18,TILE*1.2,.18),pilMat);
    p.position.set(px,TILE*.6,pz);scene.add(p);
    const orb=new THREE.Mesh(new THREE.SphereGeometry(.08,6,6),new THREE.MeshStandardMaterial({color:0xffcc00,emissive:0xffaa00,emissiveIntensity:3,transparent:true,opacity:.6}));
    orb.position.set(px,TILE*1.15,pz);scene.add(orb);
    decoBlocks.push({x:px,z:pz,r:.25});
  }
}

function checkChallengeTerminals(){
  if(challengeActive||cipherActive||battleActive)return;
  if(Date.now()<challengeCooldownEnd)return; // cooldown after closing
  for(var ci=0;ci<challengeTerminals.length;ci++){
    var ct=challengeTerminals[ci];
    if(ct.solved)continue;
    var dx=ct.x-player.x,dz=ct.z-player.z;
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
  document.getElementById('cm-mission').textContent=ch.q+'\n\n穴埋めを完成させて「▶ 実行」を押せ！\n正しい結果が出力されれば自動クリア！';
  document.getElementById('cm-data').style.display='none';
  document.getElementById('cm-hint').textContent=`ヒント: ${ch.hint}`;
  document.getElementById('cm-footer').textContent=`⭐ XP +${ch.xp}`;

  // Show editor with template
  document.getElementById('code-editor-wrap').classList.add('show');
  initAceEditor();setEditorCode(ch.template);setEditorReadOnly(false);
  document.getElementById('code-output-wrap').classList.remove('show');

  // Hide answer input row (auto-check on run)
  document.getElementById('cm-input-row').style.display='none';
  document.getElementById('c-result').style.display='none';
  document.getElementById('c-continue-btn').style.display='none';
  document.getElementById('secret-reveal').classList.remove('show');
  document.getElementById('agent-phase').classList.remove('show');
  document.getElementById('cipher-close-btn').style.display='inline-block';

  // Run button: execute + auto-check answer
  document.getElementById('code-run-btn').onclick=()=>{
    try{
      const code=getEditorCode();
      const result=miniPyEval(code);
      document.getElementById('code-output-wrap').classList.add('show');
      document.getElementById('code-output').textContent=result||'(出力なし)';
      // Auto-check: if output matches answer → success!
      const trimResult=result.trim();
      if(trimResult===ch.answer||trimResult.toUpperCase()===ch.answer.toUpperCase()){
        document.getElementById('code-output').style.color='#44ff88';
        clearInterval(cipherTimerInt);
        const r=document.getElementById('c-result');
        r.style.display='flex';r.className='correct-res';
        document.getElementById('cr-icon').textContent='⭐';
        document.getElementById('cr-msg').innerHTML=`<strong>正解！ XP +${ch.xp}</strong>`;
        player.xp+=ch.xp;checkLevelUp();updateHUD();
        ct.solved=true;scene.remove(ct.mesh);
        playSound('correct');spawnParticles(player.x,player.z,'#ffdd44',20);
        setEditorReadOnly(true);
        // Auto-close after 2 seconds
        setTimeout(()=>closeChallengeModal(),2000);
      }else if(result.startsWith('Error')){
        document.getElementById('code-output').style.color='#ff6666';
      }else{
        document.getElementById('code-output').style.color='#ffaa88';
        showMessage('出力が違う… コードを修正して再実行！','#ff8844');
      }
    }catch(e){
      document.getElementById('code-output-wrap').classList.add('show');
      document.getElementById('code-output').textContent='Error: '+e.message;
      document.getElementById('code-output').style.color='#ff6666';
    }
  };

  // Timer (5 min) — timeout removes terminal permanently
  const CHALLENGE_TIME=300;
  clearInterval(cipherTimerInt);cipherTimerVal=CHALLENGE_TIME;
  const el=document.getElementById('cipher-timer');el.classList.remove('danger');
  const fmtT=(s)=>{const m=Math.floor(s/60);return m>0?`${m}:${String(s%60).padStart(2,'0')}`:String(s);};
  el.textContent=fmtT(cipherTimerVal);
  cipherTimerInt=setInterval(()=>{cipherTimerVal--;el.textContent=fmtT(cipherTimerVal);
    if(cipherTimerVal<=30)el.classList.add('danger');
    if(cipherTimerVal<=0){
      clearInterval(cipherTimerInt);
      ct.solved=true;scene.remove(ct.mesh); // terminal disappears on timeout
      closeChallengeModal();
      showMessage('⏰ 時間切れ… チャレンジ端末が消えた','#ff4444');
    }
  },1000);

  modal.classList.add('open');
  // Don't auto-focus editor — user clicks to start typing
}

var challengeCooldownEnd=0; // timestamp when challenge can re-trigger

function closeChallengeModal(){
  clearInterval(cipherTimerInt);
  challengeActive=false;currentChallenge=null;
  document.getElementById('cipher-modal').classList.remove('open');
  document.getElementById('code-editor-wrap').classList.remove('show');
  document.getElementById('code-output-wrap').classList.remove('show');
  document.getElementById('cm-data').style.display='';
  document.getElementById('cipher-close-btn').style.display='none';
  // Restore original cipher handlers
  document.getElementById('c-submit').onclick=function(){submitCipherAnswer();};
  document.getElementById('c-input').onkeydown=function(e){if(e.key==='Enter')submitCipherAnswer();};
  gameState='playing';unmuteBGM();
  battleCooldown=3; // 3s enemy cooldown after challenge
  challengeCooldownEnd=Date.now()+5000; // 5s challenge cooldown
  setTimeout(function(){canvas.requestPointerLock();},350);
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
