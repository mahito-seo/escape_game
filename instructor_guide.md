# 講師用ガイド — Python × Copilot Agent 脱出ゲーム

このファイルは**索引ページ**です。詳細は各専用ガイドへ:

| カテゴリ | 詳細ガイド | 内容 |
|---|---|---|
| 📘 **当日の実行手順** | **[INSTRUCTOR_RUNBOOK.md](INSTRUCTOR_RUNBOOK.md)** | **サーバー起動からセッション終了まで全手順** |
| 🔐 暗号ターミナル | [INSTRUCTOR_CIPHER.md](INSTRUCTOR_CIPHER.md) | 5 ステージ + EXTRA。Phase 1 コード / Phase 2 Agent / 復号データ |
| 🔧 修理ターミナル | [INSTRUCTOR_REPAIR.md](INSTRUCTOR_REPAIR.md) | 全 14 問の仕様・解答・解説 |
| 👹 ボス・モブ戦 | [INSTRUCTOR_BOSS.md](INSTRUCTOR_BOSS.md) | ボス 3 問の解答 + モブクイズ 90 問構成 |

---

## ゲーム概要

**Python の文法学習 × Copilot Agent への推論プロンプト設計 × AI 対戦の自前実装** をテーマにした脱出ゲーム。学生は 5 階層 (+ EXTRA) のダンジョンを進みながら以下をこなします:

1. **修理ターミナル（黄色端末・フル画面）** — Python の穴埋め問題でゲーム機能（攻撃力・スキル・マップ等）を解放
2. **暗号ターミナル（緑端末・フル画面）** — Phase 1 で Python パスフレーズ計算 → Phase 2 で Copilot Agent に機密データを渡して推論させ最終答えを入力
3. **アイテムピックアップ** — 各フロアの暗号 Phase 2 をクリアすると **🤖 ロボットの組み立て部品** が落ちる（ボディ / 武器 / サブ武器 / 移動 / コア）。各装備に特殊効果あり
4. **モブバトル** — 通路の敵に接触すると Python クイズが開始（タイトルで密度 Easy/Normal/Hard 選択可）
5. **ボス戦 ROBOT ARENA（EXTRA のみ）** — 集めた装備で組み上げたロボットを `robot_action(state)` の **Python AI コード** で制御してターン制バトル

---

## 階層構成

```
Floor 1 (古代遺跡)    : Stage 1 暗号 / 修理 (mpBar/enemyName/skillHeal) / アイテム ボディフレーム
Floor 2 (氷の洞窟)    : Stage 2 暗号 / 修理 (itemEffect/attack/skillFire) / アイテム メイン武器
Floor 3 (溶岩の回廊)  : Stage 3 暗号 / 修理 (minimap/skillLightning/levelUp) / アイテム サブ武器
Floor 4 (闇の森)      : Stage 4 暗号 / 修理 (itemDrop/fireEvo/healEvo) / アイテム 移動装置
Floor 5 (深淵の神殿)  : Stage 5 暗号 / 修理 (scoreCalc/lightningEvo) / アイテム パワーコア
                       ↑ 5 アイテム揃うと組み立て演出 + 右上 HUD が 🤖 一個に
Floor 6 (不死鳥の炉)  : EXTRA 暗号 → ROBOT ARENA ボス戦
```

> **デバッグモード**: タイトル画面の "CIPHER DUNGEON" の最後の "N" を 5 回クリックすると有効化。Lv.6 開始 + 修理ターミナルが入口近くにまとまる。授業中は使わない

---

## モブプログラミングのルール（[js/flow.js](js/flow.js)）

- **3 人 1 組** で進行
- **5 分ごと** にドライバー交代（自動通知）
- 役割例: 操作担当 / コード担当 / Agent 担当

---

## 暗号 → Agent 推論チェーン早見表

| Stage | Phase 1 答え | Phase 2 答え | 必要データ |
|---|---|---|---|
| 1 | `FALCON` | `VIPER` | A のみ |
| 2 | `CIPHER` | `STORM` | A + B |
| 3 | `DELTA` | `WOLF` | A + B + C |
| 4 | `SHADOW` | `BRAVO-3` | A + B + C + D |
| 5 | `OMEGA` | `OMEGA-1` | A + B + C + D + E |
| EXTRA | `PHOENIX` | `ALPHA-7` | A〜E + F |

完全マッピング・暗号データ・復号手順は [INSTRUCTOR_CIPHER.md](INSTRUCTOR_CIPHER.md) を参照。

---

## よくある詰まりポイント

