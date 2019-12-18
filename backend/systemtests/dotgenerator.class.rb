def generateDOT(tree)
	nodes = tree.each_with_index.map { |e, i| "#{i.to_s} [label=\"#{e['negated'] ? "!" : ""}#{e['spelling']}\"];" }
	edges = tree.each_with_index.filter{ |e, i| e['parent'] != nil }.map { |e, i| "#{i.to_s} -- #{e['parent']};"}
	closing = tree.each_with_index.filter{ |e, i| e['closeRef'] != nil }.map{ |e, i| "#{i.to_s} -- #{e['closeRef']} [weight=0,color=\"blue\"];"}

	n = nodes.join("")
	e = edges.join("")
	c = closing.join("")

	return "graph tableaux {root=0;rankdir=\"BT\";#{n}#{e}#{c}}"
end