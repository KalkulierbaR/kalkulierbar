package kalkulierbar.logic

import kalkulierbar.logic.transform.LogicNodeVisitor
import kotlinx.serialization.Serializable

class Var(var spelling: String) : LogicNode() {

    override fun toString() = spelling

    override fun clone() = Var(spelling)

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class Not(child: LogicNode) : UnaryOp(child) {

    override fun toString() = "!$child"

    override fun clone() = Not(child.clone())

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class And(leftChild: LogicNode, rightChild: LogicNode) : BinaryOp(leftChild, rightChild) {

    override fun toString() = "($leftChild ∧ $rightChild)"

    override fun clone() = And(leftChild.clone(), rightChild.clone())

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class Or(leftChild: LogicNode, rightChild: LogicNode) : BinaryOp(leftChild, rightChild) {

    override fun toString() = "($leftChild ∨ $rightChild)"

    override fun clone() = Or(leftChild.clone(), rightChild.clone())

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class Impl(leftChild: LogicNode, rightChild: LogicNode) : BinaryOp(leftChild, rightChild) {

    override fun toString() = "($leftChild --> $rightChild)"

    override fun clone() = Impl(leftChild.clone(), rightChild.clone())

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class Equiv(leftChild: LogicNode, rightChild: LogicNode) : BinaryOp(leftChild, rightChild) {

    override fun toString() = "($leftChild <=> $rightChild)"

    override fun clone() = Equiv(leftChild.clone(), rightChild.clone())

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

@Serializable
class Relation(val spelling: String, var arguments: List<FirstOrderTerm>) : SyntacticEquality, LogicNode() {

    override fun toString() = "$spelling(${arguments.joinToString(", ")})"

    override fun clone(): Relation {
        val args = arguments.map { it.clone() }
        return Relation(spelling, args)
    }

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)

    /**
     * Check if two relations are syntactically (as opposed to referentially) identical
     * @param other Object to check for syntactic equality
     * @return true iff the relations are equal
     */
    @Suppress("ReturnCount")
    override fun synEq(other: Any?): Boolean {
        if (other == null || !(other is Relation))
            return false

        if (spelling != other.spelling || arguments.size != other.arguments.size)
            return false

        for (i in arguments.indices) {
            if (!arguments[i].synEq(other.arguments[i]))
                return false
        }

        return true
    }
}

class UniversalQuantifier(
    varName: String,
    child: LogicNode,
    boundVariables: MutableList<QuantifiedVariable>
) : Quantifier(varName, child, boundVariables) {

    override fun toString() = "(∀$varName: $child)"

    override fun clone() = UniversalQuantifier(varName, child.clone(), mutableListOf())

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

class ExistentialQuantifier(
    varName: String,
    child: LogicNode,
    boundVariables: MutableList<QuantifiedVariable>
) : Quantifier(varName, child, boundVariables) {

    override fun toString() = "(∃$varName: $child)"

    override fun clone() = ExistentialQuantifier(varName, child.clone(), mutableListOf())

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}
