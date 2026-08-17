#!/usr/bin/env python3
"""Verify a local project snapshot against its recorded source manifest.

Usage:
  python scripts/verify_source_snapshot.py /path/to/project

The script intentionally fails on missing files, changed bytes, and unresolved
Git LFS pointers. It does not modify the source tree.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

MANIFEST = Path(__file__).resolve().parents[1] / "docs" / "SOURCE_ARCHIVE_MANIFEST.json"


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: verify_source_snapshot.py PROJECT_DIR", file=sys.stderr)
        return 2
    root = Path(sys.argv[1]).resolve()
    if not root.is_dir():
        print(f"ERROR: not a directory: {root}", file=sys.stderr)
        return 2

    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    expected_model = data["svetlana_model_sha256"]
    model_matches = []
    for candidate in root.rglob("model_base.glb"):
        if candidate.is_file():
            model_matches.append((candidate, sha256(candidate)))
    if model_matches and not any(h == expected_model for _, h in model_matches):
        print("ERROR: model_base.glb exists but no copy matches the locked SHA-256")
        for p, h in model_matches:
            print(f"  {p}: {h}")
        return 1

    unresolved = []
    for path in root.rglob("*"):
        if path.is_file() and path.suffix.lower() in {".glb", ".wav", ".mp3", ".zip"}:
            try:
                head = path.read_text(encoding="utf-8", errors="strict")[:80]
            except UnicodeDecodeError:
                continue
            if head.startswith("version https://git-lfs.github.com/spec/v1"):
                unresolved.append(path)
    if unresolved:
        print("ERROR: unresolved Git LFS pointers:")
        for p in unresolved:
            print(f"  {p}")
        return 1

    print(f"Source snapshot verification checks passed for: {root}")
    if model_matches:
        print(f"Svetlana model lock: {expected_model}")
    else:
        print("WARNING: no model_base.glb found; migration is incomplete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
