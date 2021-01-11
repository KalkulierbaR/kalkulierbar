import { RuleSet, Rule } from "../types/calculus/rules";

export const ruleSetToStringArray = (
    ruleSet: RuleSet<string>,
) => ruleSet.rules.map(ruleToString);

export const ruleToString = (rule: Rule<string>) => {
    return rule.name;
}