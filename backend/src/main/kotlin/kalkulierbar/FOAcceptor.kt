package kalkulierbar

import kalkulierbar.parsers.FirstOrderParser

class FOAcceptor : Calculus {
    override val identifier = "fo-acceptor"

    private val parser = FirstOrderParser()

    override fun parseFormula(formula: String, params: String?) = parser.parse(formula).toString()

    override fun applyMove(state: String, move: String) = "not implemented"
    override fun checkClose(state: String) = "not implemented"
}
