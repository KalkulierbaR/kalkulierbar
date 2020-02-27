import { Fragment, h } from "preact";
import DPLLTree from "../../../components/dpll/tree";
import { useAppState } from "../../../helpers/app-state";

import { useCallback, useState } from "preact/hooks";
import ControlFAB from "../../../components/control-fab";
import Dialog from "../../../components/dialog";
import FAB from "../../../components/fab";
import CheckCircleIcon from "../../../components/icons/check-circle";
import DeleteIcon from "../../../components/icons/delete";
import SplitIcon from "../../../components/icons/split";
import SwitchIcon from "../../../components/icons/switch";
import OptionList from "../../../components/input/option-list";
import { checkClose } from "../../../helpers/api";
import {stringArrayToStringMap} from "../../../helpers/array-to-map";
import { classMap } from "../../../helpers/class-map";
import {
    atomToString,
    clauseSetToStringMap
} from "../../../helpers/clause";
import {
    calculateClauseSet,
    getAllLits,
    getPropCandidates,
    sendProp,
    sendPrune,
    sendSplit,
} from "../../../helpers/dpll";
import dpllExampleState from "./example";
import * as style from "./style.scss";

interface Props {}

type SelectedClauses = undefined | [number] | [number, number];

const DPLLView: preact.FunctionalComponent<Props> = () => {
    const {
        dpll: cState,
        smallScreen,
        server,
        onChange,
        onError,
        onSuccess,
    } = useAppState();

    const [showTree, setShowTree] = useState(false);
    const toggleShowTree = useCallback(() => setShowTree(!showTree), [
        showTree,
    ]);

    const [selectedNode, setSelectedNode] = useState<number>(0);

    const [selectedClauses, setSelectedClauses] = useState<SelectedClauses>(
        undefined,
    );

    const showPropDialog = selectedClauses !== undefined && selectedClauses.length === 2;
    const [showSplitDialog, setShowSplitDialog] = useState(false);

    const state = cState || dpllExampleState;

    const clauseSet = calculateClauseSet(state, selectedNode);

    const handleNodeSelect = (newNode: number) => {
        if (newNode === selectedNode) {
            return;
        }
        setSelectedNode(newNode);
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
                selectedNode,
                selectedClauses[0],
                newClauseId,
                candidates[0],
                setSelectedNode,
                onChange,
                onError,
            );
            setSelectedClauses(undefined);
            return;
        }
        setSelectedClauses([selectedClauses[0], newClauseId]);
    };

    const propOptions = selectedClauses !== undefined && selectedClauses.length > 1 ?
            stringArrayToStringMap(clauseSet.clauses[selectedClauses[1]!].atoms.map(atomToString))
            : new Map<number, string>();

    const handlePropLitSelect = (keyValuePair: [number, string]) => {
        if (selectedClauses === undefined || selectedClauses.length < 2) {
            return;
        }
        sendProp(
            server,
            state,
            selectedNode,
            selectedClauses[0],
            selectedClauses[1]!,
            keyValuePair[0],
            setSelectedNode,
            onChange,
            onError,
        );
        setSelectedClauses(undefined);
    };

    const allLits = showSplitDialog ? getAllLits(clauseSet) : [];

    const handleSplitLitSelect = (keyValuePair: [number, string]) => {
        sendSplit(
            server,
            state,
            selectedNode,
            allLits[keyValuePair[0]],
            onChange,
            onError
        );
        setShowSplitDialog(false);
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
                        selectedNode={selectedNode}
                        onSelect={handleNodeSelect}
                    />
                </div>
            </div>
            <Dialog
                label="Choose Literal"
                open={showPropDialog}
                onClose={() => setSelectedClauses([selectedClauses![0]])}
            >
                <OptionList
                    options={propOptions}
                    selectOptionCallback={handlePropLitSelect}
                />
            </Dialog>
            <Dialog
                label="Select Literal"
                open={showSplitDialog}
                onClose={() => setShowSplitDialog(false)}
            >
                <OptionList
                    options={stringArrayToStringMap(allLits)}
                    selectOptionCallback={handleSplitLitSelect}
                />
            </Dialog>
            <ControlFAB alwaysOpen={!smallScreen}>
                {smallScreen && (
                    <FAB
                        label="Switch"
                        icon={<SwitchIcon />}
                        mini={true}
                        extended={true}
                        onClick={toggleShowTree}
                    />
                )}
                <FAB
                    icon={<CheckCircleIcon />}
                    label="Check"
                    mini={true}
                    extended={true}
                    showIconAtEnd={true}
                    onClick={() =>
                        checkClose(server, onError, onSuccess, "dpll", state)
                    }
                />
                <FAB
                    label="Prune"
                    icon={<DeleteIcon />}
                    mini={true}
                    extended={true}
                    showIconAtEnd={true}
                    onClick={() =>
                        sendPrune(
                            server,
                            state,
                            selectedNode,
                            onChange,
                            onError,
                        )
                    }
                />
                <FAB
                    label="Split"
                    icon={<SplitIcon />}
                    mini={true}
                    extended={true}
                    showIconAtEnd={true}
                    onClick={() => setShowSplitDialog(true)}
                />
            </ControlFAB>
        </Fragment>
    );
};

export default DPLLView;
