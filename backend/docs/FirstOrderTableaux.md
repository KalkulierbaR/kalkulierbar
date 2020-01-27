# First Order Tableaux

The first order tableaux is an extension of the propositional tableaux for first order logic.

## Input Format Specification

The input to a First Order Tableaux proof is the first order formula whose insatisfiability is to be proven. Details regarding the input format specification can be found in [FirstOrderFormula.md](./FirstOrderFormula.md).  

As the calculus operates on first order clause sets, the input formula is transformed into Skolem Normal Form and then converted into a clause set with implicitly universally quantified variables.

## State Format Specification

The state representation returned by most endpoints is a JSON object. Some of the object's properties are for internal use only and are subject to change at any time. The state object is intended to be read-only and any modification may lead to the state being rejected by the API. The only properties that a visualization frontend should rely on are the `nodes` list and the `renderedClauses` list.

The `node` lists contains all nodes of the current proof tree. A node is identified by its position in the list starting at zero. Each node has the properties `parent` and `children`, containing the IDs of the respective parent and child nodes. The parent of the root node is `null`. Additionally, nodes have a `spelling` and a `negated` flag. A set `negated` flag indicates that the node represents a negated relation, `spelling` contains a textual rendering of the relation. Nodes in a subtree that is completely closed will have the `isClosed` flag set, closed leaves have the ID of the node they were closed with set as `closeRef`. For all other nodes, `closeRef` is `null`.

The `renderedClauses` list holds a textual representation of the user-supplied clauses.

## Rule Specification

### Initialize

The initialize rule can only be applied to an empty proof tree and creates a single root node which the proof tree will be built upon. This rule is automatically applied after parsing the input formula and cannot be applied manually.

### Expand

The expand rule can be applied to any non-closed leaf in the proof tree using any of the clauses available in the provided clause set. When the rule is applied, the atoms of the selected clause are appended as children to the selected leaf node, thereby turning it into a non-leaf node.
The rule cannot be applied to non-leaf nodes or closed leaf nodes. Any variables present in the clause that is expanded will be re-named to be fresh.

Expand moves are encoded as `{"type":"EXPAND","id1":<ID of leaf to expand on>,"id2":<ID of clause to expand>,"varAssign":{}}`. A node's or clause's ID is defined as its respective position in the `nodes` or `renderedClauses` list in the state JSON object.

### Close

The close rule can be applied to a leaf node in the proof tree if and only if a node with a compatible relation and opposite `negated` value exists on the path from the leaf node to the tree root. Two relations are compatible for this purpose if their name and arity is identical and there exists a unifying variable assignment under which the relation's arguments are equal. For the manual close rule, this unifying assignment has to be given by the user. When the close rule is applied, the unifying assignment is applied on the entire tree, i.e. all variables present in the assignment map are replaced with their replacement terms.  
Branch closure is usually visualized by connecting the root node to the corresponding node used for closure.

Close moves are encoded as `{"type":"CLOSE","id1":<ID of leaf to close>,"id2":<ID of node to close with>,"varAssign":<assignment map>}` where the assignment map is of the form `{"X": "f(a)", "Y": "X"}`.

### Automatic close

The unifying variable assignment can be computed automatically as well. The automatic close rule is identical to the regular close rule except that no assignment has to be specified by the user.  

Automatic close moves are encoded as `{"type":"AUTOCLOSE","id1":<ID of leaf to close>,"id2":<ID of node to close with>,"varAssign":{}}`.

## Closing a Proof

A proof can be closed if and only if every leaf of the proof tree has been closed by applying the `close` move on that leaf. A closed proof shows that the clause set used is unsatisfiable.

## Undo

The undo move reverts the latest expand or close move and reverts the state to the point before executing the given move. It can be used only if the backtracking option is enabled.

Close moves are encoded as `{"type":"UNDO","id1":<Any integer>,"id2":<Any integer>,"varAssign":{}}`.

# Variants

## Regularity

A proof may be restricted to a regular tableaux which does not permit duplicate atoms (nodes with equal relations and negation state) on any root-to-leaf path in the proof tree. Attempts to use the expand rule which would introduce a duplicate atom on a root-to-leaf path will fail. Close moves may also fail if applying the specified variable assignment would introduce duplicate atoms.

## Weak Connectedness

With weak connectedness enabled, every non-leaf and non-root node has to have at least one child that is a closed leaf. Attempts to expand a clause which would result in no closable children will fail. After expanding a clause, no further expand moves can be applied until at least on of the new leaves created is closed, thus restoring connectedness.

## Strong Connectedness

Strong connectedness is completely analogous to weak connectedness with the exception that at least one new leaf has to be closed **with its direct parent node**. As with weak connectedness, attempts to expand clauses not resulting in a thus closeable leaf will fail.
