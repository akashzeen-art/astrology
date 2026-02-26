from __future__ import annotations

import base64
import os
from typing import Any

from cryptography.fernet import Fernet, InvalidToken


def get_fernet() -> Fernet:
    """
    Return a Fernet instance using ASTROLOGY_ENCRYPTION_KEY.

    The key MUST be a 32-byte urlsafe base64-encoded string, as returned by

        >>> from cryptography.fernet import Fernet
        >>> Fernet.generate_key()

    Copy that exact value into ASTROLOGY_ENCRYPTION_KEY.
    """
    key = os.getenv("ASTROLOGY_ENCRYPTION_KEY")
    if not key:
        raise RuntimeError(
            "ASTROLOGY_ENCRYPTION_KEY must be set and must be a valid Fernet key. "
            "Generate one with: from cryptography.fernet import Fernet; Fernet.generate_key()"
        )
    return Fernet(key.encode("utf-8"))


def encrypt_value(value: Any) -> str:
    if value is None:
        return ""
    f = get_fernet()
    data = (
        value
        if isinstance(value, (bytes, bytearray))
        else str(value).encode("utf-8")
    )
    token = f.encrypt(data)
    return token.decode("utf-8")


def decrypt_value(token: str) -> str | None:
    if not token:
        return None
    f = get_fernet()
    try:
        data = f.decrypt(token.encode("utf-8"))
        return data.decode("utf-8")
    except InvalidToken:
        return None


