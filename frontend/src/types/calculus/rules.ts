export interface Rule<L = string>{
    name: L;
    site: string;
}
export interface  RuleSet<L=String>{
    rules: Rule<L>[];
} 
export function getRuleSet(){
    const ruleSet: RuleSet<string> = {rules: [
        {name:"NotRight",site:"right"},
        {name:"NotLeft",site:"left"},
    ]}
    return ruleSet;
}

export type SelectedRule = undefined | [number];