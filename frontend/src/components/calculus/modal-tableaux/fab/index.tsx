import { ModalCalculusType } from "../../../../types/calculus";
import { ExpandMove, ModalTableauxState } from "../../../../types/calculus/modal-tableaux";
import { useAppState } from "../../../../util/app-state";
import { Fragment, h } from "preact";
import DownloadFAB from "../../../input/fab/download";
import ControlFAB from "../../../input/control-fab";
import FAB from "../../../input/fab";
import ExploreIcon from "../../../icons/explore";
import { nextOpenLeaf, sendNodeExtend } from "../../../../util/modal-tableaux";
import CenterFAB from "../../../input/fab/center";
import CheckCloseFAB from "../../../input/fab/check-close";
import { sendBacktrack } from "../../../../util/modal-tableaux";
import UndoIcon from "../../../icons/undo";
import { sendMove } from "../../../../util/api";

import * as style from "./style.scss";
import DeleteIcon from "../../../icons/delete";


interface Props {
    /**
     * Which calculus to use
     */
    calculus: ModalCalculusType;
    /**
     * The current calculus state
     */
    state: ModalTableauxState;
    /**
     * Which node is currently selected
     */
    selectedNodeId?: number;
    /**
     * Which node is currently selected
     */
    setSelectedNodeId: (id: number | undefined) => void;
    /**
     * Which node is currently selected
     */
    setLeafSelected: (b: boolean) => void;
    /**
     * Which Move has been selected in case the user needs to specify the branch
     */
    setSelectedMove: (move: ExpandMove) => void;
    /**
     * Callback to reset a specific drag
     */
    resetDragTransform: (id: number) => void;
    /**
     * Callback to reset all drags
     */
    resetDragTransforms: () => void;
    /**
     * Whether to show or not to show the prefix dialog
     */
    setShowPrefixDialog: (b: boolean) => void; 
    /**
     * Deletes selected Branch
     */
    pruneCallback: () => void;

}

const ModalTableauxFAB: preact.FunctionalComponent<Props> = ({
    calculus,
    state,
    selectedNodeId,
    setSelectedNodeId,
    setLeafSelected,
    setSelectedMove,
    resetDragTransform,
    resetDragTransforms,
    setShowPrefixDialog,
    pruneCallback,
}) => {
    
    const {
        server,
        smallScreen,
        onChange,
        notificationHandler,
    } = useAppState();

    const showUndoFAB = state.backtracking && state.moveHistory.length > 0;

    return (
        <Fragment>
        
            <ControlFAB
                alwaysOpen={!smallScreen}
                couldShowCheckCloseHint={state.nodes[0].isClosed}
            >
                {selectedNodeId === undefined ? (
                    <Fragment>
                        <DownloadFAB
                            state={state}
                            name={calculus}
                            type={calculus}
                        />
                        {state.nodes.filter((node) => !node.isClosed).length > 0 && (
                            <FAB
                            icon={<ExploreIcon />}
                            label="Next Leaf"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                const node = nextOpenLeaf(state!.nodes);
                                if (node === undefined) {
                                    return;
                                }
                                dispatchEvent(
                                    new CustomEvent("go-to", {
                                        detail: { node },
                                    }),
                                );
                            }}
                        />
                    )}
                    <CenterFAB resetDragTransforms={resetDragTransforms}/>
                    <CheckCloseFAB calculus={calculus}/>
                    {showUndoFAB && (
                            <FAB
                                icon={<UndoIcon />}
                                label="Undo"
                                mini={true}
                                extended={true}
                                showIconAtEnd={true}
                                onClick={() => {
                                    // If the last move added a node, and we undo this, remove the corresponding drag
                                    if (state.moveHistory.length > 0) {
                                        const move =
                                            state.moveHistory[
                                                state.moveHistory.length - 1
                                            ];
                                        if (move.type === "alphaMove" || "betaMove") {
                                            resetDragTransform(
                                                state.nodes.length - 1,
                                            );
                                        }
                                    }
                                    sendBacktrack(
                                        calculus,
                                        server,
                                        state,
                                        onChange,
                                        notificationHandler,
                                    );
                                }}
                            />
                        )}
                    </Fragment>
                ) : (
                    <Fragment>
                        <FAB
                            icon={<span class={style.greekLetter}>!</span>}
                            label="Negation"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                sendNodeExtend(
                                    calculus, 
                                    server, 
                                    state, 
                                    "negation", 
                                    onChange, 
                                    notificationHandler, 
                                    state.nodes, 
                                    selectedNodeId, 
                                    setLeafSelected, 
                                    setSelectedMove,
                                    setSelectedNodeId
                                );
                            }}
                        />
                        <FAB
                            icon={<span class={style.greekLetter}>α</span>}
                            label="Alpha"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                sendNodeExtend(
                                    calculus, 
                                    server, 
                                    state, 
                                    "alphaMove", 
                                    onChange, 
                                    notificationHandler, 
                                    state.nodes, 
                                    selectedNodeId, 
                                    setLeafSelected, 
                                    setSelectedMove,
                                    setSelectedNodeId
                                );
                            }}
                        />
                        <FAB
                            icon={<span class={style.greekLetter}>β</span>}
                            label="Beta"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                sendNodeExtend(
                                    calculus, 
                                    server, 
                                    state, 
                                    "betaMove", 
                                    onChange, 
                                    notificationHandler, 
                                    state.nodes, 
                                    selectedNodeId, 
                                    setLeafSelected, 
                                    setSelectedMove,
                                    setSelectedNodeId
                                );
                            }}
                        />
                        <FAB
                            icon={<span class={style.greekLetter}>𝜈</span>}
                            label="Nu"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                setSelectedMove({type: "nuMove",nodeID: selectedNodeId})
                                setShowPrefixDialog(true);
                            }}
                        />
                        <FAB
                            icon={<span class={style.greekLetter}>π</span>}
                            label="Pi"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                setSelectedMove({type: "piMove",nodeID: selectedNodeId})
                                setShowPrefixDialog(true);
                            }}
                        />
                        <FAB
                            icon={<DeleteIcon />}
                            label="Prune"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                pruneCallback();
                            }}
                        />
                    </Fragment>
                )}
            </ControlFAB>
           
        </Fragment>
    );

}

export default ModalTableauxFAB;