export interface Rule<L = string>{
    name: L;
    site: string;
}

export interface RuleSet<L = string>{
    rules: Rule<L>[] = [];

    rules.push({name:"Not Left" , site:"left"});
    rules.push({name:"Not Right" , site:"right"});
    }
}