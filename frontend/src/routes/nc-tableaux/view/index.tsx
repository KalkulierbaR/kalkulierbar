import { Fragment, h } from "preact";
import { useCallback, useState } from "preact/hooks";
import TutorialDialog from "../../../components/tutorial/dialog";
import VarAssignDialog from "../../../components/dialog/var-assign";
import NCTabFAB from "../../../components/calculus/nc-tableaux/fab";
import NCTabTree from "../../../components/calculus/nc-tableaux/tree";
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
    const [varOrigins, setVarOrigins] = useState<string[]>([]);

    const selectedNode =
        selectedNodeId !== undefined ? state.nodes[selectedNodeId] : undefined;
    const selectedNodeIsLeaf =
        selectedNode !== undefined
            ? selectedNode.children.length === 0
            : undefined;

    /**
     * Handle the selection of a node
     * @param {NCTabTreeNode} node - The being selected
     * @returns {void}
     */
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
            const vars = new Set<string>();
            collectVarsFromNode(vars, selectedNode!.formula);
            collectVarsFromNode(vars, node.formula);
            if (vars.size <= 0) {
                sendFOClose(false, {}, node.id);
                return;
            }
            setVarOrigins([selectedNode!.spelling, node.spelling]);
            setVarsToAssign(Array.from(vars));
            setShowVarAssignDialog(true);
        }
    };

    /**
     * Send a close move to backend
     * @param {boolean} auto - Whether vars should be assigned automatically
     * @param {VarAssign} varAssign - Variable assignments
     * @param {number | undefined} secondID - The second node`s id
     * @returns {void}
     */
    const sendFOClose = (
        auto: boolean,
        varAssign: VarAssign = {},
        secondID: number | undefined = varAssignSecondNodeId,
    ) => {
        const leaf = selectedNodeIsLeaf ? selectedNodeId : secondID;
        const pred = selectedNodeIsLeaf ? secondID : selectedNodeId;
        sendClose(
            server,
            state!,
            onChange,
            notificationHandler,
            leaf!,
            pred!,
            auto ? null : varAssign,
        );
        setSelectedNode(undefined);
        setShowVarAssignDialog(false);
    };

    return (
        <Fragment>
            <h2>NC Tableaux View</h2>

            <div class="card no-pad">
                <NCTabTree
                    nodes={state.nodes}
                    selectedNodeId={selectedNodeId}
                    selectNodeCallback={handleNodeSelect}
                    dragTransforms={dragTransforms}
                    onDrag={onDrag}
                />
            </div>

            <VarAssignDialog
                open={showVarAssignDialog}
                onClose={() => setShowVarAssignDialog(false)}
                varOrigins={varOrigins}
                vars={varsToAssign}
                submitVarAssignCallback={sendFOClose}
                secondSubmitEvent={sendFOClose}
            />

            <NCTabFAB
                state={state}
                selectedNodeId={selectedNodeId}
                setSelectedNode={setSelectedNode}
                resetDragTransform={resetDragTransform}
                resetDragTransforms={resetDragTransforms}
            />

            <TutorialDialog calculus={Calculus.ncTableaux} />
        </Fragment>
    );
};

export default NCTableauxView;
