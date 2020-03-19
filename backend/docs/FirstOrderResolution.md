# First Order Resolution

First Order Resolution is an extension of the propositional resolution calculus for first-order logic.

## Input Format Specification

The input to a First Order Resolution proof is the first order formula whose insatisfiability is to be proven. 
Details regarding the input format specification can be found in [FirstOrderFormula.md](./FirstOrderFormula.md).  

As the calculus operates on first order clause sets, the input formula is transformed into Skolem Normal Form and 
then converted into a clause set with implicitly universally quantified variables.

## State Format Specification

The state representation returned by most endpoints is a JSON object. 
Some of the object's properties are for internal use only and are subject to change at any time. 
The state object is intended to be read-only and any modification may lead to the state being rejected by the API. 
The only property that a visualization frontend should rely on is the `clauseSet.clauses` list.

The `clauses` list holds the user-supplied clauses, each clause having a list of atoms (`atoms`). 
Each atom has a `lit` property holding an atomic formula (a Relation) as well as a `negated` 
flag to indicate a negated atom.

## Rule Specification

Just as in the propositional case, the first-order resolution calculus has only one main rule: _resolution_.

The resolution rule takes two different clauses in the `clauses` with one literal selected in each clause and creates 
new 'virtual' clauses by applying the most general unifier of the two selected atoms. 
These virtual clauses are then resolved as in the propositional case using the common unified atom. 
The resulting clause containing all the atoms from both clauses except for the selected atoms is added to the clause set. 
The virtual clauses are discarded, the original clauses remain unchanged. 
For the rule to be applicable, the two selected atoms have to have a most general unifier. 
Analogous to the propositional case, the selected atoms must be of opposing polarity as well.

First-order resolution moves are encoded as `{"type": "res-resolveunify", "c1": <ID of first clause>, 
"c2": <ID of second clause>, "l1": <Index of the selected literal in c1>, "l2": <Index of the selected literal in c2>}`. 
The id of a clause is defined as its position in the `clauses` list.

To reduce visual clutter, two additional moves that do not directly represent calculus rules are available. 
To hide a clause from view temporarily, a _hide_ move can be used, encoded as `{"type": "res-hide", "c1": <ID of clause>}`. 
The corresponding _show_ move re-shows all clauses previously hidden from view, encoded as `{"type": "res-show"}`.

The second important rule of the FO resolution calculus is the factorization rule. Within a clause, 
two chosen atoms can be unified, creating a new clause with one less atom and potentially changed variable instantiations. 
The most general unifier for two selected atoms is generated and applied automatically. 
The factorization move can only be applied if a unifier exists for the two selected atoms. 
The original clause remains in the clause set but will be hidden by default. 
The factorized clause will be added to the set in its place.  

Factorization moves are encoded as `{"type": "res-factorize", "c1": <ID of clause to factorize>, 
"a1": <Index of first chosen atom>, "a2": <Index of second chosen atom>}`.

## Closing a Proof

A proof can be closed iff the `clauses` list contains an empty clause. 
A closed proof shows that the clause set is unsatisfiable.
