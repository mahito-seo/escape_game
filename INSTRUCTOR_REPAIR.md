# 修理ターミナル — 講師用ガイド

全 14 問の修理ターミナルチャレンジを 1 ページに集約。各問の **仕様・テンプレート・模範解答・期待出力・評価基準** が分かります。

> ★ ランクは **テスト通過数で自動判定**:
> - 全部通過 → ★★★（最大効果）
> - ≥66% 通過 → ★★
> - 1つでも通過 → ★（機能アンロックのみ）
> - 0 → 失敗

> **スキル威力**: 攻撃力・火炎・雷撃・回復は ★数 が威力倍率に直接効く（[0, 1×, 1.5×, 2×]）。他の機能はバイナリ（出るか出ないか）。

---

## 出現条件（Gating）

```
最初から    : mpBar / enemyName / skillHeal / itemEffect
attack 解放 : skillFire / skillLightning
基底スキル  : 対応する進化（fireEvo / lightningEvo / healEvo）
```

---

## FLOOR 1 — 基本機能

### 1. 💧 mpBar（calc_mp_percent）— EASY / XP 40

| | |
|---|---|
| 関数 | `calc_mp_percent(mp, max_mp)` |
| 仕様 | mp が max_mp の何%か、整数で返す |
| 期待出力 | `(30, 50)→60` / `(0, 100)→0` / `(100, 100)→100` |

**模範解答**
```python
def calc_mp_percent(mp, max_mp):
    return int(mp / max_mp * 100)
```

**解説**: 割合 = `mp / max_mp`、それを×100して`int()`で切り捨て。

---

### 2. 👹 enemyName（decode_name）— EASY / XP 50

| | |
|---|---|
| 関数 | `decode_name(codes)` |
| 仕様 | ASCII コードのリストを文字列に変換して連結 |
| 期待出力 | `[71,111,98,108,105,110]→"Goblin"` / `[79,114,99]→"Orc"` / `[68,101,109,111,110]→"Demon"` |

**模範解答**
```python
def decode_name(codes):
    result = ""
    for c in codes:
        result += chr(c)
    return result
```

**解説**: `chr(数値)` で ASCII → 1文字。蓄積パターンの典型例。

---

## FLOOR 2 — アイテム強化・戦闘設計

### 3. 🧪 itemEffect（calc_heal）— NORMAL / XP 60

| | |
|---|---|
| 関数 | `calc_heal(hp, max_hp, amount)` |
| 仕様 | hp + amount を返す（max_hp を超える場合は max_hp で頭打ち） |
| 期待出力 | `(70,100,50)→100` / `(90,100,5)→95` / `(50,100,30)→80` |

**模範解答**
```python
def calc_heal(hp, max_hp, amount):
    return min(hp + amount, max_hp)
```

**解説**: 「クランプ」の定番。`min(計算値, 上限)`。

---

### 4. 💊 skillHeal（calc_heal_skill）— NORMAL / XP 80 ⭐ スキル威力

| | |
|---|---|
| 関数 | `calc_heal_skill(max_hp, level)` |
| 仕様 | max_hp の一定割合 + レベルボーナス（整数） |
| 期待出力 | `(100,1)→25` / `(100,5)→45` / `(500,1)→105` |

**模範解答**
```python
def calc_heal_skill(max_hp, level):
    return max_hp // 5 + level * 5
```

**解説**:
- `max_hp // 5` は max の 20%。`int(max_hp / 5)` でも可
- `level * 5` でレベル毎に +5 ボーナス
- 検算: (100, 1) = 20 + 5 = 25 ✓

**★** ごとの効果: 20%回復 / 30%回復 / 40%回復

---

### 5. 🔥 skillFire（calc_fire_damage）— NORMAL / XP 80 ⭐ スキル威力

| | |
|---|---|
| 関数 | `calc_fire_damage(base_damage, level, floor_num)` |
| 仕様 | base_damage を level と floor_num で増幅。(1,1) で素のまま、base=0 なら 0 |
| 期待出力 | `(35,1,1)→35` / `(35,5,1)→175` / `(35,1,5)→175` / `(0,5,5)→0` |

**模範解答**
```python
def calc_fire_damage(base_damage, level, floor_num):
    return base_damage * level * floor_num
```

**解説**: 3 引数全部を素直に掛けるだけ。base=0 のテストが「base_damage を必ず使う」ことを保証。

**★** ごとの効果: 火炎(弱) / 火炎(中) / 火炎(強)

---

## FLOOR 3 — 戦闘の核

### 6. ⚔️ attack（calc_damage）— NORMAL / XP 70 ⭐ 物理攻撃の威力

| | |
|---|---|
| 関数 | `calc_damage(attack, defense, streak, level)` |
| 仕様 | base = max(攻撃−防御, 1)、bonus = streak と level の重み付き和 |
| 期待出力 | `(25,10,0,1)→15` / `(5,20,0,1)→1` / `(30,10,5,1)→40` / `(30,10,0,5)→40` |

