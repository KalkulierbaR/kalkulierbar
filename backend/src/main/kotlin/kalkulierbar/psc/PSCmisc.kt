package kalkulierbar.psc

import kalkulierbar.CloseMessage
import kalkulierbar.IllegalMove
import kalkulierbar.JSONCalculus
import kalkulierbar.JsonParseException
import kalkulierbar.parsers.FlexibleClauseSetParser
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.plus
import kotlinx.serialization.Serializable


@Serializable
class PSCState(val formula: String) {
    val root: TreeNode = TreeNode(null, formula);
}

@Serializable
class TreeNode() {
    
    var parent: TreeNode? = null;
    var leftChild: TreeNode? = null;
    var rightChild: TreeNode? = null;
    var leftExpression: Expression? = null;
    var rightExpression: Expression? = null;
    
    constructor(parent: TreeNode?, label: String): this() {
        this.parent = parent;
    }

    constructor(parent: TreeNode?, exprLeft: Expression, exprRight: Expression): this() {
        this.parent = parent;
        this.leftExpression = exprLeft;
        this.rightExpression = exprRight
    }

}

@Serializable
class atom(val label: String, val booleanValue: Boolean) : Expression(null, null, null) {

}

@Serializable
open class Expression(val operation: ExpressionOperation?, val op1: Expression?, val op2: Expression?) {

}

enum class ExpressionOperation() {
    NOT,
    OR,
    AND,
}