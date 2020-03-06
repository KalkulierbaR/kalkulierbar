package statekeeper

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

        // TODO: Store this somewhere else
        private val key = "correctHorseBatteryStaple"

        private val date
            get() = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC).format(Instant.now())

        // TODO: Make these things persistent somehow
        private val enabledCalculi = mutableListOf(
            "prop-tableaux",
            "prop-resolution",
            "fo-tableaux",
            "fo-resolution",
            "prop-dpll"
        )
        private val examples = mutableListOf<Example>(
            Example(
                "Example Example",
                "An example showing the capabilities of examples",
                "prop-tableaux",
                "a,b,c;!a;!b;!c",
                "{\"type\": \"UNCONNECTED\", \"regular\": false, \"backtracking\": true}"
            )
        )

        @kotlinx.serialization.UnstableDefault
        fun getConfig(): String {
            val calculiJson = enabledCalculi.map { "\"$it\"" }.joinToString(", ")
            val examplesJson = examples.map { Json.stringify(Example.serializer(), it) }.joinToString(", ")

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
                examples.add(parsedExample)
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
                if (id < 0 || id >= examples.size)
                    throw JsonParseException("Example with ID $id does not exist")
                examples.removeAt(id)
            } catch (e: NumberFormatException) {
                val msg = "Could not parse example ID: "
                throw JsonParseException(msg + (e.message ?: "Unknown error"))
            }

            return "true"
        }

        private fun verifyMAC(payload: String, mac: String): Boolean {
            val payloadWithKey = "$payload|$date|$key"
            val calculatedMAC = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
            return calculatedMAC == mac.toUpperCase()
        }

        private fun toHex(bytes: ByteArray) = bytes.map { String.format("%02X", it) }.joinToString("")
    }
}

@Serializable
data class Example(
    val name: String,
    val description: String,
    val calculus: String,
    val formula: String,
    val params: String
)

class AuthenticationException(msg: String) : KalkulierbarException(msg)
