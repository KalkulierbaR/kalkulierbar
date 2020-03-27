import { h } from "preact";
import { useMemo } from "preact/hooks";
import { ClauseSet } from "../../../types/clause";
import { DPLLState } from "../../../types/dpll";
import { useAppState } from "../../../util/app-state";
import { stringArrayToStringMap } from "../../../util/array-to-map";
import { getAllLits, sendSplit } from "../../../util/dpll";
import Dialog from "../../dialog";
import OptionList from "../../input/option-list";

interface Props {
    open: boolean;
    state: DPLLState;
    branch: number;
    clauseSet: ClauseSet;
    setOpen: (v: boolean) => void;
}

const DPLLSplitDialog: preact.FunctionalComponent<Props> = ({
    open,
    setOpen,
    clauseSet,
    state,
    branch,
}) => {
    const { server, onChange, notificationHandler } = useAppState();

    const lits = useMemo(() => getAllLits(clauseSet), [clauseSet]);

    const handleSplitLitSelect = (keyValuePair: [number, string]) => {
        sendSplit(
            server,
            state,
            branch,
            lits[keyValuePair[0]],
            onChange,
            notificationHandler,
        );
        setOpen(false);
    };

    return (
        <Dialog
            label="Select Literal"
            open={open}
            onClose={() => setOpen(false)}
        >
            <OptionList
                options={stringArrayToStringMap(lits)}
                selectOptionCallback={handleSplitLitSelect}
            />
        </Dialog>
    );
};

export default DPLLSplitDialog;