| 現象 | 助言 |
|---|---|
| 「Copilot が答えを間違える」 | プロンプトをリセットしていないか確認。前ステージのデータも残すよう指示 |
| 「Stage 4 で CONTACT_CODE と答えてしまう」 | 問題は **CHANNEL** を聞いている。情報 D の表を見直すよう促す |
| 「Stage 5 と EXTRA が混同」 | Stage 5 は「**最大**優先度」、EXTRA は「**最小**優先度」。逆 |
| 「修理で ★★★ が取れない」 | 期待出力と一致しているかテスト出力を確認。部分点でも機能は解放される |
| 「`Unexpected identifier` / `Unexpected token` エラー」 | `miniPyEval` は Python のサブセットなので、タプルアンパック・f-string などは未対応。1 行 1 文に書き直す |
| 「ROBOT ARENA で `boss == "heavy"` なのに dodge しない」 | バッチ 2-3 ターン目は予告なし（ランダム）。1 ターン目のみ予告が出る仕様 |
| 「ボスを火球・雷撃で削ろうとする」 | 「ボスに物理攻撃は効かないようだ…」と出る。コードで倒すしかない |
| 「アイテムが取れない」 | 暗号ターミナル Phase 2 までクリアしないと落ちない（Phase 1 だけでは出ない） |

---

## 制限時間まとめ

| ターミナル | 制限時間 |
|---|---|
| 暗号ターミナル | `450 + ステージ番号 × 90` 秒（Stage 1: 9分、Stage 5: 15分） |
| 修理ターミナル | **なし**（じっくり考えてOK） |
| コーディングチャレンジ（金色端末） | 7.5 分 |
| ROBOT ARENA ボス戦 | **時間制限なし**（コードを書き換えながら試行錯誤できる） |

---

## スコア計算

| 部門 | 計算式 | 上限 |
|---|---|---|
| ⏱ タイム | 120 分以内 400 / 150 分 300 / 180 分 200 / 240 分 50 / それ以降 50 | 400 pts |
| ⚔ 戦闘 XP | `(Lv-1) × 35 + 撃破数 × 8` | **上限なし** (HARD モード救済) |
| 🔥 連続正解 | `連続正解 × 12` | 250 pts |

**ランク境界**: S(750+) / A(600+) / B(450+) / C(300+) / D(150+) / E
EXTRA ボス撃破は **強制 RANK S (1000 pts 固定)**。エクストラクリア後は再チャレンジボタンなし（スコア保持のため）。

---

## 操作リファレンス（チュートリアル抜粋）

| キー | 動作 |
|---|---|
| W/A/S/D | 前進・左右・後退 |
| マウス | 視点移動 |
| 2 / **左クリック** | 🔥 火球（MP 15） |
| 3 / **右クリック** | ⚡ 雷撃（MP 25） |
| 4 | 💊 回復（MP 20） |
| 5 | 🗺️ マップ（MP 30） |
| R | 視点リセット |
| ESC | ポーズ |

---

## 🚨 緊急対応 — サーバー落ち / データ消失への備え

### 自動スナップショット（各 PC 内に保存）

各 PC のブラウザの **localStorage に直近 100 件のスナップショット** が自動保存されています:
- `saveProgress()` が呼ばれるたび（ステージクリア、レベルアップ、修理完了など）
- 1 分ごとの定期保存

サーバーが落ちても、各クライアントのローカルデータは無事です。

### サーバー側のディスク永続化（最重要）

tracker サーバーは受信した全チームの状態を **`tracker/data/teams.json` にディスク保存** しています:
- 各 POST /status のたびに（1 秒間隔のデバウンス付き）アトミック書き込み
- **サーバー再起動時に自動復元** — 学生は何もしなくて OK

これにより、サーバープロセスが落ちて再起動しても以前の進捗が完全に残ります。

### 自動ファイルダウンロード（節目のみ）

localStorage が消えるリスク（プライベートウィンドウ終了、データ消去など）の保険として、
JSON バックアップを各学生 PC に自動ダウンロードします:

- **暗号ステージクリア時**（節目）
- **ゲームクリア時**（最終バックアップ）

ファイル名: `cipher-dungeon-log-<チーム名>-<タイムスタンプ>.json`
保存先: 各 PC のダウンロードフォルダ

> 定期ダウンロード（10 分ごと）はサーバー永続化があるので無効化しています。
> 通常の運営では「サーバー永続化 + 講師ダッシュボードの 📥 ボタン」だけで十分です。

### 講師の介入手段: Admin コンソール（各 PC で実行可能）

学生または講師が **DevTools のコンソール** (`F12` / `Cmd+Opt+I` → Console タブ) で次のコマンドを実行できます:

```js
admin.help()           // 全コマンド一覧
admin.state()          // 現在の状態を表示
```

#### よく使う復旧コマンド

| コマンド | 用途 |
|---|---|
| `admin.setLevel(5)` | レベルを 5 に |
| `admin.setHP(100)` | HP を 100 に |
| `admin.setKills(20)` | キル数を 20 に |
| `admin.setStage(3)` | 暗号ステージを 3 に（1〜6） |
| `admin.setFloor(3)` | フロアを 3 に |
| `admin.unlock("attack", 3)` | 特定機能を★★★で解放 |
| `admin.unlockAll(3)` | 全 14 機能を★★★で解放 |
| `admin.solveCipher()` | 現ステージの暗号をクリア扱い |
| `admin.skipFloor()` | 次の階層へ強制移動 |
| `admin.heal()` | HP/MP 全回復 |
| `admin.god()` | 無敵モード（HP/MP/攻撃 9999） |

