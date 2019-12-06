import { h } from "preact";
import Btn from "../../../btn";
import * as style from "./style.css";

interface Props {
    open?: boolean;
    label: string;
    onClose: () => void;
    onConfirm: () => void;
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
                    <Btn onClick={onConfirm}>OK</Btn>
                </div>
            </div>
        </div>
    );
};

export default Dialog;
