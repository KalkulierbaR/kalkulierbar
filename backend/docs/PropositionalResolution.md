# Propositional Resolution

## Input Format Specification

The input to a Propositional Propositional proof is the clause set whose unsatisfiability is to be proven. Details regarding the input format specification can be found in [ClauseSet.md](./ClauseSet.md).

## State Format Specification

The state representation returned by most endpoints is a JSON object. Some of the object's properties are for internal use only and are subject to change at any time. The state object is intended to be read-only and any modification may lead to the state being rejected by the API. The only property that a visualization frontend should rely on is the `clauseSet.clauses` list.

The `clauses` list holds the user-supplied clauses, each clause having a list of atoms (`atoms`). Each atom has a `lit` property holding the variable name as well as a `negated` flag to indicate a negated variable.

## Rule Specification

The Resolution calculus has only one rule: _resolution_. It takes two different clauses in the `clauses` list and a literal that is contained in both clauses and adds a new clause. The literal has to be negated in one clause (we will call this `a-`) and not negated in the other (`a+`). The new clause is the union of the first clause minus `a-` and the other clause minus `a+`. The selected clauses themselves are not changed.

Moves are encoded as `{"c1": <ID of first clause>, "c2": <ID of second clause>, "spelling": <Spelling of the literal>}`. The id of a clause is defined as its position in the `clauses` list.

## Closing a Proof

A proof can be closed iff the `clauses` list contains an empty clause. A closed proof shows that the clause set is unsatisfiable.
