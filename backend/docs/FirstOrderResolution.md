# First Order Resolution

First Order Resolution is an extension of the propositional resolution calculus for first-order logic.

## Input Format Specification

The input to a First Order Resolution proof is the first order formula whose insatisfiability is to be proven. Details regarding the input format specification can be found in [FirstOrderFormula.md](./FirstOrderFormula.md).  

As the calculus operates on first order clause sets, the input formula is transformed into Skolem Normal Form and then converted into a clause set with implicitly universally quantified variables.

## State Format Specification

The state representation returned by most endpoints is a JSON object. Some of the object's properties are for internal use only and are subject to change at any time. The state object is intended to be read-only and any modification may lead to the state being rejected by the API. The only property that a visualization frontend should rely on is the `clauseSet.clauses` list.

The `clauses` list holds the user-supplied clauses, each clause having a list of atoms (`atoms`). Each atom has a `lit` property holding an atomic formula (a Relation) as well as a `negated` flag to indicate a negated atom.

## Rule Specification

The first-order resolution calculus has two rules: _resolution_ and _instantiation_.  

The resolution rule takes two different clauses in the `clauses` list and a literal that is contained in both clauses and adds a new clause to the clause set. The literal has to be negated in one clause (we will call this `a-`) and not negated in the other (`a+`). The new clause is the union of the first clause minus `a-` and the other clause minus `a+`. The selected clauses themselves are not changed.

Resolution moves are encoded as `{"type": "res-resolve", "c1": <ID of first clause>, "c2": <ID of second clause>, "literal": <Spelling of the literal>}`. The id of a clause is defined as its position in the `clauses` list. If the literal is set to `null`, a suitable literal will be determined automatically.

The instantiation rule adds a new clause to the clause set by applying a variable instantiation on an existing clause. For example, the clause `{R(X)}` can be instantiated using the variable mapping `X => f(c)` to add the new clause `{R(f(c))}` to the clause set. Variables for which no instantiation is specified remain unchanged. The original clause is not changed by the instantiation.  

Instantiation moves are encoded ad `{"type": "res-instantiate", "c1": <ID of clause>, "varAssign":<assignment map>}` where the assignment map is of the form `{"X": "f(a)", "Y": "X"}`.  

To reduce visual clutter, two additional moves that do not directly represent calculus rules are available. To hide a clause from view temporarily, a _hide_ move can be used, encoded as `{"type": "res-hide", "c1": <ID of clause>}`. The corresponding _show_ move re-shows all clauses previously hidden from view, encoded as `{"type": "res-show"}`.

## Closing a Proof

A proof can be closed iff the `clauses` list contains an empty clause. A closed proof shows that the clause set is unsatisfiable.
