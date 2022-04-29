# Network request helper class
class TestRequest

	# Open a connection to the specified host
	def initialize(host = 'localhost', port = 8080, headers = 'default')
		@host = host
		@port = port
		@headers = headers
		@net = Net::HTTP.new(host, port)
		#@net.use_ssl = true
		@net.start()

		logMsg "Targeting endpoint #{@host}:#{@port}, #{@headers} headers"
	end

	# Get the response for a request without performing any validation
	# data is post data to send in form encoding
	# i.e. "formula=a,b;c&something=somethingelse"
	def getPostResponse(path, data, debug = false, silent = false)
		uri = URI("http://#{@host}#{path}")

		req = Net::HTTP::Post.new(uri, initheader = getHeaders)
		
		req.body = data

		logMsg "Sending request to #{path}" if debug

		# Catch and log network issues
		begin
			response = @net.request(req)
		rescue Timeout::Error, Errno::EINVAL, Errno::ECONNRESET, EOFError, Net::HTTPBadResponse, Net::HTTPHeaderSyntaxError, Net::ProtocolError => e
			if !silent
				logMsg "Network Error: #{e.to_s}\n---------------- request body: #{data}"
			end
			return nil
		end

		# Catch and log unexpected status code
		if response.code != "200"
			if !silent
				logMsg("Unexpected HTTP status: #{response.code.to_s} - #{response.msg}\n---------------- response: #{response.body}\n---------------- request body: #{data}")
			end
			return nil
		end

		return response.body
	end

	# Send a request and validate response
	# data is post data to send, form encoded
	# responseValidator is either:
	# - a String which the response body has to match exactly
	# - a RegExp which the response body has to match
	# - a Lambda which, when invoked with the response body as an argument, has to return true
	def post(path, data, responseValidator, expectedStatus = '200', debug = false)
		uri = URI("http://#{@host}#{path}")

		req = Net::HTTP::Post.new(uri, initheader = getHeaders)
		
		req.body = data

		logMsg "Sending request to #{path}" if debug

		# Catch network issues
		begin
			response = @net.request(req)
		rescue Timeout::Error, Errno::EINVAL, Errno::ECONNRESET, EOFError, Net::HTTPBadResponse, Net::HTTPHeaderSyntaxError, Net::ProtocolError => e
			logMsg "Network Error: #{e.to_s}\n---------------- request body: #{data}"
			return false
		end

		# Catch unexpected status
		if response.code != expectedStatus.to_s
			logMsg("Unexpected HTTP status: #{response.code.to_s} - #{response.msg}\n---------------- response: #{response.body}\n---------------- request body: #{data}")
			return false
		end

		# Perform response validation
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

	# Close connection to host
	def finish
		@net.finish
	end

	# Request headers to use (mostly unimportant)
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