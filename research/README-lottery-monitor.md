# Lottery monitoring phases

1. Discover candidates from configured official sources.
2. Parse with a source-specific parser.
3. Run the verification gate.
4. Check Production for duplicates.
5. Only trusted auto sources may be inserted automatically.
6. Review-only sources require manual confirmation.
7. Read back the saved row after any Production write.
