# 暗号ターミナル — 講師用ガイド

5 ステージ + EXTRA の暗号ターミナル全部を 1 ページに集約したものです。
各ステージは **Phase 1（Python コーディング → パスフレーズ）** と **Phase 2（Copilot Agent に推論させて回答）** の 2 段構成。

> **設計コンセプト**: Phase 2 では各ステージで Copilot Agent に**新しい機密データを追加**します。前ステージの情報を保持させたまま積み上げ、最終的に複数データを横断した推論を求めます。プロンプトをリセットすると解けません。

---

## 全体構造

### 累積暗号レイヤー

| Stage | 暗号方式 | 復号順序 |
|---|---|---|
| 1 | ROT13 | ROT13 |
| 2 | ROT13 → Base64 | Base64 → ROT13 |
| 3 | ROT13 → Base64 → hex | hex → Base64 → ROT13 |
| 4 | ROT13 → reverse | reverse → ROT13 |
| 5 | Base64 → reverse → Atbash | Atbash → reverse → Base64 |
| EXTRA | ROT13（指令本体） / カスタム5段階（Phase 1） | — |

> Stage 4 以降は Copilot Agent が処理しやすいよう層数を最大 3 に抑え、難易度は推論チェーンの長さで出しています。

### 推論チェーンの全体像

```
情報A: エージェント名 → SECTOR
情報B: SECTOR → 都市・作戦コード（ACTIVE / INACTIVE）
情報C: 作戦コード → 優先度
情報D: 優先度 → 緊急連絡チャンネル
情報E: 最終指令の公式（誰のチャンネルを採用するか）
```

---

## Stage 1 — 古代遺跡：エージェント名簿 ★☆☆☆☆

### Phase 1: Python コーディング

**テンプレート**
```python
alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
indices = [5, 0, 11, 2, 14, 13]

result = ""
for idx in indices:
    result += _____  # ← alphabet から idx 番目の文字
print(result)
```

| 項目 | 値 |
|---|---|
| 埋める箇所 | `alphabet[idx]` |
| 出力（パスフレーズ） | **`FALCON`** |

### Phase 2: Agent 機密情報A

**暗号方式**: ROT13

**ゲーム内表示（暗号文）**
```
[NTRAPL QNGNONFR]
VQ:N001 ANZR:TUBFG   FGNGHF:ERGVERQ FRPGBE:F1
VQ:N002 ANZR:SNYPBA  FGNGHF:NPGVIR  FRPGBE:F7
VQ:N003 ANZR:IVCRE   FGNGHF:NPGVIR  FRPGBE:F3
VQ:N004 ANZR:ENIRA   FGNGHF:ERGVERQ FRPGBE:F4
VQ:N005 ANZR:RNTYR   FGNGHF:NPGVIR  FRPGBE:F9
VQ:N006 ANZR:JBYS    FGNGHF:NPGVIR  FRPGBE:F12
```

**ROT13 復号後**
```
[AGENCY DATABASE]
ID:A001 NAME:GHOST   STATUS:RETIRED SECTOR:S1
ID:A002 NAME:FALCON  STATUS:ACTIVE  SECTOR:S7
ID:A003 NAME:VIPER   STATUS:ACTIVE  SECTOR:S3
ID:A004 NAME:RAVEN   STATUS:RETIRED SECTOR:S4
ID:A005 NAME:EAGLE   STATUS:ACTIVE  SECTOR:S9
ID:A006 NAME:WOLF    STATUS:ACTIVE  SECTOR:S12
```

**問題**: ACTIVE なエージェントのうち、SECTOR 番号が一番小さいのは誰？
**答え**: **`VIPER`**（S3 が最小）

---

## Stage 2 — 氷の洞窟：作戦データ ★★☆☆☆

### Phase 1: Python コーディング

**テンプレート**
```python
codes = [72, 78, 85, 77, 74, 87]
offset = 5

result = ""
for code in codes:
    result += _____  # ← code から offset を引いて文字に変換
print(result)
```

| 項目 | 値 |
|---|---|
| 埋める箇所 | `chr(code - offset)` |
| 出力（パスフレーズ） | **`CIPHER`** |

