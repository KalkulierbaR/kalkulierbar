export interface LayoutItem<T> {
    x: number;
    y: number;
    data: T;
}

export interface Layout {
    /**
     * The width the svg element should have
     */
    width: number;
    /**
     * The height the svg element should have
     */
    height: number;
}

export interface ArrayLayout<T> extends Layout {
    /**
     * The array of items with their coordinates
     */
    data: LayoutItem<T>[];
}
