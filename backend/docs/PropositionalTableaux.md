# Propositional Tableaux

## Format Specification

The input to a Propositional Tableaux proof is the clause set whose insatisfiability is to be proven. Details regarding the input format specification can be found in [ClauseSet.md](./ClauseSet.md).

## Rule Specification

### Initialize

The initialize rule can only be applied to an empty proof tree and creates a single root node which the proof tree will be built upon. This rule is automatically applied after parsing the input clause set and cannot be applied manually.

### Expand

The expand rule can be applied to any non-closed leaf in the proof tree using any of the clauses available in the provided clause set. When the rule is applied, the atoms of the selected clause are appended as children to the selected leaf node, thereby turning it into a non-leaf node.  
The rule cannot be applied to non-leaf nodes or closed leaf nodes.

### Close

The close rule can be applied to a leaf node in the proof tree if and only if a node with the same variable name (`spelling`) and opposite `negated` value exists on the path from the leaf node to the tree root. This is usually visualized by connecting the root node to the corresponding node used for closure.

## Closing a Proof

A proof can be closed if and only if every leaf of the proof tree has been closed by applying the `close` move on that leaf. A closed proof shows that the clause set used is unsatisfiable.
