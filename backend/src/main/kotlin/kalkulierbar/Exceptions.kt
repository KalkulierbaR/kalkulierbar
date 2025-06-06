package kalkulierbar

open class KalkulierbarException(
    msg: String,
) : Exception(msg)

open class InvalidFormulaFormat(
    msg: String,
) : KalkulierbarException(msg)

class EmptyFormulaException(
    msg: String,
) : InvalidFormulaFormat(msg)

open class IllegalMove(
    msg: String,
) : KalkulierbarException(msg)

class ApiMisuseException(
    msg: String,
) : KalkulierbarException(msg)

class JsonParseException(
    msg: String,
) : KalkulierbarException(msg)

class FormulaConversionException(
    msg: String,
) : KalkulierbarException(msg)

class UnificationImpossible(
    msg: String,
) : KalkulierbarException(msg)

class UnknownFunctionException(
    msg: String,
) : IllegalMove(msg)

class IncorrectArityException(
    msg: String,
) : IllegalMove(msg)
