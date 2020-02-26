import { Fragment, h } from "preact";
import DPLLTree from "../../../components/dpll/tree";
import { useAppState } from "../../../helpers/app-state";

import { useCallback, useState } from "preact/hooks";
import ControlFAB from "../../../components/control-fab";
import Dialog from "../../../components/dialog";
import FAB from "../../../components/fab";
import DeleteIcon from "../../../components/icons/delete";
import SplitIcon from "../../../components/icons/split";
import SwitchIcon from "../../../components/icons/switch";
import OptionList from "../../../components/input/option-list";
import { classMap } from "../../../helpers/class-map";
import { atomToString, clauseSetToStringArray } from "../../../helpers/clause";
import {
    getAllLits,
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
    } = useAppState();

    const [showTree, setShowTree] = useState(false);
    const toggleShowTree = useCallback(() => setShowTree(!showTree), [
        showTree,
    ]);

    const [selectedNode, setSelectedNode] = useState<number>(0);

    const [selectedClauses, setSelectedClauses] = useState<SelectedClauses>(
        undefined,
    );

    const showPropDialog = selectedClauses?.length === 2;
    const [showSplitDialog, setShowSplitDialog] = useState(false);

    const state = cState || dpllExampleState;

    const handleNodeSelect = (newNode: number) => {
        if (newNode === selectedNode) {
            return;
        }
        setSelectedNode(newNode);
    };

    const handleClauseSelect = (newClause: number) => {
        if (selectedClauses === undefined) {
            setSelectedClauses([newClause]);
            return;
        }
        if (selectedClauses[0] === newClause) {
            setSelectedClauses(undefined);
            return;
        }
        setSelectedClauses([selectedClauses[0], newClause]);
    };

    const propOptions: string[] =
        selectedClauses === undefined || selectedClauses.length < 2
            ? []
            : state.clauseSet.clauses[selectedClauses[1]!].atoms.map((a) =>
                  atomToString(a),
              );

    const handlePropLitSelect = (lId: number) => {
        if (selectedClauses === undefined || selectedClauses.length < 2) { return; }
        sendProp(
            server,
            state,
            selectedNode,
            selectedClauses[0],
            selectedClauses[1]!,
            lId,
            onChange,
            onError,
        );
        setSelectedClauses(undefined);
    };

    const allLits = showSplitDialog ? getAllLits(state.clauseSet) : [];

    const handleSplitLitSelect = (id: number) => {
        sendSplit(server, state, selectedNode, allLits[id], onChange, onError);
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
                        options={clauseSetToStringArray(state.clauseSet)}
                        selectOptionCallback={handleClauseSelect}
                        selectedOptionId={selectedClauses?.[0]}
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
                    options={allLits}
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
                    label="Prune"
                    icon={<DeleteIcon />}
                    mini={true}
                    extended={true}
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
                    onClick={() => setShowSplitDialog(true)}
                />
            </ControlFAB>
        </Fragment>
    );
};

export default DPLLView;
