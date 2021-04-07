package kalkulierbar.sequent.psc

import kalkulierbar.sequent.GenericSequentCalculusNode
import kalkulierbar.sequent.GenericSequentCalculusState
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
