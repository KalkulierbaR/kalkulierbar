package statekeeper

import kalkulierbar.JsonParseException
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.util.Timer
import java.util.TimerTask

object Scoreboard {
    private val data: MutableMap<String, MutableMap<String, MutableList<Map<String, String>>>>
    private val storage = File("kbar-scoreboard.json")
    private val timer = Timer()
    private var flushScheduled = false
    private val flusher = object : TimerTask() {
        override fun run() = flush()
    }

    private const val READONLY = false

    /**
     * Read contents of the scoreboard storage file
     * Creates an empty scoreboard if none exists
     */
    init {
        @Suppress("TooGenericExceptionCaught")
        data = try {
            if (READONLY || storage.createNewFile())
                mutableMapOf()
            else
                Json.decodeFromString(storage.readText())
        } catch (e: Exception) {
            val msg = "Could not parse stored scoreboard: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    fun getScores(calculus: String, formula: String): List<Map<String, String>> {
        return if (data.containsKey(calculus) && data[calculus]!!.containsKey(formula))
            data[calculus]!![formula]!!
        else
            emptyList()
    }

    fun addScore(calculus: String, formula: String, score: Map<String, String>) {
        if (READONLY)
            return

        checkSanity(calculus, formula, score)

        if (!data.containsKey(calculus))
            data[calculus] = mutableMapOf()

        val calculusScores = data[calculus]!!
        if (!calculusScores.containsKey(formula))
            calculusScores[formula] = mutableListOf()

        calculusScores[formula]!!.add(score)

        if (!flushScheduled) {
            flushScheduled = true
            timer.schedule(flusher, SCORE_FLUSH_DELAY_MS)
        }
    }

    /**
     * Ensures that a given score meets size limitations
     * @param score Score to be added
     */
    @Suppress("ThrowsCount")
    private fun checkSanity(calculus: String, formula: String, score: Map<String, String>) {
        if (score.size > SCORE_MAX_FIELD_COUNT)
            throw StorageLimitHit("Score objects exceeds field limit of $SCORE_MAX_FIELD_COUNT fields")
        if (formula.length > SCORE_MAX_FORMULA_SIZE)
            throw StorageLimitHit("Formula exceed size limit of $SCORE_MAX_FORMULA_SIZE B")
        if (calculus.length > SCORE_MAX_CALC_NAME_SIZE)
            throw StorageLimitHit("Example calculus name exceeds size limit of $SCORE_MAX_CALC_NAME_SIZE B")
        if (score.keys.any { it.length > SCORE_MAX_KEY_SIZE })
            throw StorageLimitHit("Score object key exceeds size limit of $SCORE_MAX_KEY_SIZE B")
        if (score.values.any { it.length > SCORE_MAX_VALUE_SIZE })
            throw StorageLimitHit("Score object value exceeds size limit of $SCORE_MAX_VALUE_SIZE B")
    }

    /**
     * Save the current scoreboard data to the scoreboard file
     */
    private fun flush() {
        storage.writeText(Json.encodeToString(data))
        flushScheduled = false
    }
}
