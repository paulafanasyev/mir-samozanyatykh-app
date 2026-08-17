# Security baseline

- Never commit API keys, tokens, Render credentials, Apple signing credentials, or private keys.
- Production database files such as `*.db`, `*.sqlite`, and `*.sqlite3` are not source assets.
- WebView navigation must remain restricted to approved local/app origins.
- Svetlana bridge commands must use a whitelist and bounded input sizes.
- Chat endpoints must authenticate the current user and enforce rate limiting.
- Release verification must fail when required binary assets are missing or replaced by placeholders.