**模範解答**
```python
def calc_damage(attack, defense, streak, level):
    base = max(attack - defense, 1)
    bonus = streak * 4 + (level - 1) * 5
    return base + bonus
```

**解説**:
- `max(..., 1)` で攻撃≤防御でも最低 1 ダメージ保証
- `(level - 1)` にしているのは、level=1 のとき bonus を 0 にしてテスト1の `15` をぴったり出すため
- 検算: (30,10,5,1) = 20 + 20 + 0 = 40 ✓

**★** ごとの効果: 1.0倍 / 1.5倍 / 2.0倍

---

### 7. 🗺️ minimap（calc_map_pixel）— NORMAL / XP 80

| | |
|---|---|
| 関数 | `calc_map_pixel(pos, tile_size, cells, display)` |
| 仕様 | ワールド座標を表示ピクセル座標に線形変換 |
| 期待出力 | `(24.0,2.0,40,120)→36` / `(0.0,2.0,40,120)→0` / `(80.0,2.0,40,120)→120` |

**模範解答**
```python
def calc_map_pixel(pos, tile_size, cells, display):
    return pos / (tile_size * cells) * display
```

**解説**: 「値 ÷ 元範囲 × 目標範囲」のスケール変換。`24/(2*40)*120 = 0.3*120 = 36`。

---

### 8. ⚡ skillLightning（calc_lightning）— HARD / XP 100 ⭐ スキル威力

| | |
|---|---|
| 関数 | `calc_lightning(damages, level)` |
| 仕様 | damages の最大値 + level ボーナス |
| 期待出力 | `([55,20,80,35],1)→100` / `([55,20,80,35],5)→180` / `([10],1)→30` |

**模範解答**
```python
def calc_lightning(damages, level):
    return max(damages) + level * 20
```

**解説**: `max(リスト)` で最大値、ボーナスは `level * 20`。

**★** ごとの効果: 雷撃(弱) / 雷撃(中) / 雷撃(強)

---

### 9. ⬆️ levelUp（calc_level）— HARD / XP 100

| | |
|---|---|
| 関数 | `calc_level(total_xp, base_threshold)` |
| 仕様 | xp が threshold 以上の間レベルアップ。threshold は毎回 1.5 倍 |
| 期待出力 | `(250,100)→3` / `(50,100)→1` / `(0,100)→1` |

**テンプレート（骨格が用意済み、3つの空欄を埋めるだけ）**
```python
def calc_level(total_xp, base_threshold):
    level = 1
    xp = total_xp
    threshold = base_threshold
    while xp >= threshold:
        xp = xp - _____           # ← threshold
        level = level + _____     # ← 1
        threshold = int(threshold * _____)   # ← 1.5
    return level
```

| 空欄 | 答え |
|---|---|
| 1つめ | `threshold` |
| 2つめ | `1` |
| 3つめ | `1.5` |

**トレース**: `total_xp=250, base=100`
| 状態 | level | xp | threshold |
|---|---|---|---|
| 初期 | 1 | 250 | 100 |
| 1回目 | 2 | 150 | 150 |
| 2回目 | 3 | 0 | 225 |
| 結果 | **3** | | |

---

## FLOOR 4 — メタ機能・進化

### 10. 💎 itemDrop（get_drop_item）— HARD / XP 100

| | |
|---|---|
| 関数 | `get_drop_item(roll)` |
| 仕様 | `roll<25→"hp"` / `25≤roll<50→"mp"` / `50≤roll→"xp"` |
| 期待出力 | `15→"hp"` / `42→"mp"` / `75→"xp"` |

**模範解答**
```python
def get_drop_item(roll):
    if roll < 25:
        return "hp"
    elif roll < 50:
        return "mp"
    else:
        return "xp"
```

**解説**: 上から順に評価される `if/elif/else` の典型。25未満=25%、25〜49=25%、50以上=50% で合計 75% のドロップ率。

---

### 11. 🏆 scoreCalc（calc_score）— HARD / XP 120

| | |
|---|---|
| 関数 | `calc_score(level, kills, streak)` |
| 仕様 | level×35 + kills×8 + streak×12 |
| 期待出力 | `(5,12,8)→367` / `(1,0,0)→35` / `(10,50,20)→990` |

**模範解答**
```python
def calc_score(level, kills, streak):
    return level * 35 + kills * 8 + streak * 12
```

**解説**: 仕様通りの重み付き和。係数は期待出力から逆算可能 — `(1,0,0)→35` から level の係数=35、残りはほかの式から連立で。

---

### 12. 🌋 fireEvo（calc_explosion）— HARD / XP 120

| | |
|---|---|
| 関数 | `calc_explosion(enemies, center_x, center_y, radius, base_dmg)` |
| 仕様 | 中心からの距離で線形にダメージ減衰。半径外は 0 |
| 期待出力（例） | `([[0,0],[3,0],[10,0]], 0, 0, 5, 100) → [100, 40, 0]` |

