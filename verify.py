"""
回答検証モジュール（答えはSHA-256ハッシュで保存。平文は含まれていません）
"""
import hashlib

_HASHES = {
    1: "50673d02ac6324d4cfa82c941caed56709489e70bd5402e1e3520c25d1100b8e",
    2: "e555a71f0ce4ab12bc3de31adda7979c753fa3f9edd36e8cd8929d5bd4b7e906",
    3: "d079e7e1ed0e0922106cc50fb80a27c68dcf83d7262a8ede9cd5ee976e1afced",
    4: "d8b0f1de2500842edc7e3287adae5a84e153d34817697a313ba0ed0a5c335d8a",
    5: "f77ebc83d4ee51886072e270fbdcac1df96aac78cdcd2ad96a833a9e9f599fe2",
    6: "517a877c6718e65c6b43bb591fe497767f9d38449a47b68269a9917ecb2ea268",
}


def check(stage: int, answer: str) -> bool:
    """answer が正解なら True を返す"""
    h = hashlib.sha256(answer.strip().upper().encode()).hexdigest()
    return h == _HASHES.get(stage)
