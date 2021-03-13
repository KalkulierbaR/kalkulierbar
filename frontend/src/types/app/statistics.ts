export interface Statistics {
    formula: string;
    entries: Entry[];
    columnNames: string[];
}
export interface SequentCalculusStatistic {
    userName: string;
    nodeAmount: number;
    depth: number;
    width: number;
    usedStupidMode: boolean;
    score: number;
}

export type Entry = SequentCalculusStatistic