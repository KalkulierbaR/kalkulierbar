package statekeeper

import kalkulierbar.JsonParseException
import kotlinx.serialization.json.Json
import java.io.File
import java.util.Timer
import java.util.TimerTask

@OptIn(kotlinx.serialization.ExperimentalSerializationApi::class)
object Scoreboard {
    private var data: MutableMap<String, MutableMap<String, MutableList<Map<String, String>>>>
    private val storage = File("kbar-scoreboard.json")
    private var scoreboardCounter: Int
    private val timer = Timer()
    private var flushScheduled = false
    private val flusher =
        object : TimerTask() {
            override fun run() = flush()
        }

    private const val READONLY = false

    /*
     * Read contents of the scoreboard storage file
     * Creates an empty scoreboard if none exists
     */
    init {
        @Suppress("TooGenericExceptionCaught")
        data =
            try {
                if (READONLY || !storage.exists()) {
                    mutableMapOf()
                } else {
                    Json.decodeFromString(storage.readText())
                }
            } catch (e: Exception) {
                val msg = "Could not parse stored scoreboard: "
                throw JsonParseException(msg + (e.message ?: "Unknown error"))
            }

        scoreboardCounter = data.values.sumOf { it.size }
    }

    fun getScores(
        calculus: String,
        formula: String,
    ): List<Map<String, String>> = data.getOrDefault(calculus, mapOf()).getOrDefault(formula, emptyList())

    fun addScore(
        calculus: String,
        formula: String,
        score: Map<String, String>,
    ) {
        if (READONLY) {
            return
        }

        checkSanity(calculus, formula, score)
        if (scoreboardCounter >= SCORE_MAX_NUM_SCOREBOARDS) {
            cleanScoreboards()
        }
        val calculusScores = data.getOrPut(calculus) { mutableMapOf() }
        val formulaScores =
            calculusScores.getOrPut(formula) {
                scoreboardCounter += 1
                mutableListOf()
            }

        insertScore(formulaScores, score)

        // Schedule backup to disk
        if (!flushScheduled) {
            flushScheduled = true
            timer.schedule(flusher, SCORE_FLUSH_DELAY_MS)
        }
    }

    /**
     * Insert a new score into a scoreboard, keeping the board sorted by field "Score" if present
     * @param scoreboard Scoreboard to insert into
     * @param score New score to insert
     */
    private fun insertScore(
        scoreboard: MutableList<Map<String, String>>,
        score: Map<String, String>,
    ) {
        scoreboard.add(score)
        scoreboard.sortByDescending {
            it["Score"]?.toInt() ?: 0
        }
        if (scoreboard.size > SCORE_MAX_ENTRIES_PER_FORMULA) {
            scoreboard.removeLast()
        }
    }

    /**
     * Ensures that a given score meets size limitations
     * @param score Score to be added
     */
    @Suppress("ThrowsCount")
    private fun checkSanity(
        calculus: String,
        formula: String,
        score: Map<String, String>,
    ) {
        if (score.size > SCORE_MAX_FIELD_COUNT) {
            throw StorageLimitHit("Score objects exceeds field limit of $SCORE_MAX_FIELD_COUNT fields")
        }
        if (formula.length > SCORE_MAX_FORMULA_SIZE) {
            throw StorageLimitHit("Formula exceed size limit of $SCORE_MAX_FORMULA_SIZE B")
        }
        if (calculus.length > SCORE_MAX_CALC_NAME_SIZE) {
            throw StorageLimitHit("Example calculus name exceeds size limit of $SCORE_MAX_CALC_NAME_SIZE B")
        }
        if (score.keys.any { it.length > SCORE_MAX_KEY_SIZE }) {
            throw StorageLimitHit("Score object key exceeds size limit of $SCORE_MAX_KEY_SIZE B")
        }
        if (score.values.any { it.length > SCORE_MAX_VALUE_SIZE }) {
            throw StorageLimitHit("Score object value exceeds size limit of $SCORE_MAX_VALUE_SIZE B")
        }
    }

    /**
     * Save the current scoreboard data to the scoreboard file
     */
    private fun flush() {
        if (!storage.exists()) {
            storage.createNewFile()
        }
        storage.writeText(Json.encodeToString(data))
        flushScheduled = false
    }

    /**
     * Remove likely unused scoreboards to make space for new ones
     */
    private fun cleanScoreboards() {
        data =
            data
                .mapValues { entry ->
                    entry.value.filter { it.value.size > 1 }.toMutableMap()
                }.toMutableMap()
        scoreboardCounter = data.values.sumOf { it.size }

        if (scoreboardCounter >= SCORE_MAX_NUM_SCOREBOARDS) {
            throw StorageLimitHit("Maximum scoreboard count of $SCORE_MAX_NUM_SCOREBOARDS exceeded")
        }
    }
}
