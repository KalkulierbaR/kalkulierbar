package kalkulierbar.nonclausaltableaux

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.UnificationImpossible
import kalkulierbar.logic.And
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.FirstOrderTerm
import kalkulierbar.logic.FoTermModule
import kalkulierbar.logic.LogicModule
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not
import kalkulierbar.logic.Or
import kalkulierbar.logic.Relation
import kalkulierbar.logic.UniversalQuantifier
import kalkulierbar.logic.transform.DeltaSkolemization
import kalkulierbar.logic.transform.LogicNodeVariableInstantiator
import kalkulierbar.logic.transform.LogicNodeVariableRenamer
import kalkulierbar.logic.transform.NegationNormalForm
import kalkulierbar.logic.transform.Unification
import kalkulierbar.parsers.FirstOrderParser
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus

val serializer = Json(context = FoTermModule + LogicModule)

@Suppress("TooManyFunctions")
class NonClausalTableaux : JSONCalculus<NcTableauxState, NcTableauxMove, Unit>() {

    override val identifier = "nc-tableaux"

    override fun parseFormulaToState(formula: String, params: Unit?): NcTableauxState {
        val parsedFormula = NegationNormalForm.transform(FirstOrderParser.parse(formula))

        return NcTableauxState(parsedFormula)
    }

    override fun applyMoveOnState(state: NcTableauxState, move: NcTableauxMove): NcTableauxState {
        // Pass moves to relevant subfunction
        return when (move) {
            is AlphaMove -> applyAlpha(state, move.leafID)
            is BetaMove -> applyBeta(state, move.leafID)
            is GammaMove -> applyGamma(state, move.leafID)
            is DeltaMove -> applyDelta(state, move.leafID)
            is CloseMove -> applyClose(state, move.leafID, move.closeID, move.getVarAssignTerms())
            is UndoMove -> applyUndo(state)
            else -> throw IllegalMove("Unknown move")
        }
    }

    /**
     * While the outermost LogicNode is an AND:
     * Split into subformulae, chain onto a single branch
     * @param state: Non clausal tableaux state to apply move on
     * @param leafID: leaf node ID to apply move on
     * @return new state after applying move
     */
    private fun applyAlpha(state: NcTableauxState, leafID: Int): NcTableauxState {
        val nodes = state.nodes
        checkLeafRestrictions(nodes, leafID)

        val formula = state.formula
        // Get sub-formula splitted by And
        val conjunctions = recursiveAlpha(formula)

        var parent = leafID
        // Add nodes, chained onto a single branch
        for (sub in conjunctions) {
            nodes.add(NcTableauxNode(parent, sub))
            nodes[parent].children.add(nodes.size - 1)
            parent = nodes.size - 1
        }

        // Add move to history
        state.moveHistory.add(DeltaMove(leafID))
        return state
    }

    /**
     * While outermost LogicNOde is an AND -> split into subformulae
     * @param node: node to apply splitting
     * @return A list containing LogicNodes so that every element is not a AND
     */
    private fun recursiveAlpha(node: LogicNode): List<LogicNode> {
        val lst = mutableListOf<LogicNode>()
        // Recursively collects all AND LogicNodes
        while (node is And) {
            lst.addAll(recursiveAlpha(node.leftChild))
            lst.addAll(recursiveAlpha(node.rightChild))
        }
        return lst
    }

    /**
     * Check leafID valid + node at leafID is leaf
     */
    private fun checkLeafRestrictions(nodes: List<NcTableauxNode>, leafID: Int) {
        if (leafID < 0 || leafID >= nodes.size)
            throw IllegalMove("There is no node with ID: $leafID")
        if (!nodes[leafID].isLeaf)
            throw IllegalMove("Selected node is not a leaf")
    }

    /**
     * While the outermost LogicNode is an OR:
     * Split into subformulae and add to leaf node
     * @param state: non clausal tableaux state to apply move on
     * @param leafID: ID of leaf-node to apply move on
     * @return new state after applying move
     */
    private fun applyBeta(state: NcTableauxState, leafID: Int): NcTableauxState {
        val nodes = state.nodes
        checkLeafRestrictions(nodes, leafID)

        val formula = state.formula
        // Get sub-formula splitted by Or
        val disjunctions = recursiveBeta(formula)

        // Add nodes as child node to leafID-node
        for (sub in disjunctions) {
            nodes.add(NcTableauxNode(leafID, sub))
            nodes[leafID].children.add(nodes.size - 1)
        }

        // Add move to history
        state.moveHistory.add(BetaMove(leafID))
        return state
    }

