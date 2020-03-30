import { h } from "preact";
import { ClauseSet } from "../../../../types/calculus/clause";
import { getAllLits } from "../../../../util/dpll";
import Btn from "../../../input/btn";
import Dialog from "../../../dialog";
import Switch from "../../../input/switch";

import * as style from "./style.scss";

interface Props {
    /**
     * The current clause set
     */
    clauseSet: ClauseSet;
    /**
     * Whether or not the dialog is open
     */
    open: boolean;
    /**
     * Send handler
     */
    onSend: (model: Record<string, boolean>) => void;
    /**
     * Close handler
     */
    onClose: () => void;
}

const DPLLModelInput: preact.FunctionalComponent<Props> = ({
    clauseSet,
    onSend,
    open,
    onClose,
}) => {
    const lits = getAllLits(clauseSet);

    const model: Record<string, boolean> = {};

    for (const l of lits) {
        model[l] = false;
    }

    return (
        <Dialog label="Enter Model" open={open} onClose={onClose}>
            {lits.map((l) => (
                <div class={style.listItem}>
                    <Switch
                        label={l}
                        onChange={(checked) => (model[l] = checked)}
                    />
                </div>
            ))}
            <div class={style.sendWrapper}>
                <Btn onClick={() => onSend(model)} label="Check Model" />
            </div>
        </Dialog>
    );
};

export default DPLLModelInput;
