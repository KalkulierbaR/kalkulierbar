import { CalculusType } from "../calculus";
import { Example } from "./example";

export interface Config {
    disabled: CalculusType[];
    examples: Example[];
}
