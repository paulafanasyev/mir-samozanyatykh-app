# Asset migration

## Source of truth

The migration source is the locally verified project snapshot. Binary assets are never replaced with placeholders.

## Required Svetlana assets

- `model_base.glb`
- runtime audio assets used by the Web/Mobile shell
- any referenced textures/images
- Three.js 0.179.1 vendor files required by `GLTFLoader`

## Integrity

Svetlana model SHA-256:

`9a65654d5de83f73201f9577b3fb44478d7ef6d0412b81c2467724a4de1151f5`

## Large files

Large binary assets must be transferred using a mechanism that preserves their exact bytes (Git LFS or a release/object-storage pipeline). A text/Base64 reconstruction is not accepted as a substitute for a verified binary transfer.

## Completion criterion

Asset migration is complete only when every required asset exists in the repository or its declared artifact store and the recorded SHA-256 values match the local source-of-truth manifest.
