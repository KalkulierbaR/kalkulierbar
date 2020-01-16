package kalkulierbar.logic.transform

import kalkulierbar.FormulaConversionException
import kalkulierbar.logic.ExistentialQuantifier
import kalkulierbar.logic.LogicNode
import kalkulierbar.logic.QuantifiedVariable
import kalkulierbar.logic.UniversalQuantifier

class PrenexNormalForm : DoNothingVisitor() {

    companion object Companion {
        fun transform(formula: LogicNode): LogicNode {
            val instance = PrenexNormalForm()
            var res = formula.accept(instance)

            instance.quantifiers.asReversed().forEach {
                val (varName, isUniversal, boundVars) = it
                if (isUniversal)
                    res = UniversalQuantifier(varName, res, boundVars)
                else
                    res = ExistentialQuantifier(varName, res, boundVars)
            }

            return res
        }
    }

    private var quantifiers: MutableList<Triple<String, Boolean, MutableList<QuantifiedVariable>>> = mutableListOf()
    private var encounteredVars: MutableList<String> = mutableListOf()

    override fun visit(node: UniversalQuantifier): LogicNode {

        if (encounteredVars.contains(node.varName))
            throw FormulaConversionException("Prenex Normal Form conversion encountered " +
                "double-binding of variable '${node.varName}'")

        quantifiers.add(Triple(node.varName, true, node.boundVariables))
        encounteredVars.add(node.varName)

        return node.child.accept(this)
    }

    override fun visit(node: ExistentialQuantifier): LogicNode {

        if (encounteredVars.contains(node.varName))
            throw FormulaConversionException("Prenex Normal Form conversion encountered " +
                " double-binding of variable '${node.varName}'")

        quantifiers.add(Triple(node.varName, false, node.boundVariables))
        encounteredVars.add(node.varName)

        return node.child.accept(this)
    }
}
