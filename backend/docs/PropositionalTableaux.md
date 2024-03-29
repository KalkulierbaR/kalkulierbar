# Propositional Tableaux

## Input Format Specification

The input to a Propositional Tableaux proof is the clause set whose insatisfiability is to be proven.
Details regarding the input format specification can be found in [ClauseSet.md](./ClauseSet.md).

## State Format Specification

The state representation returned by most endpoints is a JSON object.
Some of the object's properties are for internal use only and are subject to change at any time.
The state object is intended to be read-only and any modification may lead to the state being rejected by the API.
The only properties that a visualization frontend should rely on are the `tree` list and the `clauseSet.clauses` list.

The `tree` lists contains all nodes of the current proof tree.
A node is identified by its position in the list starting at zero.
Each node has the properties `parent` and `children`, containing the IDs of the respective parent and child nodes.
The parent of the root node is `null`. Additionally, nodes have a `spelling` and a `negated` flag.
A set `negated` flag indicates that the node represents a negated variable, the `spelling` is the name of said variable. 
Nodes in a subtree that is completely closed will have the `isClosed` flag set,
closed leaves have the ID of the node they were closed with set as `closeRef`.
For all other nodes, `closeRef` is `null`.

The `clauses` list holds the user-supplied clauses, each clause having a list of atoms (`atoms`).
Each atom has a `lit` property holding the variable name as well as a `negated` flag to indicate a negated variable.

## Rule Specification

### Initialize

The initialize rule can only be applied to an empty proof tree and creates a single root node
which the proof tree will be built upon.
This rule is automatically applied after parsing the input clause set and cannot be applied manually.

### Expand

The expand rule can be applied to any non-closed leaf in the proof tree using any of the clauses
available in the provided clause set. When the rule is applied, the atoms of the selected clause
are appended as children to the selected leaf node, thereby turning it into a non-leaf node.
The rule cannot be applied to non-leaf nodes or closed leaf nodes.

Expand moves are encoded as 
```json
{
  "type": "tableaux-expand", 
  "id1": <ID of leaf to expand on>, 
  "id2": <ID of clause to expand>
}
``` 
A node's or clause's ID is defined as its respective position in the `tree` or `clauses` list in the state JSON object.

### Close

The close rule can be applied to a leaf node in the proof tree if and only if a node with the same
variable name (`spelling`) and opposite `negated` value exists on the path from the leaf node to the tree root.
This is usually visualized by connecting the root node to the corresponding node used for closure.

Close moves are encoded as 
```json
{
  "type": "tableaux-close", 
  "id1": <ID of leaf to close>, 
  "id2": <ID of node to close with>
}
```

### Lemma

Using the lemma creation rule, a proven assumption can be expanded at specific locations in a proof.
Every node in the proof tree whose children contain no open leaves (i.e. the nodes `isClosed` is `true`)
represents a valid proof of the unsatisfyability of that node (lemma node),
given all the assumptions above the node in the proof tree.
Therefore, we can assume that the negation of the lemma node holds in all branches
of the tree that share the same predecessors.
The lemma rule formalizes this by expanding the negation of the lemma node at a leaf
that is a transitive child of the lemma node's immediate parent node.

Lemma rule applications are encoded as
```json
{
  "type": "tableaux-lemma", 
  "id1": <ID of leaf to expand lemma on>, 
  "id2": <ID of node to create lemma from>`
}  
```
Nodes created using a lemma rule instantiation will have the `lemmaSource` attribute set to the ID
of the node they were created from to indicate their origin. For all other nodes, `lemmaSource` is `null`.

### Undo

The undo move reverts the latest expand or close move and reverts the state to the point
before executing the given move.
It can be used only if the backtracking option is enabled.

Undo moves are encoded as 
```json
{
  "type": "tableaux-undo"
}
```

## Closing a Proof

A proof can be closed if and only if every leaf of the proof tree has been closed
by applying the `close` move on that leaf.
A closed proof shows that the clause set used is unsatisfiable.

## Variants

### Regularity

A proof may be restricted to a regular tableaux which does not permit duplicate atoms
(nodes sharing the same variable name and negation state) on any root-to-leaf path in the proof tree.
Attempts to use the expand rule which would introduce a duplicate atom on a root-to-leaf path will fail.

### Weak Connectedness

With weak connectedness enabled, every non-leaf and non-root node has to have at least one child that is a closed leaf.
Attempts to expand a clause which would result in no closable children will fail.
After expanding a clause, no further expand moves can be applied until at least on of the new leaves
created is closed, thus restoring connectedness.

### Strong Connectedness

Strong connectedness is completely analogous to weak connectedness with the exception
that at least one new leaf has to be closed **with its direct parent node**.
As with weak connectedness, attempts to expand clauses not resulting in a thus closeable leaf will fail.
