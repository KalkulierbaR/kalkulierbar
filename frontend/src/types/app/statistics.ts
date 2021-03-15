import { StatisticEntry } from "../calculus";

export interface Statistics {
    formula: string;
    entries: StatisticEntry[];
    columnNames: string[];
}
