/**
 * Stops an event from having any effect
 * @param {Event} e - The event to stop
 * @returns {void} - void
 */
export const noEvent = (e: Event) => {
    e.preventDefault();
    e.stopImmediatePropagation();
};

/**
 * Disable drag on the entire document
 * @returns {void} - void
 */
export const disableDrag = () => {
    const el = document.documentElement;
    el.addEventListener("dragstart", noEvent);
    el.addEventListener("selectstart", noEvent);
};

/**
 * Enable drag again
 * @param {boolean} noClick - Whether to temporarily disable click events
 * @returns {void} - void
 */
export const enableDrag = (noClick: boolean) => {
    const el = document.documentElement;
    el.removeEventListener("dragstart", noEvent);
    el.removeEventListener("selectstart", noEvent);
    if (noClick) {
        el.addEventListener("click", noEvent);
        setTimeout(() => el.removeEventListener("click", noEvent), 0);
    }
};
