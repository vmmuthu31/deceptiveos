"""
CipherNest utilities — port of src/shared/utils/formatters.ts
"""
import math


def calculate_shannon_entropy(data: str) -> float:
    if not data:
        return 0.0
    freq: dict[str, int] = {}
    for ch in data:
        freq[ch] = freq.get(ch, 0) + 1
    entropy = 0.0
    n = len(data)
    for count in freq.values():
        p = count / n
        entropy -= p * math.log2(p)
    return round(entropy, 3)


def generate_watermark_signature(token: str) -> str:
    binary = "".join(format(ord(c), "08b") for c in token)
    return binary.replace("0", "​").replace("1", "‌")
