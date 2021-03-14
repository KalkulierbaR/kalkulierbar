package kalkulierbar

interface StatisticCalculus<State> {
    /**
    * Calculates the statistics for a given proof
    * @param state A closed state
    * @param name the name of the user
    * @return The statistics for the given state
    */
    fun getStatistic(state: String, name: String?): String

    /**
     * Takes in a State of the given calculus
     * @param state Current state object
     * @return The statistic of the given object
     */
    fun getStatisticOnState(state: State): Statistic

    /**
     * Serializes a statistics object to JSON
     * @param statistic Statistics object
     * @return JSON statistics representation
     */
    fun statisticToJson(statistic: Statistic): String

    /**
     * Parses a json object to Statistic
     * @param json Statistics object
     * @return JSON statistics representation
     */
    fun jsonToStatistic(json: String): Statistic

    /**
     * Returns the intitial formula of the state.
     * @param state state representation
     * @return string representing the initial formula of the state
     */
    fun getStartingFormula(state: String): String
}
