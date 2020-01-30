package main.kotlin

import io.javalin.Javalin
import kalkulierbar.ApiMisuseException
import kalkulierbar.Calculus
import kalkulierbar.KBAR_DEFAULT_PORT
import kalkulierbar.KalkulierbarException
import kalkulierbar.resolution.FirstOrderResolution
import kalkulierbar.resolution.PropositionalResolution
import kalkulierbar.tableaux.FirstOrderTableaux
import kalkulierbar.tableaux.PropositionalTableaux
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.server.ServerConnector

// List of all active calculi
val endpoints: Set<Calculus> = setOf<Calculus>(PropositionalTableaux(), PropositionalResolution(), FirstOrderTableaux(), FirstOrderResolution())

fun main(args: Array<String>) {
    // Verify that all calculus implementations have unique names
    if (endpoints.size != endpoints.map { it.identifier }.distinct().size)
        throw KalkulierbarException("Set of active calculus implementations contains duplicate identifiers")

    val port = getEnvPort()

    // Only listen globally if cli argument is present
    val listenGlobally = args.isNotEmpty() && (args[0] == "--global" || args[0] == "-g")

    httpApi(port, endpoints, listenGlobally)
}

fun getEnvPort() = System.getenv("PORT")?.toInt() ?: KBAR_DEFAULT_PORT

/**
 * Starts a Javalin Server and creates API methods for active calculus objects
 * @param port Port number to run the local server at
 * @param endpoints Set of active Calculi to serve
 */
@Suppress("ThrowsCount", "MagicNumber")
fun httpApi(port: Int, endpoints: Set<Calculus>, listenGlobally: Boolean = false) {

    val host = if (listenGlobally) "0.0.0.0" else "localhost"

    val app = Javalin.create { config ->
        // Enable CORS headers
        config.enableCorsForAllOrigins()

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
                |Interact via the /parse /move and /close endpoints""".trimMargin())
        }

        // Parse endpoint takes formula parameter and passes it to calculus implementation
        app.post("/$name/parse") { ctx ->
            val map = ctx.formParamMap()
            val formula = getParam(map, "formula")!!
            val params = getParam(map, "params", true)
            ctx.result(endpoint.parseFormula(formula, params))
        }

        // Move endpoint takes state and move parameter values and passes them to calculus implementation
        app.post("/$name/move") { ctx ->
            val map = ctx.formParamMap()
            val state = getParam(map, "state")!!
            val move = getParam(map, "move")!!
            ctx.result(endpoint.applyMove(state, move))
        }

        // Close endpoint takes state parameter value and passes it to calculus implementation
        app.post("/$name/close") { ctx ->
            val state = ctx.formParam("state")
                    ?: throw ApiMisuseException("POST parameter 'state' with state representation must be present")
            ctx.result(endpoint.checkClose(state))
        }
    }
}

/**
 * Get a request parameter from the Javalin provided parameter map
 * Will never return null unless the optional parameter is true
 * @param map Javalin parameter map
 * @param key parameter name
 * @param optional true if no exception should be raised for missing values
 * @return Value associated with the parameter key, null if not found and optional
 */
fun getParam(map: Map<String, List<String>>, key: String, optional: Boolean = false): String? {
    val lst = map.get(key)

    if (lst == null && !optional)
        throw ApiMisuseException("POST parameter '$key' needs to be present")
    else if (lst == null)
        return null

    return lst.get(0)
}
