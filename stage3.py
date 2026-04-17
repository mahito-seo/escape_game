"""
==============================================
  Stage 3 — 辞書の暗号（普通）
==============================================
  暗号方式: 辞書のソート
  目標: 辞書操作とソートを使って暗号を解読する
==============================================
"""
from verify import check

# 暗号データ（文字と順番のペア。順番通りに並べるとパスフレーズになる）
cipher = {'D': 1, 'E': 2, 'L': 3, 'T': 4, 'A': 5}


def decode(cipher):
    """
    辞書を値（value）で昇順ソートし、キー（key）をつなげてパスフレーズを作る関数

    【やること】
    1. cipher を value の昇順でソートする
    2. ソート結果の key を順番につなげる

    【ヒント】
    - sorted(cipher.items(), key=lambda x: x[1])
      → [(key, value), ...] のリストが value 順で返る
    - 例: sorted({'B':2, 'A':1}.items(), key=lambda x: x[1])
      → [('A', 1), ('B', 2)]
    """

    # ===== ここを埋めてください =====
    # Step 1: cipher を value でソートする
    sorted_items = []  # ← sorted() を使ってソート

    # Step 2: ソート結果の key をつなげる
    result = ""  # ← sorted_items から key だけ取り出して結合
    # ================================

    return result


# 実行
if __name__ == "__main__":
    answer = decode(cipher)
    print(f"暗号データ: {cipher}")
    print(f"復号結果: {answer}")
    print()

    if check(3, answer):
        print("✓ 正解！ この復号結果をブラウザの「パスフレーズ入力」に入力してください！")
    else:
        print("✗ 不正解… decode関数を見直してみましょう！")