    /**
     * While outermost LogicNOde is an OR -> split into subformulae
     * @param node: node to apply splitting
     * @return A list containing LogicNodes so that every element is not a OR
     */
    private fun recursiveBeta(node: LogicNode): List<LogicNode> {
        val lst = mutableListOf<LogicNode>()
        // Recursively collects all OR LogicNodes
        while (node is Or) {
            lst.addAll(recursiveBeta(node.leftChild))
            lst.addAll(recursiveBeta(node.rightChild))
        }

        return lst
    }

    /**
     * If outermost LogicNode is a universal quantifier:
     * Remove quantifier and instantiate with fresh variable
     * @param state: non clausal tableaux state to apply move on
     * @param leafID: ID of leaf-node to apply move on
     * @return new state after applying move
     */
    private fun applyGamma(state: NcTableauxState, leafID: Int): NcTableauxState {
        val nodes = state.nodes
        checkLeafRestrictions(nodes, leafID)

        // Check leaf formula == UniversalQuantifier
        val leafNode = nodes[leafID]
        val formula = leafNode.formula
        if (formula !is UniversalQuantifier)
            throw IllegalMove("There is no universal quantifier")

        // Transform new Formula + remove UniversalQuantifier
        val vars = formula.boundVariables
        val suffix = "_${state.expansionCounter + 1}"
        val newFormula = LogicNodeVariableRenamer.transform(formula.child, vars, suffix)

        // Add new node to tree
        val newNode = NcTableauxNode(leafID, newFormula)
        nodes.add(newNode)
        leafNode.children.add(nodes.size - 1)

        // Add move to history
        state.moveHistory.add(GammaMove(leafID))

        state.expansionCounter += 1
        return state
    }

    /**
     * If outermost LogicNode is an existantial quantifier:
     * Remove quantifier and instantiate with Skolem term
     * -> Iff free variables in current node: term = firstOrderTerm (free variables)
     * -> IFF no free variables: term = constant
     * @param state: non clausal tableaux state to apply move on
     * @param leafID: ID of leaf-node to apply move on
     * @return new state after applying move
     */
    private fun applyDelta(state: NcTableauxState, leafID: Int): NcTableauxState {
        val nodes = state.nodes
        checkLeafRestrictions(nodes, leafID)

        // Check leaf == UniversalQuantifier
        val leafNode = nodes[leafID]
        val formula = leafNode.formula
        if (formula !is ExistentialQuantifier)
            throw IllegalMove("There is no existential quantifier")

        val newFormula = DeltaSkolemization.transform(formula)

        // Add new node to tree
        val newNode = NcTableauxNode(leafID, newFormula)
        nodes.add(newNode)
        leafNode.children.add(nodes.size - 1)

        // Add move to history
        state.moveHistory.add(DeltaMove(leafID))
        return state
    }

    /**
     * Applies close move by following constraints:
     * 1. The outermost LogicNode is a NOT for one and RELATION for the other
     * 2. The child of the NOT node is a RELATION (think this is already covered by converting to NNF)
     * 3. Both RELATION nodes are syntactically equal after (global) variable instantiation
     * @param state State to apply close move on
     * @param leafID Leaf to close
     * @param closeID Node to close with
     * @param varAssign variable assignment to instantiate variables
     * @return state after applying move
     */
    private fun applyClose(
        state: NcTableauxState,
        leafID: Int,
        closeID: Int,
        varAssign: Map<String, FirstOrderTerm>?
    ): NcTableauxState {
        val nodes = state.nodes
        val (leafRelation, closeRelation) = ensureBasicCloseability(state, leafID, closeID)

        val closeNode = nodes[closeID]
        val leafNode = nodes[leafID]

        if (varAssign != null)
            return closeBranchCommon(state, leafID, closeID, leafRelation, closeRelation, varAssign)

        // Try to find a unifying variable assignment and pass it to the internal close method
        // which will handle the verification, tree modification, and history management for us
        try {
            val varAssign = Unification.unify(leafRelation, closeRelation)
            return closeBranchCommon(state, leafID, closeID, leafRelation, closeRelation, varAssign)
        } catch (e: UnificationImpossible) {
            throw IllegalMove("Cannot unify '$leafRelation' and '$closeRelation': ${e.message}")
        }
    }

