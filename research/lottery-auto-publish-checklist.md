# Checker checklist

Before merge:

- [ ] npm test passes
- [ ] npm run lint passes
- [ ] npm run build passes
- [ ] No Production write path was added
- [ ] External-host URLs are rejected
- [ ] Review-only sources cannot auto-publish
- [ ] Inactive/expired lotteries cannot auto-publish
- [ ] Ambiguous dates or product identity block auto-publish

Before a future Production write is enabled:

- [ ] Source-specific parser test fixtures exist
- [ ] JST timestamps are verified against official source text
- [ ] Production duplicate check is performed
- [ ] Post-write read-back verification is performed
