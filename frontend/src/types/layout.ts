export interface LayoutItem<T> {
    x: number;
    y: number;
    data: T;
}

export interface Layout<T> {
    /**
     * The width the svg element should have
     */
    width: number;
    /**
     * The height the svg element should have
     */
    height: number;
    /**
     * The array of items with their coordinates
     */
    data: Array<LayoutItem<T>>;
}
