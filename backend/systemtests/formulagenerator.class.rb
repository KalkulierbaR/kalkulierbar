class FormulaGenerator

	def initialize(fo = false)
		@isFO = fo
		@definedVars = []
	end

	def generate
		generateEquiv
	end

	def generateEquiv
		if chance(0.1)
			op = chance(0.5) ? "<->" : "<=>"
			return "#{generateImpl} #{op} #{generateImpl}"
		else
			return generateImpl
		end
	end

	def generateImpl
		if chance(0.1)
			return "#{generateOr} -> #{generateOr}"
		else
			return generateOr
		end
	end

	def generateOr
		if chance(0.2)
			return "#{generateAnd} | #{generateOr}"
		else
			return generateAnd
		end
	end

	def generateAnd
		if chance(0.2)
			return "#{generateNot} & #{generateAnd}"
		else
			return generateNot
		end
	end

	def generateNot
		if chance(0.3)
			return "! #{generateQuantifier}"
		else
			return generateQuantifier
		end
	end

	def generateQuantifier
		return generateAtom unless @isFO and chance(0.2)

		vname = ["X", "Y", "Z", "W", "Qvar", "QUANT", "Person", "Thing", "T3", "X1"].sample
		@definedVars.push(vname)

		if chance(0.5)
			res = "\\ex #{vname}: #{generateQuantifier}"
		else
			res = "\\all #{vname}: #{generateQuantifier}"
		end

		@definedVars.pop()

		return res
	end

	def generateAtom
		if chance(0.2)
			return "( #{generateEquiv} )"
		else
			return @isFO ? generateRelation : generateVar
		end
	end

	def generateVar
		["a", "b", "c", "d", "e", "var", "Variable01", "42var"].sample
	end

	def generateRelation
		name = ["R", "Q", "P", "S", "Relation", "R1", "REL"].sample
		joinString = [",", ", ", " , "].sample
		arity = rand(1..3)
		args = (1..arity).map { |e| generateFunction }
		"#{name}(#{args.join(joinString)})"
	end

	def generateFunction
		return generateQuantifiedVariable if chance(0.8)

		name = ["f", "g", "h", "fun", "functionCall", "1", "42"].sample
		joinString = [",", ", ", " , "].sample
		arity = rand(1..3)
		args = (1..arity).map { |e| generateFunction }
		"#{name}(#{args.join(joinString)})"
	end

	def generateQuantifiedVariable
		return generateConstant if @definedVars.length == 0

		chance(0.5) ? generateConstant : @definedVars.sample
	end 

	def generateConstant
		["a", "b", "c", "d", "e", "var", "v01", "1", "42", "vARIABLE"].sample
	end

	def chance(prob)
		Random::rand() < prob
	end
end