package kalkulierbar.tamperprotect

/**
 * Class defining a common baseline for state objects using TamperProtect seals
 * computeSeal must be called before serialization
 * verifySeal must be called after deserialization
 * getHash must be implemented to capture all state information relevant for proof correctness
 * seal must be overridden in implementing classes to be included in serialization
 */
abstract class ProtectedState {
    abstract var seal: String

    /**
     * Generate a checksum of the current state to detect state objects being
     * modified or corrupted while in transit
     * Call before exporting state
     */
    fun computeSeal() {
        val payload = getHash()
        seal = TamperProtect.seal(payload)
    }

    /**
     * Verify the state object checksum
     * Call after importing state
     * @return true iff the current seal is valid
     */
    fun verifySeal() = TamperProtect.verify(getHash(), seal)

    /**
     * Pack the state into a well-defined, unambiguous string representation
     * Used to calculate checksums over state objects as JSON representation
     * might differ slightly between clients, encodings, etc
     * @return Canonical state representation
     */
    abstract fun getHash(): String
}
