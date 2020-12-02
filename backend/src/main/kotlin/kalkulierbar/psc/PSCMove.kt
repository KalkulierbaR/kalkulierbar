package kalkulierbar.psc

import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus
import kotlinx.serialization.Serializable

import kotlinx.serialization.SerialName
import kotlinx.serialization.modules.SerializersModule

// Context object for move serialization
// Tells kotlinx.serialize about child types of DPLLMove
val pscMoveModule = SerializersModule {
    polymorphic(PSCMove::class) {
        MoveNotLeft::class with MoveNotLeft.serializer()
    }
}

@Serializable
abstract class PSCMove

@Serializable
@SerialName("psc-notLeft")
data class MoveNotLeft(val state: PSCState, val move: PSCMove) : PSCMove()
