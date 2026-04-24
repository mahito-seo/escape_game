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
'【故障】MPバーが壊れて表示されない！\n\n'+
'calc_mp_percent 関数を完成させよ。\n'+
'MPの残り割合(%)を計算して返す。\n\n'+
'修理するとMPバーが表示され、スキルが使えるようになる。',
   hint:'',
   hintDetail:'/ (割り算) / * (掛け算) / int()',
   template:
'def calc_mp_percent(mp, max_mp):\n'+
'    # MPの割合(%)を整数で返せ\n'+
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
     return numClose(L[0],60)&&numClose(L[1],0)&&numClose(L[2],100)?3:0;
   },
   effectDesc:['','','','MPバーが表示される'],
   unlockMsg:'\uD83D\uDCA7 MPバーが復活した！'},

  {id:'enemyName',name:'敵識別システム修理',icon:'\uD83D\uDC79',floor:1,
   color:0xaa44ff,emissive:0x6622cc,diff:'EASY',xp:50,
   mission:
'【故障】敵の名前もHPも「???」で見えない！\n\n'+
'decode_name 関数を完成させよ。\n'+
'ASCIIコードのリストを文字列に変換する。\n\n'+
'修理すると敵の名前とHP残量が表示されるようになる。',
   hint:'',
   hintDetail:'chr() / for / +=',
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
     return L[0]==='Goblin'&&L[1]==='Orc'&&L[2]==='Demon'?3:0;
   },
   effectDesc:['','','','敵の名前とHPが見える'],
   unlockMsg:'\uD83D\uDC79 敵識別システムが復活した！'},

  {id:'itemEffect',name:'アイテム効果ブースト',icon:'\uD83E\uDDEA',floor:2,
   color:0x44ff88,emissive:0x00aa44,diff:'NORMAL',xp:60,
   mission:
'【強化】アイテムの回復効果を強化せよ！\n\n'+
'calc_heal 関数を完成させよ。\n'+
'回復後HPがmax_hpを超えないように！\n\n'+
'修理するとアイテムの回復量がアップする。',
   hint:'',
   hintDetail:'min() / + ',
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
     return numClose(L[0],100)&&numClose(L[1],95)&&numClose(L[2],80)?3:0;
   },
   effectDesc:['','','','アイテム回復量 1.5倍！'],
   unlockMsg:'\uD83E\uDDEA アイテム効果がブーストされた！'},

  // ══════ FLOOR 2: 戦闘強化（コードで強さが変わる！）══════
  {id:'attack',name:'攻撃力ブーストを設計せよ',icon:'\u2694\uFE0F',floor:3,
   color:0xff8844,emissive:0xff4400,diff:'NORMAL',xp:70,
   mission:
'【強化】バトルの攻撃力をブーストせよ！\n\n'+
'calc_damage 関数を完成させよ。\n'+
'※ テスト3はボーナステスト！\n'+
'streak や level を活用すれば高得点 → 強い攻撃倍率に！\n\n'+
'\u2605\u2606\u2606  20未満  → 攻撃力 1.0倍（変化なし）\n'+
'\u2605\u2605\u2606  20〜49 → 攻撃力 1.5倍\n'+
'\u2605\u2605\u2605  50以上  → 攻撃力 2.0倍！',
   hint:'',
   hintDetail:'max() / - / * ',
   template:
'def calc_damage(attack, defense, streak, level):\n'+
'    # ダメージを計算して返せ（最低1）\n'+
'    # streak, level を使えばボーナスダメージ！\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    \n'+
'    return 0\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_damage(25, 10, 0, 1))   # 基本: 15が正解\n'+
'print(calc_damage(5, 20, 0, 1))    # 防御>攻撃でも最低1\n'+
'print(calc_damage(30, 10, 5, 3))   # ★ボーナステスト！高いほど強い\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var v1=parseFloat(L[0]),v2=parseFloat(L[1]),v3=parseFloat(L[2]);
     if(isNaN(v1)||isNaN(v2)||isNaN(v3))return 0;
     if(!numClose(v1,15))return 0; // Basic must be exact
     if(v2<1)return 0;             // Min damage
     // Power based on bonus test
     if(v3>=50)return 3;
     if(v3>=20)return 2;
     return 1;
   },
   effectDesc:['','攻撃力 1.0倍','攻撃力 1.5倍','攻撃力 2.0倍！'],
   unlockMsg:'\u2694\uFE0F 攻撃システムが復活した！'},

  {id:'skillFire',name:'火炎スキルを設計せよ',icon:'\uD83D\uDD25',floor:2,
   color:0xff6600,emissive:0xff3300,diff:'NORMAL',xp:80,
   mission:
'【故障】火炎スキルが壊れている！\n\n'+
'calc_fire_damage 関数を完成させよ。\n'+
'※ テスト2はボーナステスト！\n'+
'level や floor を活用して高ダメージを狙え！\n\n'+
'\u2605\u2606\u2606  50未満  → 火炎(弱)\n'+
'\u2605\u2605\u2606  50〜99 → 火炎(中)\n'+
'\u2605\u2605\u2605  100以上 → 火炎(強)',
   hint:'',
   hintDetail:'* / + / level / floor_num',
   template:
'def calc_fire_damage(base_damage, level, floor_num):\n'+
'    # 火炎ダメージを計算して返せ\n'+
'    # level, floor_num で強化できる！\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    \n'+
'    return 0\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_fire_damage(35, 1, 1))    # 基本: 35が正解\n'+
'print(calc_fire_damage(35, 3, 2))    # ★ボーナス！高いほど強い\n'+
'print(calc_fire_damage(0, 5, 5))     # 基礎0なら0\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var v1=parseFloat(L[0]),v2=parseFloat(L[1]),v3=parseFloat(L[2]);
     if(isNaN(v1)||isNaN(v2)||isNaN(v3))return 0;
     if(!numClose(v1,35))return 0;
     if(!numClose(v3,0))return 0;
     if(v2>=100)return 3;
     if(v2>=50)return 2;
     return 1;
   },
   effectDesc:['','\uD83D\uDD25火炎(弱)','\uD83D\uDD25火炎(中)','\uD83D\uDD25火炎(強)！'],
   unlockMsg:'\uD83D\uDD25 火炎スキルが復活した！'},

  {id:'skillHeal',name:'回復スキルを設計せよ',icon:'\uD83D\uDC8A',floor:1,
   color:0x88ff88,emissive:0x44aa44,diff:'NORMAL',xp:80,
   mission:
'【故障】回復スキルが壊れている！\n\n'+
'calc_heal_skill 関数を完成させよ。\n'+
'※ テスト2はボーナステスト！\n'+
'levelを活用して回復量UP！\n\n'+
'\u2605\u2606\u2606  40未満  → HP 20%回復\n'+
'\u2605\u2605\u2606  40〜69 → HP 30%回復\n'+
'\u2605\u2605\u2605  70以上  → HP 40%回復',
   hint:'',
   hintDetail:'int() / * / level',
   template:
'def calc_heal_skill(max_hp, level):\n'+
'    # 回復量を整数で返せ\n'+
'    # levelが高いほど多く回復させよう！\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    \n'+
'    return 0\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_heal_skill(100, 1))    # 基本: 20〜100の範囲\n'+
'print(calc_heal_skill(100, 5))    # ★ボーナス！高いほど強い\n'+
'print(calc_heal_skill(200, 3))    # 大きいHP\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var v1=parseFloat(L[0]),v2=parseFloat(L[1]),v3=parseFloat(L[2]);
     if(isNaN(v1)||isNaN(v2)||isNaN(v3))return 0;
     if(v1<10||v1>150)return 0; // Sanity check
     if(v3<10)return 0;
     if(v2>=70)return 3;
     if(v2>=40)return 2;
     return 1;
   },
   effectDesc:['','HP 20%回復','HP 30%回復','HP 40%回復！'],
   unlockMsg:'\uD83D\uDC8A 回復スキルが復活した！'},

  // ══════ FLOOR 3: 探索・成長 ══════
  {id:'minimap',name:'ミニマップ修理',icon:'\uD83D\uDDFA\uFE0F',floor:3,
   color:0x44aaff,emissive:0x0066cc,diff:'NORMAL',xp:80,
   mission:
'【故障】ミニマップが壊れている！\n\n'+
'calc_map_pixel 関数を完成させよ。\n'+
'3D座標をマップ上のピクセル座標に変換する。',
   hint:'',
   hintDetail:'/ (割り算) / * (掛け算)',
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
     return numClose(L[0],36)&&numClose(L[1],0)&&numClose(L[2],120)?3:0;
   },
   effectDesc:['','','','マップが正確に表示される'],
   unlockMsg:'\uD83D\uDDFA\uFE0F ミニマップが復活した！'},

  {id:'skillLightning',name:'雷撃スキルを設計せよ',icon:'\u26A1',floor:3,
   color:0x8888ff,emissive:0x4444ff,diff:'HARD',xp:100,
   mission:
'【故障】雷撃スキルが壊れている！\n\n'+
'calc_lightning 関数を完成させよ。\n'+
'ダメージリストの最大値を見つけて返す。\n'+
'※ テスト2はボーナス！levelを活用して高得点を狙え！\n\n'+
'\u2605\u2606\u2606  100未満  → 雷撃(弱)\n'+
'\u2605\u2605\u2606  100〜149 → 雷撃(中)\n'+
'\u2605\u2605\u2605  150以上  → 雷撃(強)',
   hint:'',
   hintDetail:'max() / + / level',
   template:
'def calc_lightning(damages, level):\n'+
'    # ダメージリストの最大値 + レベルボーナスを返せ\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    \n'+
'    return 0\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_lightning([55, 20, 80, 35], 1))    # 基本: 80\n'+
'print(calc_lightning([55, 20, 80, 35], 5))    # ★ボーナス！\n'+
'print(calc_lightning([10], 1))                 # 単一要素\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     var v1=parseFloat(L[0]),v2=parseFloat(L[1]),v3=parseFloat(L[2]);
     if(isNaN(v1)||isNaN(v2)||isNaN(v3))return 0;
     if(v1<80)return 0;
     if(v3<10)return 0;
     if(v2>=150)return 3;
     if(v2>=100)return 2;
     return 1;
   },
   effectDesc:['','\u26A1雷撃(弱)','\u26A1雷撃(中)','\u26A1雷撃(強)！'],
   unlockMsg:'\u26A1 雷撃スキルが復活した！'},

  {id:'levelUp',name:'レベルアップ強化',icon:'\u2B06\uFE0F',floor:3,
   color:0xffdd00,emissive:0xaa8800,diff:'HARD',xp:100,
   mission:
'【強化】レベルアップ時のステータス上昇量を強化せよ！\n\n'+
'calc_level 関数を完成させよ。\n'+
'XPが閾値以上ある限りレベルアップし、\n閾値は毎回1.5倍になる。\n\n'+
'修理するとレベルアップ時のHP/MP/攻撃力の上昇量がアップ。',
   hint:'',
   hintDetail:'while / >= / -= / int() / * 1.5',
   template:
'def calc_level(total_xp, base_threshold):\n'+
'    # total_xpからレベルを計算して返せ\n'+
'    # 閾値はレベルアップごとに1.5倍\n'+
'    level = 1\n'+
'    xp = total_xp\n'+
'    threshold = base_threshold\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    \n'+
'    # =========================================\n'+
'    return level\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_level(250, 100))\n'+
'print(calc_level(50, 100))\n'+
'print(calc_level(0, 100))\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     return numClose(L[0],3)&&numClose(L[1],1)&&numClose(L[2],1)?3:0;
   },
   effectDesc:['','','','Lvアップ時 HP+30/MP+15/攻撃+10！'],
   unlockMsg:'\u2B06\uFE0F レベルアップが強化された！'},

  // ══════ FLOOR 4: メタ機能 ══════
  {id:'itemDrop',name:'ドロップ率ブースト',icon:'\uD83D\uDC8E',floor:4,
   color:0xff88ff,emissive:0xaa44aa,diff:'HARD',xp:100,
   mission:
'【強化】敵撃破時のアイテムドロップ率を上げよ！\n\n'+
'get_drop_item 関数を完成させよ。\n'+
'roll値(0-99)に応じてアイテムを振り分ける。\n\n'+
'修理するとドロップ率が40%→75%にアップ！',
   hint:'',
   hintDetail:'if / elif / else / < (比較)',
   template:
'def get_drop_item(roll):\n'+
'    # roll(0-99)に応じてアイテム種類を返せ\n'+
'    # "hp", "mp", "xp" のどれかを返す\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    \n'+
'    return ""\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(get_drop_item(15))\n'+
'print(get_drop_item(42))\n'+
'print(get_drop_item(75))\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     return L[0]==='hp'&&L[1]==='mp'&&L[2]==='xp'?3:0;
   },
   effectDesc:['','','','ドロップ率 75%！'],
   unlockMsg:'\uD83D\uDC8E ドロップ率がブーストされた！'},

  {id:'scoreCalc',name:'スコア計算を実装せよ',icon:'\uD83C\uDFC6',floor:4,
   color:0xffdd44,emissive:0xccaa00,diff:'HARD',xp:120,
   mission:
'【強化】クリア時のスコア＆ランク表示を有効にせよ！\n\n'+
'calc_score 関数を完成させよ。\n'+
'スコア = level×35 + kills×8 + streak×12\n\n'+
'修理するとクリア画面で詳細スコアとランクが表示される。',
   hint:'',
   hintDetail:'* (掛け算) / + (足し算)',
   template:
'def calc_score(level, kills, streak):\n'+
'    # 3つの要素からスコアを計算して返せ\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    \n'+
'    return 0\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_score(5, 12, 8))\n'+
'print(calc_score(1, 0, 0))\n'+
'print(calc_score(10, 50, 20))\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     return numClose(L[0],367)&&numClose(L[1],35)&&numClose(L[2],990)?3:0;
   },
   effectDesc:['','','','スコア＋ランク詳細表示！'],
   unlockMsg:'\uD83C\uDFC6 スコア計算が有効になった！'},

  // ══════ FLOOR 4: スキル進化 ══════
  {id:'fireEvo',name:'火球 → 爆裂火球に進化',icon:'\uD83C\uDF0B',floor:4,
   color:0xff2200,emissive:0xcc0000,diff:'HARD',xp:120,
   mission:
'【進化】火球スキルを「爆裂火球」に進化させよ！\n\n'+
'calc_explosion 関数を完成させよ。\n'+
'着弾点から半径内の全ての敵にダメージを与える。\n\n'+
'進化後: 火球が着弾時に爆発し、範囲ダメージ！',
   hint:'',
   hintDetail:'for / ** (二乗) / ** 0.5 (平方根) / append() / if',
   template:
'def calc_explosion(enemies, center_x, center_y, radius, base_dmg):\n'+
'    # 爆発の範囲ダメージを計算せよ\n'+
'    # enemies: [[x, y], ...] 敵の座標リスト\n'+
'    # center_x, center_y: 爆発の中心\n'+
'    # radius: 爆発の半径\n'+
'    # base_dmg: 基礎ダメージ\n'+
'    # 戻り値: 各敵へのダメージのリスト\n'+
'    #   半径内→ダメージ、半径外→ 0\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    results = []\n'+
'    \n'+
'    return results\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_explosion([[0,0],[3,0],[10,0]], 0, 0, 5, 100))\n'+
'print(calc_explosion([[1,1]], 0, 0, 2, 50))\n'+
'print(calc_explosion([[10,10]], 0, 0, 3, 80))\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     // Test 1: [0,0]=hit(100), [3,0]=hit(>0), [10,0]=miss(0)
     try{
       var r1=JSON.parse(L[0].replace(/'/g,'"'));
       if(!Array.isArray(r1)||r1.length!==3)return 0;
       if(r1[0]<80||r1[2]!==0)return 0;
       // Test 2: [1,1] within radius 2 → hit
       var r2=JSON.parse(L[1].replace(/'/g,'"'));
       if(!Array.isArray(r2)||r2.length!==1||r2[0]<=0)return 0;
       // Test 3: [10,10] outside radius 3 → 0
       var r3=JSON.parse(L[2].replace(/'/g,'"'));
       if(!Array.isArray(r3)||r3.length!==1||r3[0]!==0)return 0;
       // Star based on distance-scaling
       if(r1[1]>0&&r1[1]<r1[0])return 3; // Distance-scaled damage
       return 3;
     }catch(e){return 0;}
   },
   effectDesc:['','','','\uD83C\uDF0B 爆裂火球！着弾時に範囲爆発！'],
   unlockMsg:'\uD83C\uDF0B 火球が「爆裂火球」に進化した！'},

  {id:'lightningEvo',name:'雷撃 → 連鎖雷撃に進化',icon:'\u26A1\u26A1',floor:4,
   color:0x4444ff,emissive:0x2222cc,diff:'HARD',xp:120,
   mission:
'【進化】雷撃スキルを「連鎖雷撃」に進化させよ！\n\n'+
'calc_chain 関数を完成させよ。\n'+
'最初の敵に当たった後、近くの敵に連鎖する。\n'+
'連鎖するたびにダメージは70%に減衰する。\n\n'+
'進化後: 雷撃が敵から敵へ3回まで連鎖！',
   hint:'',
   hintDetail:'for / range() / int() / * decay / append()',
   template:
'def calc_chain(base_dmg, chain_count, decay):\n'+
'    # 連鎖ダメージのリストを返せ\n'+
'    # base_dmg: 最初のダメージ\n'+
'    # chain_count: 連鎖回数（最初の1発含む）\n'+
'    # decay: 減衰率（0.7 = 70%に減衰）\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    damages = []\n'+
'    \n'+
'    return damages\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_chain(100, 3, 0.7))\n'+
'print(calc_chain(80, 4, 0.5))\n'+
'print(calc_chain(50, 1, 0.7))\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     try{
       var r1=JSON.parse(L[0].replace(/'/g,'"'));
       // [100, 70, 49]
       if(!Array.isArray(r1)||r1.length!==3)return 0;
       if(r1[0]!==100)return 0;
       if(Math.abs(r1[1]-70)>1)return 0;
       if(Math.abs(r1[2]-49)>1)return 0;
       var r2=JSON.parse(L[1].replace(/'/g,'"'));
       // [80, 40, 20, 10]
       if(!Array.isArray(r2)||r2.length!==4)return 0;
       if(r2[0]!==80)return 0;
       var r3=JSON.parse(L[2].replace(/'/g,'"'));
       // [50]
       if(!Array.isArray(r3)||r3.length!==1||r3[0]!==50)return 0;
       return 3;
     }catch(e){return 0;}
   },
   effectDesc:['','','','\u26A1\u26A1 連鎖雷撃！敵から敵へ3回連鎖！'],
   unlockMsg:'\u26A1\u26A1 雷撃が「連鎖雷撃」に進化した！'},

  {id:'healEvo',name:'回復 → リジェネに進化',icon:'\uD83D\uDC9A',floor:4,
   color:0x22ff88,emissive:0x11aa44,diff:'HARD',xp:120,
   mission:
'【進化】回復スキルを「リジェネ」に進化させよ！\n\n'+
'calc_regen 関数を完成させよ。\n'+
'一度に全回復ではなく、毎ターン少しずつ回復する。\n'+
'合計回復量を計算せよ。\n\n'+
'進化後: 回復スキルが持続回復（5ターンHP回復）に！',
   hint:'',
   hintDetail:'for / range() / min() / += ',
   template:
'def calc_regen(hp, max_hp, heal_per_turn, turns):\n'+
'    # リジェネの合計回復量を返せ\n'+
'    # hp: 現在HP\n'+
'    # max_hp: 最大HP\n'+
'    # heal_per_turn: 1ターンあたりの回復量\n'+
'    # turns: 持続ターン数\n'+
'    # ===== この中を自由に書き換えよう！ =====\n'+
'    total_healed = 0\n'+
'    \n'+
'    return total_healed\n'+
'    # =========================================\n'+
'\n'+
'# ▼▼▼ テスト（変更禁止！）▼▼▼\n'+
'print(calc_regen(80, 100, 10, 5))\n'+
'print(calc_regen(95, 100, 10, 5))\n'+
'print(calc_regen(50, 200, 20, 3))\n',
   evaluate:function(out){
     var L=out.trim().split('\n');if(L.length<3)return 0;
     // Test 1: hp=80, max=100, 10/turn, 5turns → heals 20 (capped at max)
     // Test 2: hp=95, max=100, 10/turn, 5turns → heals 5 (capped at max)
     // Test 3: hp=50, max=200, 20/turn, 3turns → heals 60
     var v1=parseFloat(L[0]),v2=parseFloat(L[1]),v3=parseFloat(L[2]);
     if(isNaN(v1)||isNaN(v2)||isNaN(v3))return 0;
     if(numClose(v1,20)&&numClose(v2,5)&&numClose(v3,60))return 3;
     return 0;
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
  var ox=(Math.random()-.5)*rm.w*.3*TILE;
  var oz=(Math.random()-.5)*rm.h*.3*TILE;
  var px=cx+ox,pz=cz+oz;
  if(isWall(px,pz)){px=cx;pz=cz;}
  var tg=new THREE.Group();
  var base=new THREE.Mesh(new THREE.CylinderGeometry(.45,.55,.15,6),
    new THREE.MeshStandardMaterial({color:ch.color,emissive:ch.emissive,emissiveIntensity:.5,metalness:.4}));
  base.position.y=.08;tg.add(base);
  var screen=new THREE.Mesh(new THREE.BoxGeometry(.65,.95,.08),
    new THREE.MeshStandardMaterial({color:0x1a1a1a,emissive:ch.color,emissiveIntensity:1.5,transparent:true,opacity:.85}));
  screen.position.y=.65;tg.add(screen);
  var indicator=new THREE.Mesh(new THREE.OctahedronGeometry(.12,0),
    new THREE.MeshStandardMaterial({color:ch.color,emissive:ch.emissive,emissiveIntensity:3,transparent:true,opacity:.8}));
  indicator.position.y=1.3;tg.add(indicator);
  var ring=new THREE.Mesh(new THREE.TorusGeometry(.2,.04,4,8),
    new THREE.MeshStandardMaterial({color:ch.color,emissive:ch.emissive,emissiveIntensity:2,transparent:true,opacity:.6}));
  ring.position.y=1.0;ring.rotation.x=Math.PI/2;tg.add(ring);
  var glow=new THREE.Mesh(new THREE.SphereGeometry(.5,8,8),
    new THREE.MeshStandardMaterial({color:ch.color,emissive:ch.emissive,emissiveIntensity:2,transparent:true,opacity:.12}));
  glow.position.y=.7;tg.add(glow);
  var light=new THREE.PointLight(ch.color,2,8);
  light.position.set(px,1.5,pz);scene.add(light);
  tg.position.set(px,0,pz);scene.add(tg);
  repairTerminals.push({mesh:tg,light:light,x:px,z:pz,challenge:ch,challengeIdx:challengeIdx,solved:false});
  decoBlocks.push({x:px,z:pz,r:.5});
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
  document.getElementById('cm-input-row').style.display='none';
  document.getElementById('c-result').style.display='none';
  document.getElementById('c-continue-btn').style.display='none';
  document.getElementById('secret-reveal').classList.remove('show');
  document.getElementById('agent-phase').classList.remove('show');
  // FIX: set close button to call closeRepairModal, not closeChallengeModal
  var closeBtn=document.getElementById('cipher-close-btn');
  closeBtn.style.display='inline-block';
  closeBtn.onclick=closeRepairModal;
  // Run button
  document.getElementById('code-run-btn').onclick=function(){
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
        setTimeout(function(){closeRepairModal();},3000);
      }else{
        document.getElementById('code-output').style.color='#ffaa88';
        document.getElementById('code-output').textContent=result+'\n\n\u274C \u30C6\u30B9\u30C8\u5931\u6557\u2026 \u30B3\u30FC\u30C9\u3092\u898B\u76F4\u3057\u3066\u518D\u5B9F\u884C\uFF01';
        showMessage('\u30C6\u30B9\u30C8\u5931\u6557\u2026 \u30B3\u30FC\u30C9\u3092\u4FEE\u6B63\u3057\u3066\u518D\u5B9F\u884C\uFF01','#ff8844');
      }
    }catch(e){
      document.getElementById('code-output-wrap').classList.add('show');
      document.getElementById('code-output').textContent='Error: '+e.message;
      document.getElementById('code-output').style.color='#ff6666';
    }
  };
  // Timer (10 min)
  clearInterval(cipherTimerInt);cipherTimerVal=600;
  var el=document.getElementById('cipher-timer');el.classList.remove('danger');
  var fmtT=function(s){var m=Math.floor(s/60);return m>0?m+':'+String(s%60).padStart(2,'0'):String(s);};
  el.textContent=fmtT(cipherTimerVal);
  cipherTimerInt=setInterval(function(){
    cipherTimerVal--;el.textContent=fmtT(cipherTimerVal);
    if(cipherTimerVal<=30)el.classList.add('danger');
    if(cipherTimerVal<=0){clearInterval(cipherTimerInt);closeRepairModal();showMessage('\u23F0 \u6642\u9593\u5207\u308C\u2026 \u307E\u305F\u6765\u3088\u3046','#ff8844');}
  },1000);
  document.getElementById('cipher-modal').classList.add('open');
  // Don't auto-focus editor — user clicks to start typing
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
    if(rt.mesh.children[2])rt.mesh.children[2].position.y=1.3+Math.sin(ts/1000*2)*.15;
    if(rt.mesh.children[2])rt.mesh.children[2].rotation.y+=.02;
    if(rt.mesh.children[3])rt.mesh.children[3].rotation.z+=.03;
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

// ── Spawn repair terminals for current floor + carry-over from previous ──
function spawnFloorRepairTerminals(rooms){
  var floorChallenges=[];
  for(var i=0;i<REPAIR_CHALLENGES.length;i++){
    var ch=REPAIR_CHALLENGES[i];
    // Spawn if: this floor's challenge OR unsolved from a previous floor
    if(features[ch.id]<=0&&ch.floor<=floor)floorChallenges.push(i);
  }
  if(!floorChallenges.length)return;
  var available=rooms.length>3?rooms.slice(2):rooms.slice(1);
  for(var ci=0;ci<floorChallenges.length;ci++){
    var rmIdx=ci%available.length;
    spawnRepairTerminal(available[rmIdx],floorChallenges[ci]);
  }
}
