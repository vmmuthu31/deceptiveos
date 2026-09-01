"""
CipherNest Steganography & Lure Generation Engine
Real zero-width space steganographic watermark embedding and token decoding.
"""

import hashlib
import json
import os
import random
import time
from typing import Dict, Optional, Tuple

ZERO_WIDTH_SPACE = "\u200B"
ZERO_WIDTH_NON_JOINER = "\u200C"
ZERO_WIDTH_JOINER = "\u200D"
ZERO_WIDTH_NO_BREAK = "\uFEFF"

CHAR_TO_ZW = {
    '0': ZERO_WIDTH_SPACE,
    '1': ZERO_WIDTH_NON_JOINER,
    '2': ZERO_WIDTH_JOINER,
    '3': ZERO_WIDTH_NO_BREAK,
}

ZW_TO_CHAR = {v: k for k, v in CHAR_TO_ZW.items()}

def encode_token_to_zw(token: str) -> str:
    """Encode an ASCII token into invisible zero-width unicode characters."""
    token_bytes = token.encode('utf-8')
    hex_str = token_bytes.hex()
    zw_chars = []
    for ch in hex_str:
        val = int(ch, 16)
        c0 = str((val >> 2) & 3)
        c1 = str(val & 3)
        zw_chars.append(CHAR_TO_ZW[c0])
        zw_chars.append(CHAR_TO_ZW[c1])
    return "".join(zw_chars)

def decode_zw_to_token(zw_text: str) -> Optional[str]:
    """Extract and decode a hidden token from zero-width unicode text."""
    zw_seq = [ch for ch in zw_text if ch in ZW_TO_CHAR]
    if len(zw_seq) % 2 != 0:
        return None
    
    digits = [ZW_TO_CHAR[ch] for ch in zw_seq]
    hex_chars = []
    for i in range(0, len(digits), 2):
        d0 = int(digits[i])
        d1 = int(digits[i+1])
        val = (d0 << 2) | d1
        hex_chars.append(f"{val:x}")
    
    hex_str = "".join(hex_chars)
    try:
        token_bytes = bytes.fromhex(hex_str)
        return token_bytes.decode('utf-8', errors='ignore')
    except Exception:
        return None

def generate_watermarked_document(
    doc_type: str,
    target_company: str,
    industry: str,
    token: str
) -> Tuple[str, str]:
    """
    Generate an authentic company-tailored lure document with an invisible tracking watermark.
    Returns (filename, content_with_watermark).
    """
    zw_watermark = encode_token_to_zw(token)
    
    if doc_type.upper() == "XLSX" or doc_type.upper() == "CSV":
        filename = f"{target_company.replace(' ', '_')}_Q3_Financial_Comp_2026.csv"
        content = (
            f"# {target_company} — Confidential Executive Payroll & Infrastructure Vault\n"
            f"# CLASSIFICATION: TOP SECRET // INTERNAL ONLY {zw_watermark}\n"
            f"Employee_ID,Full_Name,Title,Department,Salary_USD,Bonus_USD,Vault_API_Token\n"
            f"EMP-8801,Jonathan Vance,Chief Executive Officer,Executive,320000,65000,sk_live_ceovault_{token[:8]}\n"
            f"EMP-8802,Sarah Jenkins,Chief Technology Officer,Engineering,280000,45000,sk_live_ctovault_{token[8:16]}\n"
            f"EMP-8803,Marcus Brody,Head of Cloud Security,SecOps,210000,30000,sk_live_secops_{token[16:24] if len(token) >= 24 else token}\n"
            f"EMP-8804,Elena Rostova,Lead AI Infrastructure,ML Research,235000,35000,sk_live_mlvault_{token[:12]}\n"
        )
    elif doc_type.upper() == "ENV" or doc_type.upper() == "JSON":
        filename = f".env.production.{target_company.lower().replace(' ', '_')}"
        content = (
            f"# {target_company} PRODUCTION SECRETS -- DO NOT SHARE\n"
            f"APP_ENV=production{zw_watermark}\n"
            f"DATABASE_URL=postgresql://admin_vault:P@ssw0rd2026_{token[:6]}@db-prod.internal.corp:5432/customer_pii\n"
            f"STRIPE_SECRET_KEY=sk_live_51M_{token}_PROD_KEY\n"
            f"AWS_ACCESS_KEY_ID=AKIA{token[:16].upper()}\n"
            f"AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCY{token[:10]}\n"
            f"OLLAMA_MODEL_ENDPOINT=http://ai-cluster.internal:11434\n"
        )
    else:
        filename = f"{target_company.replace(' ', '_')}_Master_Service_Agreement.txt"
        content = (
            f"===================================================================\n"
            f"CONFIDENTIAL MASTER SERVICE AGREEMENT & INFRASTRUCTURE KEYS\n"
            f"Party A: {target_company} Inc.\n"
            f"Industry Focus: {industry}\n"
            f"===================================================================\n\n"
            f"1. SCOPE AND SECURITY PROTOCOLS {zw_watermark}\n"
            f"All remote administrative access shall be routed through secure bastion\n"
            f"endpoints with access tokens authorized by key: CN-AUTH-{token.upper()}.\n\n"
            f"2. CONFIDENTIALITY AND ENCRYPTION\n"
            f"Data at rest is secured via AES-256-GCM. Decryption keys are stored in the\n"
            f"Hardware Security Module (HSM) cluster under ID: HSM-SEC-{token[:8]}.\n"
        )
    
    return filename, content

if __name__ == "__main__":
    test_token = "wt_89f1a2c4e5b6"
    encoded = encode_token_to_zw(test_token)
    decoded = decode_zw_to_token(encoded)
    assert decoded == test_token, f"Decoded '{decoded}' != '{test_token}'"
    print("Steganography Engine Self-Test: PASSED (Zero-width watermark verified)")
