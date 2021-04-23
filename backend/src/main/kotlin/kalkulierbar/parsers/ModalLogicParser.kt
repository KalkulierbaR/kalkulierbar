package kalkulierbar.parsers

import kalkulierbar.logic.Box
import kalkulierbar.logic.Diamond
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.Not

/**
 * Recursive descent parser for Modal logic
 * Supports basic operations (and, or, not), implications and equivalences, as well as
 * box and diamond.
 */
class ModalLogicParser : PropositionalParser() {

    /**
     * Parses a unary not
     * @return LogicNode representing the negated formula
     */
    override fun parseNot(): LogicNode {
        return if (nextTokenIs(TokenType.NOT)) {
            consume()
            Not(parseParen())
        } else {
            parseBox()
        }
    }

    /**
     * Parses a unary always
     * @return LogicNode representing the negated formula
     */
    private fun parseBox(): LogicNode {
        return if (nextTokenIs(TokenType.BOX)) {
            consume()
            Box(parseBox())
        } else {
            parseDiamond()
        }
    }

    /**
     * Parses a unary sometimes
     * @return LogicNode representing the negated formula
     */
    private fun parseDiamond(): LogicNode {
        return if (nextTokenIs(TokenType.DIAMOND)) {
            consume()
            Diamond(parseBox())
        } else {
            parseParen()
        }
    }
}
