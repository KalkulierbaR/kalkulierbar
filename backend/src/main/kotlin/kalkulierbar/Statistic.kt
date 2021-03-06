package kalkulierbar

interface Statistic {

    public var userName: String?

    public var score: Int

    /**
     * The function returns the score of the statistic object
     * @return The score of the statistic
     */
    public fun calculateScore(): Int
}
