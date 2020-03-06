package statekeeper

import java.io.File
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import kalkulierbar.JsonParseException
import kalkulierbar.KalkulierbarException
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.komputing.khash.keccak.KeccakParameter
import org.komputing.khash.keccak.extensions.digestKeccak

class StateKeeper {
    companion object {

        private val date
            get() = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC).format(Instant.now())

        private val storage = File("kbar-state.json")
        private val state: AppState

        init {
            try {
                if (storage.createNewFile())
                    state = AppState()
                else
                    state = Json.parse(AppState.serializer(), storage.readText())
            } catch (e: Exception) {
                val msg = "Could not parse stored state: "
                throw JsonParseException(msg + (e.message ?: "Unknown error"))
            }
        }

        // TODO: Make these things persistent somehow

        @kotlinx.serialization.UnstableDefault
        fun getConfig(): String {
            val calculiJson = state.enabledCalculi.map { "\"$it\"" }.joinToString(", ")
            val examplesJson = state.examples.map { Json.stringify(Example.serializer(), it) }.joinToString(", ")

            return """{"calculi": [$calculiJson], "examples": [$examplesJson]}"""
        }

        fun setCalculusState(calculus: String, enableString: String, mac: String): String {
            val fingerprint = "kbsc|$calculus|$enableString"
            if (!verifyMAC(fingerprint, mac))
                throw AuthenticationException("Invalid MAC")

            return "Not implemented yet"
        }

        @Suppress("TooGenericExceptionCaught")
        @kotlinx.serialization.UnstableDefault
        fun addExample(example: String, mac: String): String {
            val fingerprint = "kbae|$example"
            if (!verifyMAC(fingerprint, mac))
                throw AuthenticationException("Invalid MAC")

            try {
                val parsedExample = Json.parse(Example.serializer(), example)
                state.examples.add(parsedExample)
                flush()
            } catch (e: Exception) {
                val msg = "Could not parse JSON example: "
                throw JsonParseException(msg + (e.message ?: "Unknown error"))
            }

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
            val json = Json.stringify(AppState.serializer(), state)
            storage.writeText(json)
        }
    }
}

@Serializable
data class AppState(
    val enabledCalculi: MutableList<String> = mutableListOf(),
    val examples: MutableList<Example> = mutableListOf(),
    val key: String = "WildFlowers/UncomfortableMoons"
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
