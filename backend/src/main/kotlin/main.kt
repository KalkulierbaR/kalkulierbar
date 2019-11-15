package main.kotlin

import io.javalin.Javalin
import kalkulierbar.ApiMisuseException
import kalkulierbar.ClauseAcceptor
import kalkulierbar.KalkulierbarException
import kotlinx.serialization.json.*
import main.kotlin.kalkulierbar.CalculusJSON
import main.kotlin.kalkulierbar.clause.ClauseSet

// List of all active calculi (calculuus?)
val endpoints: Set<CalculusJSON> = setOf<CalculusJSON>(ClauseAcceptor())

fun main(args: Array<String>) {

    // Verify that all calculus implementations have unique names
    if (endpoints.size != endpoints.map { it.identifier }.distinct().size)
        throw KalkulierbarException("Set of active calculus implementations contains duplicate identifiers")

    val port = 7000

    httpApi(port, endpoints)
}

/**
 * Starts a Javalin Server and creates API methods for active calculus objects
 */
@Suppress("ThrowsCount")
fun httpApi(port: Int, endpoints: Set<CalculusJSON>) {

    val app = Javalin.create().start(port)

    val json = Json(JsonConfiguration.Stable)
    val clauseSetSerializer = ClauseSet.serializer()

    // Catch explicitly thrown exceptions
    app.exception(KalkulierbarException::class.java) { e, ctx ->
        ctx.status(400)
        ctx.result(e.message ?: "Unknown exception")
    }

    // Serve a small overview at the root endpoint listing all active calculus identifiers
    app.get("/") { ctx ->
        val ids = endpoints.map { it.identifier }
        ctx.result("KalkulierbaR API Server\n\nAvailable calculus endpoints:\n${ids.joinToString("\n")}")
    }

    // Create API methods for each calculus
    for (endpoint in endpoints) {
        val name = endpoint.identifier

        // Small documentation at the main calculus endpoint
        app.get("/$name") { ctx ->
            ctx.result("Calculus \"$name\" loaded.\nInteract via the /parse /move and /close endpoints\n\nCalculus Documentation:\n\n${endpoint.getDocumentation()}")
        }

        // Parse endpoint takes formula parameter and passes it to calculus implementation
        app.post("/$name/parse") { ctx ->
            val formula = ctx.formParam("formula")
            if (formula == null)
                throw ApiMisuseException("POST parameter 'formula' needs to be present")
            ctx.header("Access-Control-Allow-Origin", "*")
            val result = endpoint.parseFormulaToJSON(formula)
            ctx.result(result)
        }

        // Move endpoint takes state and move parameter values and passes them to calculus implementation
        app.post("/$name/move") { ctx ->
            val state = ctx.formParam("state")
            val move = ctx.formParam("move")
            if (state == null)
                throw ApiMisuseException("POST parameter 'state' with state representation needs to be present")
            if (move == null)
                throw ApiMisuseException("POST parameter 'move' with move representation needs to be present")
            ctx.header("Access-Control-Allow-Origin", "*")
            val result = endpoint.applyMove(state, move)
            ctx.result(result)
        }

        // Close endpoint takes state parameter value and passes it to calculus implementation
        app.post("/$name/close") { ctx ->
            val state = ctx.formParam("state")
            if (state == null)
                throw ApiMisuseException("POST parameter 'state' with state representation must be present")
            ctx.header("Access-Control-Allow-Origin", "*")
            ctx.result(if (endpoint.checkClose(state)) "Proof closed" else "Incomplete Proof")
        }
    }
}
