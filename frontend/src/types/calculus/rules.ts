export interface Rule<L = string>{
    name: L;
    site: string;
}
export interface  RuleSet<L=string>{
    rules: Rule<L>[];
} 
export function getRuleSet(){
    const ruleSet: RuleSet<string> = {rules: [
        {name:"Ax",site:"both"},
        {name:"NotRight",site:"right"},
        {name:"NotLeft",site:"left"},
        {name:"AndRight",site:"right"},
        {name:"AndLeft",site:"left"},
        {name:"OrRight",site:"right"},
        {name:"OrLeft",site:"left"}
    ]}
    return ruleSet;
}

export type SelectedRule = undefined | [number];