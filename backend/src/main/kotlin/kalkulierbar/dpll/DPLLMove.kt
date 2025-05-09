package kalkulierbar.dpll

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.polymorphic
import kotlinx.serialization.modules.subclass

// Context object for move serialization
// Tells kotlinx.serialize about child types of DPLLMove
val dpllMoveModule =
    SerializersModule {
        polymorphic(DPLLMove::class) {
            subclass(MoveSplit::class)
            subclass(MovePropagate::class)
            subclass(MovePrune::class)
            subclass(MoveModelCheck::class)
        }
    }

@Serializable
abstract class DPLLMove

@Serializable
@SerialName("dpll-split")
data class MoveSplit(
    val branch: Int,
    val literal: String,
) : DPLLMove()

@Serializable
@SerialName("dpll-prop")
data class MovePropagate(
    val branch: Int,
    val baseClause: Int,
    val propClause: Int,
    val propAtom: Int,
) : DPLLMove()

@Serializable
@SerialName("dpll-prune")
data class MovePrune(
    val branch: Int,
) : DPLLMove()

@Serializable
@SerialName("dpll-modelcheck")
data class MoveModelCheck(
    val branch: Int,
    val interpretation: Map<String, Boolean>,
) : DPLLMove()
