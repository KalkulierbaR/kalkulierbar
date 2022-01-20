package kalkulierbar.tests.resolution

import kalkulierbar.resolution.FirstOrderResolution
import kotlin.test.Test
import kotlin.test.assertEquals

class TestFOResolutionInit {
  private val inst = FirstOrderResolution()

  // See #50 for explanation
  @Test
  fun testSuffixes() {
    val state = inst.parseFormulaToState("/all M: /all N: (Subset(M, N) <-> /all A: (In(A, M) -> In(A, N)))", null)
    assertEquals("{Subset(M_1, N_1), !Subset(M_1, N_1)}, {Subset(M_2, N_2), In(sk1(M_2, N_2), M_2)}, {Subset(M_3, N_3), !In(sk1(M_3, N_3), N_3)}, {!In(A_4, M_4), In(A_4, N_4), !Subset(M_4, N_4)}, {!In(A_5, M_5), In(A_5, N_5), In(sk1(M_5, N_5), M_5)}, {!In(A_6, M_6), In(A_6, N_6), !In(sk1(M_6, N_6), N_6)}", state.clauseSet.toString())
  }
}