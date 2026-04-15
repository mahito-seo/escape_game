// Coding Challenge Rooms + Code-Input Battle Questions

// ═══════════════════════════════════
//  CODING CHALLENGES (gold terminals)
// ═══════════════════════════════════
const CODE_CHALLENGES=[
  // Easy
  {diff:'easy',q:'リスト [3,1,4,1,5] の合計を求めるコードを書け',
   test:c=>{try{return eval(c)===14;}catch(e){return false;}},
   hint:'sum() を使う',xp:30},
  {diff:'easy',q:'文字列 "hello" を大文字にするコードを書け',
   test:c=>{try{return eval(c)==='HELLO';}catch(e){return false;}},
   hint:'.upper() を使う',xp:30},
  {diff:'easy',q:'1から10までの数をリストにするコードを書け（range使用）',
   test:c=>{try{const r=eval(c);return JSON.stringify(r)==='[1,2,3,4,5,6,7,8,9,10]';}catch(e){return false;}},
   hint:'list(range(1,11))',xp:35},
  // Normal
  {diff:'normal',q:'リスト [5,2,8,1,9] を降順ソートした結果を出力するコードを書け',
   test:c=>{try{const r=eval(c);return JSON.stringify(r)==='[9,8,5,2,1]';}catch(e){return false;}},
   hint:'sorted(list, reverse=True)',xp:50},
  {diff:'normal',q:'"banana" の中で "a" が何回出現するか数えるコードを書け',
   test:c=>{try{return eval(c)===3;}catch(e){return false;}},
   hint:'.count()',xp:50},
  {diff:'normal',q:'辞書 {"x":10,"y":20,"z":30} の値の合計を求めるコードを書け',
   test:c=>{try{return eval(c)===60;}catch(e){return false;}},
   hint:'sum(dict.values())',xp:55},
  // Hard
  {diff:'hard',q:'リスト [1,2,3,4,5] の各要素を2乗したリストを内包表記で書け',
   test:c=>{try{const r=eval(c);return JSON.stringify(r)==='[1,4,9,16,25]';}catch(e){return false;}},
   hint:'[x**2 for x in list]',xp:80},
  {diff:'hard',q:'文字列 "Python" の各文字をカンマ区切りで結合するコードを書け\n結果: "P,y,t,h,o,n"',
   test:c=>{try{return eval(c)==='P,y,t,h,o,n';}catch(e){return false;}},
   hint:'",".join(str)',xp:80},
  {diff:'hard',q:'1から100で3の倍数かつ5の倍数の数をリストにするコードを書け',
   test:c=>{try{const r=eval(c);return JSON.stringify(r)==='[15,30,45,60,75,90]';}catch(e){return false;}},
   hint:'リスト内包表記 + if条件',xp:90},
];

let challengeTerminals=[]; // {mesh, x, z, solved}

function spawnChallengeTerminal(rm){
  const cx=(rm.x+~~(rm.w/2))*TILE;
  const cz=(rm.y+~~(rm.h/2))*TILE;
  // Gold glowing terminal
  const tg=new THREE.Group();
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.4,.5,.15,6),
    new THREE.MeshStandardMaterial({color:0x8a7a20,emissive:0x443a00,emissiveIntensity:.5,metalness:.4}));
  base.position.y=.08;tg.add(base);
  const screen=new THREE.Mesh(new THREE.BoxGeometry(.6,.9,.08),
    new THREE.MeshStandardMaterial({color:0x1a1a00,emissive:0xffcc00,emissiveIntensity:1.5,transparent:true,opacity:.8}));
  screen.position.y=.65;tg.add(screen);
  // Star symbol on top
  const star=new THREE.Mesh(new THREE.OctahedronGeometry(.1,0),
    new THREE.MeshStandardMaterial({color:0xffdd00,emissive:0xffaa00,emissiveIntensity:3,transparent:true,opacity:.7}));
  star.position.y=1.2;tg.add(star);
  tg.position.set(cx,0,cz);scene.add(tg);
  challengeTerminals.push({mesh:tg,x:cx,z:cz,solved:false,star});
}

