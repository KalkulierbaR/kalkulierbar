import { Rule, RuleSet } from "../types/calculus/rules";

export const ruleSetToStringArray = (ruleSet: RuleSet) =>
    ruleSet.rules.map(ruleToString);

export const ruleToString = (rule: Rule) => {
    return rule.name;
};
