# Modal Logic Formula

Modal Logic formula will be used as a input format SignedModalLogic.

## Format Specification

### Variables

Variables can be any alpha-numeric string and are case-sensitive.

### Operations

Operator notation follows the usual infix notation for propositional logic.
Syntax conventions are designed to be compatible with the notation used by the KeY system.

| Operation     | Symbol        | Example           |
| ------------- |:-------------:| -----------------:|
| Unary Not     | !             |  !valid           |
| Binary And    | &             |  a & b            |
| Binary Or     | &#124;        |  a &#124; b       |
| Implication   | ->            |  rain -> wet      |
| Equivalence   | <=> or <->    |  right <=> !left  |
| Parentheses   |   ()          |  (a &#124; b) & c |
| Diamond       |   ◇           |     ◇ a & ◇ c     |
| Box           |   □           |     □ a & □ c     |

### Operator precedence

unary operators ¬, □ and ◇ have the same precedence

they take precedence over the binary connectives ∧ and ∨

therefore, □x ∨ y is:

the same as (□x) ∨ y
different from □(x ∨ y)

### Whitespace

Common whitespace characters between variables and operator are ignored.
Whitespace in variable names is not allowed.
