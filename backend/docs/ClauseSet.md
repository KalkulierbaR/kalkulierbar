# Clause Set

Propositional clause sets are shared between different calculi as a common input format and are thus specified on their own here.

## Format Specification

### Atoms

An atom, a propositional variable that may or may not be negated, is represented by the variable name (strictly latin characters, lower or upper case), optionally preceeded by a `!` to indicate negation.

### Clauses

A single clause is represented by one or more atoms separated by a `,`. Leading or trailing commas are not permitted.

### Clause Set

A set of clauses is represented by one or more clauses separated by a `;`. As with clauses, leading or trailing semicolons are not permitted. This specification is complete, i.e. no other strings are considered valid clause sets. This includes any unexpected whitespace.