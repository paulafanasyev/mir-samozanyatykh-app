# Mobile ↔ Svetlana integration

The mobile client uses the same backend API contract as Web.

## Rules

- API paths are defined in `mobile/lib/core/api/api_contract.dart`.
- Native bridge commands are explicitly whitelisted in `mobile/lib/core/security/bridge_command.dart`.
- Unknown bridge commands must be ignored/rejected.
- User-visible chat state is represented by `SvetlanaMessage`.
- The mobile runtime must use the verified Svetlana model asset and the same SHA-256 manifest as Web.
- No API credentials are embedded in the application bundle.

This file documents the integration contract; it does not claim that Android/iOS release builds have passed until those builds are executed and their artifacts are verified.
