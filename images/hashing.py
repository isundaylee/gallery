import hashlib

import imagehash
from PIL import Image as PILImage


def hash_file(path: str) -> tuple[str, str]:
    """Return (sha256_hex, phash_hex) for the image at ``path``.

    sha256 is over the raw bytes (exact-duplicate detection); phash is a 64-bit
    perceptual hash rendered as 16 hex chars (near-duplicate detection via
    Hamming distance). Raises if the file cannot be read or decoded.
    """
    with open(path, "rb") as f:
        sha256 = hashlib.sha256(f.read()).hexdigest()

    with PILImage.open(path) as pil:
        phash = str(imagehash.phash(pil))

    return sha256, phash
