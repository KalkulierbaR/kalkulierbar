export interface Rule<L = string>{
    name: L;
    site: string;
}
export interface  RuleSet<L=string>{
    rules: Rule<L>[];
} 
export function getNormalRuleSet(){
    const ruleSet: RuleSet<string> = {rules: [
        {name:"Ax",site:"both"},
        {name:"notLeft",site:"left"},
        {name:"notRight",site:"right"},
        {name:"andLeft",site:"left"},
        {name:"andRight",site:"right"},
        {name:"orLeft",site:"left"},
        {name:"orRight",site:"right"},
        {name:"impLeft",site:"left"},
        {name:"impRight",site:"right"}
    ]}
    return ruleSet;
}

export function getFORuleSet(){
    const ruleSet: RuleSet<string> = {rules: [
        {name:"Ax",site:"both"},
        {name:"notLeft",site:"left"},
        {name:"notRight",site:"right"},
        {name:"andLeft",site:"left"},
        {name:"andRight",site:"right"},
        {name:"orLeft",site:"left"},
        {name:"orRight",site:"right"},
        {name:"impLeft",site:"left"},
        {name:"impRight",site:"right"},
        {name:"allLeft",site:"left"},
        {name:"allRight",site:"right"},
        {name:"exLeft",site:"left"},
        {name:"exRight",site:"right"},
    ]}
    return ruleSet;
}

export type SelectedRule = undefined | [number];