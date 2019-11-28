package kalkulierbar

open class KalkulierbarException(msg: String) : Exception(msg)

class InvalidFormulaFormat(msg: String) : KalkulierbarException(msg)

class ApiMisuseException(msg: String) : KalkulierbarException(msg)

class JsonParseException(msg: String) : KalkulierbarException(msg)
