require 'net/http'
require 'json'
require 'date'

def logMsg(msg, c = "0")
	STDERR.puts "[#{Time.now.strftime('%d/%m %H:%M:%S')}] \e[#{c}m#{msg}\e[0m"
end

def logSuccess(msg)
	logMsg(msg, "32")
end

def logError(msg)
	logMsg(msg, "41")
end

class TestRequest

	def initialize(host = 'localhost', port = 7000, headers = 'default')
		@host = host
		@port = port
		@headers = headers
		@net = Net::HTTP.new(host, port)
		#@net.use_ssl = true
		@net.start()

		logMsg "Targeting endpoint #{@host}:#{@port}, #{@headers} headers"
	end

	def getPostResponse(path, data, debug = false)
		uri = URI("http://#{@host}#{path}")

		req = Net::HTTP::Post.new(uri, initheader = getHeaders)
		
		req.body = data

		logMsg "Sending request to #{path}" if debug

		begin
			response = @net.request(req)
		rescue Timeout::Error, Errno::EINVAL, Errno::ECONNRESET, EOFError, Net::HTTPBadResponse, Net::HTTPHeaderSyntaxError, Net::ProtocolError => e
			logMsg "Network Error: #{e.to_s}\n---------------- request body: #{data}"
			return nil
		end

		if response.code != "200"
			logMsg("Unexpected HTTP status: #{response.code.to_s} - #{response.msg}\n---------------- response: #{response.body}\n---------------- request body: #{data}")
			return nil
		end

		return response.body
	end

	def post(path, data, responseValidator, expectedStatus = '200', debug = false)
		uri = URI("http://#{@host}#{path}")

		req = Net::HTTP::Post.new(uri, initheader = getHeaders)
		
		req.body = data

		logMsg "Sending request to #{path}" if debug

		begin
			response = @net.request(req)
		rescue Timeout::Error, Errno::EINVAL, Errno::ECONNRESET, EOFError, Net::HTTPBadResponse, Net::HTTPHeaderSyntaxError, Net::ProtocolError => e
			logMsg "Network Error: #{e.to_s}\n---------------- request body: #{data}"
			return false
		end

		if response.code != expectedStatus.to_s
			logMsg("Unexpected HTTP status: #{response.code.to_s} - #{response.msg}\n---------------- response: #{response.body}\n---------------- request body: #{data}")
			return false
		end


		if (responseValidator.is_a? String and response.body == responseValidator) or (responseValidator.is_a? Regexp and response.body =~ responseValidator)
			logMsg "Request OK" if debug
			return true
		elsif responseValidator.is_a? Proc and responseValidator.call(response.body)
			logMsg "Request OK" if debug
			return true
		else
			logMsg("Response does not match expected format\n---------------- response: #{response.body}\n---------------- request body: #{data}")
			return false
		end

	end

	def finish
		@net.finish
	end

	def getHeaders
		if @headers == 'default'
			{
				'Host' => @host,
				'Content-Type' => 'application/x-www-form-urlencoded',
				'Accept' => 'text/html,application/json;q=0.9,*/*;q=0.8',
				'Referer' => "http://#{@host}/",
				'Connection' => 'keep-alive',
				'Cache-Control' => 'max-age=0, no-cache',
				'Pragma' => 'no-cache',
				'Accept-Language' => 'en-US,en;q=0.5',
				'User-Agent' => 'Mozilla/5.0 (Windows NT 6.1; rv:60.0) Gecko/20100101 Firefox/60.0'
			}
		else
			{}
		end
	end
end

class ClauseGenerator
	def genVar
		if rand < 0.5
			length = (2 ** rand(0.0..4.0)).ceil
			charset = "abcdefghijklmnopqrstuvqxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
			(0...length).map{ charset.sample }.join
		else
			["a", "b", "c", "d"].sample
		end
	end

	def genAtom(clause)
		res = rand() < 0.5 ? "!#{genVar()}" : genVar()
		clause.push(res)
		return res
	end

	def genDisjunction(set)
		clause = []
		length = (2 ** rand(0.0..4.0)).ceil
		res = (0...length).map{ genAtom(clause) }.join(',')
		set.push(clause)
		return res
	end

	def genClauseSet(set = [])
		length = (2 ** rand(0.0..5.0)).ceil
		(0...length).map{ genDisjunction(set) }.join(';')
	end
end

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
		valid &= n['parent'] === 0
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
		success &= trq.post('/prop-tableaux/close', "state=#{JSON.dump(parsed)}", /Incomplete Proof/, 200)

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

def tweakNode(state)
	i = rand(0...state['nodes'].length)
	case rand(1..4)
	when 1
		state['nodes'][i]['negated'] = !state['nodes'][i]['negated']
	when 2
		state['nodes'][i]['isClosed'] = !state['nodes'][i]['isClosed']
	when 3
		state['nodes'][i]['parent'] += rand(1..500)
	when 4
		state['nodes'][i]['children'].push(rand(0..500))
	end
end

def tweakClause(state)
	i = rand(0...state['clauseSet']['clauses'].length)
	j = rand(0...state['clauseSet']['clauses'][i]['atoms'].length)
	state['clauseSet']['clauses'][i]['atoms'][j]['negated'] = !state['clauseSet']['clauses'][i]['atoms'][j]['negated']
end


trq = TestRequest.new

logMsg("Testing PropositionalTableaux")
testInvalidParam(trq)
fuzzClauseParsing(trq)
testRootNodeCreation(trq)
testStateModification(trq)