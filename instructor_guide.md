# 講師用ガイド — Python × Copilot Agent 脱出ゲーム

## コンセプト

**Agentのプロンプトを「成長」させるゲーム**です。

各ステージで新しい暗号データが渡されますが、そのデータは**前ステージのデータと紐づいて**います。
学生は Copilot Agent のプロンプトに情報を**蓄積**させ、複数データを**横断的に推論**させて答えを導きます。

- Stage 1: データAだけで回答
- Stage 2: A + B を SECTOR コードで紐づけて回答
- Stage 3: A + B + C を横断して回答（逆方向推論あり）
- Stage 4: A〜D の全チェーンを使って回答
- Stage 5: A〜E を統合し、逆方向に全チェーンをたどって回答

**「プロンプトを毎回リセットすると解けない」設計**になっています。

---

## データの紐づき構造

```
機密情報A (1層)             機密情報B (2層)              機密情報C (3層)
ROT13                      ROT13→Base64               ROT13→Base64→hex
エージェント → SECTOR  ──→  SECTOR → 都市・作戦  ──→  作戦 → 優先度
                                                          │
機密情報E (5層)             機密情報D (4層)               │
ROT13→Base64→hex           ROT13→Base64→hex→reverse      │
→reverse→Atbash            優先度 → 連絡コード＆チャンネル ←┘
最終指令         ←──────────────────────────────────────────┘
```

### 暗号の累積構造
| Stage | 暗号層 | 復号手順 |
|-------|-------|---------|
| 1 | ROT13 | ROT13 |
| 2 | ROT13 → Base64 | Base64 → ROT13 |
| 3 | ROT13 → Base64 → hex | hex → Base64 → ROT13 |
| 4 | ROT13 → Base64 → hex → reverse | reverse → hex → Base64 → ROT13 |
| 5 | ROT13 → Base64 → hex → reverse → Atbash | Atbash → reverse → hex → Base64 → ROT13 |

ステージが進むごとに暗号の層が1つずつ増えます。
Agentへの復号指示も累積的に複雑になるため、プロンプト設計力が段階的に鍛えられます。

**SECTOR コード（S7, S3, S12, S9）** が情報A↔Bのリンク、**作戦コード** が情報B↔Cのリンクです。
各データを個別に復号しても、紐づけがないと推論チェーンが成立しません。

---

## ステージ別 出題内容

### Stage 1 — 逆さまの世界

| 項目 | 内容 |
|------|------|
| Python課題 | 文字列を逆順にする（`[::-1]`） |
| パスフレーズ | `FALCON` |
| 機密情報の暗号 | **1層**: ROT13（12件、うちACTIVE 4件） |
| **講師の問い** | **「ACTIVE なエージェントのうち、SECTOR番号が一番小さいのは誰ですか？」** |
| 必要な情報 | A のみ |
| 正解 | **VIPER**（SECTOR:S3 が最小） |

> **Agentに必要な処理**: ROT13復号 → ACTIVEをフィルタ → SECTOR番号を比較
> 12件のROT13データを手作業で復号するのは非現実的。

---

### Stage 2 — 数字の手紙

| 項目 | 内容 |
|------|------|
| Python課題 | ASCIIオフセット復号（`chr(num - 5)`） |
| パスフレーズ | `CIPHER` |
| 機密情報の暗号 | **2層**: ROT13 → Base64（12行） |
| **講師の問い** | **「FALCON が所属する SECTOR の都市で実行中の作戦コードは何ですか？」** |
| 必要な情報 | A + B |
| 正解 | **STORM** |

> **推論チェーン**: (A) FALCON → S7 → (B) S7 → TOKYO → STORM
> 情報Bは2層暗号（Base64→ROT13）。復号すると `S7:TOKYO:STORM:ACTIVE` だが、`S7`がFALCONだと知るには情報Aが必要。

---

### Stage 3 — 二重の封筒

