package statekeeper

import kalkulierbar.JsonParseException
import kalkulierbar.KalkulierbarException
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.komputing.khash.keccak.KeccakParameter
import org.komputing.khash.keccak.extensions.digestKeccak
import java.io.File
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

@Suppress("TooGenericExceptionCaught", "TooManyFunctions")
object StateKeeper {
    private val date
        get() = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC).format(Instant.now())

    private var availableCalculi = listOf<String>()

    private val storage = File("kbar-state.json")
    private val state: AppState

    /**
     * Read contents of the state storage file
     * Creates a default config file if none exists already
     */
    init {
        try {
            if (storage.createNewFile()) {
                state = AppState()
                flush()
            } else
                state = Json.decodeFromString(storage.readText())
        } catch (e: Exception) {
            val msg = "Could not parse stored state: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }
    }

    fun importAvailable(calculi: List<String>) {
        availableCalculi = calculi
    }

    /**
     * Builds a config json object to be sent to the frontend
     * Containing example formulae and a list of disabled calculi
     * @return JSON config object
     */
    fun getConfig(): String {
        val calculiJson = state.disabledCalculi.joinToString(", ") { "\"$it\"" }
        val examplesJson = state.examples.joinToString(", ") { Json.encodeToString(it) }

        return """{"disabled": [$calculiJson], "examples": [$examplesJson]}"""
    }

    /**
     * Allows a frontend implementation to check admin credentials
     * @param mac Message Authentication Code for this request
     *            sha3-256("kbcc|$date|$state.key"), hex-encoded
     * @return Constant string "true" if the credentials are valid
     */
    fun checkCredentials(mac: String): String {
        val fingerprint = "kbcc"
        if (!verifyMAC(fingerprint, mac))
            throw AuthenticationException("Invalid password")

        return "true"
    }

    /**
     * Enables or disables a calculus
     * This only affects the configuration object used by frontends to adjust the UI
     * All backend calculus endpoints will continue to accept requests
     * @param calculus The identifier of the calculus to enable/disable
     * @param enableString "true" to enable a calculus, "false" to disable
     * @param mac Message Authentication Code for this request
     *            sha3-256("kbsc|$calculus|$enableString|$date|$state.key"), hex-encoded
     * @return Constant string "true"
     */
    fun setCalculusState(calculus: String, enableString: String, mac: String): String {
        val fingerprint = "kbsc|$calculus|$enableString"
        if (!verifyMAC(fingerprint, mac))
            throw AuthenticationException("Invalid password")

        val enable = (enableString == "true")

        when {
            enable -> state.disabledCalculi.remove(calculus)
            availableCalculi.contains(calculus) -> state.disabledCalculi.add(calculus)
            else -> throw InvalidRequest("Calculus '$calculus' does not exist")
        }

        flush()

        return "true"
    }

    /**
     * Adds an example formula to the example list
     * @param example JSON representation of the example to add
     * @param mac Message Authentication Code for this request
     *            sha3-256("kbae|$example|$date|$state.key"), hex-encoded
     * @return Constant string "true"
     */
    @Suppress("TooGenericExceptionCaught")
    fun addExample(example: String, mac: String): String {
        val fingerprint = "kbae|$example"
        val parsedExample: Example

        if (!verifyMAC(fingerprint, mac))
            throw AuthenticationException("Invalid password")

        try {
            parsedExample = Json.decodeFromString(example)
        } catch (e: Exception) {
            val msg = "Could not parse JSON example: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }

        // Since we will be writing this to disk, let's
        // make sure that the example is somewhat sane
        checkSanity(parsedExample)

        state.examples.add(parsedExample)
        flush()

        return "true"
    }

    /**
     * Removes an example formula from the example list
     * @param exampleIdString Textual representation of the index of the example to remove
     * @param mac Message Authentication Code for this request
     *            sha3-256("kbde|$exampleIdString|$date|$state.key"), hex-encoded
     * @return Constant string "true"
     */
    @Suppress("ThrowsCount")
    fun delExample(exampleIdString: String, mac: String): String {
        val fingerprint = "kbde|$exampleIdString"
        if (!verifyMAC(fingerprint, mac))
            throw AuthenticationException("Invalid password")

        try {
            val id = exampleIdString.toInt()
            if (id < 0 || id >= state.examples.size)
                throw JsonParseException("Example with ID $id does not exist")
            state.examples.removeAt(id)
            flush()
        } catch (e: NumberFormatException) {
            val msg = "Could not parse example ID: "
            throw JsonParseException(msg + (e.message ?: "Unknown error"))
        }

        return "true"
    }

    /**
     * Resets singleton
     * NOTE: At the moment for testing purpose only
     */
    fun reset() {
        availableCalculi = listOf()
        storage.delete()
        state.disabledCalculi.clear()
        state.examples.clear()
    }

    /**
     * Verfies that a request has a valid Message Authentication Code
     * MACs are formed by appending the current date and admin key before hashing the payload
     * This means that requests can be re-played within the same day by an attacker
     * @param payload String the MAC was computed over, without date and key components
     * @param mac The received MAC
     * @return true iff the received MAC is valid for the given payload
     */
    private fun verifyMAC(payload: String, mac: String): Boolean {
        val payloadWithKey = "$payload|$date|${state.key}"
        val calculatedMAC = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        return calculatedMAC == mac.toUpperCase()
    }

    private fun toHex(bytes: ByteArray) = bytes.joinToString("") { String.format("%02X", it) }

    /**
     * Save the current AppState to the state file
     */
    private fun flush() {
        val json = Json.encodeToString(state)
        storage.writeText(json)
    }

    /**
     * Ensures that a given example meets size limitations
     * @param ex Example to be added
     */
    @Suppress("ThrowsCount")
    private fun checkSanity(ex: Example) {
        if (ex.name.length > EXAMPLE_NAME_SIZE)
            throw StorageLimitHit("Example name exceeds size limit of $EXAMPLE_NAME_SIZE B")
        if (ex.description.length > EXAMPLE_DESC_SIZE)
            throw StorageLimitHit("Example description exceeds size limit of $EXAMPLE_DESC_SIZE B")
        if (ex.formula.length > EXAMPLE_FORMULA_SIZE)
            throw StorageLimitHit("Example formula exceeds size limit of $EXAMPLE_FORMULA_SIZE B")
        if (ex.params.length > EXAMPLE_PARAM_SIZE)
            throw StorageLimitHit("Example parameters exceed size limit of $EXAMPLE_PARAM_SIZE B")
        if (ex.calculus.length > EXAMPLE_CALC_NAME_SIZE)
            throw StorageLimitHit("Example calculus name exceeds size limit of $EXAMPLE_CALC_NAME_SIZE B")

        if (state.examples.size >= MAX_EXAMPLE_COUNT)
            throw StorageLimitHit("Maximum number of stored examples ($MAX_EXAMPLE_COUNT) exceeded")
    }
}

@Serializable
data class AppState(
    val key: String = "WildFlowers/UncomfortableMoons",
    val disabledCalculi: MutableList<String> = mutableListOf(),
    val examples: MutableList<Example> = mutableListOf()
)

@Serializable
data class Example(
    val name: String,
    val description: String,
    val calculus: String,
    val formula: String,
    val params: String
)

class AuthenticationException(msg: String) : KalkulierbarException(msg)

class StorageLimitHit(msg: String) : KalkulierbarException(msg)

class InvalidRequest(msg: String) : KalkulierbarException(msg)
