package statekeeper

import java.io.File
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import kalkulierbar.JsonParseException
import kalkulierbar.KalkulierbarException
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonConfiguration
import org.komputing.khash.keccak.KeccakParameter
import org.komputing.khash.keccak.extensions.digestKeccak

@Suppress("TooGenericExceptionCaught")
class StateKeeper {
    companion object {

        private val serializer = Json(JsonConfiguration.Stable)

        private val date
            get() = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC).format(Instant.now())

        private val storage = File("kbar-state.json")
        private val state: AppState

        init {
            try {
                if (storage.createNewFile()) {
                    state = AppState()
                    flush()
                } else
                    state = serializer.parse(AppState.serializer(), storage.readText())
            } catch (e: Exception) {
                val msg = "Could not parse stored state: "
                throw JsonParseException(msg + (e.message ?: "Unknown error"))
            }
        }

        fun getConfig(): String {
            val calculiJson = state.disabledCalculi.map { "\"$it\"" }.joinToString(", ")
            val examplesJson = state.examples.map { serializer.stringify(Example.serializer(), it) }.joinToString(", ")

            return """{"disabled": [$calculiJson], "examples": [$examplesJson]}"""
        }

        fun setCalculusState(calculus: String, enableString: String, mac: String): String {
            val fingerprint = "kbsc|$calculus|$enableString"
            if (!verifyMAC(fingerprint, mac))
                throw AuthenticationException("Invalid MAC")

            return "Not implemented yet"
        }

        @Suppress("TooGenericExceptionCaught")
        fun addExample(example: String, mac: String): String {
            val fingerprint = "kbae|$example"
            val parsedExample: Example

            if (!verifyMAC(fingerprint, mac))
                throw AuthenticationException("Invalid MAC")

            try {
                parsedExample = serializer.parse(Example.serializer(), example)
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

        @Suppress("ThrowsCount")
        fun delExample(exampleIdString: String, mac: String): String {
            val fingerprint = "kbde|$exampleIdString"
            if (!verifyMAC(fingerprint, mac))
                throw AuthenticationException("Invalid MAC")

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

        private fun verifyMAC(payload: String, mac: String): Boolean {
            val payloadWithKey = "$payload|$date|${state.key}"
            val calculatedMAC = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
            return calculatedMAC == mac.toUpperCase()
        }

        private fun toHex(bytes: ByteArray) = bytes.map { String.format("%02X", it) }.joinToString("")

        private fun flush() {
            val json = serializer.stringify(AppState.serializer(), state)
            storage.writeText(json)
        }

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
            if (ex.calculus.length > EXAMPLE_CALCNAME_SIZE)
                throw StorageLimitHit("Example calculus name exceeds size limit of $EXAMPLE_CALCNAME_SIZE B")

            if (state.examples.size >= MAX_EXAMPLE_COUNT)
                throw StorageLimitHit("Maximum number of stored examples ($MAX_EXAMPLE_COUNT) exceeded")
        }
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
