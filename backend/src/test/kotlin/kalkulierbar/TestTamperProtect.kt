package kalkulierbar

import kalkulierbar.tamperprotect.TamperProtect
import kotlin.random.Random
import kotlin.test.Test
import kotlin.test.assertEquals

class TestTamperProtect {

    private val tv1 = Pair("", "0D9A6E6CCA519AEFA10F211186D8F4F8BCC5132816027D6260134B59A440CA6C")
    private val tv2 = Pair("smoke&mirrors", "7323EC61EE548AF565BA2D874AD8E9FC3F363E4726833283B25B9AC9F54E42EF")

    private val words = listOf("fog", "haze", "watermelon", "zombie", "factory", "dance", "dream", "silent", "weep", "lightbulb", "shine", "dim", "utopia")

    @Test
    fun testSealGeneration() {
        assertEquals(tv1.second, TamperProtect.seal(tv1.first))
        assertEquals(tv2.second, TamperProtect.seal(tv2.first))
    }

    @Test
    fun testVerification() {
        assertEquals(true, TamperProtect.verify(tv1.first, tv1.second))
        assertEquals(true, TamperProtect.verify(tv2.first, tv2.second))

        assertEquals(false, TamperProtect.verify(tv1.first, tv2.second))
        assertEquals(false, TamperProtect.verify(tv2.first, tv1.second))
    }

    @Test
    fun testCombined() {
        var payload: String
        for (i in 1..50) {
            payload = genPoem()
            val seal = TamperProtect.seal(payload)
            println(payload)
            assertEquals(true, TamperProtect.verify(payload, seal))

            val delete = Random.nextInt(payload.length - 1)
            payload = payload.removeRange(delete, delete + 1)

            assertEquals(false, TamperProtect.verify(payload, seal))
        }
    }

    private fun genPoem(): String {
        val length = Random.nextInt(2, 15)
        var poem = ""
        for (i in 1..length) {
            poem += "${ranWord()} "
        }
        return poem
    }

    private fun ranWord(): String {
        return words.random()
    }
}
