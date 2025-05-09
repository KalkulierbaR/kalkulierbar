package kalkulierbar.sequent.prop

import kalkulierbar.sequent.GenericSequentCalculusState
import kalkulierbar.sequent.TreeNode
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable

@Serializable
class PropositionalSequentState(
    override val tree: MutableList<TreeNode> = mutableListOf(),
    override var showOnlyApplicableRules: Boolean = false,
) : ProtectedState(),
    GenericSequentCalculusState {
    override var seal = ""

    override fun getHash(): String = "psc|${tree.joinToString()}|$showOnlyApplicableRules"
}
