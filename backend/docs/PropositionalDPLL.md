# Propositional DPLL

## Input Format Specification

The input to a DPLL proof is the clause set whose insatisfiability is to be proven. Details regarding the input format specification can be found in [ClauseSet.md](./ClauseSet.md).

## State Format Specification

The state representation returned by most endpoints is a JSON object. Some of the object's properties are for internal use only and are subject to change at any time. The state object is intended to be read-only and any modification may lead to the state being rejected by the API. The only properties that a visualization frontend should rely on are the `tree` list and the `clauseSet.clauses` list.

The `tree` lists contains all nodes of the current proof tree. A node is identified by its position in the list starting at zero. Each node has the properties `parent` and `children`, containing the IDs of the respective parent and child nodes. The parent of the root node is `null`. Additionally, nodes have a `label` which contains the text they should be presented with, a `type`, which identifies them as a node created using a propagation rule (`PROP`) or a split rule (`SPLIT`). The root node has the type `ROOT`, annotations marking a branch as either closed or representing a model are of type `CLOSED` and `MODEL` respectively. For model nodes, the `modelVerified` flag indicates whether the user has manually provided a satisfying model for the node. Every node has the field `diff`, which contains a delta representation of the changes to the clause set that are to be applied in this node relative to its parent. The initial clause set at the root node is the one specified by the user.

There are four different types of clause set deltas: The identity diff, which indicates no change (`{type: "cd-identity"}`), the delete clause diff, which indicates removal of a clause (`{type: "cd-delclause", id:<ID of clause to remove>}`), the delete atom diff, which indicates removal of a single atom from a clause (`{type: "cd-delatom", cid: <ID of containing clause>, aid: <Index of atom to remove>}`), and the add clause diff (`type: "cd-addclause", clause: <Clause object>` where the clause object is of the same format as the clauses in `clauseSet.clauses`). 

The `clauses` list holds the user-supplied clauses, each clause having a list of atoms (`atoms`). Each atom has a `lit` property holding the variable name as well as a `negated` flag to indicate a negated variable.

## Rule Specification

### Propagate

The propagate rule can be applied on any node that is not an annotation, given that the node's associated clause set contains a clause with only a single atom. For the clause set to be satisfied, this single atom must necessarily be satisfied as well. This information can propagated in two ways: By removing clauses containing an identical atom, since we now know already that these clauses are satisfied should the atom be satisfied, or by removing an identical atom of opposite polarity from a clause as we know the negated atom cannot be satisfied. The rule takes the single-atom clause and an atom in another clause as arguments and appends a new node on the selected node. Depending on the polarity of the selected atom, the clause set of the appended node either has the selected atom removed from the clause or the entire clause removed from the set as described above.  

Propagate moves are encoded as `{type: "dpll-prop", branch: <ID of selected node>, baseClause: <ID of single-atom clause>, propClause: <ID of clause to propagate information to>, propAtom: <Index of atom to use for propagation>}`.

### Split

The split rule is used to introduce a case distinction over a selected variable into the proof tree. It can be applied on any node that is not an annotation. Given the variable the case distinction is to be applied on (`v` from here on), the proof is split at the selected node into two branches. One branch will contain the added clause `{v}`, the other the added clause `{!v}`. Apart from that, the clause sets remain unchanged.   

Split moves are encoded as `{type: "dpll-split", branch: <ID of node to split at>, literal: <Variable name to use>}`.

### Modelcheck

The model checking rule can be applied on model-annotations (type `MODEL`) only. While not a part of the formal calculus, it allows the user to provide a variable interpretation and verifies that this interpretation satisfies the clause set associated with the model node. On a successfull verification, the model node will be marked as verified using the `modelVerified` flag.  

Model checking moves are encoded as `{type: "dpll-modelcheck", branch: <ID of model node>, interpretation: {<Map of variable assignments>}}` where the interpretation map is of the format `{"somevar": true, "othervar": false, ...}` to assign these truth values to the variables.

### Prune

The prune rule deletes the subtree rooted at a selected node in the proof tree. This cannot be undone. The prune rule cannot be used to remove annotations (`CLOSED` or `MODEL`) nodes from their parent nodes.  

Prune moves are encoded as `{type: "dpll-prune", branch: <ID of node to prune at>}`.

## Closing a Proof

A proof can be closed if and only if every leaf of the proof tree is of type `CLOSED`. A closed proof shows that the clause set used is unsatisfiable.