> 検算: 72-5=67="C", 78-5=73="I", 85-5=80="P", 77-5=72="H", 74-5=69="E", 87-5=82="R"

### Phase 2: Agent 機密情報B

**暗号方式**: ROT13 → Base64（行ごと）

**ゲーム内表示**
```
RjE6T1JFWVZBOkdVSEFRUkU6VkFOUEdWSVI=
RjM6QkZOWE46T1lOTVI6TlBHVklS
RjQ6UE5WRUI6UUVWU0c6VkFOUEdWSVI=
Rjc6R0JYTEI6RkdCRVo6TlBHVklS
Rjk6Rk5DQ0JFQjpGVU5RUjpOUEdWSVI=
RjEyOlNIWEhCWE46U0VCRkc6TlBHVklS
```

**Base64 → ROT13 復号後**
| SECTOR | CITY | MISSION | STATUS |
|---|---|---|---|
| S1 | BERLIN | THUNDER | INACTIVE |
| S3 | OSAKA | BLAZE | ACTIVE |
| S4 | CAIRO | DRIFT | INACTIVE |
| S7 | TOKYO | STORM | ACTIVE |
| S9 | SAPPORO | SHADE | ACTIVE |
| S12 | FUKUOKA | FROST | ACTIVE |

**問題**: FALCON が所属する SECTOR の都市で実行中の作戦コードは？
**推論**: A から `FALCON → S7`、B から `S7 → TOKYO:STORM`
**答え**: **`STORM`**

---

## Stage 3 — 溶岩の回廊：優先度マップ ★★★☆☆

### Phase 1: Python コーディング

**テンプレート（3 つの空欄を埋める）**
```python
# DELTA を作る
# letters の 4,3,2,1,0 番目を順に取り出して連結する
order = [4, 3, 2, 1, 0]
letters = "ATLED"

result = _____           # ← 空文字列で初期化 ("")
for _____ in order:      # ← ループ変数の名前 (i)
    result = result + letters[_____]   # ← 何番目の文字を取り出す？
print(result)
```

| 空欄 | 答え |
|---|---|
| 1つめ | `""` |
| 2つめ | `i` |
| 3つめ | `i` |
| 出力（パスフレーズ） | **`DELTA`** |

### Phase 2: Agent 機密情報C

**暗号方式**: ROT13 → Base64 → hex

**ゲーム内表示**
```
65794a4752304a46576949364d79776954316c4f545649694f6a55734...（長文）
```

**復号後（JSON）**
```json
{"STORM":3,"BLAZE":5,"FROST":1,"SHADE":4,"THUNDER":7,"DRIFT":6}
```

**問題**: ACTIVE のエージェントの中で、優先度の数字が一番小さい（最優先）のは誰？
**推論**:
1. ACTIVE 作戦 = STORM, BLAZE, SHADE, FROST
2. その中で最小優先度 = FROST (1)
3. B から `FROST → S12`
4. A から `S12 → WOLF`

**答え**: **`WOLF`**

---

## Stage 4 — 闇の森：緊急連絡網 ★★★★☆

### Phase 1: Python コーディング

**テンプレート（3 つの空欄）**
```python
# S-x-H-x-A-x-D-x-O-x-W から x を除いて SHADOW を作る
encoded = "S-x-H-x-A-x-D-x-O-x-W"

parts = encoded._____("-")   # ← 分割するメソッド名
result = ""
for p in parts:
    if p != _____:           # ← ダミー文字
        result = result _____ p   # ← 連結する演算子
print(result)
```

| 空欄 | 答え |
|---|---|
| 1つめ | `split` |
| 2つめ | `"x"` |
| 3つめ | `+` |
| 出力（パスフレーズ） | **`SHADOW`** |

### Phase 2: Agent 機密情報D

**暗号方式**: ROT13 → reverse（文字列逆順）

**ゲーム内表示**
```
LYAB-RIVGPN
RABA:+6C
1-NTRZB:5C
3-BINEO:4-3C
7-NUCYN:2-1C
```

