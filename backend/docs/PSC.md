# Propositional Sequent Calculus

# input formula
(a | b | a) & c
# formula from propositionalParser
(((a or b) or a) and c)
# State representation needed for psc
Leaf({List({}) ==> List({(((a or b) or a) and c)})})
# Representation after andRight
TreeNode(value: "==> (a | b | a) & c", left: Leaf({List({}) ==> List({a or b or a})}), right: Leaf({List({}) ==> List({c})}))
# Representation after orRight
TreeNode(value: "==> (a | b | a) & c", left: TreeNode(value: "==> a | b | a", child: Leaf({List({}) ==> List({a or b}, {a})})), right: Leaf({List({}) ==> List({c})}))
# Representation after orRight
TreeNode(value: "==> (a | b | a) & c", left: TreeNode(value: "==> a | b | a", child: TreeNode(value: "==> a | b, a", child: Leaf({List({}) ==> List({b}, {a})}))), right: Leaf({List({}) ==> List({c})}))
