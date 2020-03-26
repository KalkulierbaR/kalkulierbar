package kalkulierbar.logic

import kalkulierbar.logic.transform.LogicNodeVisitor
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
@SerialName("var")
class Var(var spelling: String) : LogicNode() {

    override fun toString() = spelling

    override fun clone(qm: Map<String, Quantifier>) = Var(spelling)

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

@Serializable
@SerialName("not")
class Not(override var child: LogicNode) : UnaryOp() {

    override fun toString() = "¬$child"

    override fun clone(qm: Map<String, Quantifier>) = Not(child.clone(qm))

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

@Serializable
@SerialName("and")
class And(override var leftChild: LogicNode, override var rightChild: LogicNode) : BinaryOp() {

    override fun toString() = "($leftChild ∧ $rightChild)"

    override fun clone(qm: Map<String, Quantifier>) = And(leftChild.clone(qm), rightChild.clone(qm))

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

@Serializable
@SerialName("or")
class Or(override var leftChild: LogicNode, override var rightChild: LogicNode) : BinaryOp() {

    override fun toString() = "($leftChild ∨ $rightChild)"

    override fun clone(qm: Map<String, Quantifier>) = Or(leftChild.clone(qm), rightChild.clone(qm))

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

@Serializable
@SerialName("impl")
class Impl(override var leftChild: LogicNode, override var rightChild: LogicNode) : BinaryOp() {

    override fun toString() = "($leftChild --> $rightChild)"

    override fun clone(qm: Map<String, Quantifier>) = Impl(leftChild.clone(qm), rightChild.clone(qm))

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

@Serializable
@SerialName("equiv")
class Equiv(override var leftChild: LogicNode, override var rightChild: LogicNode) : BinaryOp() {

    override fun toString() = "($leftChild <=> $rightChild)"

    override fun clone(qm: Map<String, Quantifier>) = Equiv(leftChild.clone(qm), rightChild.clone(qm))

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

@Serializable
@SerialName("relation")
class Relation(val spelling: String, var arguments: List<FirstOrderTerm>) : SyntacticEquality, LogicNode() {

    override fun toString() = "$spelling(${arguments.joinToString(", ")})"

    override fun clone(qm: Map<String, Quantifier>): Relation {
        val args = arguments.map { it.clone(qm) }
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

@Serializable
@SerialName("allquant")
class UniversalQuantifier(
    override var varName: String,
    override var child: LogicNode,
    override val boundVariables: MutableList<QuantifiedVariable>
) : Quantifier() {

    override fun toString() = "(∀$varName: $child)"

    override fun clone(qm: Map<String, Quantifier>): UniversalQuantifier {
        val newQuantifier = UniversalQuantifier(varName, child, mutableListOf())

        // Set this quantifier as the binding one for variables of name $varName
        val modMap = qm.toMutableMap()
        modMap[varName] = newQuantifier

        // Replace the child reference with a deep copy and compute quantifier linking
        newQuantifier.child = child.clone(modMap)
        return newQuantifier
    }

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}

@Serializable
@SerialName("exquant")
class ExistentialQuantifier(
    override var varName: String,
    override var child: LogicNode,
    override val boundVariables: MutableList<QuantifiedVariable>
) : Quantifier() {

    override fun toString() = "(∃$varName: $child)"

    override fun clone(qm: Map<String, Quantifier>): ExistentialQuantifier {
        val newQuantifier = ExistentialQuantifier(varName, child, mutableListOf())

        // Set this quantifier as the binding one for variables of name $varName
        val modMap = qm.toMutableMap()
        modMap[varName] = newQuantifier

        // Replace the child reference with a deep copy and compute quantifier linking
        newQuantifier.child = child.clone(modMap)
        return newQuantifier
    }

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)
}