| 項目 | 内容 |
|------|------|
| Python課題 | Base64デコード → hexデコード |
| パスフレーズ | `DELTA` |
| 機密情報の暗号 | **3層**: ROT13 → Base64 → hex（JSONデータ） |
| **講師の問い** | **「優先度が最も高い（数値が最も小さい）ACTIVE作戦を担当するエージェントは誰ですか？」** |
| 必要な情報 | A + B + C |
| 正解 | **WOLF** |

> **推論チェーン（逆方向）**:
> (C) 最小優先度 = FROST(1) → (B) FROST → S12 → (A) S12 → WOLF
>
> ACTIVEな作戦（STORM/BLAZE/FROST/SHADE）の中から最小を見つけ、
> 逆方向にSECTOR→エージェントと辿る必要がある。

---

### Stage 4 — XOR暗号の壁

| 項目 | 内容 |
|------|------|
| Python課題 | XOR復号（`byte ^ 42`） |
| パスフレーズ | `SHADOW` |
| 機密情報の暗号 | **4層**: ROT13 → Base64 → hex → reverse |
| **講師の問い** | **「EAGLE に緊急連絡する際のチャンネルは何ですか？」** |
| 必要な情報 | A + B + C + D |
| 正解 | **BRAVO-3** |

> **推論チェーン**:
> (A) EAGLE → S9 → (B) S9 → SHADE → (C) SHADE → 優先度4 → (D) 優先度3-4 → BRAVO-3
>
> 「連絡コード」ではなく「チャンネル」を聞いている点に注意。
> 情報DにはCONTACT_CODEとCHANNELの両方がある。

---

### Stage 5 — 最後の鍵

| 項目 | 内容 |
|------|------|
| Python課題 | 多重暗号（6ステップ） |
| パスフレーズ | `OMEGA` |
| 機密情報の暗号 | **5層**: ROT13 → Base64 → hex → reverse → Atbash |
| **講師の問い** | **「最終脱出コードは何ですか？」** |
| 必要な情報 | A + B + C + D + E（全て） |
| 正解 | **OMEGA-1** |

> **推論チェーン**:
> 1. (E復号) 指令: 「ACTIVE作戦で最大の優先度値を持つエージェントのチャンネルが脱出コード」
> 2. (C) 最大優先度値 = BLAZE(5)
> 3. (B) BLAZE → S3
> 4. (A) S3 → VIPER
> 5. (C) BLAZE → 優先度5
> 6. (D) 優先度5 → チャンネル OMEGA-1
>
> **ポイント**: 指令の解釈 → 優先度の最大値検索 → 逆方向チェーン → チャンネル特定
> プロンプトに全データが正しく蓄積されていないと絶対に解けない。

---

## 復号済みデータ一覧（講師確認用）

### 情報A（ROT13復号後） — ACTIVE のみ抜粋
| NAME | SECTOR |
|------|--------|
| FALCON | S7 |
| VIPER | S3 |
| WOLF | S12 |
| EAGLE | S9 |

### 情報B（Base64デコード後） — ACTIVE のみ抜粋
| SECTOR | CITY | MISSION | STATUS |
|--------|------|---------|--------|
| S7 | TOKYO | STORM | ACTIVE |
| S3 | OSAKA | BLAZE | ACTIVE |
| S12 | FUKUOKA | FROST | ACTIVE |
| S9 | SAPPORO | SHADE | ACTIVE |

### 情報C（hexデコード後のJSON） — ACTIVE作戦のみ抜粋
| MISSION | PRIORITY |
|---------|----------|
| STORM | 3 |
| BLAZE | 5 |
| FROST | 1 |
| SHADE | 4 |

### 情報D（reverse復元後）
| PRIORITY | CONTACT_CODE | CHANNEL |
|----------|-------------|---------|
| 1-2 | SILENT | ALPHA-7 |
| 3-4 | URGENT | BRAVO-3 |
| 5 | CRITICAL | OMEGA-1 |

### 情報E（Atbash復号後）
```
FINAL DIRECTIVE:
THE ESCAPE CODE IS THE CHANNEL OF THE AGENT WHOSE ACTIVE MISSION
HAS THE LARGEST PRIORITY VALUE.
```

