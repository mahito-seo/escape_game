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

**Python の文法学習 × Copilot Agent への推論プロンプト設計** をテーマにした脱出ゲーム。学生は 5 階層 (+ EXTRA) のダンジョンを進みながら以下をこなします:

1. **修理ターミナル（黄色端末）** — Python の穴埋め問題でゲーム機能（攻撃力・スキル・マップ等）を解放
2. **暗号ターミナル（緑端末）** — Phase 1 で Python パスフレーズ計算 → Phase 2 で Copilot Agent に機密データを渡して推論させ最終答えを入力
3. **モブバトル** — 通路の敵に接触すると Python クイズが開始
4. **ボス戦（EXTRA のみ）** — 3 問のコーディング問題でラスボスを倒す

---

## 階層構成

```
Floor 1 (古代遺跡)    : Stage 1 暗号 / 基本修理 (mpBar/enemyName/itemEffect/skillHeal)
Floor 2 (氷の洞窟)    : Stage 2 暗号 / 戦闘修理 (skillFire)
Floor 3 (溶岩の回廊)  : Stage 3 暗号 / 戦闘核 (attack/minimap/skillLightning/levelUp)
Floor 4 (闇の森)      : Stage 4 暗号 / メタ・進化系 (itemDrop/scoreCalc/各evo)
Floor 5 (深淵の神殿)  : Stage 5 暗号（最終ステージ）
Floor 6 (不死鳥の炉)  : EXTRA 暗号 + ボス戦 PHOENIX GUARDIAN
```

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
| 「ボスの火球が痛い」 | 壁・柱を盾にしながら近づく。被弾 40〜64 ダメージなので HP 管理重要 |

---

## 制限時間まとめ

| ターミナル | 制限時間 |
|---|---|
| 暗号ターミナル | `450 + ステージ番号 × 90` 秒（Stage 1: 9分、Stage 5: 15分） |
| 修理ターミナル | **なし**（じっくり考えてOK） |
| コーディングチャレンジ（金色端末） | 7.5 分 |
| ボス戦 | 15 分 |

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

### 自動ファイルダウンロード（各 PC のダウンロードフォルダに保存）

localStorage が消えるリスク（プライベートウィンドウ終了、データ消去など）に備えて、
**JSON バックアップを各学生 PC に自動ダウンロード** します:

- **10 分ごと**（プレイ中の定期保存）
- **暗号ステージクリア時**（節目）
- **ゲームクリア時**（最終バックアップ）

ファイル名: `cipher-dungeon-log-<チーム名>-<タイムスタンプ>.json`
保存先: 各 PC のダウンロードフォルダ

> プレイ初期（Lv.1 / 修理ゼロ）の状態では無駄なダウンロードを防ぐためスキップされます。
> ブラウザがダウンロード許可を求めてきたら「許可」を選択するよう学生に伝えてください。

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
