# Lottery auto-publish safety policy

Auto-publish is allowed only when all of the following are true:

1. The source registry marks the source as `auto`.
2. A source-specific parser has verified the item (`parserVerified=true`).
3. Product identity is non-empty and unambiguous.
4. `officialUrl` stays on the configured official source hostname.
5. Exact `applicationStart` and `deadlineAt` values parse as timestamps.
6. The application window is valid and is currently open.
7. No ambiguity reason is present.
8. Before any future DB write, a duplicate check against Production must pass.

Card-shop sources remain review-only and must never bypass the manual confirmation rule.

The current implementation only provides the verification gate. It does not write to Production.
