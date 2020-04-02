import { Fragment, h } from "preact";
import { useCallback, useState } from "preact/hooks";
import DPLLPropLitDialog from "../../../components/calculus/dpll/dialog/prop";
import DPLLSplitDialog from "../../../components/calculus/dpll/dialog/split";
import DPLLControlFAB from "../../../components/calculus/dpll/fab";
import DPLLModelInput from "../../../components/calculus/dpll/model";
import DPLLTree from "../../../components/calculus/dpll/tree";
import TutorialDialog from "../../../components/tutorial/dialog";
import OptionList from "../../../components/input/option-list";
import { Calculus } from "../../../types/calculus";
import { SelectedClauses } from "../../../types/calculus/clause";
import { useAppState } from "../../../util/app-state";
import { classMap } from "../../../util/class-map";
import { clauseSetToStringMap } from "../../../util/clause";
import {
    calculateClauseSet,
    getPropCandidates,
    sendModelCheck,
    sendProp,
} from "../../../util/dpll";
import * as style from "./style.scss";
import { route } from "preact-router";

interface Props {}

const DPLLView: preact.FunctionalComponent<Props> = () => {
    const {
        dpll: cState,
        server,
        onChange,
        notificationHandler,
    } = useAppState();

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

    if (!cState) {
        route(`/${Calculus.dpll}`);
        return null;
    }

    const state = cState;

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
                notificationHandler,
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
                        notificationHandler,
                    );
                    setShowModelDialog(false);
                }}
                open={showModelDialog}
            />
            <DPLLControlFAB
                state={state}
                branch={branch}
                showTree={showTree}
                toggleShowTree={toggleShowTree}
                setShowModelDialog={setShowModelDialog}
                setShowSplitDialog={setShowSplitDialog}
            />
            <TutorialDialog calculus={Calculus.dpll} />
        </Fragment>
    );
};

export default DPLLView;
