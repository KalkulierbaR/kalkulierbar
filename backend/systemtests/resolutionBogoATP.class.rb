def resolutionBogoATP(trq, formula, iterations = 10, verbose = false)
	rqcount = 1
	moves = 0
	state = trq.getPostResponse('/prop-resolution/parse', "formula=#{formula}")
	parsed = JSON.parse(state)

	# BogoATP loop, close everything closeable, then expand a random leaf
	iterations.times() {

		# Try closing the proof
		logMsg "Trying to close proof" if verbose
		if !trq.post('/prop-resolution/close', "state=#{state}", /.*false.*/, 200)
			logMsg "BogoATP Proof closed - #{rqcount.to_s} requests sent / #{moves.to_s} moves applied"
			return true
		end

		rqcount += 1

		# Try resolving something
		clauses = (0...parsed['clauseSet']['clauses'].length).to_a.shuffle
		breakFlag = false
		clauses.each { |c1|
			clauses.shuffle.each { |c2|
				next if c1 == c2

				possible = parsed['clauseSet']['clauses'][c1]['atoms'].map { |e| e['lit'] } & parsed['clauseSet']['clauses'][c2]['atoms'].map{ |e| e['lit']}

				next if possible.length == 0

				possible.each { |sp|
					newstate = trq.getPostResponse('/prop-resolution/move', "state=#{state}&move={spelling:\"#{sp.to_s}\",c1:#{c1.to_s},c2:#{c2.to_s}}", false, true)
					rqcount += 1
					if newstate != nil
						logMsg "Resolved clause #{c1.to_s} with clause #{c2.to_s} with literal #{sp}" if verbose
						state = newstate
						moves += 1
						breakFlag = true
						break
					end
				}
				break if breakFlag
			}
			break if breakFlag
		}

		parsed = JSON.parse(state)
	}

	logMsg "BogoATP Proof search unsuccessful - #{rqcount.to_s} requests sent / #{moves.to_s} moves applied"
	return false
end