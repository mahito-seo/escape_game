# 修理ターミナル 解答集（解説つき）

全14個の修理ターミナルチャレンジの解答（全て★★★ランク）と、なぜそのコードになるのかの解説。

---

## FLOOR 1: 基本機能

### 1. 💧 MPバー修理 (`mpBar`)

**やること**: MPの残り割合(%)を整数で返す。

```python
def calc_mp_percent(mp, max_mp):
    return int(mp / max_mp * 100)

print(calc_mp_percent(30, 50))   # 60
print(calc_mp_percent(0, 100))   # 0
print(calc_mp_percent(100, 100)) # 100
```

#### 🧠 解説 — なぜこのコード？
- 「割合(%)」とは「全体に対する比 × 100」。`30/50 = 0.6` → ×100で `60`。
- `int()` を使う理由: テストの期待値（60, 0, 100）が**整数**だから。`30/50*100` は浮動小数 `60.0` になることがあるので整数に変換しておくと安全。
- 注意: `mp / max_mp` の順番が大事。`max_mp / mp` だと比率が逆になる。
- `mp=0` のときは `0/100 = 0` で自然に0になる。`mp=max_mp` のときは `100/100 = 1` で `1*100=100`。両端のケースが特別扱い不要なところがこの式の美しさ。

---

### 2. 👹 敵識別システム修理 (`enemyName`)

**やること**: ASCIIコードのリストを文字列に変換。

```python
def decode_name(codes):
    result = ""
    for c in codes:
        result += chr(c)
    return result

print(decode_name([71, 111, 98, 108, 105, 110])) # Goblin
print(decode_name([79, 114, 99]))                # Orc
print(decode_name([68, 101, 109, 111, 110]))     # Demon
```

#### 🧠 解説 — なぜこのコード？
- `chr(数値)` は ASCIIコード番号を**1文字**に変換する組み込み関数。`chr(65)` → `"A"`、`chr(71)` → `"G"`。
- リスト `[71, 111, 98, 108, 105, 110]` をひとつずつ文字に変換して連結すると `"G"+"o"+"b"+"l"+"i"+"n"` = `"Goblin"`。
- `result = ""` で空文字列から始め、`+=` で後ろに追加していく**蓄積パターン**。
- `for c in codes:` でリストの要素を1つずつ取り出すのが Python らしい書き方（`for i in range(len(codes))` よりシンプル）。

---

### 3. 💊 回復スキルを設計せよ (`skillHeal`)

**やること**: max_hp と level から回復量を整数で返す。levelが高いほど多く回復させたい。

```python
def calc_heal_skill(max_hp, level):
    # max_hp の (20 + level*10)% を回復
    return int(max_hp * (0.2 + level * 0.1))

print(calc_heal_skill(100, 1))   # 30
print(calc_heal_skill(100, 5))   # 70  ← ★★★ボーナス
print(calc_heal_skill(200, 3))   # 100
```

#### 🧠 解説 — なぜこのコード？
- ★★★条件は **テスト2が70以上**。`max_hp=100, level=5` で 70以上を狙う必要がある。
- 「max_hp の何%か」という設計にすると HP のスケールに自動で追従する。
- 倍率を `0.2 + level*0.1` にした理由:
  - level=1 → 30% (=30)
  - level=5 → 70% (=70) ✓ ★★★
  - level=3, max_hp=200 → 50% (=100)
- もし `level*0.05` にすると level=5 で 45% になり★★★を逃すので、**係数を 0.1 まで上げて level スケールを強くする**のがポイント。

---

## FLOOR 2: 戦闘・アイテム

### 4. 🧪 アイテム効果ブースト (`itemEffect`)

**やること**: 回復後HPがmax_hpを超えないようキャップ。

```python
def calc_heal(hp, max_hp, amount):
    return min(hp + amount, max_hp)

print(calc_heal(70, 100, 50))  # 100 (70+50=120だがmax_hpでキャップ)
print(calc_heal(90, 100, 5))   # 95
print(calc_heal(50, 100, 30))  # 80
```

#### 🧠 解説 — なぜこのコード？
- 課題は「**最大値で制限する**」というよくあるゲームロジック。
- `min(a, b)` は2つのうち小さい方を返す。
  - `hp+amount = 120, max_hp = 100` → `min(120, 100)` = 100 ✓
  - `hp+amount = 95, max_hp = 100` → `min(95, 100)` = 95 ✓