    /**
     * Ensures that basic conditions for branch closure are met
     * If a condition is not met, an explaining exception will be thrown
     * Conditions inlcude:
     *  - Both nodes exist
     *  - The specified leaf is a leaf and not yet closed
     *  - Both nodes share the same relation stem (relation name + argument size)
     *  - The nodes are of opposite polarity
     *  - The closeNode is an ancestor of the leaf
     *
     * @param state State to apply close move in
     * @param leafID Leaf to close
     * @param closeID Node to close with
     * @return Pair of (leaf-relation, closeNode-relation)
     */
    @Suppress("ComplexMethod", "ThrowsCount")
    private fun ensureBasicCloseability(state: NcTableauxState, leafID: Int, closeID: Int): Pair<Relation, Relation> {
        // Verify that both leaf and closeNode are valid nodes
        if (leafID >= state.nodes.size || leafID < 0)
            throw IllegalMove("Node with ID $leafID does not exist")
        if (closeID >= state.nodes.size || closeID < 0)
            throw IllegalMove("Node with ID $closeID does not exist")

        val leaf = state.nodes[leafID]
        val closeNode = state.nodes[closeID]

        // Verify that leaf is actually a leaf
        if (!leaf.isLeaf)
            throw IllegalMove("Node '$leaf' is not a leaf")

        // Verify that leaf is not already closed
        if (leaf.isClosed)
            throw IllegalMove("Leaf '$leaf' is already closed, no need to close again")

        // Ensure that tree root node cannot be used to close literals of same spelling ('true')
        if (closeID == 0)
            throw IllegalMove("The root node cannot be used for branch closure")

        // Verify that closeNode is transitive parent of leaf
        if (!state.nodeIsParentOf(closeID, leafID))
            throw IllegalMove("Node '$closeNode' is not an ancestor of leaf '$leaf'")

        val leafFormula = leaf.formula
        val closeNodeFormula = closeNode.formula
        // Verify that leaf and closeNode reference the same Relation
        if (leafFormula is Not && leafFormula.child is Relation && closeNodeFormula is Relation) {
            checkCloseRelation(leafFormula.child as Relation, closeNodeFormula)
            return Pair(leafFormula.child as Relation, closeNodeFormula)
        } else if (closeNodeFormula is Not && closeNodeFormula.child is Relation && leafFormula is Relation) {
            checkCloseRelation(leafFormula, closeNodeFormula.child as Relation)
            return Pair(leafFormula, closeNodeFormula.child as Relation)
        } else throw IllegalMove("Either one of selected nodes has to be a negated relation " +
                "while the other is a relation (not negated)")
    }

    private fun checkCloseRelation(rel1: Relation, rel2: Relation) {
        if (rel1.spelling != rel2.spelling)
            throw IllegalMove("Leaf and node do not reference the same relation")
        if (rel1.arguments.size != rel2.arguments.size)
            throw IllegalMove("Argument size of both relations is not the same")
    }

    @Suppress("LongParameterList")
    /**
     * Close a branch using either computed or manually entered variable assignments
     * NOTE: This does NOT verify closeability.
     *       It is assumed that ensureBasicCloseability has been called before.
     * @param state State to apply the close move in
     * @param leafID Leaf to close
     * @param closeID Node to close the leaf with
     * @param leafRelation Relation referenced to leaf
     * @param closeRelation Relation referenced to closeNode
     * @param varAssign Map of variable names and terms to replace them with
     * @return state with the close move applied
     */
    private fun closeBranchCommon(
        state: NcTableauxState,
        leafID: Int,
        closeID: Int,
        leafRelation: Relation,
        closeRelation: Relation,
        varAssign: Map<String, FirstOrderTerm>
    ): NcTableauxState {

        // Apply all specified variable instantiations globally
        applyVarInstantiation(state, varAssign)

        val leaf = state.nodes[leafID]
        val closeNode = state.nodes[closeID]

        // Check relations after instantiation
        if (!leafRelation.synEq(closeRelation))
            throw IllegalMove("Node '$leaf' and '$closeNode' are not equal after variable instantiation")

        // Close branch
        leaf.closeRef = closeID
        setNodeClosed(state, leaf)

        // Record close move for backtracking purposes
        if (state.backtracking) {
            val varAssignStrings = varAssign.mapValues { it.value.toString() }
            val move = CloseMove(leafID, closeID, varAssignStrings)
            state.moveHistory.add(move)
        }

        return state
    }

