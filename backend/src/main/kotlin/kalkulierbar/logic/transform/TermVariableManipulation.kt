package kalkulierbar.logic.transform

import kalkulierbar.logic.Constant
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.Function
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.Relation

class VariableInstantiator(val replacementMap: Map<String, FirstOrderTerm>) : FirstOrderTermVisitor<FirstOrderTerm>() {

    companion object {
        fun transform(term: FirstOrderTerm, map: Map<String, FirstOrderTerm>): FirstOrderTerm {
            val instance = VariableInstantiator(map)
            return term.accept(instance)
        }

        fun transformRelation(relation: Relation, map: Map<String, FirstOrderTerm>): Relation {
            val instance = VariableInstantiator(map)
            relation.arguments = relation.arguments.map { it.accept(instance) }
            return relation
        }
    }

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

class TermContainsVariable(val variable: String) : FirstOrderTermVisitor<Boolean>() {

    companion object {
        fun check(term: FirstOrderTerm, variable: String): Boolean {
            val instance = TermContainsVariable(variable)
            return term.accept(instance)
        }
    }

    override fun visit(node: QuantifiedVariable) = (node.spelling == variable)

    override fun visit(node: Constant) = false

    override fun visit(node: Function) = node.arguments.fold(false) { acc, term -> acc || term.accept(this) }
}
