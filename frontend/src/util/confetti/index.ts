import { createParticle, Particle, resetParticle } from "./particle";
import { ConfettiOptions } from "./types";

/* tslint:disable:no-bitwise */

let supportsAnimationFrame = false;

if (typeof window !== "undefined") {
    supportsAnimationFrame =
        (window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            (window as any).mozRequestAnimationFrame ||
            (window as any).oRequestAnimationFrame ||
            (window as any).msRequestAnimationFrame) !== undefined;
}

/**
 * Creates a confetti effect
 */
export default class Confetti {
    protected canvas: HTMLCanvasElement;
    protected context: CanvasRenderingContext2D;
    protected maxCount: number; // set max confetti count
    protected speed: number; // set the particle animation speed
    protected frameInterval: number; // the confetti animation frame interval in milliseconds
    protected alpha: number; // the alpha opacity of the confetti (between 0 and 1, where 1 is opaque and 0 is invisible)
    protected particles: Particle[] = [];

    private pause: boolean = false;
    private lastFrameTime = Date.now();
    private waveAngle = 0;
    private streamingConfetti = false;
    // private animationTimer: number | null = null;

    /**
     *
     * @param {ConfettiOptions} param0 options
     */
    constructor({
        canvas,
        maxCount = 150,
        speed = 2,
        frameInterval = 15,
        alpha = 1.0,
        paddingTop = 56,
    }: ConfettiOptions = {}) {
        if (canvas === undefined) {
            canvas = document.createElement("canvas") as HTMLCanvasElement;
            canvas.setAttribute("id", "confetti-canvas");
            canvas.setAttribute(
                "style",
                `display:block;z-index:999999;pointer-events:none;position:fixed;top:${paddingTop}px`,
            );
            document.body.prepend(canvas);
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight - paddingTop;
            window.addEventListener(
                "resize",
                () => {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight - paddingTop;
                },
                true,
            );
            this.context = canvas.getContext("2d")!;
        } else {
            this.context = canvas.getContext("2d")!;
        }
        this.canvas = canvas;
        this.maxCount = maxCount;
        // Adjust speed to make it equally fast on all displays,
        // even 4k
        this.speed = (speed * canvas.height) / 1000;
        this.frameInterval = frameInterval;
        this.alpha = alpha;
    }

    /**
     *
     * @param {number} timeout - timeout
     * @param {number} min - min of particles
     * @param {number} max - max of particles
     * @returns {void}
     */
    public start(timeout?: number, min?: number, max?: number) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        window.requestAnimationFrame = (() => {
            return (
                window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                (window as any).mozRequestAnimationFrame ||
                (window as any).oRequestAnimationFrame ||
                (window as any).msRequestAnimationFrame ||
                ((callback) => {
                    return window.setTimeout(callback, this.frameInterval);
                })
            );
        })();
        let count = this.maxCount;
        if (min) {
            if (max) {
                if (min === max) {
                    count = this.particles.length + max;
                } else {
                    if (min > max) {
                        const temp = min;
                        min = max;
                        max = temp;
                    }
                    count =
                        this.particles.length +
                        ((Math.random() * (max - min) + min) | 0);
                }
            } else {
                count = this.particles.length + min;
            }
        } else if (max) {
            count = this.particles.length + max;
        }
        while (this.particles.length < count) {
            this.particles.push(createParticle(width, height, this.alpha));
        }
        this.streamingConfetti = true;
        this.pause = false;
        this.runAnimation();
        if (timeout) {
            window.setTimeout(this.stop, timeout);
        }
    }

    public toggleConfettiPause() {
        if (this.pause) {
            this.resume();
        } else {
            this.pauseConfetti();
        }
    }

    public isPaused() {
        return this.pause;
    }

    public pauseConfetti() {
        this.pause = true;
    }

    public resume() {
        this.pause = false;
        this.runAnimation();
    }

    public runAnimation() {
        if (this.isPaused()) {
            return;
        }
        if (this.particles.length === 0) {
            this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            // this.animationTimer = null;
            return;
        }
        const now = Date.now();
        const delta = now - this.lastFrameTime;
        if (!supportsAnimationFrame || delta > this.frameInterval) {
            this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            this.updateParticles();
            this.drawParticles(this.context);
            this.lastFrameTime = now - (delta % this.frameInterval);
        }
        /* this.animationTimer =  */ requestAnimationFrame(
            this.runAnimation.bind(this),
        );
    }

    public stop() {
        this.streamingConfetti = false;
    }

    public removeConfetti() {
        stop();
        this.pause = false;
        this.particles = [];
    }

    public toggleConfetti() {
        if (this.streamingConfetti) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Updates particle positions
     * @returns {void}
     */
    public updateParticles() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        let particle;
        this.waveAngle += 0.01;
        for (let i = 0; i < this.particles.length; i++) {
            particle = this.particles[i];
            if (!this.streamingConfetti && particle.y < -15) {
                particle.y = height + 100;
            } else {
                particle.tiltAngle += particle.tiltAngleIncrement;
                particle.x += Math.sin(this.waveAngle) - 0.5;
                particle.y +=
                    (Math.cos(this.waveAngle) +
                        particle.diameter +
                        this.speed) *
                    0.5;
                particle.tilt = Math.sin(particle.tiltAngle) * 15;
            }
            if (
                particle.x <= width + 20 &&
                particle.x >= -20 &&
                particle.y <= height
            ) {
                continue;
            }
            if (
                this.streamingConfetti &&
                this.particles.length <= this.maxCount
            ) {
                resetParticle(particle, width, height, this.alpha);
            } else {
                this.particles.splice(i, 1);
                i--;
            }
        }
    }

    /**
     * Renders particles
     * @param {CanvasRenderingContext2D} context - context for render
     * @returns {void}
     */
    public drawParticles(context: CanvasRenderingContext2D) {
        let x;
        let x2;
        let y2;
        for (const particle of this.particles) {
            context.beginPath();
            context.lineWidth = particle.diameter;
            x2 = particle.x + particle.tilt;
            x = x2 + particle.diameter / 2;
            y2 = particle.y + particle.tilt + particle.diameter / 2;
            context.strokeStyle = particle.color;
            context.moveTo(x, particle.y);
            context.lineTo(x2, y2);
            context.stroke();
        }
    }
}
