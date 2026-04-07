"""
回答検証モジュール（答えはSHA-256ハッシュで保存。平文は含まれていません）
"""
import hashlib

_HASHES = {
    1: "110696d9d69a52d3a6468ed32262ae130bbf24fee15b40c9728dce5f4e1a1c83",
    2: "db0464e1cf4e4e5b2558de7af988de384fc1fa82e34c9adf876319dcd81ec72a",
    3: "7b8f72c65b9fbbf971301567da244175a694378f89f2bb33a7313ce752e9e8bd",
    4: "7a88ab80cacfe078f92260beab1d15f0709df7889789030b1ceda09318422280",
    5: "ef787722842ffbf084fb4bc7a55d9173e1b2a2582acc6e0556e7521698eed953",
}


def check(stage: int, answer: str) -> bool:
    """answer が正解なら True を返す"""
    h = hashlib.sha256(answer.strip().upper().encode()).hexdigest()
    return h == _HASHES.get(stage)
