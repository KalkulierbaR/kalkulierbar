# Non Clausal Tableaux

The Non-clausal Tableaux is like a First Order Tableaux but without the clausal aspect.

## Input Format Specification

The input to a Non-clausal Tableaux proof is the first order formula whose insatisfiability is to be proven.  
Details regarding the input format specification can be found in [FirstOrderFormula.md](./FirstOrderFormula.md).   

As the calculus operates on first order formula in Negation Normal Form,  
the input formula is transformed into Negation Norm Form.

## State Format Specification

The state representation returned by most endpoints is a JSON object.  
Some of the object's properties are for internal use only and are subject to change at any time.  
The state object is intended to be read-only and any modification may lead to the state being rejected by the API.  
The only property that a visualization frontend should rely on is the `nodes` list.  

The `node` lists contains all nodes of the current proof tree.  
A node is identified by its position in the list starting at zero.  
Each node has the properties `parent` and `children`, containing the IDs of the respective parent and child nodes.  
The parent of the root node is `null`. Additionally, nodes have a `spelling` and a `isClosed` flag.   
The `spelling` contains a textual rendering of the formula, modified by an action in the same branch.  
Nodes in a subtree that is completely closed will have the `isClosed` flag set,   
closed leaves have the ID of the node they were closed with set as `closeRef`.  
For all other nodes, `closeRef` is `null`.  

## Rule Specification

### Alpha α

The alpha rule can be applied to any non-closed node in the proof tree using the formula of selected node.  
When the rule is applied, a formula of the form Φ = Φ1 ∧ ... ∧ Φn (where Φ1..Φn are sub-formulae) is split  
into n sub-formulae all chained on one single branch.  
A non-leaf node will be split too but the old child-nodes are added to the last node of the newly formed chain.  

Alpha moves are encoded as 
```json
{
  "type": "alpha", 
  "nodeID": <ID of node to apply on>
} 
```
A node's ID is defined as its respective position in the `nodes` list in the state JSON object.  

### Beta β

The beta rule can be applied to any non-closed leaf in the proof tree using the formula of selected node.  
When the rule is applied, a formula of the form Φ = Φ1 ∨ ... ∨ Φn (where Φ1..Φn are sub-formulae) is split  
into n sub-formulae all added as child nodes to the current node.  

Beta moves are encoded as 
```json
{
  "type": "beta", 
  "nodeID": <ID of node to apply on>
}
```

### Gamma ɣ

The gamma rule can be applied to any non-closed node as long as  
an universal quantifier is the outermost logic operator.  
When the rule is applied, the universal quantifier is removed  
and quantified variables are instantiated with fresh variables.  
A child node with applied modifications is added to current node.  

Gamma moves are encoded as 
```json
{
"type": "gamma", "nodeID": <ID of node to apply on>
}
```

### Delta δ

The delta rule can be applied to any non-closed node as long as  
an existential quantifier is the outermost logic operator.  
When the rule is applied, the existential quantifier is removed  
and quantified variables are instantiated  
with a skolem term, depending on all free variables in the formula of current node.  
A child node with applied modifications is added to current node.  

Delta moves are encoded as
```json
{
  "type": "delta", 
  "nodeID": <ID of node to apply on>
}
```

### Close

The close rule can be applied to a non-closed node in the proof tree if and only if a node with a compatible relation   
and opposite negation exists on the path from the node to the tree root.  
Two relations are compatible for this purpose if their name and arity is identical and there exists a  
unifying variable assignment under which the relation's arguments are equal.  
For the manual close rule, this unifying assignment has to be given by the user.  
When the close rule is applied, the unifying assignment is applied on the entire tree,  
i.e. all variables present in the assignment map are replaced with their replacement terms.   
Branch closure is usually visualized by connecting the root node to the corresponding node used for closure.  

Close moves are encoded as 
```json
{
  "type": "close", 
  "nodeID": <ID of node to close>, 
  "closeID": <ID of node to close with>, 
  "varAssign": <assignment map>
}
```
where the assignment map is of the form `{"X": "f(a)", "Y": "X"}`.  

### Undo

The undo move reverts the latest move and reverts the state to the point before executing the given move.  
It can be used only if the backtracking option is enabled.  

Undo moves are encoded as 
```json
{
  "type": "undo"
}
```

## Closing a Proof

A proof can be closed if and only if every branch of the proof tree has been closed   
by applying the `close` move on a node in this branch.  
A closed proof shows that the formula used is unsatisfiable.  