**reverse → ROT13 復号後**
```
ACTIVE-ONLY
P6+:NONE
P5:OMEGA-1
P3-4:BRAVO-3
P1-2:ALPHA-7
```

**マッピング表**
| 優先度 | チャンネル |
|---|---|
| 1〜2 | ALPHA-7 |
| 3〜4 | BRAVO-3 |
| 5 | OMEGA-1 |
| 6+ | NONE |

**問題**: FALCON が使う緊急連絡チャンネルは？
**推論**: `FALCON → S7 → STORM → 優先度3 → P3-4: BRAVO-3`
**答え**: **`BRAVO-3`**

---

## Stage 5 — 深淵の神殿：最終脱出指令 ★★★★★

### Phase 1: Python コーディング

**テンプレート（3 つの空欄）**
```python
# data の各値を A 起点のアルファベットに変換して、最後に逆順にする
# 0 → A, 6 → G, 4 → E, 12 → M, 14 → O   (n + 65 が ASCII コード)
data = [0, 6, 4, 12, 14]

result = ""
for n in data:
    result = result + _____(n _____ 65)   # ← 関数名 / 算術演算子

result = result[_____]   # ← 逆順スライス
print(result)
```

| 空欄 | 答え |
|---|---|
| 1つめ | `chr` |
| 2つめ | `+` |
| 3つめ | `::-1` |
| 中間結果 | `"AGEMO"` |
| 出力（パスフレーズ） | **`OMEGA`** |

### Phase 2: Agent 機密情報E

**暗号方式**: Base64 → reverse → Atbash

**ゲーム内表示**
```
=4HDFopFKopFJYXEGE0IHUVGttVEQwURF5FISUVRUAEHFMFJt0WRNEpGLUVHWYHIJU0JGEVR6dFJLopI
```

**Atbash → reverse → Base64 復号後**
```
FINAL: ESCAPE CHANNEL = ACTIVE AGENT WITH LARGEST PRIORITY.
```

**問題**: ACTIVE のエージェントの中で、優先度の数字が**一番大きい**担当者の緊急連絡チャンネルは？
**推論**:
1. ACTIVE 優先度 = STORM(3), BLAZE(5), SHADE(4), FROST(1)
2. 最大 = BLAZE (5)
3. B から `BLAZE → S3`
4. A から `S3 → VIPER`
5. D から `優先度5 → OMEGA-1`

**答え**: **`OMEGA-1`**

> **注意**: Stage 3 は「最小」だったがここは「最大」。混同しやすい引っかけ。

---

## EXTRA — 不死鳥の炉：真実の指令 ★★★★★★

### Phase 1: カスタム 5 段階暗号

**テンプレート（5 つの空欄）**
```python
import base64

encrypted = "=UDOmZDZ2QWNwYjM1MTN"

# Step 1: 逆順に戻す
step1 = encrypted[_____]                          # ← ::-1

# Step 2: Base64 デコード
step2 = base64._____(step1).decode()              # ← b64decode

# Step 3: hex を2文字ずつ整数リストに
numbers = [int(step2[i:i+2], _____) for i in range(0, len(step2), 2)]   # ← 16

# Step 4: 位置鍵を減算 (鍵 = index * 7 + 3)
codes = [n _____ (i * 7 + 3) for i, n in enumerate(numbers)]            # ← -

# Step 5: ASCII を文字に
result = "".join([_____(c) for c in codes])                             # ← chr
print(result)
```

| 空欄 | 答え |
|---|---|
| Step 1 | `::-1` |
| Step 2 | `b64decode` |
| Step 3 | `16` |
| Step 4 | `-` |
| Step 5 | `chr` |
| 出力（パスフレーズ） | **`PHOENIX`** |

**復号の各ステップ（講師確認用）**
```
Step 1: =UDOmZDZ2QWNwYjM1MTN → NTM1MjYwNWQ2ZDZmODU=
Step 2: NTM1MjYwNWQ2ZDZmODU= → 5352605d6d6f85
Step 3: [83, 82, 96, 93, 109, 111, 133]
Step 4: 83-3=80, 82-10=72, 96-17=79, 93-24=69, 109-31=78, 111-38=73, 133-45=88
        → [80, 72, 79, 69, 78, 73, 88]
Step 5: PHOENIX
```

