package kalkulierbar

/**
 * Default port to run the backend server under
 * given no port is specified in the PORT environment variable
 */
const val KBAR_DEFAULT_PORT = 8080

/**
 * Limit for new clauses created during CNF conversion of a
 * single Disjunction node
 */
const val CNF_BLOWUP_LIMIT = 3000
