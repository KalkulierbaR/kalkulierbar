import { CalculusType, StatisticEntry } from "../calculus";
export interface Statistics {
    formula: string;
    entries: StatisticEntry[];
    columnNames: string[];
}
// export interface SequentCalculusStatistic {
//     userName: string;
//     nodeAmount: number;
//     depth: number;
//     width: number;
//     usedStupidMode: boolean;
//     score: number;
// }

// export type Entry = SequentCalculusStatistic