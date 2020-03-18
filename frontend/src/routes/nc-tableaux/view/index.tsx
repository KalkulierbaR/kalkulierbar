import { h, Fragment } from "preact";
import { useAppState } from "../../../util/app-state";
import exampleState from "./example";
import NCTabTree from "../../../components/nc-tableaux/tree";
import { useState, useCallback } from "preact/hooks";
import { DragTransform } from "../../../types/ui";
import { NCTabTreeNode } from "../../../types/nc-tableaux";
import { updateDragTransform } from "../../../util/tableaux";
import NCTabFAB from "../../../components/nc-tableaux/fab";
import Dialog from "../../../components/dialog";
import VarAssignList from "../../../components/input/var-assign-list";
import { VarAssign } from "../../../types/tableaux";
import {
    sendClose,
    collectVarsFromNode,
    removeUnusedDrags,
} from "../../../util/nc-tableaux";

const NCTableauxView: preact.FunctionalComponent = () => {
    const { "nc-tableaux": cState, onChange, server, onError } = useAppState();

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

    const [varAssignSecondNodeId, setVarAssignSecondNodeId] = useState<
        number | undefined
    >(undefined);
    const [showVarAssignDialog, setShowVarAssignDialog] = useState(false);
    const [varsToAssign, setVarsToAssign] = useState<string[]>([]);

    const selectedNode =
        selectedNodeId !== undefined ? state.nodes[selectedNodeId] : undefined;
    const selectedNodeIsLeaf =
        selectedNode !== undefined
            ? selectedNode.children.length === 0
            : undefined;

    const handleNodeSelect = (node: NCTabTreeNode) => {
        const newNodeIsLeaf = node.children.length === 0;
        if (selectedNodeId === undefined) {
            setSelectedNode(node.id);
        } else if (selectedNodeId === node.id) {
            setSelectedNode(undefined);
        } else if (
            // Don't select two leafs or two nodes at the same time
            (selectedNodeIsLeaf && newNodeIsLeaf) ||
            (!selectedNodeIsLeaf && !newNodeIsLeaf)
        ) {
            setSelectedNode(node.id);
        } else {
            setVarAssignSecondNodeId(node.id);
            const vars: string[] = [];
            collectVarsFromNode(vars, selectedNode!.formula);
            collectVarsFromNode(vars, node.formula);
            if (vars.length <= 0) {
                sendFOClose(false, {});
                return;
            }
            setVarsToAssign(vars);
            setShowVarAssignDialog(true);
        }
    };

    const sendFOClose = (auto: boolean, varAssign: VarAssign = {}) => {
        if (
            selectedNodeId === undefined ||
            varAssignSecondNodeId === undefined
        ) {
            // Error for debugging
            throw new Error(
                "Close move went wrong, since selected nodes could not be identified.",
            );
        }
        const leaf = selectedNodeIsLeaf
            ? selectedNodeId
            : varAssignSecondNodeId;
        const pred = selectedNodeIsLeaf
            ? varAssignSecondNodeId
            : selectedNodeId;
        sendClose(
            server,
            state!,
            onChange,
            onError,
            leaf,
            pred,
            auto ? null : varAssign,
        );
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
            <Dialog
                open={showVarAssignDialog}
                label="Choose variable assignments or leave them blank"
                onClose={() => setShowVarAssignDialog(false)}
            >
                <VarAssignList
                    vars={varsToAssign}
                    manualVarAssignOnly={false}
                    submitVarAssignCallback={sendFOClose}
                    submitLabel="Assign variables"
                    secondSubmitEvent={sendFOClose}
                    secondSubmitLabel="Automatic assignment"
                />
            </Dialog>
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
