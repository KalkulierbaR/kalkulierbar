package kalkulierbar.sequent.fo

import kalkulierbar.sequent.GenericSequentCalculusState
import kalkulierbar.sequent.TreeNode
import kalkulierbar.tamperprotect.ProtectedState
import kotlinx.serialization.Serializable

@Serializable
class FirstOrderSequentState(
    override val tree: MutableList<TreeNode> = mutableListOf(),
    override var showOnlyApplicableRules: Boolean = false,
) : ProtectedState(),
    GenericSequentCalculusState {
    override var seal = ""

    override fun getHash(): String = "fosc|${tree.joinToString()}|$showOnlyApplicableRules"
}
