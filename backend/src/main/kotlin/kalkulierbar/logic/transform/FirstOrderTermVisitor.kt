package kalkulierbar.logic.transform

import kalkulierbar.FormulaConversionException
import kalkulierbar.logic.Constant
import kalkulierbar.logic.Function
import kalkulierbar.logic.QuantifiedVariable

/**
 * Skeleton Class for FirstOrderTerm visitor implementations
 */
abstract class FirstOrderTermVisitor<ReturnType> {
    open fun visit(node: QuantifiedVariable): ReturnType = throw FormulaConversionException("Visiting QuantifiedVariable not implemented")

    open fun visit(node: Constant): ReturnType = throw FormulaConversionException("Visiting Constant not implemented")

    open fun visit(node: Function): ReturnType = throw FormulaConversionException("Visiting Function not implemented")
}
