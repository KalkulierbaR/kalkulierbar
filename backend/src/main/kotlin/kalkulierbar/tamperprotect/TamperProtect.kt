package kalkulierbar.tamperprotect

import org.komputing.khash.keccak.KeccakParameter
import org.komputing.khash.keccak.extensions.digestKeccak

/**
 * Helper class to ensure state integrity
 * Calculates and verifies a cryptographic checksum over a state fingerprint
 * Technically a HMAC with a not strictly speaking secret key
 * Note:
 * This is designed to protect against semi-accidental misuse, _not_ active malicious interference
 */
class TamperProtect {
    companion object Companion {

        /**
         * Calculates a checksum over the supplied string
         * @param string Input string / state fingerprint to 'sign'
         * @return SHA3-256 checksum in uppercase hex format
         */
        fun seal(string: String): String {
            val payload = "i understand that modifying this object may lead to incorrect proofs|$string"
            return toHex(payload.digestKeccak(parameter = KeccakParameter.SHA3_256))
        }

        /**
         * Verifies a string against a TamperProtect checksum
         * @param string Data to verify
         * @param hash TamperProtect checksum of the data in uppercase hex format
         * @return true iff the checksum is valid for the provided input
         */
        fun verify(string: String, hash: String): Boolean {
            return seal(string) == hash
        }

        private fun toHex(bytes: ByteArray) = bytes.map { String.format("%02X", it) }.joinToString("")
    }
}