function checkChallengeTerminals(){
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
  document.getElementById('cm-stage-sub').textContent='オプション課題 — 正解でXPボーナス！';
  document.getElementById('cm-mission').textContent=ch.q;
  document.getElementById('cm-data').textContent='Pythonの式または短いコードを入力してください';
  document.getElementById('cm-hint').textContent=`ヒント: ${ch.hint}\n\n※ JavaScriptの式として評価されます\n例: [1,2,3].reduce((a,b)=>a+b,0)`;
  document.getElementById('cm-footer').textContent=`⭐ 正解で XP +${ch.xp}`;
  document.getElementById('c-input').value='';
  document.getElementById('c-input').disabled=false;
  document.getElementById('c-submit').disabled=false;
  document.getElementById('c-result').style.display='none';
  document.getElementById('cm-input-row').style.display='flex';
  document.getElementById('secret-reveal').classList.remove('show');
  document.getElementById('agent-phase').classList.remove('show');
  // Override cipher timer for challenge (60s)
  clearInterval(cipherTimerInt);cipherTimerVal=60;
  const el=document.getElementById('cipher-timer');el.classList.remove('danger');el.textContent='1:00';
  const fmtT=(s)=>{const m=Math.floor(s/60);return m>0?`${m}:${String(s%60).padStart(2,'0')}`:String(s);};
  cipherTimerInt=setInterval(()=>{cipherTimerVal--;el.textContent=fmtT(cipherTimerVal);
    if(cipherTimerVal<=10)el.classList.add('danger');
    if(cipherTimerVal<=0){clearInterval(cipherTimerInt);closeCipherModal();showMessage('⏰ 時間切れ…','#ff8844');unmuteBGM();}
  },1000);

  modal.classList.add('open');

  // Override submit for coding challenge
  const origSubmit=document.getElementById('c-submit').onclick;
  document.getElementById('c-submit').onclick=()=>{
    const code=document.getElementById('c-input').value.trim();
    if(!code)return;
    clearInterval(cipherTimerInt);
    const r=document.getElementById('c-result');
    if(ch.test(code)){
      r.style.display='flex';r.className='correct-res';
      document.getElementById('cr-icon').textContent='⭐';
      document.getElementById('cr-msg').innerHTML=`<strong>正解！ XP +${ch.xp}</strong>`;
      player.xp+=ch.xp;checkLevelUp();updateHUD();
      ct.solved=true;scene.remove(ct.mesh);
      playSound('correct');spawnParticles(player.x,player.z,'#ffdd44',20);
      document.getElementById('c-continue-btn').style.display='inline-block';
      document.getElementById('c-continue-btn').textContent='閉じる';
      document.getElementById('c-continue-btn').onclick=()=>{closeCipherModal();unmuteBGM();document.getElementById('c-submit').onclick=origSubmit;};
    }else{
      r.style.display='flex';r.className='wrong-res';
      document.getElementById('cr-icon').textContent='❌';
      document.getElementById('cr-msg').innerHTML='不正解… もう一度試してみよう';
      playSound('wrong');
      document.getElementById('c-continue-btn').style.display='inline-block';
      document.getElementById('c-continue-btn').textContent='再挑戦';
      document.getElementById('c-continue-btn').onclick=()=>{
        r.style.display='none';document.getElementById('c-input').value='';
        cipherTimerVal=60;el.textContent='1:00';el.classList.remove('danger');
        cipherTimerInt=setInterval(()=>{cipherTimerVal--;el.textContent=fmtT(cipherTimerVal);
          if(cipherTimerVal<=10)el.classList.add('danger');
          if(cipherTimerVal<=0){clearInterval(cipherTimerInt);closeCipherModal();showMessage('⏰ 時間切れ…','#ff8844');unmuteBGM();}
        },1000);
      };
    }
  };
  // Also handle Enter key
  document.getElementById('c-input').onkeydown=(e)=>{if(e.key==='Enter')document.getElementById('c-submit').onclick();};
  setTimeout(()=>document.getElementById('c-input').focus(),100);
}

// ═══════════════════════════════════
//  CODE-INPUT BATTLE QUESTIONS
// ═══════════════════════════════════
const CODE_BATTLE_QS=[
  {cat:'コード入力',diff:'normal',type:'code',
   q:'リスト [3,1,4,1,5] を逆順にした結果は？\nPythonの式で答えよ',
   test:c=>{try{const r=eval(c);return JSON.stringify(r)==='[5,1,4,1,3]';}catch(e){return false;}},
   expl:'[3,1,4,1,5][::-1] または list(reversed(...))',hint:'[::-1]'},
  {cat:'コード入力',diff:'normal',type:'code',
   q:'"hello world" を全て大文字にした結果は？\nPythonの式で答えよ',
   test:c=>{try{return eval(c)==='HELLO WORLD';}catch(e){return false;}},
   expl:'"hello world".upper()',hint:'.upper()'},
  {cat:'コード入力',diff:'normal',type:'code',
   q:'2の8乗の結果は？ 数値で答えよ',
   test:c=>{try{return eval(c)===256;}catch(e){return false;}},
   expl:'2**8 = 256',hint:'** がべき乗'},
  {cat:'コード入力',diff:'hard',type:'code',
   q:'[1,2,3,4,5] の偶数だけのリストは？\nPythonの式で答えよ',
   test:c=>{try{const r=eval(c);return JSON.stringify(r)==='[2,4]';}catch(e){return false;}},
   expl:'[x for x in [1,2,3,4,5] if x%2==0]',hint:'リスト内包表記 + if'},
  {cat:'コード入力',diff:'hard',type:'code',
   q:'文字列 "abcde" の文字数は？ 数値で答えよ',
   test:c=>{try{return eval(c)===5;}catch(e){return false;}},
   expl:'len("abcde") = 5',hint:'len()'},
  {cat:'コード入力',diff:'hard',type:'code',
   q:'辞書 {1:"a",2:"b",3:"c"} のキーの合計は？ 数値で答えよ',
   test:c=>{try{return eval(c)===6;}catch(e){return false;}},
   expl:'sum({1:"a",2:"b",3:"c"}.keys()) ← JSでは別の方法',hint:'キーの合計'},
];
