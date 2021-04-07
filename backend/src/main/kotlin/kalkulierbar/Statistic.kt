package kalkulierbar

import kalkulierbar.sequent.SequentCalculusStatistic
import kalkulierbar.signedtableaux.SignedModalTableauxStatistic
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.modules.SerializersModule
import kotlinx.serialization.modules.polymorphic
import kotlinx.serialization.modules.subclass

interface Statistic {

    var userName: String?

    /**
     * Returns the column names of the data that is stored within this interface.
     * The column names are needed by the Frontend and need to be ordered in the same order serialization happens
     */
    fun columnNames(): List<String>
}

val StatisticModule = SerializersModule {
    polymorphic(Statistic::class) {
        subclass(SequentCalculusStatistic::class)
        subclass(SignedModalTableauxStatistic::class)
    }
}

@Serializable
class Statistics(
    val formula: String,
    var entries: List<Statistic> = listOf(),
    var columnNames: List<String> = listOf()
) {
    constructor(entries: List<String>, formula: String, endpoint: StatisticCalculus<*>) : this(formula) {
        val statistics = entries.map { endpoint.jsonToStatistic(it) }
        this.entries = statistics
        this.columnNames = statistics[0].columnNames()
    }

    fun toJson(): String {
        return Json { serializersModule = StatisticModule }.encodeToString(this)
    }
}
