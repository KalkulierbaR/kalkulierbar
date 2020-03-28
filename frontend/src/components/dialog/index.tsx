import { h } from "preact";
import Btn from "../btn";
import CloseIcon from "../icons/close";
import * as style from "./style.scss";

interface Props {
    /**
     * Opens the dialog.
     * Defaults to `false`.
     */
    open?: boolean;
    /**
     * The dialog label. Used as a heading.
     */
    label: string;
    /**
     * Close handler
     */
    onClose: () => void;
    /**
     * Confirm handler.
     * If set to false, the confirm button is not shown.
     * Defaults to `false`.
     */
    onConfirm?: () => void;
    class?: string;
}

const Dialog: preact.FunctionalComponent<Props> = ({
    open,
    children,
    label,
    onClose,
    onConfirm,
    class: className,
}) => {
    /**
     * Handle the click event
     * @param {MouseEvent} e - The event to handle
     * @returns {void}
     */
    const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        if (!target.classList.contains(style.dialog)) {
            e.stopPropagation();
            return;
        }

        onClose();
    };

    // Choose styles
    const c = `${style.dialog} ${open ? style.open : ""}`;

    return (
        <div class={c} onClick={handleClick}>
            <div class={`card  ${style.container} ${className}`}>
                <h2 class={style.label}>{label}</h2>
                <button
                    class={style.closeBtn}
                    onClick={onClose}
                    aria-label="Close"
                >
                    <CloseIcon />
                </button>
                <div class={style.content}>{children}</div>
                <div class={style.actions}>
                    {onConfirm && <Btn onClick={onConfirm}>Okay</Btn>}
                </div>
            </div>
        </div>
    );
};

export default Dialog;
