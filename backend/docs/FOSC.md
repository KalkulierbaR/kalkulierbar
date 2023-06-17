# First Order Sequent Calculus

The First Order Sequent Calculus is a calculus which consists of sequences on which rules can be applied to be solved.
A Sequence consists of a left and a right side seperated by `|-` and each side there may be multiple firstorder formulas
seperated by a `,`

## Input Format Specification

FOSC can accept one or more FirstOrder Formulas (seperated by `,`) which it will put automatically on the right side of the sequence to proof validity.
One can also input a whole sequence by using the `|-` symbol which will seperate the firstorder Formulas on the left side from the formulas on the right side.

## State Format Specification

The state representation returned by most endpoints is a JSON object.
Some of the object's properties are for internal use only and are subject to change at any time.
The state object is intended to be read-only and any modification may lead to the state being rejected by the API.
The only property that a visualization frontend should rely on is the `tree` list.

The `tree` lists contains all TreeNodes of the current proof tree.
A TreeNode is identified by its position in the list starting at zero.
Each TreeNode has the properties `parent` and `children`, containing the IDs of the respective parent and child TreeNodes.
The parent of the root TreeNode is `null`. Additionally, TreeNodes have an `isClosed` flag and a `lastMove` property.
TreeNodes in a subtree that is completely closed will have the `isClosed` flag set.
The `lastMove` property tracks which move was applied on the parent of a TreeNode to get to the current TreeNode. This can be used by the Frontend to visuallize which Rules were applied. 
The `lastMove` property for the root is `null` as no move was applied on the root.
A TreeNode also contains two MutableLists `leftFormulas` and `rightFormulas`. The lists consist of `FirstOrderTerm` and are kept distinct so that duplicate elements will be removed. The Lists contain the formulas which are on the left or right side of the sequence respectively.

## Rule Specification

### Basic Moves

Basic Moves are: `notLeft`, `notRight`, `andLeft`, `andRight`, `orLeft`, `orRight`, `implLeft`, `implRight`, `equivLeft`, `equivRight`, 
These Moves add one or two TreeNodes to the proof tree and set the children and parent properties respectively. 

Basic moves are encoded as 
```json
{
  "type": <identifier for the move>, 
  "nodeID": <ID of the TreeNode to to apply the move on>, 
  "listIndex": <the index in the list `(left/right)Formulas`>, 
}
```

Other Basic Moves are: `Ax`
This move is used to close a Leaf of the proof tree. It checks if there is a formula in `leftFormulas` which is syntactic equal to a formula in `rightFormulas`. If that is the case it will add an empty node as a child of the current Node and sets the `isClosed` flag for all parent nodes which now have no more open children.

Ax is encoded as 
```json
{
  "type": "Ax", 
  "nodeID": <ID of TreeNode to close>, 
}
```

Additionaly to the PSC Moves FOSC has Moves for: `allLeft`, `allRight`, `exLeft`, `exRight`.
These Moves can be used to assign a Constant (in the case of `allRight` and `exLeft`) or any complex term (in the case of `allLeft` and `exRight`) to the BoundVariable of the respective Quantifier.

These FOSC moves are encoded as 
```json
{
  "type": <identifier for the move>, 
  "nodeID": <ID of the TreeNode to to apply the move on>, 
  "listIndex": <the index in the list `(left/right)Formulas`>, 
  "instTerm": <the term to instantiate with as a string>
}
```

### Prune

The Prune move can be used to delete a whole subtree in case a mistake was made or the user wants to find a quicker proof.
Prune takes a node and recursively deletes all children nodes.

Prune is encoded as 
```json
{
  "type": "prune", 
  "nodeID": <ID of TreeNode which childrens are to be deleted>, 
}
```

### Undo

The undo move reverts the latest move and reverts the state to the point before executing the last move.
Undo uses only the `tree` property to decide which move needs to be undone, by using the fact that new TreeNodes will always be added to the end of `tree`. This is why undo cannot be used to undo a `prune` move

Undo moves are encoded as
```json
{
  "type": "undo"
}
```

## Closing a Proof

A proof can be closed if and only if every branch of the proof tree has been closed
by applying the `Ax` move on a Leaf in this branch.
A closed proof shows that the sequence used is valid.
