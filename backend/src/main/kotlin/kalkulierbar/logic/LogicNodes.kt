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

    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is Var)
            return false

        return this.spelling == other.spelling
    }
}

@Serializable
@SerialName("not")
class Not(override var child: LogicNode) : UnaryOp() {

    override fun toString() = "¬$child"

    override fun clone(qm: Map<String, Quantifier>) = Not(child.clone(qm))

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)

    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is Not)
            return false

        return this.child.synEq(other.child)
    }
}

@Serializable
@SerialName("and")
class And(override var leftChild: LogicNode, override var rightChild: LogicNode) : BinaryOp() {

    override fun toString() = "($leftChild ∧ $rightChild)"

    override fun clone(qm: Map<String, Quantifier>) = And(leftChild.clone(qm), rightChild.clone(qm))

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)

    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is And)
            return false

        return this.leftChild.synEq(other.leftChild) && this.rightChild.synEq(other.rightChild)
    }
}

@Serializable
@SerialName("or")
class Or(override var leftChild: LogicNode, override var rightChild: LogicNode) : BinaryOp() {

    override fun toString() = "($leftChild ∨ $rightChild)"

    override fun clone(qm: Map<String, Quantifier>) = Or(leftChild.clone(qm), rightChild.clone(qm))

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)

    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is Or)
            return false

        return this.leftChild.synEq(other.leftChild) && this.rightChild.synEq(other.rightChild)
    }
}

@Serializable
@SerialName("impl")
class Impl(override var leftChild: LogicNode, override var rightChild: LogicNode) : BinaryOp() {

    override fun toString() = "($leftChild → $rightChild)"

    override fun clone(qm: Map<String, Quantifier>) = Impl(leftChild.clone(qm), rightChild.clone(qm))

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)

    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is Impl)
            return false

        return this.leftChild.synEq(other.leftChild) && this.rightChild.synEq(other.rightChild)
    }
}

@Serializable
@SerialName("equiv")
class Equiv(override var leftChild: LogicNode, override var rightChild: LogicNode) : BinaryOp() {

    override fun toString() = "($leftChild <=> $rightChild)"

    override fun clone(qm: Map<String, Quantifier>) = Equiv(leftChild.clone(qm), rightChild.clone(qm))

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)

    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is Equiv)
            return false

        return this.leftChild.synEq(other.leftChild) && this.rightChild.synEq(other.rightChild)
    }
}

@Serializable
@SerialName("relation")
class Relation(val spelling: String, var arguments: List<FirstOrderTerm>) : SyntacticEquality, LogicNode() {

    override fun toString() = "$spelling(${arguments.joinToString(", ")})"

    override fun clone(qm: Map<String, Quantifier>): Relation {
        val args = arguments.map { it.clone(qm) }
        return Relation(spelling, args)
    }

    // Implement simple clone function required by SynEq
    override fun clone() = clone(mapOf())

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)

    /**
     * Check if two relations are syntactically (as opposed to referentially) identical
     * @param other Object to check for syntactic equality
     * @return true iff the relations are equal
     */
    @Suppress("ReturnCount")
    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is Relation)
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

    @Suppress("ReturnCount")
    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is UniversalQuantifier)
            return false

        if (this.varName != other.varName)
            return false

        if (!this.child.synEq(other.child))
            return false

        if (this.boundVariables.size != other.boundVariables.size)
            return false

        for (i in this.boundVariables.indices) {
            if (!this.boundVariables[i].synEq(other.boundVariables[i]))
                return false
        }
        return true
    }
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

    @Suppress("ReturnCount")
    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is ExistentialQuantifier)
            return false

        if (this.varName != other.varName)
            return false

        if (!this.child.synEq(other.child))
            return false

        if (this.boundVariables.size != other.boundVariables.size)
            return false

        for (i in this.boundVariables.indices) {
            if (!this.boundVariables[i].synEq(other.boundVariables[i]))
                return false
        }
        return true
    }
}

@Serializable
@SerialName("box")
class Box(override var child: LogicNode) : UnaryOp() {

    override fun toString() = "□$child"

    override fun clone(qm: Map<String, Quantifier>) = Box(child.clone(qm))

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)

    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is Box)
            return false

        return this.child.synEq(other.child)
    }
}

@Serializable
@SerialName("diamond")
class Diamond(override var child: LogicNode) : UnaryOp() {

    override fun toString() = "◇$child"

    override fun clone(qm: Map<String, Quantifier>) = Diamond(child.clone(qm))

    override fun <ReturnType> accept(visitor: LogicNodeVisitor<ReturnType>) = visitor.visit(this)

    override fun synEq(other: Any?): Boolean {
        if (other == null || other !is Diamond)
            return false

        return this.child.synEq(other.child)
    }
}
