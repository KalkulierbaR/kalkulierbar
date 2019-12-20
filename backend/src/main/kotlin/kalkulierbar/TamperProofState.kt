package main.kotlin.kalkulierbar

import kalkulierbar.TamperProtect
import kotlinx.serialization.Serializable

@Serializable
abstract class TamperProofState {
    abstract var seal: String

    abstract fun getHash(): String

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
}