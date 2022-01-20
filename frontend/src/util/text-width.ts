const svg = document.getElementById("kbar-svg") as unknown as SVGSVGElement;
const svgNS = svg.namespaceURI;

/**
 * Calculates the width of a string when rendered as an SVG <text> by rendering it into an svg
 * @param {string} txt - The string to estimate
 * @returns {number} - width of text
 */
export const estimateSVGTextWidth = (txt: string) => {
    const data = document.createTextNode(txt);

    const svgElement = document.createElementNS(
        svgNS,
        "text",
    ) as SVGTextElement;
    svgElement.appendChild(data);

    svg.appendChild(svgElement);

    const bbox = svgElement.getBBox();

    svgElement.parentNode!.removeChild(svgElement);

    return bbox.width;
};
