# Propositional Formula

Propositional formulae may be shared between different calculi as a common input format and are thus specified on their own here.

## Format Specification

### Variables

Variables can be any alpha-numeric string and are case-sensitive.

### Operations

Operator notation follows the usual infix notation for propositional logic. Syntax conventions are designed to be compatible with the notation used by the KeY system.

| Operation     | Symbol        | Example           |
| ------------- |:-------------:| -----------------:|
| Unary Not     | `!`           | `!valid`          |
| Binary And    | `&`           | `a & b`           |
| Binary Or     | `|`           | `a | b`           |
| Implication   | `->`          | `rain -> wet`     |
| Equivalence   | `<=>` or `<->`| `right <=> !left` |
| Parentheses   | `()`          | `(a | b) & c`     |

### Operator precedence

Operator precedence is defined as follows: `()` > `!` > `&` > `|` > `->` > `<=>`. All binary operations are left-associative. 

### Whitespace

Common whitespace characters are ignored.