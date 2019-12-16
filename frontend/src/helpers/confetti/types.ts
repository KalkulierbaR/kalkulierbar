export interface ConfettiOptions {
    canvas?: HTMLCanvasElement;
    maxCount?: number; // set max confetti count
    speed?: number; // set the particle animation speed
    frameInterval?: number; // the confetti animation frame interval in milliseconds
    alpha?: number; // the alpha opacity of the confetti (between 0 and 1, where 1 is opaque and 0 is invisible)
}