- `if hp+amount > max_hp: return max_hp else: return hp+amount` でも同じだが、**1行で書ける `min()` の方が読みやすい**。
- これは「クランプ（clamp）」と呼ばれる定番パターン。下限もある場合は `max(下限, min(上限, 値))` を使う。

---

### 5. 🔥 火炎スキルを設計せよ (`skillFire`)

**やること**: base_damage, level, floor_num から火炎ダメージを計算。levelとfloorで強化。

```python
def calc_fire_damage(base_damage, level, floor_num):
    return int(base_damage * (1 + (level - 1) + (floor_num - 1)))

print(calc_fire_damage(35, 1, 1))   # 35  (基本テスト)
print(calc_fire_damage(35, 3, 2))   # 140 ← ★★★ボーナス
print(calc_fire_damage(0, 5, 5))    # 0
```

#### 🧠 解説 — なぜこのコード？
- テスト1: `(35, 1, 1)` → **35が完全一致**で必要。
- テスト3: `(0, 5, 5)` → **0が完全一致**で必要 → `base_damage` を必ず掛ける式じゃないとダメ。
- テスト2: `(35, 3, 2)` → **100以上**で★★★。
- これらを満たす形は `base_damage × 倍率` で、倍率は level=1, floor=1 のとき**1になる必要**がある。
  - `(level-1)` と `(floor_num-1)` を使えば、最小値で 0 になる
  - 倍率 = `1 + (level-1) + (floor_num-1)` = `level + floor_num - 1`
  - テスト1: `35 * 1 = 35` ✓
  - テスト2: `35 * (3 + 2 - 1) = 35 * 4 = 140` ✓ (>=100で★★★)
  - テスト3: `0 * 何か = 0` ✓
- 「テスト1とテスト3が完全一致を要求 → base_damage を掛け、レベル等の係数は0スタートにする」という制約から自然と式が決まる。

---

## FLOOR 3: 戦闘強化・探索

### 6. ⚔️ 攻撃力ブーストを設計せよ (`attack`)

**やること**: 攻撃力 - 防御力で基本ダメージを出し、streak と level でボーナス。最低1。

```python
def calc_damage(attack, defense, streak, level):
    base = max(attack - defense, 1)
    bonus = streak * 4 + (level - 1) * 5
    return base + bonus

print(calc_damage(25, 10, 0, 1))   # 15 (基本: 完全一致が必須)
print(calc_damage(5, 20, 0, 1))    # 1  (最低保証)
print(calc_damage(30, 10, 5, 3))   # 50 ← ★★★ボーナス
```

#### 🧠 解説 — なぜこのコード？
- テスト1: `(25, 10, 0, 1)` → **15が完全一致**必須。`attack-defense = 15` で streak=0, level=1 のときボーナスが0になる必要がある。
  - `streak * 4` は streak=0 で 0 ✓
  - `(level - 1) * 5` は level=1 で 0 ✓ ← `level * 5` だと 5になってしまうのでマイナス1がポイント
- テスト2: `(5, 20, 0, 1)` → 防御 > 攻撃で `5-20 = -15`。**最低1が必要**。
  - `max(attack - defense, 1)` で「もし負になったら1にする」という処理。これは MP/ダメージ系で頻出。
- テスト3: `(30, 10, 5, 3)` → ★★★条件は **50以上**。
  - base = `max(20, 1) = 20`
  - bonus = `5*4 + (3-1)*5 = 20 + 10 = 30`
  - 合計 = `50` ✓ ★★★ ぎりぎり
- 係数の選び方: streak には4、level には5（+1基準）を割り当て、テスト3で**ちょうど50**になるよう調整した。

---

### 7. 🗺️ ミニマップ修理 (`minimap`)

**やること**: 3D座標 → 表示ピクセル座標の線形変換。

```python
def calc_map_pixel(pos, tile_size, cells, display):
    return pos / (tile_size * cells) * display

print(int(calc_map_pixel(24.0, 2.0, 40, 120))) # 36
print(int(calc_map_pixel(0.0, 2.0, 40, 120)))  # 0
print(int(calc_map_pixel(80.0, 2.0, 40, 120))) # 120
```

#### 🧠 解説 — なぜこのコード？
- マップの「世界全体のサイズ」は `tile_size * cells` (1タイルの大きさ × タイル数)。例: `2.0 * 40 = 80` がワールド全幅。
- 「ワールド座標 pos が全体の何%か」を出す: `pos / (tile_size * cells)`。例: `24/80 = 0.3` (30%)。
- それを画面表示サイズ `display` (例: 120px) に掛ければ表示座標になる: `0.3 * 120 = 36` ✓
- 検証:
  - `24/(2*40)*120 = 0.3*120 = 36` ✓
  - `0/80*120 = 0` ✓
  - `80/80*120 = 1*120 = 120` ✓
