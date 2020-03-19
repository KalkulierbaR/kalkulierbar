import { Extent } from "../../types/ui";

/**
 * Get the size (viewBox) of an element
 * @param {HTMLElement|SVGSVGElement} e - The element to analyze
 * @returns {void} - void
 */
export function extent(e: HTMLElement | SVGSVGElement): Extent {
    if (e instanceof SVGElement) {
        const svg = e.ownerSVGElement || ((e as unknown) as SVGSVGElement);
        if (svg.hasAttribute("viewBox")) {
            const base = svg.viewBox.baseVal;
            return [
                [base.x, base.y],
                [base.x + base.width, base.y + base.height]
            ];
        }
        return [
            [0, 0],
            [svg.width.baseVal.value, svg.height.baseVal.value]
        ];
    }
    return [
        [0, 0],
        [e.clientWidth, e.clientHeight]
    ];
}
