package kalkulierbar.tests.statekeeper

import kalkulierbar.JsonParseException
import org.komputing.khash.keccak.KeccakParameter
import org.komputing.khash.keccak.extensions.digestKeccak
import statekeeper.AuthenticationException
import statekeeper.InvalidRequest
import statekeeper.StateKeeper
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TestAdmin {

    val date = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC).format(Instant.now())
    val key = "WildFlowers/UncomfortableMoons"

    @BeforeTest
    fun resetCompanion() {
        StateKeeper.reset()
    }

    private fun toHex(bytes: ByteArray) = bytes.map { String.format("%02X", it) }.joinToString("")

    @Test
    fun testInitialConfig() {
        var config = StateKeeper.getConfig()
        var expected = """{"disabled": [], "examples": []}"""
        assertEquals(expected, config)
    }

    @Test
    fun testImportCalculi() {
        // Import available calculi
        val lst = mutableListOf("first", "second", "third")
        StateKeeper.importAvailable(lst)

        // Compute mac + set active calculus
        var enableString = "false"
        var setCalculus = "first"
        var fingerprint = "kbsc|$setCalculus|$enableString"
        var payloadWithKey = "$fingerprint|$date|$key"
        var mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        StateKeeper.setCalculusState(setCalculus, enableString, mac)
        assertEquals("""{"disabled": ["first"], "examples": []}""", StateKeeper.getConfig())

        enableString = "false"
        setCalculus = "third"
        fingerprint = "kbsc|$setCalculus|$enableString"
        payloadWithKey = "$fingerprint|$date|$key"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        StateKeeper.setCalculusState(setCalculus, enableString, mac)
        assertEquals("""{"disabled": ["first", "third"], "examples": []}""", StateKeeper.getConfig())

        enableString = "false"
        setCalculus = "second"
        fingerprint = "kbsc|$setCalculus|$enableString"
        payloadWithKey = "$fingerprint|$date|$key"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        StateKeeper.setCalculusState(setCalculus, enableString, mac)
        assertEquals("""{"disabled": ["first", "third", "second"], "examples": []}""", StateKeeper.getConfig())

        enableString = "true"
        setCalculus = "first"
        fingerprint = "kbsc|$setCalculus|$enableString"
        payloadWithKey = "$fingerprint|$date|$key"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        StateKeeper.setCalculusState(setCalculus, enableString, mac)
        assertEquals("""{"disabled": ["third", "second"], "examples": []}""", StateKeeper.getConfig())

        // Illegal calculi
        enableString = "false"
        setCalculus = "fourth"
        fingerprint = "kbsc|$setCalculus|$enableString"
        payloadWithKey = "$fingerprint|$date|$key"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        assertFailsWith<InvalidRequest> {
            StateKeeper.setCalculusState(setCalculus, enableString, mac)
        }

        // Wrong mac
        enableString = "true"
        setCalculus = "second"
        fingerprint = "kbsc|$setCalculus|$enableString"
        payloadWithKey = "$fingerprint|20200101|$key"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        assertFailsWith<AuthenticationException> {
            StateKeeper.setCalculusState(setCalculus, enableString, mac)
        }
    }

    @Test
    fun testCheckCredentials() {
        var fingerprint = "kbcc"
        var payloadWithKey = "$fingerprint|$date|$key"
        var mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        StateKeeper.checkCredentials(mac)

        // Test invalid mac
        fingerprint = "kbca"
        payloadWithKey = "$fingerprint|$date|$key"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        assertFailsWith<AuthenticationException> {
            StateKeeper.checkCredentials(mac)
        }

        fingerprint = "kbcc"
        payloadWithKey = "$fingerprint|$date|ThisIsCustomKey"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        assertFailsWith<AuthenticationException> {
            StateKeeper.checkCredentials(mac)
        }

        fingerprint = "kbcc"
        payloadWithKey = "$fingerprint|$date|$key|42"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        assertFailsWith<AuthenticationException> {
            StateKeeper.checkCredentials(mac)
        }
    }

    @Test
    fun testExamples() {
        var example = """{"name": "example1", "description": "Does some stuff", "calculus": "fo-resolution","formula": "/ex X: R(X)", "params": "Some params here"}"""
        var fingerprint = "kbae|$example"
        var payloadWithKey = "$fingerprint|$date|$key"
        var mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        StateKeeper.addExample(example, mac)
        var expected = """{"disabled": [], "examples": [{"name":"example1","description":"Does some stuff","calculus":"fo-resolution","formula":"/ex X: R(X)","params":"Some params here"}]}"""
        assertEquals(expected, StateKeeper.getConfig())

        example = """{"name": "example2", "description": "Does some crazy stuff", "calculus": "fo-tableaux","formula": "/all X: P(X)", "params": "Some params here"}"""
        fingerprint = "kbae|$example"
        payloadWithKey = "$fingerprint|$date|$key"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        StateKeeper.addExample(example, mac)
        expected = """{"disabled": [], "examples": [{"name":"example1","description":"Does some stuff","calculus":"fo-resolution","formula":"/ex X: R(X)","params":"Some params here"}, {"name":"example2","description":"Does some crazy stuff","calculus":"fo-tableaux","formula":"/all X: P(X)","params":"Some params here"}]}"""
        assertEquals(expected, StateKeeper.getConfig())

        // Wrong ID
        var exampleIdString = "-1"
        fingerprint = "kbde|$exampleIdString"
        payloadWithKey = "$fingerprint|$date|$key"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        assertFailsWith<JsonParseException> {
            StateKeeper.delExample(exampleIdString, mac)
        }

        exampleIdString = "2"
        fingerprint = "kbde|$exampleIdString"
        payloadWithKey = "$fingerprint|$date|$key"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        assertFailsWith<JsonParseException> {
            StateKeeper.delExample(exampleIdString, mac)
        }

        exampleIdString = "String here"
        fingerprint = "kbde|$exampleIdString"
        payloadWithKey = "$fingerprint|$date|$key"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        assertFailsWith<JsonParseException> {
            StateKeeper.delExample(exampleIdString, mac)
        }

        // Continue valid
        exampleIdString = "0"
        fingerprint = "kbde|$exampleIdString"
        payloadWithKey = "$fingerprint|$date|$key"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        StateKeeper.delExample(exampleIdString, mac)
        expected = """{"disabled": [], "examples": [{"name":"example2","description":"Does some crazy stuff","calculus":"fo-tableaux","formula":"/all X: P(X)","params":"Some params here"}]}"""
        assertEquals(expected, StateKeeper.getConfig())
    }

    @Test
    fun testInvalidExample() {
        // Missing field
        var example = """{"name": "example1", "calculus": "fo-resolution","formula": "/ex X: R(X)", "params": "Some params here"}"""
        var fingerprint = "kbae|$example"
        var payloadWithKey = "$fingerprint|$date|$key"
        var mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        assertFailsWith<JsonParseException> {
            StateKeeper.addExample(example, mac)
        }

        // Wrong mac
        example = """{"name": "example1", "description": "Does some stuff", "calculus": "fo-resolution","formula": "/ex X: R(X)", "params": "Some params here"}"""
        fingerprint = "kbae|$example"
        payloadWithKey = "$fingerprint|20200101|$key"
        mac = toHex(payloadWithKey.digestKeccak(parameter = KeccakParameter.SHA3_256))
        assertFailsWith<AuthenticationException> {
            StateKeeper.addExample(example, mac)
        }
    }
}
