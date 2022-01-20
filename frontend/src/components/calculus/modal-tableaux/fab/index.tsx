import { Fragment, h } from "preact";

import { Statistics } from "../../../../types/app/statistics";
import { ModalCalculusType } from "../../../../types/calculus";
import {
    ExpandMove,
    ModalTableauxState,
} from "../../../../types/calculus/modal-tableaux";
import { useAppState } from "../../../../util/app-state";
import { sendNodeExtend } from "../../../../util/modal-tableaux";
import DeleteIcon from "../../../icons/delete";
import ControlFAB from "../../../input/control-fab";
import FAB from "../../../input/fab";
import CenterFAB from "../../../input/fab/center";
import CheckCloseFAB from "../../../input/fab/check-close";
import DownloadFAB from "../../../input/fab/download";
import NextLeafFAB from "../../../input/fab/next-leaf";
import UndoFAB from "../../../input/fab/undo";

import * as style from "./style.scss";

// import { sendMove } from "../../../../util/api";

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
    /**
     * Function called on closeProof
     */
    closeCallback: (stat: Statistics) => void;
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
    closeCallback,
}) => {
    const { server, smallScreen, onChange, notificationHandler } =
        useAppState();

    const showUndoFAB = state.backtracking && state.moveHistory.length > 0;

    return (
        <Fragment>
            <ControlFAB
                alwaysOpen={!smallScreen}
                couldShowCheckCloseHint={state.tree[0].isClosed}
            >
                {selectedNodeId === undefined ? (
                    <Fragment>
                        <DownloadFAB
                            state={state}
                            name={calculus}
                            type={calculus}
                        />
                        {state.tree.filter((node) => !node.isClosed).length >
                            0 && <NextLeafFAB calculus={calculus} />}
                        <CenterFAB resetDragTransforms={resetDragTransforms} />
                        <CheckCloseFAB
                            calculus={calculus}
                            onProven={closeCallback}
                        />
                        {showUndoFAB && (
                            <UndoFAB
                                calculus={calculus}
                                resetDragTransform={resetDragTransform}
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
                                    state.tree,
                                    selectedNodeId,
                                    setLeafSelected,
                                    setSelectedMove,
                                    setSelectedNodeId,
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
                                    state.tree,
                                    selectedNodeId,
                                    setLeafSelected,
                                    setSelectedMove,
                                    setSelectedNodeId,
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
                                    state.tree,
                                    selectedNodeId,
                                    setLeafSelected,
                                    setSelectedMove,
                                    setSelectedNodeId,
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
                                setSelectedMove({
                                    type: "nuMove",
                                    nodeID: selectedNodeId,
                                });
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
                                setSelectedMove({
                                    type: "piMove",
                                    nodeID: selectedNodeId,
                                });
                                setShowPrefixDialog(true);
                            }}
                        />
                        {showUndoFAB && (
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
                        )}
                    </Fragment>
                )}
            </ControlFAB>
        </Fragment>
    );
};

export default ModalTableauxFAB;
