package kalkulierbar

import kalkulierbar.parsers.PropositionalParser

class PropositionalAcceptor : Calculus {
    override val identifier = "prop"

    override fun parseFormula(formula: String) = PropositionalParser(formula).parse().toString()

    override fun applyMove(state: String, move: String) = ""

    override fun checkClose(state: String) = true
}
