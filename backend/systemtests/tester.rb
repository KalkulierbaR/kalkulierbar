require 'net/http'
require 'json'
require 'date'

require_relative 'clausegenerator.class'
require_relative 'testrequest.class'
require_relative 'bogoatp.class'

def logMsg(msg, c = "0")
	STDERR.puts "[#{Time.now.strftime('%d/%m %H:%M:%S')}] \e[#{c}m#{msg}\e[0m"
end

def logSuccess(msg)
	logMsg(msg, "32") # Green font color
end

def logError(msg)
	logMsg(msg, "41") # Red font color
end

=begin
	How to write a system test scenario

	1. Create a new function taking a TestRequest instance as an argument
	2. Log some output (What are you testing right now?) using logMsg
	3. Generate the test data you need (use ClauseGenerator for random clause sets)
	4. Send & validate some requests using TestRequest.post
	4.1 For simple error tests, setting the expected status code should be enough
	    You might want to check the error message, too.
	4.2 If you know exactly what the response should be, pass the response as a string
	    to post() in the requestValidator parameter
	4.3 If you only care about a part of the response, try passing a regular expression
	    that matches what you want
	4.4 For anything more complex, pass a Lambda function taking the response body and
	    returning a boolean
	5. Log success or failure using logSuccess and logError - give some stats, too, if
	   you like
	6. Call your function with the trq object and appropriate parameters at the bottom
	   of this file
	7. Done!
=end

def fuzzClauseParsing(trq, count = 100)
	logMsg "Fuzzing valid formulas"
	success = true
	cg = ClauseGenerator.new

	count.times() {
		clauses = []
		string = cg.genClauseSet(clauses)
		success &= trq.post('/prop-tableaux/parse', "formula=#{string}", ->(res){ checkEquiv(JSON.parse(res)['clauseSet']['clauses'], clauses)}, 200)
	}

	if success
		logSuccess "Test successful - sent #{count.to_s} requests"
	else
		logError "Test failed!"
	end
end

# Checks if a clauseSet received is equivalent to a clauseSet obtained from ClauseGenerator
def checkEquiv(got, expect)
	return false unless got.length === expect.length
	expect.each_with_index { |eClause, i|
		return false unless eClause.length === got[i]['atoms'].length
		gClause = got[i]['atoms'].map{ |a| (a['negated'] ? "!" : "") + a['lit']}
		
		# Elements in got or expected, but not the intersection of got and expected
		differring = (eClause | gClause) - (eClause & gClause)
		return false if differring.length > 0
	}
	true
end

def testInvalidParam(trq)
	cg = ClauseGenerator.new
	logMsg "Testing invalid formulas"
	formulas = ["", ",", "a,", "a,b;", "a,b;c,", "a,b;c,;e", ",b;c,;e", ";c,;e"]
	success = true

	success &= trq.post('/prop-tableaux/parse', "formul=#{cg.genClauseSet()}", /parameter.*needs to be present/i, 400)

	formulas.each { |f|
		success &= trq.post('/prop-tableaux/parse', "formula=#{f}", /invalid input formula format/i, 400)
	}
	
	if success
		logSuccess "Test successful - sent #{(formulas.length + 1).to_s} requests"
	else
		logError "Test failed!"
	end
end

def testRootNodeCreation(trq, count = 20)
	logMsg "Testing correct root node creation"

	success = true
	cg = ClauseGenerator.new

	validate = ->(res) {
		r = JSON.parse(res)
		valid = r['nodes'].length === 1
		n = r['nodes'][0]
		valid &= n['spelling'] === 'true'
		valid &= !n['isClosed']
		valid &= !n['negated']
		valid &= n['parent'] === nil
		valid &= n['children'].length === 0
		valid
	}

	count.times() {
		string = cg.genClauseSet()
		success &= trq.post('/prop-tableaux/parse', "formula=#{string}", validate, 200)
	}
	
	if success
		logSuccess "Test successful - sent #{count.to_s} requests"
	else
		logError "Test failed!"
	end
end

def testStateModification(trq, count = 50)
	logMsg "Testing tamper protection"
	cg = ClauseGenerator.new
	iterations = count / 10
	success = true

	iterations.times() {
		validState = trq.getPostResponse('/prop-tableaux/parse', "formula=#{cg.genClauseSet}")
		parsed = JSON.parse(validState)

		# Test unmodified state
		success &= trq.post('/prop-tableaux/close', "state=#{JSON.dump(parsed)}", "false", 200)

		10.times() {
			modified = JSON.parse(validState)
			modType = rand(1..2)
			case modType
			when 1
				tweakNode(modified)
			when 2
				tweakClause(modified)
			end

			success &= trq.post('/prop-tableaux/close', "state=#{JSON.dump(modified)}", /.*Invalid tamper protection seal.*/, 400)
		}
	}

	if success
		logSuccess "Test successful - sent #{(iterations * 11).to_s} requests"
	else
		logError "Test failed!"
	end
