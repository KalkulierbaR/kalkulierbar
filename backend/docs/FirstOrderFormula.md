# First Order Formula

First order formulae may be shared between different calculi as a common input format   
and are thus specified on their own here.   
First order formulae are, for the most part, an extension of propositional formulae   
as defined in PropositionalFormula.md.

## Format Specification

### Identifiers

Identifiers may only contain alpha-numeric characters.   
Constant and function identifiers must start with a lowercase letter or a number;   
relation and variable identifiers must begin with an uppercase letter.

Identifiers (constants, relations, functions, etc) are recognized on use   
and do not have to be defined explicitly.

### Whitespace

All whitespace, including linebreaks, is ignored except for whitespace in identifier.   
Whitespace in examples is for human readability only.

### Terms

First order terms are defined as follows:

1. All constants (identifiers with a lowercase or numeric first character) are terms

2. All variables (identifiers with an uppercase first character) are terms

3. Given n terms `t1` to `tn`, all functions `f(t1, t2, ... tn)` are terms 
    - where `f` is an identifier with a lowercase or numeric first character

4. Nothing else is a term

Please note that functions must have at least one argument and that different functions  
with the same name but different numbers of arguments may exist. 

### Atomic Formulae

An atomic formula is a relation with one or more terms as arguments,   
written as `R(t1, t2, ... tn)` where `R` is an identifier with an uppercase first character.  
Please note that relations with the same name but different numbers of arguments may exist.

### First Order Formulae

A first order formula consists of one or more atomic formulae joined together  
by propositional logic operations and quantifiers.   
All variables in a propositional formula must be bound by a quantifier.

| Operation     | Symbol        | Example           |
| ------------- |:-------------:| -----------------:|
| Unary Not     |   !           |   !valid          |
| Binary And    |   &           |   a & b           |
| Binary Or     | &#124;        | a &#124; b        |
| Implication   |   ->          |   rain -> wet     |
| Equivalence   |   <=> or <->  | right <=> !left   |
| Parentheses   |   ()          | (a &#124; b) & c  |

### Quantifiers

Variables may be quantified using an existential or universal quantifier.   
Universal quantifiers are written as `/all X: f` or `\all X: f`, where `X` is a variable and `f`   
is a first-order formula in which `X` is to be universally quantified.   
Existential quantifiers are written as `/ex: X: f` or `\ex: X: f`.

When two quantifiers with overlapping scopes bind the same identifier  
(e.g. `\all X: (R(X) & \ex X: Q(X))`),   
each variable is bound to the innermost applicable quantifier.

### Operator precedence

Operator precedence is defined as follows: `()` > `!` > `\ex` = `\all` > `&` > `|` > `->` > `<=>`.   
All binary operations are left-associative. 
