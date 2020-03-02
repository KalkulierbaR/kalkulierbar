export interface KStringMap<V> {
    [key: string]: V;
}

export interface KNumMap<V> {
    [key: number]: V;
}

export interface KPair<F, S> {
    first: F;
    second: S;
}
