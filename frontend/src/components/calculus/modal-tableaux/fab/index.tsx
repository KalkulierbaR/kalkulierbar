import { ModalCalculusType } from "../../../../types/calculus";
import { ModalTableauxState } from "../../../../types/calculus/modal-tableaux";
import { useAppState } from "../../../../util/app-state";
import { Fragment, h } from "preact";
import DownloadFAB from "../../../input/fab/download";
import ControlFAB from "../../../input/control-fab";
import FAB from "../../../input/fab";
import ExploreIcon from "../../../icons/explore";
import { nextOpenLeaf } from "../../../../util/modal-tableaux";
import CenterFAB from "../../../input/fab/center";
import CheckCloseFAB from "../../../input/fab/check-close";
import { sendBacktrack } from "../../../../util/modal-tableaux";
import UndoIcon from "../../../icons/undo";
import { sendMove } from "../../../../util/api";

import * as style from "./style.scss";


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
     * Callback if expand FAB is clicked
     */
    expandCallback: () => void;
    /**
     * Whether lemma mode is enabled
     */
    lemmaMode: boolean;
    /**
     * Callback if lemma FAB is clicked
     */
    lemmaCallback: () => void;
    /**
     * Callback to reset a specific drag
     */
    resetDragTransform: (id: number) => void;
    /**
     * Callback to reset all drags
     */
    resetDragTransforms: () => void;
}

const ModalTableauxFAB: preact.FunctionalComponent<Props> = ({
    calculus,
    state,
    selectedNodeId,
    expandCallback,
    lemmaMode,
    lemmaCallback,
    resetDragTransform,
    resetDragTransforms,
}) => {
    
    const {
        server,
        smallScreen,
        onChange,
        notificationHandler,
    } = useAppState();

    const showUndoFAB = state.usedBacktracking && state.moveHistory.length > 0;

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
                            icon={<span class={style.greekLetter}>α</span>}
                            label="Alpha"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                sendMove(server,calculus,state,{type: "alphaMove", nodeID: selectedNodeId, leafID: null},onChange,notificationHandler);
                            }}
                        />
                        <FAB
                            icon={<span class={style.greekLetter}>β</span>}
                            label="Beta"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                sendMove(server,calculus,state,{type: "betaMove", nodeID: selectedNodeId, leafID: null},onChange,notificationHandler);
                            }}
                        />
                        <FAB
                            icon={<span class={style.greekLetter}>β</span>}
                            label="Nu"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                sendMove(server,calculus,state,{type: "nuMove", nodeID: selectedNodeId, leafID: null},onChange,notificationHandler);
                            }}
                        />
                        <FAB
                            icon={<span class={style.greekLetter}>π</span>}
                            label="Pi"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                sendMove(server,calculus,state,{type: "piMove", nodeID: selectedNodeId, leafID: null},onChange,notificationHandler);
                            }}
                        />
                    </Fragment>
                )}
            </ControlFAB>
           
        </Fragment>
    );

}

export default ModalTableauxFAB;