import {h} from "preact";

import {ClauseSet, SelectedClauses} from "../../../../types/calculus/clause";
import {DPLLState} from "../../../../types/calculus/dpll";
import {useAppState} from "../../../../util/app-state";
import {stringArrayToStringMap} from "../../../../util/array-to-map";
import {atomToString} from "../../../../util/clause";
import {sendProp} from "../../../../util/dpll";
import Dialog from "../../../dialog";
import OptionList from "../../../input/option-list";

interface Props {
    /**
     * Whether or not the dialog is open
     */
    open: boolean;
    /**
     * The current state
     */
    state: DPLLState;
    /**
     * The current active branch
     */
    branch: number;
    /**
     * The current clause set
     */
    clauseSet: ClauseSet;
    /**
     * A function with which to set the branch
     */
    setBranch: (n: number) => void;
    /**
     * The currently selected clauses
     */
    selectedClauses: SelectedClauses;
    /**
     * Setter for selected clauses
     */
    setSelectedClauses: (s: SelectedClauses) => void;
}

const DPLLPropLitDialog: preact.FunctionalComponent<Props> = ({
    open,
    setSelectedClauses,
    selectedClauses,
    state,
    clauseSet,
    branch,
    setBranch,
}) => {
    const { server, onChange, notificationHandler } = useAppState();

    const propOptions =
        selectedClauses !== undefined && selectedClauses.length > 1
            ? stringArrayToStringMap(
                  clauseSet.clauses[selectedClauses[1]!].atoms.map(
                      atomToString,
                  ),
              )
            : new Map<number, string>();

    const handlePropLitSelect = (keyValuePair: [number, string]) => {
        if (selectedClauses === undefined || selectedClauses.length < 2) {
            return;
        }
        sendProp(
            server,
            state,
            branch,
            selectedClauses[0],
            selectedClauses[1]!,
            keyValuePair[0],
            setBranch,
            onChange,
            notificationHandler,
        );
        setSelectedClauses(undefined);
    };

    return (
        <Dialog
            label="Choose Literal"
            open={open}
            onClose={() => setSelectedClauses([selectedClauses![0]])}
        >
            <OptionList
                options={propOptions}
                selectOptionCallback={handlePropLitSelect}
            />
        </Dialog>
    );
};

export default DPLLPropLitDialog;
