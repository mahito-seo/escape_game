"""
==============================================
  Stage 4 — XOR暗号の壁（むずい）
==============================================
  暗号方式: XOR暗号
  目標: XOR復号でパスフレーズを得る
==============================================
"""
from verify import check

# 暗号データ（XOR暗号化されたバイト列）
encrypted_data = [121, 98, 107, 110, 101, 125]

# XOR鍵
XOR_KEY = 42


def decode(data, key):
    """
    XOR暗号を復号する関数

    【やること】
    1. データの各バイト（数値）に対してXOR演算を行う
    2. 復号したバイト列を文字列に変換する

    【ヒント】
    - XOR演算は ^ 演算子を使います
      例: 100 ^ 42 → 78
    - bytes([数値のリスト]) でバイト列を作れます
    - .decode('utf-8') でバイト列を文字列に変換できます
    """

    # ===== ここを埋めてください =====
    decrypted_bytes = []
    for byte in data:
        decrypted_bytes.append(byte)  # ← この行を修正！ XOR演算を追加
    # ================================

    result = bytes(decrypted_bytes).decode('utf-8')
    return result


# 実行
if __name__ == "__main__":
    answer = decode(encrypted_data, XOR_KEY)
    print(f"暗号データ: {encrypted_data}")
    print(f"XOR鍵: {XOR_KEY}")
    print(f"復号結果: {answer}")
    print()

    if check(4, answer):
        print("✓ 正解！ この復号結果をブラウザの「パスフレーズ入力」に入力してください！")
    else:
        print("✗ 不正解… decode関数を見直してみましょう！")
