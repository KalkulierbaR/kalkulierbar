# Implementing your own Calculus
KalkulierbaR comes with a whole set of features to help you implement your own Calculi - let's see how you might want to get started!

## The Bare Metal
At their core, calculi are just classes implementing the `Calculus` interface.
There are three core functions: Parsing a formula and setting up the initial proof state,
taking a proof state and applying a rule ('move') on it, and checking if a given state represents a closed proof.
An additional endpoint that you might want to support is state validation, 
which lets a frontend implementation check stored states without applying any moves. 
So a really basic calculus might be implemented like this:

```kotlin
class BareMetalCalculus : Calculus {
    // Give your calculus a unique name
    // The calculus api will be exposed at '/<identifier>/'
    override val identifier = "bare-metal"

    // Take in a formula and some optional parameters, return some state representation
    override fun parseFormula(formula: String, params: String?): String {
        /*...*/
    }

    // Take in a state representation and a move representation, return a new state
    override fun applyMove(state: String, move: String): String {
        /*...*/
    }

    // Take in a state, return a message indicating proof closure state
    override fun checkClose(state: String): String {
        /*...*/
    }

    // Take in a state, return a message indicating its validity
    override fun validate(state: String): String {
        /*...*/
    }
}
```
As you have probably noticed, all these functions operate on plain old strings,
meaning you have both the freedom and the obligation to define your own data interchange format
that you'd like to use for this calculus.

Also note how the calculus is completely stateless - state information is always supplied by the user to the function.

This means you won't have to worry about keeping tabs on who's currently using the calculus - a user might even change servers mid-proof without noticing a thing.

## A bit more structured
Most of the time, you'll probably want to use an established data format like JSON
for your calculus instead of rolling your own.
To do so, just implement the `JSONCalculus` instead! Using this interface, you can define your own classes
to represent proof states, moves, and parameters.
 
You can then operate on these classes when implementing the calculus logic - the corresponding parsing and serialization functions will be called automatically.

```kotlin
class CommonCalculus : JSONCalculus<State, Move, Param>() {

    override val identifier = "com-calc"

    override fun parseFormulaToState(formula: String, params: Param?): State {
        /*...*/
    }

    override fun applyMoveOnState(state: State, move: Move): State {
       /*...*/
    }

    override fun checkCloseOnState(state: State): CloseMessage {
        return CloseMessage(false, "Proof is not closed")
    }

    // Define how to parse a state representation
    override fun jsonToState(json: String): State {
       /*...*/
    }

    // Define how to serialize a state
    override fun stateToJson(state: State): String {
        /*...*/
    }

    // Define how to parse a move
    override fun jsonToMove(json: String): Move {
        /*...*/
    }
    
    // Define how to parse parameters
    override fun jsonToParam(json: String): Param {
        /*...*/
    }
}
```
Note that the `checkCloseOnState` function returns a `CloseMessage` - this is a predefined data class containing
a boolean field `closed` indicating whether the proof is, well, closed,
alongside a string `message` containing more information.
Also, you might have noticed there is no `validate` function here - and that's by design. 
Using the `JSONCalculus`, the validate endpoint will simply return `true` if parsing of the state succeeds. 
If you would like to perform additional validation, you can do so by overriding the `validateOnState` method of the interface.

## Some Safety
One important caveat to the stateless nature of KalkulierbaR is that we have to be able to trust the client
not to modify the proof state in between requests if we want to ensure the correctness of all proofs.
You might be okay just assuming that the client won't be that careless, but if you want to be sure,
you can use the `ProtectedState` abstract class we provide for this reason. To make a state protected,
it needs to override the `seal` field and the `getHash` function.
The `getHash` function should transform the state (or at least the parts that you care about not being changed)
into a string fingerprint deterministically.
With that in place, you can now use the `stateObj.computeSeal()` and `stateObj.verifySeal()` functions.
The compute seal function will generate a cryptographic checksum of the state fingerprint and
store it in the `seal` variable.
You should always call this before serializing your state.
The verify seal method checks if checksum in the `seal` variable matches the state fingerprint,
returning `false` if the state appears to have been modified.

```kotlin
class SampleState(): ProtectedState() {
    val shouldNotBeModified = 42
    
    override var seal = ""
    override fun getHash(): String {
        return shouldNotBeModified.toString()
    }
    
    fun serializeOrSomething(): String {
        computeSeal()
        /*...*/
    }
}
```

## Speaking Tongues
At some point, you'll most likely want to parse a logic formula in one way or another.

Because writing parsers takes time, we have some ready that you can use:
* `ClauseSetParser.parse(formula)` parses a propositional clause set in our very own clause set notation
* `PropositionalParser.parse(formula)` parses a propositional formula into a tree representation
* `FlexibleClauseSetParser.parse(formula)` parses both clause set notation and propositional formulae into clause sets
* `FirstOrderParser.parse(formula)` parses a first-order formula into a tree representation

For details on the input formats see the input format specification files in this folder,
for details on the parsed representations it's probably best to jump right to the source code
in the `logic` and `clause` packages.
There is also a variety of ready-to-use formula transformations (CNF, NNF, SNF, Unification, etc)
for both propositional and first-order formulae in the `logic/transform` `logic/util` packages.

## Calculus Frontends

This file has only covered the implementation of a custom calculus backend - to create a new frontend, have a look at the [frontend documentation](../../frontend/docs/ImplementingACalculus.md).