- これは**スケール変換**の基本パターン。`値 / 元の範囲 * 目標範囲` で覚える。

---

### 8. ⚡ 雷撃スキルを設計せよ (`skillLightning`)

**やること**: ダメージリストの最大値 + レベルボーナス。

```python
def calc_lightning(damages, level):
    return max(damages) + level * 15

print(calc_lightning([55, 20, 80, 35], 1))  # 95
print(calc_lightning([55, 20, 80, 35], 5))  # 155 ← ★★★ボーナス
print(calc_lightning([10], 1))              # 25
```

#### 🧠 解説 — なぜこのコード？
- `max(リスト)` は最大値を返す組み込み関数。`max([55, 20, 80, 35]) = 80`。
- ★★★条件は **テスト2が150以上**。テスト1は80以上、テスト3は10以上が必要。
- レベルボーナスを掛け算で設計すると簡単:
  - `max() + level * X` の形で X を決める
  - テスト2: `80 + 5*X >= 150` → `X >= 14`
  - 余裕をもって `X = 15` に設定
- 検証:
  - テスト1: `80 + 1*15 = 95` (>=80 ✓)
  - テスト2: `80 + 5*15 = 155` (>=150 ✓ ★★★)
  - テスト3: `10 + 1*15 = 25` (>=10 ✓)

---

### 9. ⬆️ レベルアップ強化 (`levelUp`)

**やること**: XP閾値を1.5倍ずつ増やしながらレベルアップを判定。

```python
def calc_level(total_xp, base_threshold):
    level = 1
    xp = total_xp
    threshold = base_threshold
    while xp >= threshold:
        xp -= threshold
        level += 1
        threshold = int(threshold * 1.5)
    return level

print(calc_level(250, 100))  # 3
print(calc_level(50, 100))   # 1
print(calc_level(0, 100))    # 1
```

#### 🧠 解説 — なぜこのコード？
- RPGのレベル設計でよくある「**次のレベルに必要な経験値が増えていく**」ロジック。
- ループ条件 `while xp >= threshold:` は「持っているXPが現在の閾値以上ならレベルアップ可能」という意味。
- レベルアップの中身:
  1. `xp -= threshold` ← 現在レベルに必要な分を消費
  2. `level += 1` ← レベルを1上げる
  3. `threshold = int(threshold * 1.5)` ← 次の閾値を1.5倍に（intで切り捨て）
- トレース: `total_xp=250, base=100`
  | 段階 | level | xp | threshold | 判定 |
  |---|---|---|---|---|
  | 初期 | 1 | 250 | 100 | 250>=100 → 続ける |
  | 1回目 | 2 | 150 | 150 | 150>=150 → 続ける |
  | 2回目 | 3 | 0 | 225 | 0<225 → 終了 |
  | 結果 | **3** | | | ✓ |
- 注意: テスト2 `(50, 100)` は 50<100 なのでループに**1回も入らず** level=1 のまま返る。これがあるおかげで `total_xp=0` でもクラッシュしない。

---

## FLOOR 4: メタ機能・進化

### 10. 💎 ドロップ率ブースト (`itemDrop`)

**やること**: roll(0-99) を3つの範囲に振り分け。

```python
def get_drop_item(roll):
    if roll < 25:
        return "hp"
    elif roll < 50:
        return "mp"
    else:
        return "xp"

print(get_drop_item(15))  # hp  (15<25)
print(get_drop_item(42))  # mp  (42>=25, 42<50)
print(get_drop_item(75))  # xp  (75>=50)
```

#### 🧠 解説 — なぜこのコード？
- `if/elif/else` は上から順に評価され、**最初にTrueになったブロック**だけが実行される。
- `roll < 25` を最初にチェックすると、ここを通過した時点で「25以上」が確定する。だから次の `elif roll < 50` は「25 ≤ roll < 50」を意味する。
- テストから境界を逆算:
  - `15 → "hp"` → 25未満 = hp
  - `42 → "mp"` → 25〜50未満 = mp
  - `75 → "xp"` → 50以上 = xp
- `roll < 25` は **0-24**（25個 = 25%）、`roll < 50` は **25-49**（25%）、それ以外は **50-99**（50%）。「ドロップ率75%」というメッセージはこの設計から来ている。
- `else` で `return "xp"` を確実に返すので「何も返らない」というバグが出ない。

