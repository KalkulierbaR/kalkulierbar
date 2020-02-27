import { Fragment, h } from "preact";
import DPLLTree from "../../../components/dpll/tree";
import { useAppState } from "../../../helpers/app-state";

import { useCallback, useState } from "preact/hooks";
import DPLLPropLitDialog from "../../../components/dpll/dialog/prop";
import DPLLSplitDialog from "../../../components/dpll/dialog/split";
import DPLLControlFAB from "../../../components/dpll/fab";
import DPLLModelInput from "../../../components/dpll/model";
import OptionList from "../../../components/input/option-list";
import { classMap } from "../../../helpers/class-map";
import { clauseSetToStringMap } from "../../../helpers/clause";
import {
    calculateClauseSet,
    getPropCandidates,
    sendModelCheck,
    sendProp,
} from "../../../helpers/dpll";
import { SelectedClauses } from "../../../types/clause";
import dpllExampleState from "./example";
import * as style from "./style.scss";

interface Props {}

const DPLLView: preact.FunctionalComponent<Props> = () => {
    const { dpll: cState, server, onChange, onError } = useAppState();

    const [showTree, setShowTree] = useState(false);
    const toggleShowTree = useCallback(() => setShowTree(!showTree), [
        showTree,
    ]);

    const [branch, setBranch] = useState<number>(0);

    const [selectedClauses, setSelectedClauses] = useState<SelectedClauses>(
        undefined,
    );

    const showPropDialog =
        selectedClauses !== undefined && selectedClauses.length === 2;
    const [showSplitDialog, setShowSplitDialog] = useState(false);

    const [showModelDialog, setShowModelDialog] = useState(false);

    const state = cState || dpllExampleState;

    const clauseSet = calculateClauseSet(state, branch);

    const handleNodeSelect = (newNode: number) => {
        if (newNode === branch) {
            return;
        }
        setBranch(newNode);
    };

    const handleClauseSelect = (keyValuePair: [number, string]) => {
        const newClauseId = keyValuePair[0];
        if (selectedClauses === undefined) {
            setSelectedClauses([newClauseId]);
            return;
        }
        if (selectedClauses[0] === newClauseId) {
            setSelectedClauses(undefined);
            return;
        }
        const candidates = getPropCandidates(
            clauseSet.clauses[selectedClauses[0]],
            clauseSet.clauses[newClauseId],
        );
        if (candidates.length === 1) {
            sendProp(
                server,
                state,
                branch,
                selectedClauses[0],
                newClauseId,
                candidates[0],
                setBranch,
                onChange,
                onError,
            );
            setSelectedClauses(undefined);
            return;
        }
        setSelectedClauses([selectedClauses[0], newClauseId]);
    };

    return (
        <Fragment>
            <h2>DPLL View</h2>
            <div
                class={classMap({
                    [style.dpllView]: true,
                    [style.showTree]: showTree,
                })}
            >
                <div class={style.list}>
                    <OptionList
                        options={clauseSetToStringMap(clauseSet)}
                        selectOptionCallback={handleClauseSelect}
                        selectedOptionIds={selectedClauses}
                    />
                </div>
                <div class={style.tree}>
                    <DPLLTree
                        nodes={state.tree}
                        selectedNode={branch}
                        onSelect={handleNodeSelect}
                    />
                </div>
            </div>
            <DPLLPropLitDialog
                open={showPropDialog}
                state={state}
                clauseSet={clauseSet}
                branch={branch}
                setBranch={setBranch}
                selectedClauses={selectedClauses}
                setSelectedClauses={setSelectedClauses}
            />
            <DPLLSplitDialog
                state={state}
                branch={branch}
                open={showSplitDialog}
                setOpen={setShowSplitDialog}
                clauseSet={clauseSet}
            />
            <DPLLModelInput
                clauseSet={clauseSet}
                onClose={() => {
                    setShowModelDialog(false);
                }}
                onSend={(interpretation) => {
                    sendModelCheck(
                        server,
                        state,
                        branch,
                        interpretation,
                        onChange,
                        onError,
                    );
                    setShowModelDialog(false);
                }}
                open={showModelDialog}
            />
            <DPLLControlFAB
                state={state}
                branch={branch}
                toggleShowTree={toggleShowTree}
                setShowModelDialog={setShowModelDialog}
                setShowSplitDialog={setShowSplitDialog}
            />
        </Fragment>
    );
};

export default DPLLView;
