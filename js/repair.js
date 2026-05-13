// ═══════════════════════════════════
//  REPAIR TERMINAL SYSTEM v2
//  実関数をテストケースで検証。不正不可。
//  コードの質で攻撃力が変わる！
// ═══════════════════════════════════

// Feature power: 0=locked, 1=★, 2=★★, 3=★★★
const features={
  mpBar:0, attack:0, enemyName:0,
  itemEffect:0, skillHeal:0, skillFire:0,
  minimap:0, skillLightning:0, levelUp:0,
  itemDrop:0, scoreCalc:0,
  fireEvo:0, lightningEvo:0, healEvo:0,
};
function unlockedCount(){var n=0;for(var k in features)if(features[k]>0)n++;return n;}
function totalFeatures(){var n=0;for(var k in features)n++;return n;}
function starStr(n){return n>=3?'\u2605\u2605\u2605':n>=2?'\u2605\u2605\u2606':n>=1?'\u2605\u2606\u2606':'\u2606\u2606\u2606';}

// ═══════════════════════════════════
//  CHALLENGES — 実関数 + テストケース
// ═══════════════════════════════════
const REPAIR_CHALLENGES=[

  // ══════ FLOOR 1: 基本機能 ══════
  {id:'mpBar',name:'MPバー修理',icon:'\uD83D\uDCA7',floor:1,
   color:0x4488ff,emissive:0x0044ff,diff:'EASY',xp:40,
   mission:
'【目的】MP の残量を 0〜100 のパーセンテージで返す！\n'+
'\n'+
'calc_mp_percent(mp, max_mp) を完成させよ。\n'+
'\n'+
'■ ヒント\n'+
'・mp が max_mp の何%か、整数で返す\n'+
'・int() を使って小数を切り捨てる\n'+
'\n'+
'■ 期待出力\n'+
'・(30, 50)   → 60\n'+
'・(0, 100)   → 0\n'+
'・(100, 100) → 100\n'+
'\n'+
'修理するとMPバーが表示され、スキルが使えるようになる。',
   hint:'',
   hintDetail:'・割合とは「部分 ÷ 全体」のこと。例: 30 円のうち 50 円なら 30/50 = 0.6（60%）\n・パーセント表記にするには 100 を掛ける\n・(30, 50) → 60、(100, 100) → 100 になる式を考えよう',
   template:
'def calc_mp_percent(mp, max_mp):\n'+
'    # MPの割合(%)を返せ（整数でも小数でも OK）\n'+
'    # mp: 現在MP, max_mp: 最大MP\n'+
'    # 例: mp=30, max_mp=50 → 60\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    \n'+
'    return 0\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_mp_percent(30, 50))\n'+
'print(calc_mp_percent(0, 100))\n'+
'print(calc_mp_percent(100, 100))\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var p=0;
     if(numClose(L[0],60))p++;
     if(numClose(L[1],0))p++;
     if(numClose(L[2],100))p++;
     return partialStar(p,3);
   },
   effectDesc:['','','','MPバーが表示される'],
   unlockMsg:'\uD83D\uDCA7 MPバーが復活した！'},

  {id:'enemyName',name:'敵識別システム修理',icon:'\uD83D\uDC79',floor:1,
   color:0xaa44ff,emissive:0x6622cc,diff:'EASY',xp:50,
   mission:
'【目的】ASCIIコードのリストを文字列に戻す！\n'+
'\n'+
'decode_name(codes) を完成させよ。\n'+
'\n'+
'■ ヒント\n'+
'・各要素は ASCII コード（数値）。1文字ずつに変換して連結\n'+
'・例: 65 → "A", 66 → "B"\n'+
'\n'+
'■ 期待出力\n'+
'・[71, 111, 98, 108, 105, 110] → "Goblin"\n'+
'・[79, 114, 99]                → "Orc"\n'+
'・[68, 101, 109, 111, 110]     → "Demon"\n'+
'\n'+
'修理すると敵の名前と HP 残量が見えるようになる。',
   hint:'',
   hintDetail:'・ASCII コードを 1 文字に変換する組み込み関数は chr()\n  例: chr(65) → "A"、chr(71) → "G"\n・空文字列 "" から始めて、for ループで 1 文字ずつ後ろに追加していくパターン\n・例: [65, 66, 67] → "ABC" になる仕組み',
   template:
'def decode_name(codes):\n'+
'    # ASCIIコードのリストを文字列に変換して返せ\n'+
'    # 例: [65, 66, 67] → "ABC"\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    result = ""\n'+
'    \n'+
'    return result\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(decode_name([71, 111, 98, 108, 105, 110]))\n'+
'print(decode_name([79, 114, 99]))\n'+
'print(decode_name([68, 101, 109, 111, 110]))\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var p=0;
     if(L[0]==='Goblin')p++;
     if(L[1]==='Orc')p++;
     if(L[2]==='Demon')p++;
     return partialStar(p,3);
   },
   effectDesc:['','','','敵の名前とHPが見える'],
   unlockMsg:'\uD83D\uDC79 敵識別システムが復活した！'},

  {id:'itemEffect',name:'アイテム効果ブースト',icon:'\uD83E\uDDEA',floor:2,
   color:0x44ff88,emissive:0x00aa44,diff:'NORMAL',xp:60,
   mission:
'【目的】回復後 HP を返す（max_hp を超えない）！\n'+
'\n'+
'calc_heal(hp, max_hp, amount) を完成させよ。\n'+
'\n'+
'■ ヒント\n'+
'・基本は hp + amount を返す\n'+
'・ただし max_hp を超える場合は max_hp で頭打ち（オーバーフロー禁止）\n'+
'\n'+
'■ 期待出力\n'+
'・(70, 100, 50) → 100  （120 だが max_hp で頭打ち）\n'+
'・(90, 100, 5)  → 95\n'+
'・(50, 100, 30) → 80\n'+
'\n'+
'修理するとアイテムの回復量がアップする。',
   hint:'',
   hintDetail:'・もし hp + amount が max_hp 以下なら そのまま、超えていたら max_hp を返したい\n・「2 つの値の小さい方」を返す組み込み関数がある — それを使えば if 文不要で 1 行で書ける\n・例: (70, 100, 50) は 120 になるが、頭打ちで 100',
   template:
'def calc_heal(hp, max_hp, amount):\n'+
'    # 回復後のHPを返せ（max_hpを超えない！）\n'+
'    # hp: 現在HP, max_hp: 最大HP, amount: 回復量\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    \n'+
'    return 0\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_heal(70, 100, 50))\n'+
'print(calc_heal(90, 100, 5))\n'+
'print(calc_heal(50, 100, 30))\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var p=0;
     if(numClose(L[0],100))p++;
     if(numClose(L[1],95))p++;
     if(numClose(L[2],80))p++;
     return partialStar(p,3);
   },
   effectDesc:['','','','アイテム回復量 1.5倍！'],
   unlockMsg:'\uD83E\uDDEA アイテム効果がブーストされた！'},

  // ══════ FLOOR 2: 戦闘強化（コードで強さが変わる！）══════
  {id:'attack',name:'攻撃力ブースト',icon:'\u2694\uFE0F',floor:2,
   color:0xff8844,emissive:0xff4400,diff:'NORMAL',xp:70,
   mission:
'【目的】ダメージ計算式を実装して攻撃力をブースト！\n'+
'\n'+
'calc_damage(attack, defense, streak, level) を完成させよ。\n'+
'\n'+
'■ 引数の意味\n'+
'・attack  = プレイヤーの攻撃力（武器・スキルの威力）\n'+
'・defense = 敵の防御力（高いほどダメージが減る）\n'+
'・streak  = 連続正解数（バトルクイズに連続で正解すると増える）\n'+
'          0, 1, 2, 3, ... と上がっていき、ハズれると 0 にリセット\n'+
'          高いほど「ノってる状態」でボーナス火力アップ\n'+
'・level   = プレイヤーのレベル（1, 2, 3, ... と成長する）\n'+
'\n'+
'■ ヒント\n'+
'・基本ダメージは attack と defense から（防御が高いと減る、最低 1）\n'+
'・streak と level の両方をボーナスとして加算する\n'+
'・level=1 / streak=0 のときボーナスは 0 になるよう調整\n'+
'\n'+
'■ 期待出力\n'+
'・(25, 10, 0, 1) → 15    基本のみ（streak=0, level=1 だからボーナス無し）\n'+
'・(5,  20, 0, 1) → 1     防御の方が高くても最低 1 ダメージ\n'+
'・(30, 10, 5, 1) → 40    base=20 + streak ボーナス（連続正解 5 回）\n'+
'・(30, 10, 0, 5) → 40    base=20 + level ボーナス（Lv.5）\n'+
'\n'+
'※ 各係数は期待出力から逆算しよう。\n'+
'※ 4 テスト全一致で ★★★（攻撃力 2.0倍）',
   hint:'',
   hintDetail:'・基本ダメは attack − defense。ただし防御の方が高くても 1 にしたい\n  → 「2 つの値の大きい方」を返す関数で (attack-defense, 1) を比較\n・期待出力で逆算:\n  (30,10,5,1) → 40 と基本ダメ 20 の差 20 が streak=5 によるボーナス\n  (30,10,0,5) → 40 と基本ダメ 20 の差 20 が level=5 によるボーナス\n・level=1 のときボーナス 0 にしたい → (level - 1) を使う発想',
   template:
'def calc_damage(attack, defense, streak, level):\n'+
'    # ダメージを返す関数を完成させよ。\n'+
'    # 期待出力（下のテスト行）と一致するよう実装する。\n'+
'    # ===== ここを書く =====\n'+
'    \n'+
'    return 0\n'+
'    # ======================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_damage(25, 10, 0, 1))   # 期待: 15\n'+
'print(calc_damage(5, 20, 0, 1))    # 期待: 1\n'+
'print(calc_damage(30, 10, 5, 1))   # 期待: 40\n'+
'print(calc_damage(30, 10, 0, 5))   # 期待: 40\n'+
'',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<4)return 0;
     var p=0;
     if(numClose(L[0],15))p++;
     if(numClose(L[1],1))p++;
     if(numClose(L[2],40))p++;
     if(numClose(L[3],40))p++;
     return partialStar(p,4);
   },
   effectDesc:['','攻撃力 1.0倍','攻撃力 1.5倍','攻撃力 2.0倍！'],
   unlockMsg:'\u2694\uFE0F 攻撃システムが復活した！'},

  {id:'skillFire',name:'火炎スキル設計',icon:'\uD83D\uDD25',floor:2,
   color:0xff6600,emissive:0xff3300,diff:'NORMAL',xp:80,
   mission:
'【目的】火炎ダメージを実装！\n'+
'\n'+
'calc_fire_damage(base_damage, level, floor_num) を完成させよ。\n'+
'\n'+
'■ ヒント\n'+
'・base_damage を level と floor_num で増幅させる\n'+
'・level=1 かつ floor=1 のときは base_damage そのまま\n'+
'・base_damage=0 なら結果も 0\n'+
'\n'+
'■ 期待出力\n'+
'・(35, 1, 1) → 35\n'+
'・(35, 5, 1) → 175\n'+
'・(35, 1, 5) → 175\n'+
'・(0,  5, 5) → 0\n'+
'\n'+
'※ 4 テスト全一致で ★★★（火炎(強)！）',
   hint:'',
   hintDetail:'・(35, 1, 1) → 35 から: level=1, floor=1 のとき base_damage そのまま = 倍率 1\n・(35, 5, 1) → 175 から: level だけで 5 倍 になる\n・(35, 1, 5) → 175 から: floor だけで 5 倍 になる\n・(0, 5, 5) → 0 から: base_damage を必ず掛ける必要がある\n・3 引数を組み合わせて (1,1) で 1 倍 になる式を考える',
   template:
'def calc_fire_damage(base_damage, level, floor_num):\n'+
'    # 火炎ダメージを返す関数を完成させよ。\n'+
'    # 期待出力（下のテスト行）と一致するよう実装する。\n'+
'    # ===== ここを書く =====\n'+
'    \n'+
'    return 0\n'+
'    # ======================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_fire_damage(35, 1, 1))    # 期待: 35\n'+
'print(calc_fire_damage(35, 5, 1))    # 期待: 175\n'+
'print(calc_fire_damage(35, 1, 5))    # 期待: 175\n'+
'print(calc_fire_damage(0, 5, 5))     # 期待: 0\n'+
'',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<4)return 0;
     var p=0;
     if(numClose(L[0],35))p++;
     if(numClose(L[1],175))p++;
     if(numClose(L[2],175))p++;
     if(numClose(L[3],0))p++;
     return partialStar(p,4);
   },
   effectDesc:['','\uD83D\uDD25火炎(弱)','\uD83D\uDD25火炎(中)','\uD83D\uDD25火炎(強)！'],
   unlockMsg:'\uD83D\uDD25 火炎スキルが復活した！'},

  {id:'skillHeal',name:'回復スキル修理',icon:'\uD83D\uDC8A',floor:1,
   color:0x88ff88,emissive:0x44aa44,diff:'NORMAL',xp:80,
   mission:
'【修理対象】💊 回復スキル（4キーで使う HP 回復魔法）\n'+
'\n'+
'戦闘中に MP を消費して HP を回復する魔法。\n'+
'1 回で「どれだけ HP が戻るか」を計算する関数が壊れている。\n'+
'修理すると 4キー で回復スキルが使えるようになる。\n'+
'\n'+
'■ やること\n'+
'calc_heal_skill(max_hp, level) を実装する：\n'+
'・max_hp = プレイヤーの最大HP\n'+
'・level  = プレイヤーのレベル\n'+
'・戻り値 = 1回で回復するHP量（数値）\n'+
'\n'+
'■ 設計のルール\n'+
'・最大HPが大きいほど回復量も増える\n'+
'・レベルが上がっても回復量が増える\n'+
'・両方の引数を必ず使うこと\n'+
'\n'+
'■ 期待出力（この値になれば正解）\n'+
'・(100, 1) → 25     ← Lv.1 / 最大HP 100\n'+
'・(100, 5) → 45     ← Lv.5 / 最大HP 100\n'+
'・(500, 1) → 105    ← Lv.1 / 最大HP 500\n'+
'\n'+
'※ 3 テスト全一致で ★★★（HP 40%回復）',
   hint:'',
   hintDetail:'答えを直接書かず、考え方だけ示す:\n・(100, 1) → 25 と (500, 1) → 105 を比べる\n  max_hp だけ 5倍になったら 結果も大きく変わる\n  → 「max_hp に比例する項」を割り出せる\n・(100, 1) → 25 と (100, 5) → 45 を比べる\n  level だけ 4 上がって +20\n  → 「level に比例する項」を割り出せる\n・2つの項を足し合わせれば答え',
   template:
'def calc_heal_skill(max_hp, level):\n'+
'    # この関数が「回復スキル使用時の回復量」を決める。\n'+
'    # 期待出力（下のテスト行）と一致するよう実装する。\n'+
'    # ===== ここを書く =====\n'+
'    \n'+
'    return 0\n'+
'    # ======================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_heal_skill(100, 1))    # 期待: 25\n'+
'print(calc_heal_skill(100, 5))    # 期待: 45\n'+
'print(calc_heal_skill(500, 1))    # 期待: 105\n'+
'',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var p=0;
     if(numClose(L[0],25))p++;
     if(numClose(L[1],45))p++;
     if(numClose(L[2],105))p++;
     return partialStar(p,3);
   },
   effectDesc:['','HP 20%回復','HP 30%回復','HP 40%回復！'],
   unlockMsg:'\uD83D\uDC8A 回復スキルが復活した！'},

  // ══════ FLOOR 3: 探索・成長 ══════
  {id:'minimap',name:'ミニマップ修理',icon:'\uD83D\uDDFA\uFE0F',floor:3,
   color:0x44aaff,emissive:0x0066cc,diff:'NORMAL',xp:80,
   mission:
'【目的】3D 座標をマップ表示用ピクセル座標に変換！\n'+
'\n'+
'calc_map_pixel(pos, tile_size, cells, display) を完成させよ。\n'+
'\n'+
'■ ヒント\n'+
'・pos はワールド座標（実距離）、display は表示サイズ（ピクセル）\n'+
'・ワールド全体の幅は tile_size と cells から計算できる\n'+
'・線形変換でピクセル位置にマッピング\n'+
'\n'+
'■ 期待出力（int で囲ってテストされます）\n'+
'・(24.0, 2.0, 40, 120) → 36\n'+
'・(0.0,  2.0, 40, 120) → 0\n'+
'・(80.0, 2.0, 40, 120) → 120',
   hint:'',
   hintDetail:'・ワールド全体の幅は何で決まる？ → tile_size × cells\n・pos がワールド全体の何割か = pos ÷ ワールド全幅\n・最後にその割合を表示サイズ display に掛ければピクセル位置\n・(24, 2, 40, 120) → 全幅 80、24/80 = 0.3、0.3 × 120 = 36',
   template:
'def calc_map_pixel(pos, tile_size, cells, display):\n'+
'    # 3D座標をマップのピクセル座標に変換して返せ\n'+
'    # 引数の意味を考えて変換式を組み立てよう\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    \n'+
'    return 0\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(int(calc_map_pixel(24.0, 2.0, 40, 120)))\n'+
'print(int(calc_map_pixel(0.0, 2.0, 40, 120)))\n'+
'print(int(calc_map_pixel(80.0, 2.0, 40, 120)))\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var p=0;
     if(numClose(L[0],36))p++;
     if(numClose(L[1],0))p++;
     if(numClose(L[2],120))p++;
     return partialStar(p,3);
   },
   effectDesc:['','','','マップが正確に表示される'],
   unlockMsg:'\uD83D\uDDFA\uFE0F ミニマップが復活した！'},

  {id:'skillLightning',name:'雷撃スキル設計',icon:'\u26A1',floor:3,
   color:0x8888ff,emissive:0x4444ff,diff:'HARD',xp:100,
   mission:
'【目的】雷撃ダメージを実装！\n'+
'\n'+
'calc_lightning(damages, level) を完成させよ。\n'+
'\n'+
'■ ヒント\n'+
'・damages の中の最大値をベースにする\n'+
'・level でボーナスを加算\n'+
'・期待出力から係数を逆算\n'+
'\n'+
'■ 期待出力\n'+
'・([55, 20, 80, 35], 1) → 100\n'+
'・([55, 20, 80, 35], 5) → 180\n'+
'・([10], 1)             → 30\n'+
'\n'+
'※ 3 テスト全一致で ★★★（雷撃(強)！）',
   hint:'',
   hintDetail:'・リスト内の最大値を返す組み込み関数を使う\n・(...[80,...], 1) → 100 と (..., 5) → 180 を比べる\n  level が 1→5 (4 増) で結果が 100→180 (80 増) → level 1 あたりの寄与は？\n・max(リスト) + level × ◯ の形で ◯ を逆算',
   template:
'def calc_lightning(damages, level):\n'+
'    # 雷撃ダメージを返す関数を完成させよ。\n'+
'    # 期待出力（下のテスト行）と一致するよう実装する。\n'+
'    # ===== ここを書く =====\n'+
'    \n'+
'    return 0\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_lightning([55, 20, 80, 35], 1))    # 期待: 100\n'+
'print(calc_lightning([55, 20, 80, 35], 5))    # 期待: 180\n'+
'print(calc_lightning([10], 1))                # 期待: 30\n'+
'',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var p=0;
     if(numClose(L[0],100))p++;
     if(numClose(L[1],180))p++;
     if(numClose(L[2],30))p++;
     return partialStar(p,3);
   },
   effectDesc:['','\u26A1雷撃(弱)','\u26A1雷撃(中)','\u26A1雷撃(強)！'],
   unlockMsg:'\u26A1 雷撃スキルが復活した！'},

  {id:'levelUp',name:'レベルアップ強化',icon:'\u2B06\uFE0F',floor:3,
   color:0xffdd00,emissive:0xaa8800,diff:'HARD',xp:100,
   mission:
'【目的】合計 XP からプレイヤーの到達レベルを計算！\n'+
'\n'+
'calc_level(total_xp, base_threshold) を完成させよ。\n'+
'\n'+
'■ アルゴリズム\n'+
'  1. 初期値: level = 1, xp = total_xp, threshold = base_threshold\n'+
'  2. xp が threshold 以上の間、以下を繰り返す:\n'+
'     - xp から threshold を引く（昇格に消費した XP を減らす）\n'+
'     - level を 1 増やす\n'+
'     - threshold を 1.5 倍にする（次の昇格は厳しくなる）\n'+
'     ※ threshold は int() で整数化\n'+
'  3. ループを抜けたら level を返す\n'+
'\n'+
'■ 動きの例: total_xp=250, base_threshold=100\n'+
'  ループ1回目: xp=250 ≥ 100 → xp=150, level=2, threshold=150\n'+
'  ループ2回目: xp=150 ≥ 150 → xp=0,   level=3, threshold=225\n'+
'  ループ3回目: xp=0  < 225  → 終了\n'+
'  → 答え: 3\n'+
'\n'+
'■ 期待出力\n'+
'・(250, 100) → 3\n'+
'・(50, 100)  → 1   （最初から条件未達でループしない）\n'+
'・(0, 100)   → 1\n'+
'\n'+
'■ やること\n'+
'while ループの骨格は用意済み。3 つの _____ を埋めるだけ。\n'+
'\n'+
'修理すると Lv アップ時の HP/MP/攻撃力 上昇量がアップ。',
   hint:'',
   hintDetail:'・while ループの 3 行をそれぞれ考える:\n  - xp から「何」を引けば、消費した分が減るか\n  - level を「いくつ」増やしたいか（1 段階アップ）\n  - threshold を「何倍」にしたら次が厳しくなる仕様か\n・期待出力 (250, 100) → 3 のループを紙でトレースしてみると分かりやすい',
   template:
'def calc_level(total_xp, base_threshold):\n'+
'    # 初期化（変更不要）\n'+
'    level = 1\n'+
'    xp = total_xp\n'+
'    threshold = base_threshold\n'+
'    \n'+
'    # ===== 3つの _____ を埋めよう =====\n'+
'    while xp >= threshold:\n'+
'        xp = xp - _____               # ← 昇格に消費する量（threshold 分）\n'+
'        level = level + _____         # ← 1 段階レベルアップ\n'+
'        threshold = int(threshold * _____)   # ← 次の閾値は何倍？\n'+
'    # ===================================\n'+
'    \n'+
'    return level\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_level(250, 100))   # 期待: 3\n'+
'print(calc_level(50, 100))    # 期待: 1\n'+
'print(calc_level(0, 100))     # 期待: 1\n'+
'',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var p=0;
     if(numClose(L[0],3))p++;
     if(numClose(L[1],1))p++;
     if(numClose(L[2],1))p++;
     return partialStar(p,3);
   },
   effectDesc:['','','','Lvアップ時 HP+30/MP+15/攻撃+10！'],
   unlockMsg:'\u2B06\uFE0F レベルアップが強化された！'},

  // ══════ FLOOR 4: メタ機能 ══════
  {id:'itemDrop',name:'ドロップ率ブースト',icon:'\uD83D\uDC8E',floor:4,
   color:0xff88ff,emissive:0xaa44aa,diff:'HARD',xp:100,
   mission:
'【目的】ロールで決まるドロップアイテム種別を返す！\n'+
'\n'+
'get_drop_item(roll) を完成させよ。\n'+
'\n'+
'■ 仕様（API 契約）\n'+
'・引数 roll は 0〜99 の整数\n'+
'・25 未満       → "hp"\n'+
'・25〜49        → "mp"\n'+
'・50 以上       → "xp"\n'+
'\n'+
'■ 期待出力\n'+
'・get_drop_item(15) → "hp"\n'+
'・get_drop_item(42) → "mp"\n'+
'・get_drop_item(75) → "xp"\n'+
'\n'+
'修理するとドロップ率が 40% → 75% にアップ！',
   hint:'',
   hintDetail:'・roll の値で 3 つに振り分ける条件分岐\n・境界値は問題文の仕様: 25 と 50\n・上から評価される if / elif / else を使うと、前段で弾けば次の条件は\n  小さい範囲をチェックするだけで書ける\n・else を最後に置けば「絶対に何か返す」が保証される',
   template:
'def get_drop_item(roll):\n'+
'    # roll(0-99) に応じてアイテム種類の文字列を返せ。\n'+
'    # 25未満 → "hp" / 25〜49 → "mp" / 50以上 → "xp"\n'+
'    # ===== ここを書く =====\n'+
'    \n'+
'    return ""\n'+
'    # ======================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(get_drop_item(15))   # → hp\n'+
'print(get_drop_item(42))   # → mp\n'+
'print(get_drop_item(75))   # → xp\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var p=0;
     if(L[0]==='hp')p++;
     if(L[1]==='mp')p++;
     if(L[2]==='xp')p++;
     return partialStar(p,3);
   },
   effectDesc:['','','','ドロップ率 75%！'],
   unlockMsg:'\uD83D\uDC8E ドロップ率がブーストされた！'},

  {id:'scoreCalc',name:'スコア計算を実装せよ',icon:'\uD83C\uDFC6',floor:4,
   color:0xffdd44,emissive:0xccaa00,diff:'HARD',xp:120,
   mission:
'【目的】3 要素の重み付けスコア計算を実装！\n'+
'\n'+
'calc_score(level, kills, streak) を完成させよ。\n'+
'\n'+
'■ ヒント\n'+
'・level / kills / streak を、それぞれ異なる重みで足す\n'+
'・期待出力 (1, 0, 0) → 35 から level の係数が分かる\n'+
'・残り 2 つの係数は他のテストから連立で逆算\n'+
'\n'+
'■ 期待出力\n'+
'・(5, 12, 8)   → 367\n'+
'・(1, 0, 0)    → 35\n'+
'・(10, 50, 20) → 990\n'+
'\n'+
'修理するとクリア画面に詳細スコア＋ランクが表示される。',
   hint:'',
   hintDetail:'・3 つの引数それぞれに「重み」を掛けて足すだけ\n・(1, 0, 0) → 35 から: level 1 つあたりの重みは 35\n・残り 2 つの重みは、他のテストの式を立てて連立で逆算\n  例: (5, 12, 8) → 367 = 5×35 + 12×X + 8×Y、X と Y を求める',
   template:
'def calc_score(level, kills, streak):\n'+
'    # 3要素の重み付けスコアを返す。\n'+
'    # 各要素の係数は期待出力から逆算しよう。\n'+
'    # ===== ここを書く =====\n'+
'    \n'+
'    return 0\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_score(5, 12, 8))     # 期待: 367\n'+
'print(calc_score(1, 0, 0))      # 期待: 35\n'+
'print(calc_score(10, 50, 20))   # 期待: 990\n'+
'',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var p=0;
     if(numClose(L[0],367))p++;
     if(numClose(L[1],35))p++;
     if(numClose(L[2],990))p++;
     return partialStar(p,3);
   },
   effectDesc:['','','','スコア＋ランク詳細表示！'],
   unlockMsg:'\uD83C\uDFC6 スコア計算が有効になった！'},

  // ══════ FLOOR 4: スキル進化 ══════
  {id:'fireEvo',name:'火球 → 爆裂火球に進化',icon:'\uD83C\uDF0B',floor:4,
   color:0xff2200,emissive:0xcc0000,diff:'HARD',xp:120,
   mission:
'【目的】爆発の範囲ダメージを敵ごとに計算！\n'+
'\n'+
'calc_explosion(enemies, center_x, center_y, radius, base_dmg) を完成させよ。\n'+
'\n'+
'■ ヒント\n'+
'・enemies は [[x, y], ...] の座標リスト\n'+
'・各敵について中心からの距離 dist を計算（dist = sqrt(dx^2 + dy^2)）\n'+
'・dist が radius 以下ならダメージ、それ以外は 0\n'+
'・中心に近いほどダメージ大（線形に減衰させる）\n'+
'・結果は敵と同じ順序のダメージ値リスト\n'+
'\n'+
'■ 期待出力（例）\n'+
'・enemies=[[0,0],[3,0],[10,0]], center=(0,0), r=5, base=100\n'+
'　→ [100, 40, 0]',
   hint:'',
   hintDetail:'・各敵について中心からの距離 dist を計算\n  → 三平方の定理: dx² + dy² の平方根（Python では ** 0.5）\n・dist が radius 以下のときだけダメージ、超えたら 0\n・中心ぴったりで base、端で 0 になるように線形減衰させたい\n  → (1 - dist/radius) を base に掛ける（中心: 1.0倍、半径端: 0倍）\n・結果は append で順に貯めて返す',
   template:
'def calc_explosion(enemies, center_x, center_y, radius, base_dmg):\n'+
'    results = []\n'+
'    for enemy in enemies:\n'+
'        ex = enemy[0]\n'+
'        ey = enemy[1]\n'+
'        dx = ex - center_x\n'+
'        dy = ey - center_y\n'+
'\n'+
'        # ① 距離 dist を計算（公式: (dx**2 + dy**2) ** 0.5）\n'+
'        dist = _____\n'+
'\n'+
'        # ② 半径内ならダメージ計算、半径外なら 0\n'+
'        if dist <= radius:\n'+
'            damage = _____   # ← int(base_dmg * (1 - dist/radius))\n'+
'            results.append(damage)\n'+
'        else:\n'+
'            results.append(0)\n'+
'    return results\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_explosion([[0,0],[3,0],[10,0]], 0, 0, 5, 100))   # → [100, 40, 0]\n'+
'print(calc_explosion([[1,1]], 0, 0, 2, 50))                  # → 中央寄り 1 つ\n'+
'print(calc_explosion([[10,10]], 0, 0, 3, 80))                # → [0]\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var p=0;
     try{
       var r1=JSON.parse(L[0].replace(/'/g,'"'));
       if(Array.isArray(r1)&&r1.length===3&&r1[0]>=80&&r1[2]===0)p++;
       var r2=JSON.parse(L[1].replace(/'/g,'"'));
       if(Array.isArray(r2)&&r2.length===1&&r2[0]>0)p++;
       var r3=JSON.parse(L[2].replace(/'/g,'"'));
       if(Array.isArray(r3)&&r3.length===1&&r3[0]===0)p++;
     }catch(e){}
     return partialStar(p,3);
   },
   effectDesc:['','','','\uD83C\uDF0B 爆裂火球！着弾時に範囲爆発！'],
   unlockMsg:'\uD83C\uDF0B 火球が「爆裂火球」に進化した！'},

  {id:'lightningEvo',name:'雷撃 → 連鎖雷撃に進化',icon:'\u26A1\u26A1',floor:4,
   color:0x4444ff,emissive:0x2222cc,diff:'HARD',xp:120,
   mission:
'【目的】連鎖ごとに減衰するダメージリストを作る！\n'+
'\n'+
'calc_chain(base_dmg, chain_count, decay) を完成させよ。\n'+
'\n'+
'■ ヒント\n'+
'・最初のダメージは base_dmg\n'+
'・連鎖するたびに decay 倍に減衰させて次のダメージを計算\n'+
'・各ダメージは int で記録、合計 chain_count 個のリストを返す\n'+
'\n'+
'■ 期待出力\n'+
'・(100, 3, 0.7) → [100, 70, 49]\n'+
'・(80, 4, 0.5)  → [80, 40, 20, 10]\n'+
'・(50, 1, 0.7)  → [50]',
   hint:'',
   hintDetail:'・current 変数を base_dmg からスタート\n・chain_count 回ループする\n・各ループの順序がポイント:\n  ① まず append で現在のダメージを記録\n  ② その後 current を decay 倍して次回に備える\n・順序を逆にすると最初の値が base_dmg にならない',
   template:
'def calc_chain(base_dmg, chain_count, decay):\n'+
'    damages = []\n'+
'    current = base_dmg\n'+
'    for i in range(chain_count):\n'+
'        # ① 今の current を int にして damages に追加\n'+
'        damages.append(_____)\n'+
'\n'+
'        # ② current を decay 倍にして減衰\n'+
'        current = _____\n'+
'    return damages\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_chain(100, 3, 0.7))   # → [100, 70, 49]\n'+
'print(calc_chain(80, 4, 0.5))    # → [80, 40, 20, 10]\n'+
'print(calc_chain(50, 1, 0.7))    # → [50]\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var p=0;
     try{
       var r1=JSON.parse(L[0].replace(/'/g,'"'));
       if(Array.isArray(r1)&&r1.length===3&&r1[0]===100&&Math.abs(r1[1]-70)<=1&&Math.abs(r1[2]-49)<=1)p++;
       var r2=JSON.parse(L[1].replace(/'/g,'"'));
       if(Array.isArray(r2)&&r2.length===4&&r2[0]===80)p++;
       var r3=JSON.parse(L[2].replace(/'/g,'"'));
       if(Array.isArray(r3)&&r3.length===1&&r3[0]===50)p++;
     }catch(e){}
     return partialStar(p,3);
   },
   effectDesc:['','','','\u26A1\u26A1 連鎖雷撃！敵から敵へ3回連鎖！'],
   unlockMsg:'\u26A1\u26A1 雷撃が「連鎖雷撃」に進化した！'},

  {id:'healEvo',name:'回復 → リジェネに進化',icon:'\uD83D\uDC9A',floor:4,
   color:0x22ff88,emissive:0x11aa44,diff:'HARD',xp:120,
   mission:
'【目的】複数ターン回復の合計回復量を計算（max_hp で頭打ち）！\n'+
'\n'+
'calc_regen(hp, max_hp, heal_per_turn, turns) を完成させよ。\n'+
'\n'+
'■ ヒント\n'+
'・毎ターン heal_per_turn だけ回復させる\n'+
'・ただし HP は max_hp を超えてはいけない（はみ出した分は捨てる）\n'+
'・turns 回繰り返した合計回復量を返す\n'+
'\n'+
'■ 期待出力\n'+
'・(80, 100, 10, 5)  → 20  （max=100で打ち止め）\n'+
'・(95, 100, 10, 5)  → 5\n'+
'・(50, 200, 20, 3)  → 60',
   hint:'',
   hintDetail:'・各ターンの「実際に回復できる量」を考える\n  → 標準回復量 と 残り余裕(max_hp - hp) の小さい方\n  → 上限を超えないように 2 つの最小値を取る\n・回復したぶん hp も増やす（次ターンの余裕計算に必要）\n・total_healed に毎ターン足し込んで返す',
   template:
'def calc_regen(hp, max_hp, heal_per_turn, turns):\n'+
'    total_healed = 0\n'+
'    for i in range(turns):\n'+
'        # ① 今ターンの回復量を計算（max_hp を超える分はカット）\n'+
'        heal = _____   # ← min(heal_per_turn, max_hp - hp)\n'+
'\n'+
'        # ② 現在HPを増やす\n'+
'        hp = _____     # ← hp + heal\n'+
'\n'+
'        # ③ 合計回復量に加算\n'+
'        total_healed = _____  # ← total_healed + heal\n'+
'    return total_healed\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_regen(80, 100, 10, 5))   # → 20  （max=100で頭打ち）\n'+
'print(calc_regen(95, 100, 10, 5))   # → 5\n'+
'print(calc_regen(50, 200, 20, 3))   # → 60\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var v1=parseFloat(L[0]),v2=parseFloat(L[1]),v3=parseFloat(L[2]);
     var p=0;
     if(numClose(v1,20))p++;
     if(numClose(v2,5))p++;
     if(numClose(v3,60))p++;
     return partialStar(p,3);
   },
   effectDesc:['','','','\uD83D\uDC9A \u30EA\u30B8\u30A7\u30CD\uFF015\u30BF\u30FC\u30F3\u6301\u7D9AHP\u56DE\u5FA9\uFF01'],
   unlockMsg:'\uD83D\uDC9A 回復が「リジェネ」に進化した！'},
];

// Helper: compare numeric output with tolerance
function numClose(s,expected){
  var v=parseFloat(String(s).trim());
  if(isNaN(v))return false;
  return Math.abs(v-expected)<0.5;
}
// Helper: convert (passed-count, total-count) to ★ tier (0..3).
//   全部一致 → ★★★ / ≥66% → ★★ / 1つでも通れば → ★ / 0なら失敗
function partialStar(passed,total){
  if(passed>=total)return 3;
  if(passed*3>=total*2)return 2;
  if(passed>=1)return 1;
  return 0;
}

// ═══════════════════════════════════
//  TERMINAL STATE
// ═══════════════════════════════════
var repairTerminals=[];
var repairActive=false;
var currentRepair=null;

// ── Spawn repair terminal in a room ──
function spawnRepairTerminal(rm,challengeIdx){
  var ch=REPAIR_CHALLENGES[challengeIdx];
  if(!ch||features[ch.id]>0)return;
  var cx=(rm.x+~~(rm.w/2))*TILE,cz=(rm.y+~~(rm.h/2))*TILE;
  // Avoid stair (exit portal) and cipher terminal positions — at least 3 tiles away.
  var sx=dungeon.stairX*TILE,sz=dungeon.stairY*TILE;
  var tx=dungeon.termX*TILE,tz=dungeon.termY*TILE;
  function tooClose(x,z){
    var ds=(x-sx)*(x-sx)+(z-sz)*(z-sz);
    var dt=(x-tx)*(x-tx)+(z-tz)*(z-tz);
    return ds<9*TILE*TILE||dt<9*TILE*TILE; // < 3 tiles
  }
  var px=0,pz=0,ok=false;
  for(var attempt=0;attempt<25;attempt++){
    var ox=(Math.random()-.5)*rm.w*.5*TILE;
    var oz=(Math.random()-.5)*rm.h*.5*TILE;
    px=cx+ox;pz=cz+oz;
    if(!isWall(px,pz)&&!tooClose(px,pz)){ok=true;break;}
  }
  if(!ok){
    // Center fallback — but only if the center is also clear of stair/terminal.
    px=cx;pz=cz;
    if(isWall(px,pz)||tooClose(px,pz))return; // skip this terminal if no safe spot
  }
  var tg=new THREE.Group();
  // ── 約 1.7 倍に拡大して視認性アップ ──
  var base=new THREE.Mesh(new THREE.CylinderGeometry(.75,.9,.25,8),
    new THREE.MeshStandardMaterial({color:ch.color,emissive:ch.emissive,emissiveIntensity:.6,metalness:.4}));
  base.position.y=.13;tg.add(base);
  var screen=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.6,.12),
    new THREE.MeshStandardMaterial({color:0x1a1a1a,emissive:ch.color,emissiveIntensity:1.8,transparent:true,opacity:.9}));
  screen.position.y=1.1;tg.add(screen);
  var indicator=new THREE.Mesh(new THREE.OctahedronGeometry(.22,0),
    new THREE.MeshStandardMaterial({color:ch.color,emissive:ch.emissive,emissiveIntensity:4,transparent:true,opacity:.9}));
  indicator.position.y=2.2;tg.add(indicator);
  var ring=new THREE.Mesh(new THREE.TorusGeometry(.38,.07,6,16),
    new THREE.MeshStandardMaterial({color:ch.color,emissive:ch.emissive,emissiveIntensity:2.5,transparent:true,opacity:.7}));
  ring.position.y=1.7;ring.rotation.x=Math.PI/2;tg.add(ring);
  var ring2=new THREE.Mesh(new THREE.TorusGeometry(.55,.05,6,16),
    new THREE.MeshStandardMaterial({color:ch.color,emissive:ch.emissive,emissiveIntensity:2,transparent:true,opacity:.5}));
  ring2.position.y=.3;ring2.rotation.x=Math.PI/2;tg.add(ring2);
  var glow=new THREE.Mesh(new THREE.SphereGeometry(.9,12,12),
    new THREE.MeshStandardMaterial({color:ch.color,emissive:ch.emissive,emissiveIntensity:2.5,transparent:true,opacity:.15}));
  glow.position.y=1.2;tg.add(glow);
  // 遠くからも見える光の柱（透過シリンダー）
  var beam=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,4.5,8),
    new THREE.MeshStandardMaterial({color:ch.color,emissive:ch.emissive,emissiveIntensity:3,transparent:true,opacity:.35}));
  beam.position.y=2.25;tg.add(beam);
  var light=new THREE.PointLight(ch.color,4,15);
  light.position.set(px,2.5,pz);scene.add(light);
  tg.position.set(px,0,pz);scene.add(tg);
  repairTerminals.push({mesh:tg,light:light,x:px,z:pz,challenge:ch,challengeIdx:challengeIdx,solved:false});
  decoBlocks.push({x:px,z:pz,r:.9});
}

// ── Check proximity ──
function checkRepairTerminals(){
  if(repairActive||challengeActive||cipherActive||battleActive)return;
  if(Date.now()<challengeCooldownEnd)return;
  for(var i=0;i<repairTerminals.length;i++){
    var rt=repairTerminals[i];
    if(rt.solved||features[rt.challenge.id]>0)continue;
    var dx=rt.x-player.x,dz=rt.z-player.z;
    var dist=Math.sqrt(dx*dx+dz*dz);
    if(dist<3.5&&!approachTarget)approachTarget={type:'repair',name:rt.challenge.name,icon:rt.challenge.icon};
    if(dist<2.0){openRepairChallenge(rt);return;}
  }
}

// ── Open repair challenge ──
function openRepairChallenge(rt){
  if(gameState!=='playing')return;
  repairActive=true;currentRepair=rt;
  gameState='cipher';document.exitPointerLock();muteBGM();
  if(typeof uploadProgress==='function')uploadProgress();
  var ch=rt.challenge;
  document.getElementById('cm-avatar').textContent=ch.icon;
  document.getElementById('cm-name').textContent='\uD83D\uDD27 修理ターミナル';
  document.getElementById('cm-stage-sub').textContent=ch.name+' \u2014 '+ch.diff;
  document.getElementById('cm-mission').textContent=ch.mission;
  document.getElementById('cm-data').style.display='none';
  // Hide hint area, show hint button instead
  var hintEl=document.getElementById('cm-hint');
  if(ch.hintDetail){
    hintEl.style.display='none';
    hintEl.textContent='';
  }else{
    hintEl.textContent=ch.hint||'';
    hintEl.style.display=ch.hint?'':'none';
  }
  document.getElementById('cm-footer').textContent=ch.icon+' '+ch.name+' | XP +'+ch.xp;
  // Hint button
  var hintBtn=document.getElementById('repair-hint-btn');
  if(ch.hintDetail){
    hintBtn.style.display='inline-block';
    hintBtn._hintData=ch.hintDetail;
    hintBtn._revealed=false;
  }else{
    hintBtn.style.display='none';
  }
  document.getElementById('code-editor-wrap').classList.add('show');
  initAceEditor();setEditorCode(ch.template);setEditorReadOnly(false);
  document.getElementById('code-output-wrap').classList.remove('show');
  // Wipe any leftover output text from a previous run / previous terminal
  var _coOut=document.getElementById('code-output');
  _coOut.textContent='';_coOut.style.color='';
  document.getElementById('cm-input-row').style.display='none';
  var _cR=document.getElementById('c-result');
  _cR.style.display='none';_cR.className='';
  document.getElementById('c-continue-btn').style.display='none';
  document.getElementById('secret-reveal').classList.remove('show');
  document.getElementById('agent-phase').classList.remove('show');
  // FIX: set close button to call closeRepairModal, not closeChallengeModal
  var closeBtn=document.getElementById('cipher-close-btn');
  closeBtn.style.display='inline-block';
  closeBtn.onclick=closeRepairModal;
  // Run button
  document.getElementById('code-run-btn').onclick=function(){
    // Clear stale state from any previous run before evaluating fresh code
    document.getElementById('code-output').textContent='';
    document.getElementById('code-output').style.color='';
    var _cr=document.getElementById('c-result');
    _cr.style.display='none';_cr.className='';
    try{
      var code=getEditorCode();
      var result=miniPyEval(code);
      document.getElementById('code-output-wrap').classList.add('show');
      document.getElementById('code-output').textContent=result||'(\u51FA\u529B\u306A\u3057)';
      if(result.startsWith('Error')){
        document.getElementById('code-output').style.color='#ff6666';
        return;
      }
      var level=ch.evaluate(result);
      if(level>=1){
        document.getElementById('code-output').style.color='#44ff88';
        document.getElementById('code-output').textContent=result+'\n\n\u2705 '+starStr(level)+' '+ch.effectDesc[level];
        clearInterval(cipherTimerInt);
        features[ch.id]=level;rt.solved=true;
        scene.remove(rt.mesh);if(rt.light)scene.remove(rt.light);
        var r=document.getElementById('c-result');r.style.display='flex';r.className='correct-res';
        document.getElementById('cr-icon').textContent=ch.icon;
        document.getElementById('cr-msg').innerHTML='<strong>'+ch.unlockMsg+'</strong> '+starStr(level)+'<br><span style="font-size:12px;color:#88cc88;">'+ch.effectDesc[level]+' | XP +'+ch.xp+' | \u4FEE\u7406\u5B8C\u4E86: '+unlockedCount()+'/'+totalFeatures()+'</span>';
        player.xp+=ch.xp;checkLevelUp();updateHUD();
        setEditorReadOnly(true);closeBtn.style.display='none';
        playSound('clear');spawnParticles(player.x,player.z,'#44ff88',30);
        showMessage(ch.unlockMsg+' '+starStr(level),'#44ff88');
        updateSkillsHUD();saveFeatures();saveProgress();
        // \u30D2\u30F3\u30C8\u7B49\u3067\u4E0A\u304C\u9577\u304F\u306A\u3063\u3066\u308B\u3068\u89E3\u653E\u30E1\u30C3\u30BB\u30FC\u30B8\u304C\u753B\u9762\u304B\u3089\u5207\u308C\u3066\u898B\u3048\u306A\u3044\u306E\u3067\u3001
        // \u5F37\u5236\u7684\u306B c-result \u307E\u3067\u30B9\u30AF\u30ED\u30FC\u30EB\u3055\u305B\u308B
        setTimeout(function(){
          try{r.scrollIntoView({behavior:'smooth',block:'end'});}catch(e){}
        },50);
        setTimeout(function(){closeRepairModal();},3000);
      }else{
        document.getElementById('code-output').style.color='#ffaa88';
        document.getElementById('code-output').textContent=result+'\n\n\u274C \u30C6\u30B9\u30C8\u5931\u6557\u2026 \u30B3\u30FC\u30C9\u3092\u898B\u76F4\u3057\u3066\u518D\u5B9F\u884C\uFF01';
        showMessage('\u30C6\u30B9\u30C8\u5931\u6557\u2026 \u30B3\u30FC\u30C9\u3092\u4FEE\u6B63\u3057\u3066\u518D\u5B9F\u884C\uFF01','#ff8844');
        // \u30C6\u30B9\u30C8\u5931\u6557\u6642\u3082\u5B9F\u884C\u7D50\u679C\u304C\u753B\u9762\u5916\u306B\u5207\u308C\u306A\u3044\u3088\u3046\u30B9\u30AF\u30ED\u30FC\u30EB
        setTimeout(function(){
          try{document.getElementById('code-output-wrap').scrollIntoView({behavior:'smooth',block:'end'});}catch(e){}
        },50);
      }
    }catch(e){
      document.getElementById('code-output-wrap').classList.add('show');
      document.getElementById('code-output').textContent='Error: '+e.message;
      document.getElementById('code-output').style.color='#ff6666';
    }
  };
  // No time limit for repair terminals — let players take their time on coding
  clearInterval(cipherTimerInt);cipherTimerInt=null;
  var el=document.getElementById('cipher-timer');
  el.classList.remove('danger');
  el.textContent='∞';
  document.getElementById('cipher-modal').classList.add('open');
  // Don't auto-focus editor — user clicks to start typing
}

// ── Copy code output text (errors, test output) to clipboard ──
function copyCodeOutput(){
  var out=document.getElementById('code-output');
  var btn=document.getElementById('code-output-copy-btn');
  if(!out||!btn)return;
  var text=out.textContent||'';
  if(!text){return;}
  var done=function(ok){
    var orig='📋 コピー';
    btn.textContent=ok?'✅ コピーしました':'❌ 失敗';
    btn.classList.toggle('copied',ok);
    setTimeout(function(){btn.textContent=orig;btn.classList.remove('copied');},1500);
  };
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){done(true);},function(){done(fallbackCopy(text));});
  }else{
    done(fallbackCopy(text));
  }
}
function fallbackCopy(text){
  try{
    var ta=document.createElement('textarea');
    ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';
    document.body.appendChild(ta);ta.select();
    var ok=document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }catch(e){return false;}
}

// ── Show hint on button click ──
function showRepairHint(){
  var btn=document.getElementById('repair-hint-btn');
  if(!btn._hintData||btn._revealed)return;
  btn._revealed=true;
  var hintEl=document.getElementById('cm-hint');
  hintEl.textContent='\uD83D\uDCA1 \u4F7F\u3048\u308B\u30AD\u30FC\u30EF\u30FC\u30C9: '+btn._hintData;
  hintEl.style.display='';
  btn.textContent='\u2705 \u30D2\u30F3\u30C8\u8868\u793A\u6E08\u307F';
  btn.style.opacity='.5';
  btn.style.cursor='default';
}

// ── Close repair modal ──
function closeRepairModal(){
  clearInterval(cipherTimerInt);repairActive=false;currentRepair=null;
  if(typeof uploadProgress==='function')uploadProgress();
  document.getElementById('cipher-modal').classList.remove('open');
  document.getElementById('code-editor-wrap').classList.remove('show');
  document.getElementById('code-output-wrap').classList.remove('show');
  document.getElementById('cm-data').style.display='';
  // Reset hint button
  var hintBtn=document.getElementById('repair-hint-btn');
  hintBtn.style.display='none';hintBtn.style.opacity='1';hintBtn.style.cursor='pointer';
  hintBtn.textContent='\uD83D\uDCA1 \u30D2\u30F3\u30C8';hintBtn._revealed=false;
  document.getElementById('cm-hint').style.display='';
  var closeBtn=document.getElementById('cipher-close-btn');
  closeBtn.style.display='none';
  // Restore default handler for cipher close (challenge terminals use closeChallengeModal)
  closeBtn.onclick=function(){
    if(typeof closeChallengeModal==='function')closeChallengeModal();
  };
  document.getElementById('c-submit').onclick=function(){submitCipherAnswer();};
  document.getElementById('c-input').onkeydown=function(e){if(e.key==='Enter')submitCipherAnswer();};
  gameState='playing';unmuteBGM();
  battleCooldown=3;challengeCooldownEnd=Date.now()+3000;
  setTimeout(function(){canvas.requestPointerLock();},350);
}

// ── Update skill HUD lock state ──
function updateSkillsHUD(){
  var slots=document.querySelectorAll('.skill-slot');
  if(slots.length<4)return;
  var locks=[
    {idx:0,feat:'skillFire',evo:'fireEvo',icon:'\uD83D\uDD25',evoIcon:'\uD83C\uDF0B'},
    {idx:1,feat:'skillLightning',evo:'lightningEvo',icon:'\u26A1',evoIcon:'\u26A1\u26A1'},
    {idx:2,feat:'skillHeal',evo:'healEvo',icon:'\uD83D\uDC8A',evoIcon:'\uD83D\uDC9A'},
    {idx:3,feat:'minimap',evo:null,icon:'\uD83D\uDDFA\uFE0F',evoIcon:null},
  ];
  locks.forEach(function(l){
    var slot=slots[l.idx];
    var lv=features[l.feat];
    // Remove old overlays
    var old=slot.querySelector('.skill-lock-overlay');if(old)old.remove();
    var oldStar=slot.querySelector('.skill-star');if(oldStar)oldStar.remove();
    // Check evolution
    var evolved=l.evo&&features[l.evo]>0;
    if(lv<=0){
      slot.classList.add('locked');
      slot.classList.remove('unlocked');
      var ov=document.createElement('div');
      ov.className='skill-lock-overlay';
      ov.textContent='\uD83D\uDD12';
      slot.appendChild(ov);
    }else{
      slot.classList.remove('locked');
      slot.classList.add('unlocked');
      if(evolved){slot.style.borderColor='#ffaa00';slot.style.boxShadow='0 0 12px rgba(255,170,0,.5)';}
      else{slot.style.borderColor='';slot.style.boxShadow='';}
      // Update icon if evolved
      var iconEl=slot.querySelector('.skill-icon');
      if(iconEl&&evolved&&l.evoIcon)iconEl.textContent=l.evoIcon;
      else if(iconEl&&l.icon)iconEl.textContent=l.icon;
      var star=document.createElement('div');
      star.className='skill-star';
      star.textContent=evolved?'EVO':starStr(lv);
      if(evolved)star.style.color='#ffaa00';
      slot.appendChild(star);
    }
  });
}

// ── Animate repair terminals ──
function updateRepairTerminals(ts){
  for(var i=0;i<repairTerminals.length;i++){
    var rt=repairTerminals[i];
    if(rt.solved||!rt.mesh)continue;
    var dx=rt.x-player.x,dz=rt.z-player.z;
    if(dx*dx+dz*dz>400)continue;
    if(rt.mesh.children[2])rt.mesh.children[2].position.y=2.2+Math.sin(ts/1000*2)*.25;
    if(rt.mesh.children[2])rt.mesh.children[2].rotation.y+=.02;
    if(rt.mesh.children[3])rt.mesh.children[3].rotation.z+=.03;
    if(rt.mesh.children[4])rt.mesh.children[4].rotation.z-=.02; // 下のリング逆回転
    if(rt.light)rt.light.intensity=2+Math.sin(ts/500)*.8;
  }
}

// ── Save/Load ──
function saveFeatures(){localStorage.setItem('cipherDungeonFeatures',JSON.stringify(features));}
function loadFeatures(){
  var raw=localStorage.getItem('cipherDungeonFeatures');
  if(!raw)return;
  try{var d=JSON.parse(raw);for(var k in features)if(d[k]!==undefined)features[k]=d[k];}catch(e){}
}
function clearFeatures(){
  localStorage.removeItem('cipherDungeonFeatures');
  for(var k in features)features[k]=0;
}

// Prerequisites — challenge X only spawns once all features in REPAIR_REQUIRES[X]
// are unlocked (>0). Skill-attack and heal terminals are gated behind the
// physical attack feature so the order is: 物理攻撃 → 各スキル → 進化。
const REPAIR_REQUIRES={
  // Attack-boosting skills require physical attack to be unlocked first.
  skillFire:['attack'],
  skillLightning:['attack'],
  // Heal skill is fine to unlock early — players need it for survival.
  // Evolutions still require their base skill.
  fireEvo:['skillFire'],
  lightningEvo:['skillLightning'],
  healEvo:['skillHeal'],
};
function repairPrereqMet(id){
  var req=REPAIR_REQUIRES[id];
  if(!req)return true;
  for(var i=0;i<req.length;i++)if((features[req[i]]||0)<=0)return false;
  return true;
}

// ── Spawn repair terminals for current floor + carry-over from previous ──
function spawnFloorRepairTerminals(rooms){
  var floorChallenges=[];
  for(var i=0;i<REPAIR_CHALLENGES.length;i++){
    var ch=REPAIR_CHALLENGES[i];
    // Spawn if: unsolved AND this floor or earlier AND prerequisites met
    if(features[ch.id]<=0&&ch.floor<=floor&&repairPrereqMet(ch.id))floorChallenges.push(i);
  }
  if(!floorChallenges.length)return;
  // Exclude the spawn room, the cipher terminal room, and the stair (exit) room
  // so repair terminals never overlap with those critical fixtures.
  function roomContains(rm,gx,gy){return gx>=rm.x&&gx<rm.x+rm.w&&gy>=rm.y&&gy<rm.y+rm.h;}
  var available=[];
  for(var ri=1;ri<rooms.length;ri++){
    var rm=rooms[ri];
    if(roomContains(rm,dungeon.stairX,dungeon.stairY))continue;
    if(roomContains(rm,dungeon.termX,dungeon.termY))continue;
    available.push(rm);
  }
  // Fallback: if filtering left no room (very small dungeons), allow non-spawn rooms.
  if(!available.length)available=rooms.slice(1);
  for(var ci=0;ci<floorChallenges.length;ci++){
    var rmIdx=ci%available.length;
    spawnRepairTerminal(available[rmIdx],floorChallenges[ci]);
  }
}
