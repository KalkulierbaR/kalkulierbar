package kalkulierbar.signedtableaux

import kalkulierbar.InvalidFormulaFormat
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.parsers.FirstOrderParser
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule

// Context object for move serialization
// Tells kotlinx.serialize about child types of SignedModalTableaux
val SignedModalTablueaxMoveModule = SerializersModule {
    polymorphic(SignedModalTableauxMove::class) {
        NotTrue::class with NotTrue.serializer()
        NotFalse::class with NotFalse.serializer()
        OrTrue::class with OrTrue.serializer()
        OrFalse::class with OrFalse.serializer()
        AndTrue::class with AndTrue.serializer()
        AndFalse::class with AndFalse.serializer()
        AlwaysTrue::class with AlwaysTrue.serializer() 
        AlwaysFalse::class with AlwaysFalse.serializer()
        SometimesTrue::class with AlwaysTrue.serializer()
        SometimesFalse::class with AlwaysFalse.serializer()
        UndoMove::class with UndoMove.serializer()
        CloseMove::class with CloseMove.serializer()
    }
}

@Serializable
abstract class SignedModalTableauxMove

@Serializable
@SerialName("notTrue")
class NotTrue(val nodeID: Int) : SignedModalTableauxMove() {
    override fun toString() = "(notTrue|$nodeID)"
}

@Serializable
@SerialName("notFalse")
class NotFalse(val nodeID: Int) : SignedModalTableauxMove() {
    override fun toString() = "(notFalse|$nodeID)"
}

@Serializable
@SerialName("andTrue")
class AndTrue(val nodeID: Int) : SignedModalTableauxMove() {
    override fun toString() = "(andTrue|$nodeID)"
}

@Serializable
@SerialName("andFalse")
class AndFalse(val nodeID: Int) : SignedModalTableauxMove() {
    override fun toString() = "(andFalse|$nodeID)"
}

@Serializable
@SerialName("orTrue")
class OrTrue(val nodeID: Int) : SignedModalTableauxMove() {
    override fun toString() = "(orTrue|$nodeID)"
}

@Serializable
@SerialName("orFalse")
class OrFalse(val nodeID: Int) : SignedModalTableauxMove() {
    override fun toString() = "(orFalse|$nodeID)"
}

@Serializable
@SerialName("alwaysTrue")
class AlwaysTrue(val nodeID: Int) : SignedModalTableauxMove() {
    override fun toString() = "(alwaysTrue|$nodeID)"
}

@Serializable
@SerialName("alwaysFalse")
class AlwaysFalse(val nodeID: Int) : SignedModalTableauxMove() {
    override fun toString() = "(alwaysFalse|$nodeID)"
}

@Serializable
@SerialName("sometimesTrue")
class SometimesTrue(val nodeID: Int) : SignedModalTableauxMove() {
    override fun toString() = "(sometimesTrue|$nodeID)"
}

@Serializable
@SerialName("sometimesFalse")
class SometimesFalse(val nodeID: Int) : SignedModalTableauxMove() {
    override fun toString() = "(sometimesFalse|$nodeID)"
}

@Serializable
@SerialName("close")
class CloseMove(
    val nodeID: Int,
    val closeID: Int,
    val varAssign: Map<String, String>?
) : SignedModalTableauxMove() {
    /**
     * Parses map values to first-order terms
     * @return null iff varAssign == null
     *         parsed map-values iff varAssign != null
     */
    fun getVarAssignTerms(): Map<String, FirstOrderTerm>? {
        if (varAssign == null)
            return null
        return varAssign.mapValues {
            try {
                FirstOrderParser.parseTerm(it.value)
            } catch (e: InvalidFormulaFormat) {
                throw InvalidFormulaFormat("Could not parse term '${it.value}': ${e.message}")
            }
        }
    }

    override fun toString() = "(close|$nodeID|$closeID|$varAssign)"
}

@Serializable
@SerialName("undo")
class UndoMove : SignedModalTableauxMove() {
    override fun toString() = "(undo)"
}
