package main.kotlin

import io.javalin.Javalin
import kalkulierbar.*
import kalkulierbar.dpll.DPLL
import kalkulierbar.nonclausaltableaux.NonClausalTableaux
import kalkulierbar.resolution.FirstOrderResolution
import kalkulierbar.resolution.PropositionalResolution
import kalkulierbar.sequent.fosc.FOSC
import kalkulierbar.sequent.psc.PSC
import kalkulierbar.signedtableaux.SignedModalTableaux
import kalkulierbar.tableaux.FirstOrderTableaux
import kalkulierbar.tableaux.PropositionalTableaux
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.eclipse.jetty.server.Server
import org.eclipse.jetty.server.ServerConnector
import statekeeper.Scoreboard
import statekeeper.StateKeeper

// List of all active calculi
val endpoints: Set<Calculus> = setOf<Calculus>(
    PropositionalTableaux(),
    PropositionalResolution(),
    FirstOrderTableaux(),
    FirstOrderResolution(),
    DPLL(),
    NonClausalTableaux(),
    PSC(),
    FOSC(),
    SignedModalTableaux()
)

fun main(args: Array<String>) {
    // Verify that all calculus implementations have unique names
    if (endpoints.size != endpoints.map { it.identifier }.distinct().size)
        throw KalkulierbarException("Set of active calculus implementations contains duplicate identifiers")

    // Verify that no calculus is overriding /admin and /config endpoints
    if (endpoints.any { it.identifier == "admin" || it.identifier == "config" })
        throw KalkulierbarException("Set of active calculi contains forbidden identifiers \"admin\" or \"config\"")

    // Pass list of available calculi to StateKeeper
    StateKeeper.importAvailable(endpoints.map { it.identifier })

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
@Suppress("ThrowsCount", "MagicNumber", "LongMethod", "ComplexMethod")
fun httpApi(port: Int, endpoints: Set<Calculus>, listenGlobally: Boolean = false) {

    val host = if (listenGlobally) "0.0.0.0" else "localhost"

    val app = Javalin.create { config ->
        // Enable CORS headers
        config.enableCorsForAllOrigins()

        // Set a Jetty server manually for more config options
        config.server {
            // Create and configure Jetty server
            Server().apply {
                connectors = arrayOf(
                    ServerConnector(this).apply {
                        this.host = host
                        this.port = port
                    }
                )
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
        ctx.result(
            """KalkulierbaR API Server
            |
            |Available calculus endpoints:
            |${ids.joinToString("\n")}""".trimMargin()
        )
    }

    // Create API methods for each calculus
    for (endpoint in endpoints) {
        createCalculusEndpoints(app, endpoint)
    }

    // Create admin interface and config endpoints
    app.get("/config") { ctx ->
        ctx.result(StateKeeper.getConfig())
    }

    app.post("/admin/checkCredentials") { ctx ->
        val mac = ctx.formParam("mac")
            ?: throw ApiMisuseException("POST parameter 'mac' with authentication code must be present")
        ctx.result(StateKeeper.checkCredentials(mac))
    }

    app.post("/admin/setCalculusState") { ctx ->
        val calculus = ctx.formParam("calculus")
            ?: throw ApiMisuseException("POST parameter 'calculus' with calculus name must be present")
        val enable = ctx.formParam("enable")
            ?: throw ApiMisuseException("POST parameter 'enable' with calculus state must be present")
        val mac = ctx.formParam("mac")
            ?: throw ApiMisuseException("POST parameter 'mac' with authentication code must be present")
        ctx.result(StateKeeper.setCalculusState(calculus, enable, mac))
    }

    app.post("/admin/addExample") { ctx ->
        val example = ctx.formParam("example")
            ?: throw ApiMisuseException("POST parameter 'example' with example data must be present")
        val mac = ctx.formParam("mac")
            ?: throw ApiMisuseException("POST parameter 'mac' with authentication code must be present")
        ctx.result(StateKeeper.addExample(example, mac))
    }

    app.post("/admin/delExample") { ctx ->
        val exampleID = ctx.formParam("exampleID")
            ?: throw ApiMisuseException("POST parameter 'exampleID' must be present")
        val mac = ctx.formParam("mac")
            ?: throw ApiMisuseException("POST parameter 'mac' with authentication code must be present")
        ctx.result(StateKeeper.delExample(exampleID, mac))
    }
}

@Suppress("ThrowsCount")
fun createCalculusEndpoints(app: Javalin, calculus: Calculus) {
    val name = calculus.identifier

    // Small documentation at the main calculus endpoint
    app.get("/$name") { ctx ->
        ctx.result(
            """Calculus "$name" loaded.
                |Interact via the /parse /move /close and /validate endpoints""".trimMargin()
        )
    }

    // Parse endpoint takes formula parameter and passes it to calculus implementation
    app.post("/$name/parse") { ctx ->
        val map = ctx.formParamMap()
        val formula = getParam(map, "formula")!!
        val params = getParam(map, "params", true)
        ctx.result(calculus.parseFormula(formula, params))
    }

    app.post("/$name/validate") { ctx ->
        val map = ctx.formParamMap()
        val state = getParam(map, "state")!!
        ctx.result(calculus.validate(state))
    }

    // Move endpoint takes state and move parameter values and passes them to calculus implementation
    app.post("/$name/move") { ctx ->
        val map = ctx.formParamMap()
        val state = getParam(map, "state")!!
        val move = getParam(map, "move")!!
        ctx.result(calculus.applyMove(state, move))
    }

    // Close endpoint takes state parameter value and passes it to calculus implementation
    app.post("/$name/close") { ctx ->
        val state = ctx.formParam("state")
            ?: throw ApiMisuseException("POST parameter 'state' with state representation must be present")
        ctx.result(calculus.checkClose(state))
    }

    if (calculus is ScoredCalculus<*, *, *>) {
        // Get scores for a calculus and a formula
        app.post("/$name/scoreboard") { ctx ->
            val state = ctx.formParam("state")
                ?: throw ApiMisuseException("POST parameter 'state' with state representation must be present")

            // Read the statistics which are currently saved in the database (saved as Json-Strings)
            val oldScores = Scoreboard.getScores(calculus.identifier, calculus.getStartingFormula(state))
            val newScore = calculus.getScore(state, null)

            val scores = Scores(oldScores + listOf(newScore))
            ctx.result(Json { encodeDefaults = true }.encodeToString(scores))
        }

        // Save the score under the given name
        app.post("/$name/submit-score") { ctx ->
            val state = ctx.formParam("state")
                ?: throw ApiMisuseException("POST parameter 'state' with state representation must be present")
            val userName = ctx.formParam("name")
                ?: throw ApiMisuseException("POST parameter 'name' with the user name must be present")

            val rootFormula = calculus.getStartingFormula(state)
            val score = calculus.getScore(state, userName)
            Scoreboard.addScore(calculus.identifier, rootFormula, score)
            ctx.result("OK")
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
    val lst = map[key]

    if (lst == null && !optional)
        throw ApiMisuseException("POST parameter '$key' needs to be present")
    else if (lst == null)
        return null

    return lst[0]
}
