export enum TutorialMode {
    None = 0,
    HighlightFAB = 1,
    HighlightCheck = 1 << 1,

    HighlightAll = HighlightCheck | HighlightFAB,
}
