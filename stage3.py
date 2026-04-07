"""
==============================================
  Stage 3 — 二重の封筒（普通）
==============================================
  暗号方式: 文字列 → hex変換 → Base64エンコード
  目標: Base64デコード → hexデコード でパスフレーズを得る
==============================================
"""
import base64
from verify import check

# 暗号データ（Base64エンコードされたhex文字列）
encrypted = "NDQ0NTRjNTQ0MQ=="


def decode(data):
    """
    二重にエンコードされたデータを復号する関数

    【やること】
    1. Base64デコードして中間データを取り出す
    2. 中間データの形式を確認する（printしてみよう！）
    3. 中間データをさらにデコードして元の文字列を復元する

    【ヒント】
    - base64.b64decode(data) でBase64デコードできます
      → 結果は bytes型なので .decode() で文字列にします
    - 中間データは「16進数(hex)」の文字列です
      例: "48656c6c6f" → "Hello"
    - bytes.fromhex(hex文字列) でhexから元のバイト列に戻せます
      → さらに .decode() で文字列にします
    """

    # Step 1: Base64デコード
    # ===== ここを埋めてください =====
    hex_string = base64.b64decode(data).decode()
    # ================================

    print(f"[デバッグ] Base64デコード結果: {hex_string}")

    # Step 2: hexデコード
    # ===== ここを埋めてください =====
    result = bytes.fromhex(hex_string).decode()
    # ================================

    return result


# 実行
if __name__ == "__main__":
    answer = decode(encrypted)
    print(f"暗号データ: {encrypted}")
    print(f"復号結果: {answer}")
    print()

    if check(3, answer):
        print("✓ 正解！ この復号結果をブラウザの「パスフレーズ入力」に入力してください！")
    else:
        print("✗ 不正解… decode関数を見直してみましょう！")