---

## 運営上の注意

- 各ステージの問いは**必ず口頭で出題**してください
- **「前のステージの情報も残して」** が最重要ポイント。プロンプトをリセットする学生がいたら助言してください
- Stage 4 は「連絡コード(URGENT)」ではなく「チャンネル(BRAVO-3)」を聞いています。引っかけポイントです
- Stage 5 は「最大の優先度**値**」（数字が一番大きい = 5）です。「最も優先度が高い = 1」と混同しないよう注意
- つまずく学生への最大のヒント: **「SECTOR コードがデータ同士をつなぐ鍵だよ」**

---

## EXTRA STAGE — 不死鳥の暗号（エクストラステージ）

> Stage 5 クリア後に「🔥 EXTRA STAGE へ挑む 🔥」ボタンが表示されます。
> 時間に余裕があるチーム向けの上級チャレンジです。

### Python課題（stage_extra.py）

| 項目 | 内容 |
|------|------|
| 暗号方式 | **カスタム暗号（5ステップ）** |
| 暗号化手順 | 元の単語→ASCII変換→位置ベース鍵加算(i*7+3)→hex変換→Base64→逆順 |
| 暗号データ | `=UDOmZDZ2QWNwYjM1MTN` |
| パスフレーズ | **`PHOENIX`** |

#### 復号の詳細手順（講師確認用）

```
Step 1: 逆順に戻す
  =UDOmZDZ2QWNwYjM1MTN → NTM1MjYwNWQ2ZDZmODU=

Step 2: Base64デコード
  NTM1MjYwNWQ2ZDZmODU= → 5352605d6d6f85

Step 3: hex を2文字ずつ分割して整数に
  53, 52, 60, 5d, 6d, 6f, 85 → [83, 82, 96, 93, 109, 111, 133]

Step 4: 位置ベース鍵を減算（鍵 = index * 7 + 3）
  83-(0*7+3)=80, 82-(1*7+3)=72, 96-(2*7+3)=79,
  93-(3*7+3)=69, 109-(4*7+3)=78, 111-(5*7+3)=73, 133-(6*7+3)=88
  → [80, 72, 79, 69, 78, 73, 88]

Step 5: ASCII文字に変換
  80=P, 72=H, 79=O, 69=E, 78=N, 73=I, 88=X → PHOENIX
```

### Agent課題

| 項目 | 内容 |
|------|------|
| 機密情報Fの暗号 | ROT13（シンプルだが指令の解釈が難しい） |
| 機密情報F（復号後） | "The agent with the ACTIVE mission of LOWEST priority (smallest number) is the one who can order the final evacuation. Find their CHANNEL and report it." |
| **問い** | **「最終指令を復号し、A〜Fの全データを使って答えを導け」** |
| 必要な情報 | A〜F（全て） |
| 正解 | **ALPHA-7** |

#### 推論チェーン（講師確認用）

```
1. (F復号) 指令: LOWEST priority（最小の数値）を持つACTIVE作戦のエージェントのCHANNEL
2. (C) 最小優先度 = FROST (Priority 1)
3. (B) FROST → S12
4. (A) S12 → WOLF
5. (C) FROST → Priority 1
6. (D) Priority 1-2 → CHANNEL: ALPHA-7
→ 答え: ALPHA-7
```

> **注意**: Stage 5 が「LARGEST priority value」だったのに対し、Extra Stage は「LOWEST priority」。
> 混同しやすいので注意が必要です。

### ダンジョン特徴

- テーマ：「不死鳥の炉」（赤黒い溶岩風、赤い松明）
- 敵のバトル問題は **hard のみ**
- 敵の数も多め

---

## 運営上の注意（追記）

- **Extra Stage は時間に余裕があるチームのみ** に案内してください
- Extra Stage のPython課題は「コードを自分で書く」レベルです。Copilot Agent に暗号化手順を伝えて復号コードを生成させるのが正攻法です
- Stage 5 と Extra Stage で「最大/最小」が逆になっている点が引っかけポイントです
