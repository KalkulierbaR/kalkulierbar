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
			length = (2 ** rand(0.0..8.0)).ceil
			charset = "abcdefghijklmnopqrstuvqxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
			(0...length).map{ charset.sample }.join
		else
			["a", "b", "c", "d"].sample
		end
	end

	def genAtom
		rand() < 0.5 ? "!#{genVar()}" : genVar()
	end

	def genDisjunction
		length = (2 ** rand(0.0..4.0)).ceil
		(0...length).map{ genAtom }.join(',')
	end

	def genClauseSet
		length = (2 ** rand(0.0..5.0)).ceil
		(0...length).map{ genDisjunction }.join(';')
	end
end

def fuzzClauseAcceptor(trq, count = 200)
	logMsg "Fuzzing valid formulas"
	success = true
	cg = ClauseGenerator.new

	count.times() {
		success &= trq.post('/clause/parse', "formula=#{cg.genClauseSet}", /^\{\"clauses\"\:\[.*\]\}$/, 200)
	}

	if success
		logSuccess "Test successful - fuzzed #{count.to_s} requests"
	else
		logError "Test failed!"
	end
end

def testInvalidParam(trq)
	cg = ClauseGenerator.new
	logMsg "Testing invalid formulas"
	formulas = ["", ",", "a,", "a,b;", "a,b;c,", "a,b;c,;e", ",b;c,;e", ";c,;e"]
	success = true

	success &= trq.post('/clause/parse', "formul=#{cg.genClauseSet}", /parameter.*needs to be present/i, 400)

	formulas.each { |f|
		success &= trq.post('/clause/parse', "formula=#{f}", /invalid input formula format/i, 400)
	}
	
	if success
		logSuccess "Test successful - sent #{(formulas.length + 1).to_s} requests"
	else
		logError "Test failed!"
	end
end

def testBarelyValidParam(trq)
	logMsg "Testing valid edge-case formulas"
	formulas = ["i", "!i", "a;b"]

	expected = [
		"{\"clauses\":[{\"atoms\":[{\"lit\":\"i\",\"negated\":false}]}]}",
		"{\"clauses\":[{\"atoms\":[{\"lit\":\"i\",\"negated\":true}]}]}",
		->(res){ r = JSON.parse(res)['clauses']; valid = r.length == 2; a0 = r[0]['atoms']; a1 = r[1]['atoms']; valid &= a0.length == 1 and a1.length == 1; valid }
	]

	success = true

	formulas.each.with_index { |f, i|
		success &= trq.post('/clause/parse', "formula=#{f}", expected[i])
	}
	
	if success
		logSuccess "Test successful - sent #{formulas.length.to_s} requests"
	else
		logError "Test failed!"
	end
end
