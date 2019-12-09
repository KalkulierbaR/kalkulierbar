import { h } from "preact";
import Btn from "../../../btn";
import * as style from "./style.css";

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
}

const Dialog: preact.FunctionalComponent<Props> = ({
    open,
    children,
    label,
    onClose,
    onConfirm
}) => {
    const c = `${style.dialog} ${open ? style.open : ""}`;
    return (
        <div class={c}>
            <div class={"card " + style.container}>
                <h2>{label}</h2>
                <div class={style.content}>{children}</div>
                <div class={style.actions}>
                    <Btn onClick={onClose}>Cancel</Btn>
                    {onConfirm && <Btn onClick={onConfirm}>OK</Btn>}
                </div>
            </div>
        </div>
    );
};

export default Dialog;
