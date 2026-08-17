# Frontend migration status

## Source of truth

The verified local snapshot remains the migration source until the repository tree matches it.

## Frontend migration order

1. React/Vite source
2. Svetlana web shell
3. Local runtime assets
4. API client configuration
5. Production build verification

## Rules

- Do not replace real assets with placeholders.
- Do not restore CDN dependencies for runtime files that must work offline.
- Every migrated asset must be checked against the source manifest.
- Build success is not accepted as proof of asset correctness without integrity checks.

## Current state

Backend foundation and security baseline are migrated. Frontend source and runtime asset migration continues in verified batches.