### Phase 2: Agent 最終機密F

**暗号方式**: ROT13（指令本体）

**ゲーム内表示**
```
Gur ntrag jvgu gur NPGVIR zvffvba bs YBJRFG cevbevgl
(fznyyrfg ahzore) vf gur bar jub pna beqre gur svany
rinphngvba. Svaq gurve PUNAARY naq ercbeg vg.
```

**ROT13 復号後**
```
The agent with the ACTIVE mission of LOWEST priority
(smallest number) is the one who can order the final
evacuation. Find their CHANNEL and report it.
```

**問題**: 上記の指令を復号し、A〜E のデータを使って答えを導け
**推論**:
1. ACTIVE で**最小**優先度 = FROST (1)
2. B から `FROST → S12`
3. A から `S12 → WOLF`
4. D から `優先度1 → P1-2: ALPHA-7`

**答え**: **`ALPHA-7`**

> **注意**: Stage 5 は「最大」、EXTRA は「最小」。逆方向です。

---

## 復号済みデータ一覧（暗記用チートシート）

### 情報A — エージェント → SECTOR（ACTIVE のみ）
| NAME | SECTOR |
|---|---|
| FALCON | S7 |
| VIPER | S3 |
| EAGLE | S9 |
| WOLF | S12 |

### 情報B — SECTOR → 都市:作戦（ACTIVE のみ）
| SECTOR | CITY | MISSION |
|---|---|---|
| S3 | OSAKA | BLAZE |
| S7 | TOKYO | STORM |
| S9 | SAPPORO | SHADE |
| S12 | FUKUOKA | FROST |

### 情報C — 作戦 → 優先度（ACTIVE のみ）
| MISSION | PRIORITY |
|---|---|
| STORM | 3 |
| BLAZE | 5 |
| SHADE | 4 |
| FROST | 1 |

### 情報D — 優先度 → チャンネル
| PRIORITY | CHANNEL |
|---|---|
| 1〜2 | ALPHA-7 |
| 3〜4 | BRAVO-3 |
| 5 | OMEGA-1 |

### エージェント完全マッピング（A〜D 統合）
| AGENT | SECTOR | CITY | MISSION | PRIORITY | CHANNEL |
|---|---|---|---|---|---|
| FALCON | S7 | TOKYO | STORM | 3 | BRAVO-3 |
| VIPER | S3 | OSAKA | BLAZE | 5 | OMEGA-1 |
| EAGLE | S9 | SAPPORO | SHADE | 4 | BRAVO-3 |
| WOLF | S12 | FUKUOKA | FROST | 1 | ALPHA-7 |

---

## 全ステージ回答 早見表

| Stage | パスフレーズ (Phase 1) | Agent 答え (Phase 2) |
|---|---|---|
| 1 | `FALCON` | `VIPER` |
| 2 | `CIPHER` | `STORM` |
| 3 | `DELTA` | `WOLF` |
| 4 | `SHADOW` | `BRAVO-3` |
| 5 | `OMEGA` | `OMEGA-1` |
| EXTRA | `PHOENIX` | `ALPHA-7` |

---

## 運営上の注意

- **「前のステージの情報も残して」** が最重要ポイント。プロンプトをリセットする学生がいたら助言
- 各ステージの問題は **ゲーム内の Agent フェーズ画面に表示** されます（口頭出題不要）
- Stage 4 の引っかけ: 「連絡コード（CONTACT_CODE）」ではなく「**チャンネル（CHANNEL）**」を聞いている
- Stage 5 と EXTRA の引っかけ: 「最大／最小」が逆。両方を解く場合は注意
- 詰まった学生への最大ヒント: **「SECTOR コードがデータ同士をつなぐ鍵だよ」**
- 制限時間: Phase 1+2 合算で `450 + ステージ番号 × 90` 秒（Stage 1=9 分、Stage 5=15 分）
