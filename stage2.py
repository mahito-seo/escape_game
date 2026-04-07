"""
==============================================
  Stage 2 — 数字の手紙（簡単）
==============================================
  暗号方式: ASCII文字コード + オフセット
  目標: 数字のリストを文字に変換してパスフレーズを得る
==============================================
"""
from verify import check

# 暗号データ（各数字は文字コード + オフセット）
encrypted = [72, 78, 85, 77, 74, 87]

# オフセット値
OFFSET = 5


def decode(numbers, offset):
    """
    数字のリストからオフセットを引いてASCII文字に変換する関数

    【やること】
    1. リストの各数字から offset を引く
    2. 引いた結果をASCII文字に変換する
    3. すべての文字をつなげて返す

    【ヒント】
    - chr(数値) で数値をASCII文字に変換できます
      例: chr(65) → 'A', chr(66) → 'B'
    - for文でリストの各要素を処理しましょう
    """

    result = ""

    for num in numbers:
        # ===== ここを埋めてください =====
        char = chr(num - offset)
        # ================================
        result += char

    return result


# 実行
if __name__ == "__main__":
    answer = decode(encrypted, OFFSET)
    print(f"暗号データ: {encrypted}")
    print(f"オフセット: {OFFSET}")
    print(f"復号結果: {answer}")
    print()

    if check(2, answer):
        print("✓ 正解！ この復号結果をブラウザの「パスフレーズ入力」に入力してください！")
    else:
        print("✗ 不正解… decode関数を見直してみましょう！")
