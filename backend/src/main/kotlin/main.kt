package main.kotlin

import io.javalin.Javalin
import kalkulierbar.*

val endpoints: Set<Calculus> = setOf<Calculus>(ClauseAcceptor())

fun main(args: Array<String>) {

	val port = 7000
    val app = Javalin.create().start(port)

    app.get("/") { ctx -> ctx.result("KalkulierbaR API Server\n\nAvailable calculus endpoints:\n${endpoints.map{it.identifier}.joinToString("\n")}") }
	
	for(endpoint in endpoints) {
		val name = endpoint.identifier
		
		app.get("/$name") {
			ctx -> ctx.result("Calculus \"$name\" loaded.\nInteract via the /parse /move and /close endpoints\n\nCalculus Documentation:\n\n${endpoint.getDocumentation()}")
		}

		app.post("/$name/parse") { ctx ->
			val formula = ctx.formParam("formula")
			if(formula == null)
				throw ApiMisuseException("POST parameter 'formula' needs to be present")
			ctx.result(endpoint.parseFormula(formula))
		}
		
		app.post("/$name/move") { ctx ->
			val state = ctx.formParam("state")
			val move = ctx.formParam("move")
			if(state == null)
				throw ApiMisuseException("POST parameter 'state' with state representation needs to be present")
			if(move == null)
				throw ApiMisuseException("POST parameter 'move' with move representation needs to be present")
			ctx.result(endpoint.applyMove(state, move))
		}
		
		app.post("/$name/close") { ctx ->
			val state = ctx.formParam("state")
			if(state == null)
				throw ApiMisuseException("POST parameter 'state' with state representation must be present")
			ctx.result(if(endpoint.checkClose(state)) "Proof closed" else "Incomplete Proof")
		}
	}
}

class ApiMisuseException(msg: String): Exception(msg)