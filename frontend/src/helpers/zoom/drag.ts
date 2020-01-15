export const noEvent = (e: Event) => {
    e.preventDefault();
    e.stopImmediatePropagation();
};

export const disableDrag = () => {
    const el = document.documentElement;
    el.addEventListener("dragstart", noEvent);
    el.addEventListener("selectstart", noEvent);
};

export const enableDrag = (noClick: boolean) => {
    const el = document.documentElement;
    el.removeEventListener("dragstart", noEvent);
    el.removeEventListener("selectstart", noEvent);
    if (noClick) {
        el.addEventListener("click", noEvent);
        setTimeout(() => el.removeEventListener("click", noEvent), 0);
    }
};
