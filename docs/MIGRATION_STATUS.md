# Migration status

The new repository is the canonical integration target for the Mir Samozanyatykh project.

## Verified invariants

- Svetlana v13 GLB SHA-256: `9a65654d5de83f73201f9577b3fb44478d7ef6d0412b81c2467724a4de1151f5`
- Three.js is pinned to `0.179.1`.
- Web and Mobile are required to use the same Svetlana runtime and model.
- No production secrets belong in source control.

## Migration policy

Binary assets and source files are migrated only from the locally verified project snapshot. No placeholder binary assets are accepted. Each migration batch must be followed by a repository tree comparison and integrity verification.

## Current limitation

The repository is being populated in verified batches. Until all source and binary assets have been transferred and compared, this repository must not be represented as a complete production release.
