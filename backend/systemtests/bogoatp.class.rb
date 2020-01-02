require_relative 'dotgenerator.class'

def bogoATP(trq, formula, connectedness = "UNCONNECTED", regular = false, iterations = 10, verbose = false, getTree: false)
	rqcount = 1
	moves = 0
	state = trq.getPostResponse('/prop-tableaux/parse', "formula=#{formula}&params={\"type\":\"#{connectedness.to_s}\",\"regular\":#{regular.to_s},\"backtracking\":false}")
	parsed = JSON.parse(state)

	# Apply all single-literal clauses to improve closability and control tree fanout
	if connectedness == "UNCONNECTED"
		lid = 0
		parsed['clauseSet']['clauses'].each_with_index { |c,i|
			if c['atoms'].length == 1
				logMsg "Pre-expanding clause #{i.to_s} on node #{lid.to_s}" if verbose
				newstate = trq.getPostResponse('/prop-tableaux/move', "state=#{state}&move={type:\"EXPAND\",id1:#{lid.to_s},id2:#{i.to_s}}", false, true)
				state = newstate == nil ? state : newstate
				lid += newstate == nil ? 0 : 1
				rqcount += 1
				moves += 1
			end
		}
	end

	parsed = JSON.parse(state)

	# BogoATP loop, close everything closeable, then expand a random leaf
	iterations.times() {

		# Try closing all leaves
		parsed['nodes'].each_with_index { |n, i|
			if n['children'].length == 0 && !n['isClosed']
				# Brute-force close with every available ID
				parsed['nodes'].length.times() { |j|
					newstate = trq.getPostResponse('/prop-tableaux/move', "state=#{state}&move={type:\"CLOSE\",id1:#{i.to_s},id2:#{j.to_s}}", false, true)
					rqcount += 1

					if newstate != nil
						logMsg "Closed node #{n['negated'] ? "!" : ""}#{n['spelling']} with node ID #{j.to_s}" if verbose
						moves += 1
						state = newstate
						break
					end
				}
			end
		}

		parsed = JSON.parse(state)

		# Try closing the proof
		logMsg "Trying to close proof" if verbose
		if !trq.post('/prop-tableaux/close', "state=#{state}", /.*"closed":false.*/, 200)
			logMsg "BogoATP Proof closed - #{rqcount.to_s} requests sent / #{moves.to_s} moves applied"
			logMsg generateDOT(parsed['nodes']) if verbose
			return getTree ? parsed['nodes'] : true
		end

		rqcount += 1

		# Try expanding a leaf
		leaves = parsed['nodes'].each_with_index.filter{ |n,i| n['children'].length == 0 && !n['isClosed'] }.map { |x,i| i }.shuffle
		clauses = (0...parsed['clauseSet']['clauses'].length).to_a.shuffle
		breakFlag = false
		leaves.each { |l|
			clauses.each { |c|
				newstate = trq.getPostResponse('/prop-tableaux/move', "state=#{state}&move={type:\"EXPAND\",id1:#{l.to_s},id2:#{c.to_s}}", false, true)
				rqcount += 1
				if newstate != nil
					logMsg "Expanded leaf #{l.to_s} with clause #{c.to_s}" if verbose
					state = newstate
					moves += 1
					breakFlag = true
					break
				end
			}
			break if breakFlag
		}

		parsed = JSON.parse(state)

		# I love not having some tool tell me how long my lines can be
		# Isn't it beautiful?
		#logMsg parsed['nodes'].map { |e| "(#{e['negated'] ? "!" : ""}#{e['spelling']}|#{e['parent'].to_s}|#{e['isClosed'] || e['children'].length > 0 ? "c" : "o"})" }.join(', ') if verbose
	}

	logMsg "BogoATP Proof search unsuccessful - #{rqcount.to_s} requests sent / #{moves.to_s} moves applied"
	logMsg generateDOT(parsed['nodes']) if verbose
	return getTree ? parsed['nodes'] : false
end

def bogoATPapplyRandomMove(state, trq)
	parsed = JSON.parse(state)

	leaves = parsed['nodes'].each_with_index.filter{ |n,i| n['children'].length == 0 && !n['isClosed'] }.map { |x,i| i }.shuffle
	clauses = (0...parsed['clauseSet']['clauses'].length).to_a.shuffle

	# Try closing a leaf
	leaves.each{ |i|
		parsed['nodes'].length.times() { |j|
			newstate = trq.getPostResponse('/prop-tableaux/move', "state=#{state}&move={type:\"CLOSE\",id1:#{i.to_s},id2:#{j.to_s}}", false, true)
			return newstate unless newstate == nil
		}
	}

	# Try expanding a leaf
	leaves.each { |l|
		clauses.each { |c|
			newstate = trq.getPostResponse('/prop-tableaux/move', "state=#{state}&move={type:\"EXPAND\",id1:#{l.to_s},id2:#{c.to_s}}", false, true)
			return newstate unless newstate == nil
		}
	}

	return false
end