end

# Internal function, irrelevant
def tweakNode(state)
	i = rand(0...state['nodes'].length)
	case rand(1..4)
	when 1
		state['nodes'][i]['negated'] = !state['nodes'][i]['negated']
	when 2
		state['nodes'][i]['isClosed'] = !state['nodes'][i]['isClosed']
	when 3
		state['nodes'][i]['parent'] = (state['nodes'][i]['parent'] == nil ? rand(1..500) : state['nodes'][i]['parent'] + rand(1..500))
	when 4
		state['nodes'][i]['children'].push(rand(0..500))
	end
end

# Internal function, irrelevant
def tweakClause(state)
	i = rand(0...state['clauseSet']['clauses'].length)
	j = rand(0...state['clauseSet']['clauses'][i]['atoms'].length)
	state['clauseSet']['clauses'][i]['atoms'][j]['negated'] = !state['clauseSet']['clauses'][i]['atoms'][j]['negated']
end

def tryCloseUncloseable(trq, iterations = 10, verbose = false)
	logMsg "Trying to close unclosable proof"
	
	if bogoATP(trq, "b,c;!a,b;!c;!b,!c", "UNCONNECTED", false, iterations, verbose)
		logError "Test failed"
	else
		logSuccess "Test successful"
	end
end

def tryCloseTrivial(trq, iterations = 5, verbose = false)
	logMsg "Trying to close a trivial proof"
	
	if bogoATP(trq, "a,b;!a;!b", "UNCONNECTED", false, iterations, verbose)
		logSuccess "Test successful"
	else
		logError "Test failed"
	end
end

def tryCloseCloseable(trq, iterations = 15, verbose = false)
	logMsg "Trying to close a proof"
	
	if bogoATP(trq, "a,b,c;a,!b;!a;!c", "UNCONNECTED", false, iterations, verbose)
		logSuccess "Test successful"
	else
		logError "Test failed"
	end
end

def tryCloseConnected(trq, iterations = 15, verbose = false)
	logMsg "Trying to close a strongly connected proof"
	
	if bogoATP(trq, "a,b,c,d,e,f;a,!b;!a;!c;d,!e;!d;!f", "STRONGLYCONNECTED", false, iterations, verbose)
		logSuccess "Test successful"
	else
		logError "Test failed"
	end
end

def tryCloseRegular(trq, iterations = 15, verbose = false)
	logMsg "Trying to close a regular proof"
	
	if bogoATP(trq, "a,b,c,d,e,f;a,!b;!a;!c;d,!e;!d;!f", "UNCONNECTED", true, iterations, verbose)
		logSuccess "Test successful"
	else
		logError "Test failed"
	end
end

def testRegularityRestriction(trq, iterations = 10, verbose = false)
	logMsg "Testing regularity restriction with random clause sets"
	cg = ClauseGenerator.new
	success = true

	iterations.times() {
		formula = cg.genClauseSet
		tree = bogoATP(trq, formula, "UNCONNECTED", true, 5, verbose, getTree: true)
		if !checkRegularity(tree)
			success = false
			break
		end
	}

	if success
		logSuccess "Test successful"
	else
		logError "Test failed"
	end
end

def checkRegularity(tree)
	leaves = tree.filter{ |node| node['children'] == nil or node['children'].length == 0 }

	leaves.each{ |leaf|
		node = leaf
		spellings = []
		while node['parent'] != nil and node['parent'].to_i != 0
			spellings.push("#{node['negated'] ? "!" : ""}#{node['spelling']}")
			node = tree[node['parent'].to_i]
		end
		return false if spellings.length > spellings.uniq.length
	}

	return true
end

trq = TestRequest.new

logMsg("Testing PropositionalTableaux")
testInvalidParam(trq)
fuzzClauseParsing(trq)
testRootNodeCreation(trq)
testStateModification(trq)
tryCloseTrivial(trq)
tryCloseCloseable(trq)
tryCloseConnected(trq)
tryCloseRegular(trq)
tryCloseUncloseable(trq, 10)
testRegularityRestriction(trq, 5)