    /**
     * Apply a global variable instantiation in the proof tree
     * @param state State to apply instantiation in
     * @param varAssign Map of which variables to replace with which terms
     * @return State with all occurences of variables in the map replaced with their respective terms
     */
    private fun applyVarInstantiation(state: NcTableauxState, varAssign: Map<String, FirstOrderTerm>): NcTableauxState {
        val instantiator = LogicNodeVariableInstantiator(varAssign)

        state.nodes.forEach {
            it.formula.accept(instantiator)
        }

        return state
    }

    /**
     * Marks a tree node and its ancestry as closed
     * NOTE: This does NOT set the closeRef of the closed leaf
     *       so make sure the closeRef is set before calling this
     * @param state State object to modify
     * @param leaf The leaf to mark as closed
     */
    fun setNodeClosed(state: NcTableauxState, leaf: NcTableauxNode) {
        var node = leaf

        // Set isClosed to true for all nodes dominated by leaf in reverse tree
        while (node.isLeaf || node.children.fold(true) { acc, e -> acc && state.nodes[e].isClosed }) {
            node.isClosed = true
            if (node.parent == null)
                break
            node = state.nodes[node.parent!!]
        }
    }

    /**
     * Undo a rule application by re-building the state from the move history
     * @param state State in which to apply the undo
     * @return Equivalent state with the most recent rule application removed
     */
    private fun applyUndo(state: NcTableauxState): NcTableauxState {
        if (!state.backtracking)
            throw IllegalMove("Backtracking is not enabled for this proof")

        // Can't undo any more moves in initial state
        if (state.moveHistory.isEmpty())
            return state

        // Create a fresh clone-state with the same parameters and input formula
        var freshState = NcTableauxState(state.formula)
        freshState.usedBacktracking = true

        // We don't want to re-do the last move
        state.moveHistory.removeAt(state.moveHistory.size - 1)

        // Re-build the proof tree in the clone state
        state.moveHistory.forEach {
            freshState = applyMoveOnState(freshState, it)
        }

        return freshState
    }

    override fun checkCloseOnState(state: NcTableauxState): CloseMessage {
        var msg = "The proof tree is not closed"

        if (state.nodes[0].isClosed) {
            val withWithoutBT = if (state.usedBacktracking) "with" else "without"

            msg = "The proof is closed and valid in non-clausal tableaux $withWithoutBT backtracking"
        }

        return CloseMessage(state.nodes[0].isClosed, msg)
    }

    /**
     * Parses a JSON state representation into a TableauxState object
     * @param json JSON state representation
     * @return parsed state object
     */
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToState(json: String): NcTableauxState {
        try {
            val parsed = serializer.parse(NcTableauxState.serializer(), json)

            // Ensure valid, unmodified state object
            if (!parsed.verifySeal())
                throw JsonParseException("Invalid tamper protection seal, state object appears to have been modified")

            return parsed
        } catch (e: Exception) {
            val msg = "Could not parse JSON state: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    /**
     * Serializes internal state object to JSON
     * @param state State object
     * @return JSON state representation
     */
    override fun stateToJson(state: NcTableauxState): String {
        state.computeSeal()
        return serializer.stringify(NcTableauxState.serializer(), state)
    }

    /*
     * Parses a JSON move representation into a TableauxMove object
     * @param json JSON move representation
     * @return parsed move object
     */
    @Suppress("TooGenericExceptionCaught")
    override fun jsonToMove(json: String): NcTableauxMove {
        try {
            return serializer.parse(NcTableauxMove.serializer(), json)
        } catch (e: Exception) {
            val msg = "Could not parse JSON move: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    /*
     * Parses a JSON parameter representation into a TableauxParam object
     * @param json JSON parameter representation
     * @return parsed param object
     */
    override fun jsonToParam(json: String) = Unit
}
