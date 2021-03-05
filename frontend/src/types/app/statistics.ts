export interface Entry {
    userName: string,
    score: number,
    nodeAmount: number | null,
}

export interface Statistics{
    table: Entry[],
}