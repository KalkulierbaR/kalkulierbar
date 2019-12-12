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
    "rgba(30,144,255,",
    "rgba(107,142,35,",
    "rgba(255,215,0,",
    "rgba(255,192,203,",
    "rgba(106,90,205,",
    "rgba(173,216,230,",
    "rgba(238,130,238,",
    "rgba(152,251,152,",
    "rgba(70,130,180,",
    "rgba(244,164,96,",
    "rgba(210,105,30,",
    "rgba(220,20,60,"
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
