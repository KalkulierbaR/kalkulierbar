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
        {name:"notRight",site:"right"},
        {name:"notLeft",site:"left"},
        {name:"andRight",site:"right"},
        {name:"andLeft",site:"left"},
        {name:"orRight",site:"right"},
        {name:"orLeft",site:"left"},
        {name:"impLeft",site:"left"},
        {name:"impRight",site:"right"}
    ]}
    return ruleSet;
}

export type SelectedRule = undefined | [number];