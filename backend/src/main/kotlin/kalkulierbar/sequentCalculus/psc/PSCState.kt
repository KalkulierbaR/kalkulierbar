package kalkulierbar.sequentCalculus.psc

import kalkulierbar.sequentCalculus.GenericSequentCalculusNode
import kalkulierbar.sequentCalculus.GenericSequentCalculusState
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable

@Serializable
class PSCState(
    override val tree: MutableList<GenericSequentCalculusNode> = mutableListOf<GenericSequentCalculusNode>(),
    override var showOnlyApplicableRules: Boolean = false
) : GenericSequentCalculusState, ProtectedState() {
    override var seal = ""

    override fun getHash(): String {
        return "psc|${tree.joinToString()}|$showOnlyApplicableRules"
    }
}
