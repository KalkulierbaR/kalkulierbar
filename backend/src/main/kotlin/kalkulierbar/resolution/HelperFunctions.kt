package kalkulierbar.resolution

import kalkulierbar.IllegalMove
import kalkulierbar.clause.Atom
import kalkulierbar.clause.Clause
import kalkulierbar.logic.SyntacticEquality

/**
 * Filters two clauses by a given literal and returns the belonging atoms from each clause
 * @param c1 First clause to search for
 * @param c2 Second clause to search for
 * @param literal Literal to search for
 * @return The pair of atoms (a1, a2) so that a1 is in c1 and a2 in c2 while a1 and b2 share the same literal
 */
@Suppress("ThrowsCount")
fun <AtomType> filterClause(
    c1: Clause<AtomType>,
    c2: Clause<AtomType>,
    literal: AtomType
): Pair<Atom<AtomType>, Atom<AtomType>> {
    // Filter clauses for atoms with correct literal
    val atomsInC1 = c1.atoms.filter { literalsAreEqual(it.lit, literal) }
    val atomsInC2 = c2.atoms.filter { literalsAreEqual(it.lit, literal) }
    if (atomsInC1.isEmpty())
        throw IllegalMove("Clause '$c1' does not contain atom '$literal'")
    if (atomsInC2.isEmpty())
        throw IllegalMove("Clause '$c2' does not contain atom '$literal'")

    val msg = "Clauses '$c1' and '$c2' do not contain atom '$literal' in both positive and negated form"
    val resCandidates = findResCandidates(atomsInC1, atomsInC2)
        ?: throw IllegalMove(msg)
    return resCandidates
}

/**
 * Automatically find a resolution candidate for two given clauses
 * @param c1 First clause to resolve
 * @param c2 Second clause to resolve
 * @return Pair of suitable atoms in c1 and c2 for resolution
 */
fun <AtomType> getAutoResolutionCandidates(
    c1: Clause<AtomType>,
    c2: Clause<AtomType>
): Pair<Atom<AtomType>, Atom<AtomType>> {

    // Find literals present in both clauses
    var sharedAtoms = c1.atoms.filter {
        val c1atom = it
        c2.atoms.any { literalsAreEqual(c1atom.lit, it.lit) }
    }

    if (sharedAtoms.isEmpty())
        throw IllegalMove("Clauses '$c1' and '$c2' contain no common literals")

    // Sort out atoms not present in opposite polarity in c2 (shared atoms came from c1 originally)
    sharedAtoms = sharedAtoms.filter {
        c2.atoms.contains(it.not())
    }

    if (sharedAtoms.isEmpty())
        throw IllegalMove(
            "Clauses '$c1' and '$c2' contain no common literals that appear" +
                "in positive and negated form"
        )

    // Choose the first shared literal
    val a1 = sharedAtoms[0]
    val a2 = a1.not()

    return Pair(a1, a2)
}

/**
 * Builds a new clause according to resolution.
 * @param c1 The first clause for resolution
 * @param a1 The atom to filter out of c1
 * @param c2 The second clause for resolution
 * @param a2 The atom to filter out of c2
 * @return A new clause that contains all elements of c1 and c2 except for a1 and a2
 */
fun <AtomType> buildClause(
    c1: Clause<AtomType>,
    a1: Atom<AtomType>,
    c2: Clause<AtomType>,
    a2: Atom<AtomType>
): Clause<AtomType> {
    val atoms = c1.atoms.filter { it != a1 }.toMutableList() +
        c2.atoms.filter { it != a2 }.toMutableList()
    return Clause(atoms.toMutableList())
}

/**
 * Searches two atom lists for resolution candidates and returns the first.
 * The lists have to be filtered for the spelling already.
 * @param atoms1 The first list of atoms
 * @param atoms2 The second list of atoms
 * @return A pair of the two atoms for resolution.
 */
fun <AtomType> findResCandidates(
    atoms1: List<Atom<AtomType>>,
    atoms2: List<Atom<AtomType>>
): Pair<Atom<AtomType>, Atom<AtomType>>? {
    val (pos, neg) = atoms2.partition { !it.negated }

    for (a1 in atoms1) {
        val other = if (a1.negated) pos else neg
        if (other.isEmpty())
            continue
        val a2 = other[0]
        return Pair(a1, a2)
    }

    return null
}

/**
 * Check if the literals of two atoms are syntactical equal
 * @param a First atom
 * @param b Second atom
 * @return Boolean
 */
fun <AtomType> literalsAreEqual(a: AtomType, b: AtomType): Boolean {
    val eq: Boolean
    // Use syntactic equality for literal comparison if defined
    if (a is SyntacticEquality && b is SyntacticEquality)
        eq = a.synEq(b)
    else
        eq = (a == b)
    return eq
}
