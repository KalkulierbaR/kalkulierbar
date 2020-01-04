class FormulaGenerator
	
	def generate
		generateEquiv
	end

	def generateEquiv
		if chance(0.15)
			op = chance(0.5) ? "<->" : "<=>"
			return "#{generateImpl} #{op} #{generateImpl}"
		else
			return generateImpl
		end
	end

	def generateImpl
		if chance(0.15)
			return "#{generateOr} -> #{generateOr}"
		else
			return generateOr
		end
	end

	def generateOr
		if chance(0.3)
			return "#{generateAnd} | #{generateOr}"
		else
			return generateAnd
		end
	end

	def generateAnd
		if chance(0.3)
			return "#{generateNot} & #{generateAnd}"
		else
			return generateNot
		end
	end

	def generateNot
		if chance(0.3)
			return "! #{generateAtom}"
		else
			return generateAtom
		end
	end

	def generateAtom
		if chance(0.3)
			return "( #{generateEquiv} )"
		else
			return generateVar
		end
	end

	def generateVar
		["a", "b", "c", "d", "e", "var", "Variable01", "42var"].sample
	end

	def chance(prob)
		Random::rand() < prob
	end
end