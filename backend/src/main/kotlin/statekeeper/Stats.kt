package statekeeper

import kalkulierbar.JsonParseException
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.time.LocalDateTime
import java.util.Timer
import java.util.TimerTask

object Stats {
    private var data: StatContainer
    private val storage = File("kbar-stats.json")
    private val timer = Timer()
    private var flushScheduled = false
    private val flusher = object : TimerTask() {
        override fun run() = flush()
    }

    /**
     * Read contents of the stats file
     * Creates an empty StatContainer if none exists
     */
    init {
        @Suppress("TooGenericExceptionCaught")
        data = try {
            if (!storage.exists())
                StatContainer()
            else
                Json.decodeFromString(storage.readText())
        } catch (e: Exception) {
            val msg = "Could not parse stored stats: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    fun getStats() = Json.encodeToString(data)

    fun logHit(key: String) {
        data.logHit(key)

        if (!flushScheduled) {
            flushScheduled = true
            timer.schedule(flusher, STATS_FLUSH_DELAY_MS)
        }
    }

    /**
     * Save the current stats to the stat file
     */
    private fun flush() {
        if (!storage.exists())
            storage.createNewFile()
        storage.writeText(Json.encodeToString(data))
        flushScheduled = false
    }
}

@Serializable
data class StatContainer(
    var currentMonth: MutableMap<String, Int> = mutableMapOf(),
    var lastMonth: Map<String, Int> = mapOf(),
    val alltime: MutableMap<String, Int> = mutableMapOf(),
    var monthIndex: Int = LocalDateTime.now().monthValue
) {
    fun logHit(key: String) {
        val month = LocalDateTime.now().monthValue
        if (month != monthIndex) {
            monthIndex = month
            lastMonth = currentMonth
            currentMonth = mutableMapOf()
        }
        currentMonth[key] = (currentMonth[key] ?: 0) + 1
        alltime[key] = (alltime[key] ?: 0) + 1
    }
}
