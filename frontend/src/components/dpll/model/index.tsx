import { h } from "preact";
import { getAllLits, sendModelCheck } from "../../../helpers/dpll";
import { ClauseSet } from "../../../types/clause";
import Btn from "../../btn";
import Dialog from "../../dialog";
import Switch from "../../switch";

import * as style from "./style.scss";

interface Props {
    clauseSet: ClauseSet;
    open: boolean;
    onSend: (model: Record<string, boolean>) => void;
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
                <Btn onClick={() => onSend(model)}>Check Model</Btn>
            </div>
        </Dialog>
    );
};

export default DPLLModelInput;
