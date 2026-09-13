# Current scope

This branch intentionally stops before automatic Production writes.

Implemented:
- pure auto-publish eligibility gate
- exact timestamp validation
- active-window validation
- official-host validation
- parser-verification requirement
- ambiguity blocking
- tests and checker documentation

Not implemented yet:
- source-specific HTML/detail parsers
- Production duplicate lookup
- Production insert/update
- scheduled invocation of an auto-publish path
