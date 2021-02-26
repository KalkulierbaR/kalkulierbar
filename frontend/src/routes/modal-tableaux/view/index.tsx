import { Fragment, h } from "preact";
import { route } from "preact-router";
import { useCallback, useState } from "preact/hooks";
import ModalTableauxFAB from "../../../components/calculus/modal-tableaux/fab";
import ModalTableauxTreeView from "../../../components/calculus/modal-tableaux/tree";
import TableauxTreeView from "../../../components/calculus/tableaux/tree";
import PrefixDialog from "../../../components/dialog/prefix-dialog";
import { Calculus, ModalCalculusType } from "../../../types/calculus";
import { ExpandMove, ModalTableauxMove, ModalTableauxNode, ModalTableauxTreeLayoutNode } from "../../../types/calculus/modal-tableaux";
import { DragTransform } from "../../../types/ui";
import { sendMove } from "../../../util/api";
import { useAppState } from "../../../util/app-state";
import { getLeaves, nodeName, sendNodeExtend } from "../../../util/modal-tableaux";
import { sendExtend, updateDragTransform } from "../../../util/tableaux";


interface Props{

    calculus: ModalCalculusType;
}

const ModalTableauxView: preact.FunctionComponent<Props> = ({calculus}) => {
    const {
        server,
        "signed-modal-tableaux": cState,
        smallScreen,
        notificationHandler,
        onChange,
    } = useAppState();

    const state = cState;
    if(!state){
        route (`/${Calculus.modalTableaux}`);
        return null;
    }
    const [selectedNodeId, setSelectedNodeId] = useState<number |undefined>(
        undefined
    );
    const [leafSelection, setLeafSelection] = useState<boolean>(
        false
    );
    const [selectedMove, setSelectedMove] = useState<ExpandMove | undefined>(
        undefined
    )

    const [dragTransforms, setDragTransforms] = useState<
        Record<number, DragTransform>
    >({});
    const onDrag = useCallback(updateDragTransform(setDragTransforms), [
        setDragTransforms,
    ]);

    const resetDragTransform = useCallback(
        (id: number) => onDrag(id, { x: 0, y: 0 }),
        [onDrag],
    );
    const resetDragTransforms = useCallback(() => setDragTransforms({}), [
        setDragTransforms,
    ]);
    const [showPrefixDialog, setShowPrefixDialog] = useState<boolean>(false);
    
    const selectNodeCallback = (
        newNode: ModalTableauxTreeLayoutNode,
    ) => {
        if(newNode.id === selectedNodeId){
            setSelectedNodeId(undefined);
            setSelectedMove(undefined);
            setLeafSelection(false);
        }else if(selectedNodeId === undefined){
            setSelectedNodeId(newNode.id);
        }else if(leafSelection === true && selectedMove !== undefined && getLeaves(state.nodes, state.nodes[selectedNodeId]).includes(newNode.id)){
            selectedMove.leafID = newNode.id;
            sendMove(server,calculus,state, selectedMove, onChange, notificationHandler);
            setSelectedNodeId(undefined);
            setSelectedMove(undefined);
            setLeafSelection(false);
        }else {
            sendMove(server, calculus, state, {type: "close", nodeID: selectedNodeId, leafID: newNode.id},onChange,notificationHandler);
            setSelectedNodeId(undefined);
        }
    }

    const sendPrefix = (
        prefix: number,
    ) => {
        if(selectedNodeId !== undefined){
            let leaves = getLeaves(state.nodes,state.nodes[selectedNodeId]);
            if(leaves.length > 1){
                setLeafSelection(true);
                setSelectedMove({type: selectedMove?.type,nodeID: selectedNodeId,leafID: selectedMove?.leafID, prefix: prefix})
            }else{
                sendMove(server, calculus, state, {type: selectedMove?.type, nodeID: selectedNodeId, leafID: leaves[0], prefix: prefix}, onChange, notificationHandler);
                setSelectedNodeId(undefined);
                setSelectedMove(undefined);
            }
            setShowPrefixDialog(false);
        }
    }

    return (
        <Fragment>
            <h2>Modal Tableux View</h2>
        
        <ModalTableauxTreeView
            nodes={state.nodes}
            smallScreen={smallScreen}
            selectedNodeId={selectedNodeId}
            selectNodeCallback={selectNodeCallback}
            lemmaNodesSelectable={false}
            dragTransforms={dragTransforms}
            onDrag={onDrag}
            leafSelection={leafSelection}
        />

        <ModalTableauxFAB
            calculus={calculus}
            state={state}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            setLeafSelected={setLeafSelection}
            setSelectedMove={setSelectedMove}
            resetDragTransform={resetDragTransform}
            resetDragTransforms={resetDragTransforms}
            setShowPrefixDialog={setShowPrefixDialog}
            pruneCallback={() => {
                sendMove(
                server,
                calculus,
                state,
                { type: "prune", nodeID: selectedNodeId! },
                onChange,
                notificationHandler,
                )}}
        />

        <PrefixDialog
            open={showPrefixDialog}
            onClose={() => setShowPrefixDialog(false)}
            prefixOrigin={nodeName(state.nodes[selectedNodeId!])}
            submitPrefixCallback={sendPrefix}
            notificationHandler={notificationHandler}
        />

        </Fragment>
    );
};

export default ModalTableauxView;