# Clause Set

Propositional clause sets are shared between different calculi as a common input format
and are thus specified on their own here.

## Format Specification

### Preprocessing

Input strings are preprocessed to remove any whitespace,
which is technically not allowed as part of the specification but makes the input more human-readable.
Also whitespace in variable names is accepted too and therefore removed after preprocessing.
Line breaks are replaced with a `;`, allowing users to list a clause in every line.
A single trailing `;` or line break at the end of the formula will be removed.

### Atoms

An atom, a propositional variable that may or may not be negated,
is represented by the variable name (strictly latin characters, lower or upper case).
Optionally preceeded by a `!` to indicate negation.

### Clauses

A single clause is represented by one or more atoms separated by a `,`.
Leading or trailing commas are not permitted.

### Clause Set

A set of clauses is represented by one or more clauses separated by a `;`.
As with clauses, leading or trailing semicolons are not permitted.
This specification is complete, i.e. no other strings are considered valid clause sets.