**模範解答**
```python
def calc_explosion(enemies, center_x, center_y, radius, base_dmg):
    results = []
    for e in enemies:
        dx = e[0] - center_x
        dy = e[1] - center_y
        dist = (dx ** 2 + dy ** 2) ** 0.5
        if dist <= radius:
            dmg = int(base_dmg * (1 - dist / radius))
            results.append(dmg)
        else:
            results.append(0)
    return results
```

**解説**:
- 距離公式: `(dx² + dy²) ** 0.5` で平方根
- 減衰: `1 - dist/radius` を base に掛けると、中心で 1.0、端で 0
- 検算 1: `(0,0)→100`, `(3,0)→100*(1-3/5)=40`, `(10,0)→範囲外で0`

---

### 13. ⚡⚡ lightningEvo（calc_chain）— HARD / XP 120

| | |
|---|---|
| 関数 | `calc_chain(base_dmg, chain_count, decay)` |
| 仕様 | base_dmg から始め、毎回 decay 倍に減衰させて chain_count 個のリストを返す |
| 期待出力 | `(100,3,0.7)→[100,70,49]` / `(80,4,0.5)→[80,40,20,10]` / `(50,1,0.7)→[50]` |

**模範解答**
```python
def calc_chain(base_dmg, chain_count, decay):
    damages = []
    current = base_dmg
    for i in range(chain_count):
        damages.append(int(current))
        current = current * decay
    return damages
```

**解説**:
- `append` を先にやってから `decay` を掛けるのがポイント（最初に base_dmg がそのまま入る）
- `current` は float のまま保持して、append 時にだけ int 化する（精度落ちを防ぐ）

---

### 14. 💚 healEvo（calc_regen）— HARD / XP 120

| | |
|---|---|
| 関数 | `calc_regen(hp, max_hp, heal_per_turn, turns)` |
| 仕様 | turns 回ループ。毎ターン heal_per_turn 回復、max_hp で頭打ち。総回復量を返す |
| 期待出力 | `(80,100,10,5)→20` / `(95,100,10,5)→5` / `(50,200,20,3)→60` |

**模範解答**
```python
def calc_regen(hp, max_hp, heal_per_turn, turns):
    total_healed = 0
    for i in range(turns):
        heal = min(heal_per_turn, max_hp - hp)
        total_healed += heal
        hp += heal
    return total_healed
```

**解説**:
- 各ターンの回復は `min(heal_per_turn, 残り余裕)`
- `max_hp - hp` で「あとどれだけ回復できるか」を計算
- 早期に max に達するとそこから先は 0 回復

---

## 全14問 早見表

| # | ID | 関数 | フロア | 難易度 | キー技 |
|---|---|---|---|---|---|
| 1 | mpBar | calc_mp_percent | **1** | EASY | 割合計算 |
| 2 | enemyName | decode_name | **1** | EASY | `chr` / 蓄積ループ |
| 3 | skillHeal | calc_heal_skill | **1** | NORMAL | 割合 + level |
| 4 | itemEffect | calc_heal | **2** | NORMAL | `min` クランプ |
| 5 | attack | calc_damage | **2** | NORMAL | `max(a-d, 1)` + 重み |
| 6 | skillFire | calc_fire_damage | **2** | NORMAL | base × level × floor |
| 7 | minimap | calc_map_pixel | **3** | NORMAL | 線形変換 |
| 8 | skillLightning | calc_lightning | **3** | HARD | `max(リスト)` + bonus |
| 9 | levelUp | calc_level | **3** | HARD | `while` + 1.5倍 |
| 10 | itemDrop | get_drop_item | **4** | HARD | `if/elif/else` |
| 11 | scoreCalc | calc_score | **4** | HARD | 重み付き和 |
| 12 | fireEvo | calc_explosion | **4** | HARD | 距離公式 + 範囲 |
| 13 | lightningEvo | calc_chain | **4** | HARD | 等比減衰 |
| 14 | healEvo | calc_regen | **4** | HARD | `min` + 累積 |

> 配置: Floor 1=3 / Floor 2=3 / Floor 3=3 / Floor 4=5。Floor 4 は進化系 3 つを含むので少し多め。

---

## 頻出パターン（学習目標）

1. **クランプ** — `min(a, b)` で上限、`max(a, b)` で下限（#3 / #6 / #14）
2. **蓄積ループ** — `+=` で積み上げ（#2 / #14）
3. **マップ変換** — `append` で新リストを作る（#12 / #13）
4. **ゼロスタート bonus** — `(level - 1) * X` で level=1 のとき 0 にする（#4 / #6）
5. **線形変換** — `値 / 元範囲 × 目標範囲`（#1 / #7）
6. **範囲分岐** — `if/elif/else` で連続範囲を振り分け（#10）
7. **距離計算** — `(dx² + dy²) ** 0.5`（#12）
