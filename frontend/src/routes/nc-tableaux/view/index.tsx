import { Fragment, h } from "preact";
import { useCallback, useState } from "preact/hooks";
import Dialog from "../../../components/dialog";
import HelpMenu from "../../../components/help-menu";
import VarAssignList from "../../../components/input/var-assign-list";
import NCTabFAB from "../../../components/nc-tableaux/fab";
import NCTabTree from "../../../components/nc-tableaux/tree";
import { Calculus } from "../../../types/calculus";
import { NCTabTreeNode } from "../../../types/calculus/nc-tableaux";
import { VarAssign } from "../../../types/calculus/tableaux";
import { DragTransform } from "../../../types/ui";
import { useAppState } from "../../../util/app-state";
import { collectVarsFromNode, sendClose } from "../../../util/nc-tableaux";
import { updateDragTransform } from "../../../util/tableaux";
import { route } from "preact-router";

const NCTableauxView: preact.FunctionalComponent = () => {
    const {
        "nc-tableaux": cState,
        onChange,
        server,
        notificationHandler,
    } = useAppState();

    const state = cState;

    if (!state) {
        route(`/${Calculus.ncTableaux}`);
        return null;
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
                sendFOClose(false, {}, node.id);
                return;
            }
            setVarsToAssign(vars);
            setShowVarAssignDialog(true);
        }
    };

    const sendFOClose = (
        auto: boolean,
        varAssign: VarAssign = {},
        secondID: number | undefined = varAssignSecondNodeId,
    ) => {
        if (selectedNodeId === undefined || secondID === undefined) {
            // Error for debugging
            throw new Error(
                "Close move went wrong, since selected nodes could not be identified.",
            );
        }
        const leaf = selectedNodeIsLeaf ? selectedNodeId : secondID;
        const pred = selectedNodeIsLeaf ? secondID : selectedNodeId;
        sendClose(
            server,
            state!,
            onChange,
            notificationHandler,
            leaf,
            pred,
            auto ? null : varAssign,
        );
        setSelectedNode(undefined);
        setVarAssignSecondNodeId(undefined);
        setVarsToAssign([]);
        setShowVarAssignDialog(false);
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
            <HelpMenu calculus={Calculus.ncTableaux} />
        </Fragment>
    );
};

export default NCTableauxView;
