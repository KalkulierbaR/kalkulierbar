import { Fragment, h } from "preact";
import DPLLTree from "../../../components/dpll/tree";
import { useAppState } from "../../../helpers/app-state";

import { useCallback, useState } from "preact/hooks";
import ControlFAB from "../../../components/control-fab";
import FAB from "../../../components/fab";
import DeleteIcon from "../../../components/icons/delete";
import SwitchIcon from "../../../components/icons/switch";
import OptionList from "../../../components/input/option-list";
import { classMap } from "../../../helpers/class-map";
import { clauseSetToStringArray } from "../../../helpers/clause";
import { sendPrune } from "../../../helpers/dpll";
import dpllExampleState from "./example";
import * as style from "./style.scss";

interface Props {}

const DPLLView: preact.FunctionalComponent<Props> = () => {
    const {
        dpll: cState,
        smallScreen,
        server,
        onChange,
        onError,
    } = useAppState();

    const [showTree, setShowTree] = useState(false);

    const [selectedNode, setSelectedNode] = useState<number | undefined>(
        undefined,
    );

    const toggleShowTree = useCallback(() => setShowTree(!showTree), [
        showTree,
    ]);

    const state = cState || dpllExampleState;

    const handleNodeSelect = (newNode: number) => {
        if (newNode === selectedNode) {
            setSelectedNode(undefined);
            return;
        }
        setSelectedNode(newNode);
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
                        selectOptionCallback={(id) => console.log(id)}
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
                {selectedNode !== undefined && (
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
                )}
            </ControlFAB>
        </Fragment>
    );
};

export default DPLLView;
