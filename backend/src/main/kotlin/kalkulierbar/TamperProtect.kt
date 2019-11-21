package kalkulierbar

import org.komputing.khash.keccak.KeccakParameter
import org.komputing.khash.keccak.extensions.digestKeccak

class TamperProtect {
    companion object Companion {
        fun seal(string: String): String {
            val payload = "i understand that modifying this object may lead to incorrect proofs|$string"
            return toHex(payload.digestKeccak(parameter = KeccakParameter.SHA3_256))
        }

        fun verify(string: String, hash: String): Boolean {
            return seal(string) == hash
        }

        private fun toHex(bytes: ByteArray) = bytes.map { String.format("%02X", it) }.joinToString("")
    }
}