---

### 11. 🏆 スコア計算を実装せよ (`scoreCalc`)

**やること**: 3要素の重み付き和。

```python
def calc_score(level, kills, streak):
    return level * 35 + kills * 8 + streak * 12

print(calc_score(5, 12, 8))    # 367
print(calc_score(1, 0, 0))     # 35
print(calc_score(10, 50, 20))  # 990
```

#### 🧠 解説 — なぜこのコード？
- 仕様文に書いてある式 `level×35 + kills×8 + streak×12` をそのまま実装するだけ。
- 検算:
  - `(5, 12, 8)`: `5*35 + 12*8 + 8*12 = 175 + 96 + 96 = 367` ✓
  - `(1, 0, 0)`: `1*35 + 0 + 0 = 35` ✓
  - `(10, 50, 20)`: `10*35 + 50*8 + 20*12 = 350 + 400 + 240 = 990` ✓
- 注意: 引数の順番は `(level, kills, streak)`。係数は `(35, 8, 12)`。**ペアを取り違えない**。

---

### 12. 🌋 火球 → 爆裂火球に進化 (`fireEvo`)

**やること**: 中心からの距離に応じた範囲ダメージ。半径外は0。

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

print(calc_explosion([[0,0],[3,0],[10,0]], 0, 0, 5, 100))  # [100, 40, 0]
print(calc_explosion([[1,1]], 0, 0, 2, 50))                # [約14]
print(calc_explosion([[10,10]], 0, 0, 3, 80))              # [0]
```

#### 🧠 解説 — なぜこのコード？
- **2点間の距離公式**: 三平方の定理 `dist = √(dx² + dy²)`。Python では `** 2` で二乗、`** 0.5` で平方根（`math.sqrt` を import しなくても書ける）。
- 「半径内かどうか」の判定: `dist <= radius`。
- ダメージの距離スケーリング: `(1 - dist / radius)` を掛けると、**中心**で1.0倍（フルダメージ）、**端**で0倍（ノーダメージ）になる。
  - `dist=0` → `1-0 = 1.0` → 100% ダメージ
  - `dist=3, radius=5` → `1-0.6 = 0.4` → 40% ダメージ
  - `dist=5` → `1-1 = 0` → 0
- 検証 (テスト1: `enemies=[[0,0],[3,0],[10,0]], center=(0,0), r=5, base=100`):
  - `[0,0]`: dist=0, dmg = `100 * 1 = 100`
  - `[3,0]`: dist=3, dmg = `100 * 0.4 = 40`
  - `[10,0]`: dist=10 > 5 → `0`
  - 結果: `[100, 40, 0]` ✓ (テストでは `r1[0]>=80, r1[2]==0` が通れば★★★)
- `for e in enemies:` で各敵を処理し、`results.append()` で結果を蓄積するのは典型的な**マップパターン**。

---

### 13. ⚡⚡ 雷撃 → 連鎖雷撃に進化 (`lightningEvo`)

**やること**: 減衰率を掛けながら連鎖回数分のダメージリストを生成。

```python
def calc_chain(base_dmg, chain_count, decay):
    damages = []
    current = base_dmg
    for i in range(chain_count):
        damages.append(int(current))
        current = current * decay
    return damages

print(calc_chain(100, 3, 0.7))  # [100, 70, 49]
print(calc_chain(80, 4, 0.5))   # [80, 40, 20, 10]
print(calc_chain(50, 1, 0.7))   # [50]
```

#### 🧠 解説 — なぜこのコード？
- `range(chain_count)` で「連鎖回数分だけループ」を作る。
- `current` 変数を保持して、**毎ループ後に `decay` を掛ける**ことで等比数列になる。
- 順序が大事: `append(current)` を**先にやってから** `current *= decay` する。これで最初に `base_dmg` がそのまま入る。
- トレース: `calc_chain(100, 3, 0.7)`
  | i | append前 current | append後 | 次の current |
  |---|---|---|---|
  | 0 | 100 | [100] | 100*0.7 = 70.0 |
  | 1 | 70.0 | [100, 70] | 70*0.7 = 49.0 |
  | 2 | 49.0 | [100, 70, 49] | 49*0.7 = 34.3 |
- `int()` を `append` 時にかけて整数化。`current` 自体は浮動小数のまま保持して**精度落ちを防ぐ**のがコツ（先に int すると累積誤差が大きくなる）。
- テスト2: `[80, 40, 20, 10]` は `0.5` 倍ずつ → 半減するパターン。

---

### 14. 💚 回復 → リジェネに進化 (`healEvo`)

**やること**: 毎ターン少しずつ回復。max_hp でキャップしつつ合計回復量を返す。

```python
def calc_regen(hp, max_hp, heal_per_turn, turns):
    total_healed = 0
    for i in range(turns):
        heal = min(heal_per_turn, max_hp - hp)
        total_healed += heal
        hp += heal
    return total_healed

