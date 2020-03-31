import { CalculusType } from "../calculus";

export interface Example {
    name: string;
    description: string;
    calculus: CalculusType;
    formula: string;
    params: string;
}
