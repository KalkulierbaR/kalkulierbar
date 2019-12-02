package main.kotlin

import io.javalin.Javalin
import kalkulierbar.ApiMisuseException
import kalkulierbar.Calculus
import kalkulierbar.KalkulierbarException
import kalkulierbar.PropositionalTableaux
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.server.ServerConnector

// List of all active calculi (calculuus?)
val endpoints: Set<Calculus> = setOf<Calculus>(PropositionalTableaux())

@Suppress("MagicNumber")
fun main(args: Array<String>) {

    // Verify that all calculus implementations have unique names
    if (endpoints.size != endpoints.map { it.identifier }.distinct().size)
        throw KalkulierbarException("Set of active calculus implementations contains duplicate identifiers")

    val port = 7000

    // Only listen globally if cli argument is present
    val listenGlobally = args.size > 0 && (args[0] == "--global" || args[0] == "-g")

    httpApi(port, endpoints, listenGlobally)
}

/**
 * Starts a Javalin Server and creates API methods for active calculus objects
 * @param port Port number to run the local server at
 * @param endpoints Set of active Calculi to serve
 */
@Suppress("ThrowsCount", "MagicNumber")
fun httpApi(port: Int, endpoints: Set<Calculus>, listenGlobally: Boolean = false) {

    val host = if (listenGlobally) "0.0.0.0" else "localhost"

    val app = Javalin.create { config ->
        // Set a Jetty server manually for more config options
        config.server {
            // Create and configure Jetty server
            Server().apply {
                connectors = arrayOf(ServerConnector(this).apply {
                    this.host = host
                    this.port = port
                })
            }
        }
    }

    app.start()

    // Catch explicitly thrown exceptions
    app.exception(KalkulierbarException::class.java) { e, ctx ->
        ctx.status(400)
        ctx.result(e.message ?: "Unknown exception")
    }

    // Add CORS headers for every request
    app.before { ctx ->
        ctx.header("Access-Control-Allow-Origin", "*")
    }

    // Serve a small overview at the root endpoint listing all active calculus identifiers
    app.get("/") { ctx ->
        val ids = endpoints.map { it.identifier }
        ctx.result("""KalkulierbaR API Server
            |
            |Available calculus endpoints:
            |${ids.joinToString("\n")}""".trimMargin())
    }

    // Create API methods for each calculus
    for (endpoint in endpoints) {
        val name = endpoint.identifier

        // Small documentation at the main calculus endpoint
        app.get("/$name") { ctx ->
            ctx.result("""Calculus "$name" loaded.
                |Interact via the /parse /move and /close endpoints
                |
                |Calculus Documentation:
                |${endpoint.getDocumentation()}""".trimMargin())
        }

        // Parse endpoint takes formula parameter and passes it to calculus implementation
        app.post("/$name/parse") { ctx ->
            val formula = ctx.formParam("formula")
                    ?: throw ApiMisuseException("POST parameter 'formula' needs to be present")
            ctx.result(endpoint.parseFormula(formula))
        }

        // Move endpoint takes state and move parameter values and passes them to calculus implementation
        app.post("/$name/move") { ctx ->
            val state = ctx.formParam("state")
                    ?: throw ApiMisuseException("POST parameter 'state' with state representation needs to be present")
            val move = ctx.formParam("move")
                    ?: throw ApiMisuseException("POST parameter 'move' with move representation needs to be present")
            ctx.result(endpoint.applyMove(state, move))
        }

        // Close endpoint takes state parameter value and passes it to calculus implementation
        app.post("/$name/close") { ctx ->
            val state = ctx.formParam("state")
                    ?: throw ApiMisuseException("POST parameter 'state' with state representation must be present")
            ctx.result(if (endpoint.checkClose(state)) "true" else "false")
        }
    }
}
