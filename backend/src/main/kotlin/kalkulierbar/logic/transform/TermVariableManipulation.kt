package kalkulierbar.logic.transform

import kalkulierbar.logic.Constant
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.Function
import kalkulierbar.logic.QuantifiedVariable

class VariableInstantiator(val replacementMap: Map<String, FirstOrderTerm>) : FirstOrderTermVisitor<FirstOrderTerm>() {

    override fun visit(node: QuantifiedVariable): FirstOrderTerm {
        if (replacementMap[node.spelling] != null) {
            // Clone the term to avoid object-sharing related weirdness
            return replacementMap[node.spelling]!!.clone()
        }

        return node
    }

    override fun visit(node: Constant) = node

    override fun visit(node: Function): FirstOrderTerm {
        node.arguments = node.arguments.map { it.accept(this) }

        return node
    }
}

class VariableSuffixAppend(val suffix: String) : FirstOrderTermVisitor<FirstOrderTerm>() {

    override fun visit(node: QuantifiedVariable): FirstOrderTerm {
        node.spelling = "${node.spelling}$suffix"
        return node
    }

    override fun visit(node: Constant) = node

    override fun visit(node: Function): FirstOrderTerm {
        node.arguments = node.arguments.map { it.accept(this) }

        return node
    }
}
