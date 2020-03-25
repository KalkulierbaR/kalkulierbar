# Propositional Resolution

## Input Format Specification

The input to a Propositional Resolution proof is the clause set whose unsatisfiability is to be proven. 
Details regarding the input format specification can be found in [ClauseSet.md](./ClauseSet.md) and
[PropositionalFormula.md](./PropositionalFormula.md).

## State Format Specification

The state representation returned by most endpoints is a JSON object. 
Some of the object's properties are for internal use only and are subject to change at any time. 
The state object is intended to be read-only and any modification may lead to the state being rejected by the API. 
The only property that a visualization frontend should rely on is the `clauseSet.clauses` list.

The `clauses` list holds the user-supplied clauses, each clause having a list of atoms (`atoms`). 
Each atom has a `lit` property holding the variable name as well as a `negated` flag to indicate a negated variable.

## Rule Specification

### Resolution

The Resolution calculus has one main rule: _resolution_. 
It takes two different clauses in the `clauses` list and a literal that is contained in both clauses and adds a new clause. 
The literal has to be negated in one clause (we will call this `a-`) and not negated in the other (`a+`). 
The new clause is the union of the first clause minus `a-` and the other clause minus `a+`. 
The selected clauses themselves are not changed.

Resolution moves are encoded as
```json
{
  "type": "res-resolve", 
  "c1": <ID of first clause>, 
  "c2": <ID of second clause>, 
  "literal": <Spelling of the literal>
}
```
The id of a clause is defined as its position in the `clauses` list.  
If the literal is set to `null`, a suitable literal will be determined automatically.  

### Hyperresolution

To resolve more than one clause at the same time, the _hyperresolution_ rule could be usefull.  
It takes a main premiss clause and a list of different side premiss clauses in the `clauses` list   
and adds a new clause. While the main premiss can have both positive and negative literals,   
the side premisses contain only positive literals.  
One atom of each side premiss is resolved with the main premiss,   
so that the resulting clause only contains positive literals.

Hyperresolution moves are encoded as
```json
{
  "type": "res-hyper",
  "mainID": <ID of main premiss>,
  "atomMap": <Mapping of main premiss atom to side premiss atom>
}
```
The atomMap maps the ID of an atom in the main premiss to a pair of   
(ID of side premiss , index of atom in that side premiss).

### Factorize

Also available is the _factorize_ rule, which removes all duplicate literals from a clause.  
The original clause without the factorization applied will remain in the clause set, but is hidden by default.   
Factorization moves are encoded as 
```json
{
  "type": "res-factorize", 
  "c1": <ID of clause to factorize>,
  "atoms": <used for FO>
}
```
### Hide / Show

To reduce visual clutter, two additional moves that do not directly represent calculus rules are available.  
To hide a clause from view temporarily, a _hide_ move can be used, encoded as 
```json
{
  "type": "res-hide", 
  "c1": <ID of clause>
}
```
The corresponding _show_ move re-shows all clauses previously hidden from view, encoded as 
```json
{"type": "res-show"}
```
## Closing a Proof

A proof can be closed iff the `clauses` list contains an empty clause.  
A closed proof shows that the clause set is unsatisfiable.
