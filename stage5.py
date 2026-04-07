"""
==============================================
  Stage 5 — 最後の鍵（激ムズ）
==============================================
  暗号方式: 多重暗号（Stage1〜4の全ロジックの組み合わせ）

  暗号化の順序（これを逆順に辿る）:
    元の単語 → 逆順 → シーザー暗号(+3) → ASCIIオフセット(+5)
    → 数値リストを文字列化 → XOR(鍵=42) → Base64エンコード

  復号の順序:
    Base64デコード → XOR復号(鍵=42) → 数値リスト復元
    → ASCIIオフセット除去(-5) → シーザー復号(-3) → 逆順
==============================================
"""
import base64
from verify import check

# 暗号データ
encrypted = "HRkGHRMGHR0GEh8GEh0="

# パラメータ（Stage1〜4で使った値）
XOR_KEY = 42
ASCII_OFFSET = 5
CAESAR_SHIFT = 3


def decode(data):
    """
    多重暗号を復号する関数

    【やること】
    6つのステップを順番に実行する必要があります。
    Stage1〜4で学んだロジックを組み合わせましょう。

    【ヒント】
    - Copilot Agentに「stage1.py〜stage4.pyのコードを読んで、
      復号ロジックを統合してください」と依頼するのも有効です！
    - 各ステップの結果をprintしてデバッグしましょう
    """

    # === Step 1: Base64デコード（Stage3のスキル） ===
    # ===== ここを埋めてください =====
    step1 = b""  # ← Base64デコード
    # ================================
    print(f"[Step1] Base64デコード: {step1}")

    # === Step 2: XOR復号（Stage4のスキル） ===
    # ===== ここを埋めてください =====
    step2 = ""  # ← 各バイトに XOR_KEY で XOR演算 → 文字列化
    # ================================
    print(f"[Step2] XOR復号: {step2}")

    # === Step 3: カンマ区切りの数値リストに変換 ===
    # ===== ここを埋めてください =====
    numbers = []  # ← step2をカンマで分割して整数のリストにする
    # ================================
    print(f"[Step3] 数値リスト: {numbers}")

    # === Step 4: ASCIIオフセット除去（Stage2のスキル） ===
    # ===== ここを埋めてください =====
    step4 = ""  # ← 各数値から ASCII_OFFSET を引いて chr() で文字に変換
    # ================================
    print(f"[Step4] オフセット除去: {step4}")

    # === Step 5: シーザー暗号の復号（シフトを戻す） ===
    # ===== ここを埋めてください =====
    step5 = ""  # ← 各文字を CAESAR_SHIFT だけ戻す（A-Zの範囲で巡回）
    # ヒント: chr((ord(c) - ord('A') - CAESAR_SHIFT) % 26 + ord('A'))
    # ================================
    print(f"[Step5] シーザー復号: {step5}")

    # === Step 6: 逆順にする（Stage1のスキル） ===
    # ===== ここを埋めてください =====
    step6 = ""  # ← step5を逆順にする
    # ================================
    print(f"[Step6] 逆順: {step6}")

    return step6


# 実行
if __name__ == "__main__":
    print("=" * 50)
    print("  Stage 5 — 多重暗号の復号")
    print("=" * 50)
    print(f"暗号データ: {encrypted}")
    print(f"パラメータ: XOR鍵={XOR_KEY}, オフセット={ASCII_OFFSET}, シーザー={CAESAR_SHIFT}")
    print()

    answer = decode(encrypted)

    print()
    print(f"★ 最終パスフレーズ: {answer}")
    print()

    if check(5, answer):
        print("✓ 正解！ この結果をブラウザの「パスフレーズ入力」に入力してください！")
    else:
        print("✗ 不正解… 各ステップの実装を見直してみましょう！")
