#!/usr/bin/env python3
"""Verify critical Svetlana assets against the source-of-truth manifest."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

EXPECTED = {
    "frontend/public/svetlana/model_base.glb": (43580292, "9a65654d5de83f73201f9577b3fb44478d7ef6d0412b81c2467724a4de1151f5"),
    "mobile/assets/svetlana/model_base.glb": (43580292, "9a65654d5de83f73201f9577b3fb44478d7ef6d0412b81c2467724a4de1151f5"),
    "frontend/public/svetlana/assets/svetlana_tts_smoke_test.wav": (152426, "e69cfa850489b6f77007c9ef0882604729d45cd65a669cb0162416dace3289bc"),
    "mobile/assets/svetlana/assets/svetlana_tts_smoke_test.wav": (152426, "e69cfa850489b6f77007c9ef0882604729d45cd65a669cb0162416dace3289bc"),
}

root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
errors = []
for rel, (size, expected_sha) in EXPECTED.items():
    path = root / rel
    if not path.is_file():
        errors.append(f"MISSING: {rel}")
        continue
    actual_size = path.stat().st_size
    actual_sha = hashlib.sha256(path.read_bytes()).hexdigest()
    if actual_size != size:
        errors.append(f"SIZE: {rel}: expected {size}, got {actual_size}")
    if actual_sha != expected_sha:
        errors.append(f"SHA256: {rel}: expected {expected_sha}, got {actual_sha}")

if errors:
    print("ASSET MANIFEST: FAIL")
    print("\n".join(errors))
    raise SystemExit(1)

print("ASSET MANIFEST: PASS")
for rel in EXPECTED:
    print(f"OK {rel}")