print(calc_regen(80, 100, 10, 5))   # 20 (max=100でキャップ)
print(calc_regen(95, 100, 10, 5))   # 5
print(calc_regen(50, 200, 20, 3))   # 60
```

#### 🧠 解説 — なぜこのコード？
- 各ターンの回復量は「**heal_per_turn と (max_hp - hp) の小さい方**」。
  - `max_hp - hp` は「あと何回復できるか」の余裕。これを超えてはいけない。
  - `min(heal_per_turn, max_hp - hp)` で「上限に達したら超えない」を表現。
- `total_healed += heal` で毎ターンの実回復量を合計。
- `hp += heal` で実際の HP も更新（次のターンの `max_hp - hp` 計算に必要）。
- トレース: `calc_regen(80, 100, 10, 5)`
  | ターン | hp(始) | 余裕(max-hp) | heal=min(10, 余裕) | total | hp(終) |
  |---|---|---|---|---|---|
  | 1 | 80 | 20 | 10 | 10 | 90 |
  | 2 | 90 | 10 | 10 | 20 | 100 |
  | 3 | 100 | 0 | 0 | 20 | 100 |
  | 4 | 100 | 0 | 0 | 20 | 100 |
  | 5 | 100 | 0 | 0 | 20 | 100 |
  - 結果: **20** ✓
- `total_healed` の初期値0からの累積は、**問4の `result = ""` と同じ蓄積パターン**（数値版）。

---

## まとめ表

| # | ID | 関数名 | フロア | 難易度 | キー技 |
|---|---|---|---|---|---|
| 1 | mpBar | calc_mp_percent | 1 | EASY | 割合計算・int |
| 2 | enemyName | decode_name | 1 | EASY | chr / 蓄積ループ |
| 3 | skillHeal | calc_heal_skill | 1 | NORMAL | 倍率設計 |
| 4 | itemEffect | calc_heal | 2 | NORMAL | min クランプ |
| 5 | skillFire | calc_fire_damage | 2 | NORMAL | (level-1)パターン |
| 6 | attack | calc_damage | 3 | NORMAL | max + 重み付き和 |
| 7 | minimap | calc_map_pixel | 3 | NORMAL | スケール変換 |
| 8 | skillLightning | calc_lightning | 3 | HARD | max() + ボーナス |
| 9 | levelUp | calc_level | 3 | HARD | while + 1.5倍 |
| 10 | itemDrop | get_drop_item | 4 | HARD | if/elif/else |
| 11 | scoreCalc | calc_score | 4 | HARD | 重み付き和 |
| 12 | fireEvo | calc_explosion | 4 | HARD | 距離公式 + 範囲 |
| 13 | lightningEvo | calc_chain | 4 | HARD | 等比数列 |
| 14 | healEvo | calc_regen | 4 | HARD | min + 累積 |

## 頻出パターンの整理

これらの問題で何度も使われる基本パターン:

1. **クランプ（上限/下限）** — `min(a, b)` で上限、`max(a, b)` で下限
   - 使用例: #4 (`min(hp+amount, max_hp)`)、#6 (`max(attack-defense, 1)`)、#14 (`min(heal, max-hp)`)

2. **蓄積ループ** — 初期値から `+=` で積み上げる
   - 使用例: #2 (`result += chr(c)`)、#14 (`total_healed += heal`)

3. **マップ（変換）** — リストから新しいリストを `append` で作る
   - 使用例: #12 (爆発ダメージ)、#13 (連鎖ダメージ)

4. **倍率設計** — `(level - 1)` を使うと level=1 で倍率が0スタート
   - 使用例: #3, #5, #6 — 「テスト1で完全一致」が必要なときの定石

5. **線形変換** — `値 / 元範囲 * 目標範囲`
   - 使用例: #1 (MPの%)、#7 (ピクセル座標)

6. **判定の積み重ね** — `if/elif/else` で範囲分け
   - 使用例: #10 (ドロップ率)

これらが組み合わさるとほぼすべての RPG ロジックが書ける、というのが面白いところです。
