"""
==============================================
  Stage 1 — リストの暗号（簡単）
==============================================
  暗号方式: アルファベットのインデックス配列
  目標: リストとfor文を使って暗号を解読する
==============================================
"""
from verify import check

# 暗号データ（アルファベットの位置番号）
indices = [5, 0, 11, 2, 14, 13]

# アルファベット表
alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def decode(indices, alphabet):
    """
    インデックス配列からパスフレーズを組み立てる関数

    【やること】
    1. indices の各数字を alphabet のインデックスとして使う
    2. 対応する文字を取り出す
    3. すべての文字をつなげて返す

    【ヒント】
    - alphabet[0] → 'A', alphabet[1] → 'B', ...
    - for文でリストの各要素を処理しましょう
    - 文字列の結合は + でできます
    """

    result = ""

    for idx in indices:
        # ===== ここを埋めてください =====
        pass  # ← alphabet から idx 番目の文字を取り出して result に追加
        # ================================

    return result


# 実行
if __name__ == "__main__":
    answer = decode(indices, alphabet)
    print(f"暗号データ: {indices}")
    print(f"アルファベット: {alphabet}")
    print(f"復号結果: {answer}")
    print()

    if check(1, answer):
        print("✓ 正解！ この復号結果をブラウザの「パスフレーズ入力」に入力してください！")
    else:
        print("✗ 不正解… decode関数を見直してみましょう！")
