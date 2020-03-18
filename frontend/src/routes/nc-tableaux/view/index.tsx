import { h, Fragment } from "preact";
import { useAppState } from "../../../util/app-state";
import exampleState from "./example";
import NCTabTree from "../../../components/nc-tableaux/tree";
import { useState, useCallback } from "preact/hooks";
import { DragTransform } from "../../../types/ui";
import { NCTabTreeNode } from "../../../types/nc-tableaux";
import { updateDragTransform } from "../../../util/tableaux";
import NCTabFAB from "../../../components/nc-tableaux/fab";

const NCTableauxView: preact.FunctionalComponent = () => {
    const { "nc-tableaux": cState, onChange } = useAppState();

    let state = cState;

    if (!state) {
        state = exampleState;
        onChange("nc-tableaux", state);
    }

    const [selectedNodeId, setSelectedNode] = useState<number | undefined>(
        undefined,
    );

    const [dragTransforms, setDts] = useState<Record<number, DragTransform>>(
        {},
    );

    const onDrag = useCallback(updateDragTransform(setDts), [setDts]);

    const resetDragTransform = useCallback(
        (id: number) => onDrag(id, { x: 0, y: 0 }),
        [onDrag],
    );
    const resetDragTransforms = useCallback(() => setDts({}), [setDts]);

    const handleNodeSelect = (node: NCTabTreeNode) => {
        if (selectedNodeId === undefined) {
            setSelectedNode(node.id);
        } else if (selectedNodeId === node.id) {
            setSelectedNode(undefined);
        }
    };

    return (
        <Fragment>
            <h2>Non-Clausal Tableaux View</h2>
            <div class="card no-pad">
                <NCTabTree
                    nodes={state.nodes}
                    selectedNodeId={selectedNodeId}
                    selectNodeCallback={handleNodeSelect}
                    dragTransforms={dragTransforms}
                    onDrag={onDrag}
                />
            </div>
            <NCTabFAB
                state={state}
                selectedNodeId={selectedNodeId}
                setSelectedNode={setSelectedNode}
                resetDragTransform={resetDragTransform}
                resetDragTransforms={resetDragTransforms}
            />
        </Fragment>
    );
};

export default NCTableauxView;
