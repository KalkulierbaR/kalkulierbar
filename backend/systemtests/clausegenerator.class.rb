# Generate random ClauseSet formulas
class ClauseGenerator

	# Generate a mix of high-entropy and low-entropy variables
	def genVar
		if rand < 0.3
			length = (2 ** rand(0.0..4.0)).ceil
			charset = "abcdefghijklmnopqrstuvqxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
			(0...length).map{ charset.sample }.join
		else
			["a", "b", "c", "d", "e", "f"].sample
		end
	end

	# Negate some of the variables
	def genAtom(clause)
		res = rand() < 0.5 ? "!#{genVar()}" : genVar()
		clause.push(res)
		return res
	end

	# Pack a bunch of them together in a clause
	def genDisjunction(set)
		clause = []
		length = (2 ** rand(-1.0..4.0)).ceil
		res = (0...length).map{ genAtom(clause) }.join(',')
		set.push(clause)
		return res
	end

	# Pack some clauses together
	# set is an array to hold a more machine-readable representation
	# of the clause set to check backend output again
	# Like this: [["a", "!b"], ["c"]]
	# return value is the regular formula string
	def genClauseSet(set = [])
		length = (2 ** rand(0.0..5.0)).ceil
		(0...length).map{ genDisjunction(set) }.join(';')
	end
end