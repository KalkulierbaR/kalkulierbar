/* tslint:disable:no-bitwise */

export interface Particle {
    color: string;
    color2: string;
    x: number;
    y: number;
    diameter: number;
    tilt: number;
    tiltAngle: number;
    tiltAngleIncrement: number;
}

const colors = [
    "rgba(103, 58, 183,",
    "rgba(202, 46, 159,",
    "rgba(255, 76, 124",
    "rgba(255, 133, 93,",
    "rgba(255, 192, 82,",
    "rgba(249, 248, 113,"
];

export function resetParticle(
    particle: Particle,
    width: number,
    height: number,
    alpha: number
) {
    particle.color =
        colors[(Math.random() * colors.length) | 0] + (alpha + ")");
    particle.color2 =
        colors[(Math.random() * colors.length) | 0] + (alpha + ")");
    particle.x = Math.random() * width;
    particle.y = Math.random() * height - height;
    particle.diameter = Math.random() * 10 + 5;
    particle.tilt = Math.random() * 10 - 10;
    particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
    particle.tiltAngle = Math.random() * Math.PI;
    return particle;
}

export function createParticle(
    width: number,
    height: number,
    alpha: number
): Particle {
    return resetParticle({} as Particle, width, height, alpha);
}