#### バックアップ・復元

| コマンド | 用途 |
|---|---|
| `admin.exportLog()` | スナップショット履歴を JSON ファイルでダウンロード |
| `admin.exportSave()` | 現セーブを JSON 文字列で取得（コピーして別 PC に移植可） |
| `admin.importSave(text)` | エクスポートした JSON を別 PC で復元 |
| `admin.rollback(1)` | 1 つ前のスナップショットに戻す |
| `admin.history()` | 過去スナップショット一覧 |

### 講師側からの集中バックアップ（推奨運用）

ダッシュボード `http://localhost:9876/dashboard` に追加された **📥 全チーム最新状態をダウンロード** ボタンで、**現在 tracker に届いている全チームの完全スナップショット** を 1 つの JSON にまとめてダウンロードできます。

- 各クライアントが `saveProgress()` のたびに送信する `snapshot.save` / `snapshot.features`（localStorage の中身そのもの）が含まれます
- セッション中に **15〜30 分ごとにポチっとダウンロード** しておけば、何が起きても元に戻せます

#### 個別チームの復元（ダッシュボードから 1 クリック）

ダッシュボードの各行の **📋 ボタン** をクリックすると、そのチームの最新スナップショットから `admin.importSave(...)` の復元コマンドが**自動でクリップボードにコピー**されます。

復元手順:
1. 講師がダッシュボードで対象チームの 📋 をクリック
2. 対象 PC の DevTools コンソール (F12) を開く
3. 貼り付け → Enter → ページがリロード → 完全復活

#### API 直叩きも可能

| エンドポイント | 用途 |
|---|---|
| `GET /export-all` | 全チームの最新状態を 1 ファイルでダウンロード |
| `GET /export-team?name=チームA` | 特定チームのスナップショット JSON を取得 |

### 障害対応の推奨手順

#### ケース 1: 講師サーバー（tracker）が落ちた
1. **各チームは続行可能** — ローカル localStorage に保存されているため
2. サーバーを再起動 → ダッシュボードは空だが、各チームのゲーム内データは無事
3. 次の `saveProgress()` 時に再アップロードされて復活

#### ケース 2: 1 チームのブラウザがクラッシュ
1. クラッシュ前の最後の状態は localStorage に残っているので、再読み込みで復活
2. localStorage まで失われた場合（プライベートウィンドウ等）:
   - 別 PC で `admin.exportSave()` してコピー → 戻したい PC で `admin.importSave(コピーした文字列)`
   - もしくは `admin.setStage(n)` / `admin.setFloor(n)` / `admin.unlockAll(3)` で手動復元

#### ケース 3: 周回遅れのチームを救済
- `admin.setStage(N)` と `admin.unlockAll(2)` で一気に追いつかせる
- 強敵が辛ければ `admin.setLevel(N)` も併用

#### ケース 4: 全体的に不安な場合
- セッション開始時に各チームに **`admin.exportLog()` を 30 分ごとに実行** してもらう
- ダウンロードされた JSON を Slack / メールで講師に送信してもらえば、最悪の場合でも復元可能

### Admin コマンドの注意

- これは**チート防止機能ではなく緊急復旧ツール**です。学生にも公開しています
- 学生が誤って `admin.clear()` を実行するとセーブが消えます（先に `admin.exportLog()` を促すと安全）
- ゲーム本体（`window.player` / `window.features` 等）に直接アクセスもできるので、上級ユーザーは細かい操作も可能

---

## ファイル構成

```
instructor_guide.md         ← このファイル（索引）
INSTRUCTOR_CIPHER.md        ← 暗号ターミナル詳細
INSTRUCTOR_REPAIR.md        ← 修理ターミナル詳細
INSTRUCTOR_BOSS.md          ← ボス・モブ戦詳細
js/stages.js                ← 暗号ステージ定義
js/repair.js                ← 修理ターミナル定義
js/boss.js                  ← ボス問題定義
js/questions.js             ← モブクイズ全 90 問
js/admin.js                 ← Admin コンソールコマンド（緊急復旧用）
tracker/server.js           ← 進捗トラッカーサーバー
tracker/dashboard.html      ← 講師用ダッシュボード
```

> 旧ドキュメント（`CIPHER_REFERENCE.md` / `PROBLEMS_SUMMARY.md` / `REPAIR_ANSWERS.md` / `REPAIR_TERMINALS_SPEC.md` / `BOSS_ANSWERS.md`）は上記 3 つに統合済み。整理のため削除推奨。
