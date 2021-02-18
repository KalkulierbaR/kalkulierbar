import { Fragment, h } from "preact";
import { route } from "preact-router";
import { useCallback, useState } from "preact/hooks";
import ModalTableauxFAB from "../../../components/calculus/modal-tableaux/fab";
import ModalTableauxTreeView from "../../../components/calculus/modal-tableaux/tree";
import TableauxTreeView from "../../../components/calculus/tableaux/tree";
import { Calculus, ModalCalculusType } from "../../../types/calculus";
import { ModalTableauxNode, ModalTableauxTreeLayoutNode } from "../../../types/calculus/modal-tableaux";
import { DragTransform } from "../../../types/ui";
import { useAppState } from "../../../util/app-state";
import { updateDragTransform } from "../../../util/tableaux";


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
    const [selectedRuleId, setSelectedRuleId] = useState<number | undefined>(   
        undefined
    );
    const [dragTransforms, setDragTransforms] = useState<
        Record<number, DragTransform>
    >({});
    const onDrag = useCallback(updateDragTransform(setDragTransforms), [
        setDragTransforms,
    ]);
    const selectedNode =
        selectedNodeId !== undefined ? state.nodes[selectedNodeId] : undefined;
    const selectedNodeIsLeaf =
        selectedNode !== undefined && selectedNode.children.length === 0;

    const resetDragTransform = useCallback(
        (id: number) => onDrag(id, { x: 0, y: 0 }),
        [onDrag],
    );
    const resetDragTransforms = useCallback(() => setDragTransforms({}), [
        setDragTransforms,
    ]);
    
    const selectNodeCallback = (
        newNode: ModalTableauxTreeLayoutNode,
    ) => {
        if(newNode.id === selectedNodeId){
            setSelectedNodeId(undefined);
        }else if(selectedNodeId === undefined){
            setSelectedNodeId(newNode.id);
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
        />

        <ModalTableauxFAB
            calculus={calculus}
            state={state}
            selectedNodeId={selectedNodeId}
            expandCallback={() => {}}
            lemmaMode={false}
            lemmaCallback={() => {}}
            resetDragTransform={resetDragTransform}
            resetDragTransforms={resetDragTransforms}
        />

        </Fragment>
    );
};

export default ModalTableauxView;