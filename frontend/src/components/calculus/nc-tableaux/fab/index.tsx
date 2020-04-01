import { Fragment, h } from "preact";
import { NCTableauxState } from "../../../../types/calculus/nc-tableaux";
import { useAppState } from "../../../../util/app-state";
import {
    sendAlpha,
    sendBeta,
    sendDelta,
    sendGamma,
    sendUndo,
} from "../../../../util/nc-tableaux";
import ControlFAB from "../../../input/control-fab";
import FAB from "../../../input/fab";
import UndoIcon from "../../../icons/undo";
import * as style from "./style.scss";
import DownloadFAB from "../../../input/btn/download";
import { Calculus } from "../../../../types/calculus";
import CheckCloseFAB from "../../../input/fab/check-close";
import CenterFAB from "../../../input/fab/center";

interface Props {
    /**
     * The NCTableaux state
     */
    state: NCTableauxState;
    /**
     * The selected node's id
     */
    selectedNodeId: number | undefined;
    /**
     * The function to set a node as selected
     */
    setSelectedNode: (id: number | undefined) => void;
    /**
     * The function to reset drag transformations
     */
    resetDragTransforms: () => void;
    /**
     * Callback to reset a specific drag
     */
    resetDragTransform: (id: number) => void;
}

const NCTabFAB: preact.FunctionalComponent<Props> = ({
    selectedNodeId,
    state,
    resetDragTransforms,
    setSelectedNode,
    resetDragTransform,
}) => {
    const {
        smallScreen,
        server,
        onChange,
        notificationHandler,
    } = useAppState();

    const selectedNode =
        selectedNodeId === undefined ? undefined : state.nodes[selectedNodeId];

    const showAlpha =
        selectedNode &&
        (selectedNode.formula.type === "and" ||
            (selectedNode.formula.type === "not" &&
                selectedNode.formula.child.type === "or"));

    const showBeta =
        selectedNode &&
        (selectedNode.formula.type === "or" ||
            (selectedNode.formula.type === "not" &&
                selectedNode.formula.child.type === "and"));

    const showGamma =
        selectedNode &&
        (selectedNode.formula.type === "allquant" ||
            (selectedNode.formula.type === "not" &&
                selectedNode.formula.child.type === "exquant"));

    const showDelta =
        selectedNode &&
        (selectedNode.formula.type === "exquant" ||
            (selectedNode.formula.type === "not" &&
                selectedNode.formula.child.type === "allquant"));

    const showUndoFAB = state.moveHistory.length > 0;

    return (
        <ControlFAB
            alwaysOpen={!smallScreen}
            checkFABPositionFromBottom={showUndoFAB ? 2 : 1}
            couldShowCheckCloseHint={state.nodes[0].isClosed}
        >
            {selectedNodeId === undefined ? (
                <Fragment>
                    <DownloadFAB
                        state={state}
                        name="nc-tableaux"
                        type={Calculus.ncTableaux}
                    />
                    <CenterFAB resetDragTransforms={resetDragTransforms}/>
                    <CheckCloseFAB calculus={Calculus.ncTableaux}/>
                    {showUndoFAB && (
                        <FAB
                            icon={<UndoIcon />}
                            label="Undo"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                sendUndo(
                                    server,
                                    state,
                                    onChange,
                                    notificationHandler,
                                ).then((s) => {
                                    if (!s) {
                                        return;
                                    }
                                    for (
                                        let i = s.nodes.length;
                                        i < state.nodes.length;
                                        i++
                                    ) {
                                        resetDragTransform(i);
                                    }
                                });
                            }}
                        />
                    )}
                </Fragment>
            ) : (
                <Fragment>
                    <CenterFAB resetDragTransforms={resetDragTransforms}/>
                    {showAlpha && (
                        <FAB
                            icon={<span class={style.greekLetter}>α</span>}
                            showIconAtEnd={true}
                            mini={true}
                            extended={true}
                            label="Alpha"
                            onClick={() => {
                                sendAlpha(
                                    server,
                                    state,
                                    onChange,
                                    notificationHandler,
                                    selectedNodeId,
                                );
                                setSelectedNode(undefined);
                            }}
                        />
                    )}
                    {showBeta && (
                        <FAB
                            icon={<span class={style.greekLetter}>β</span>}
                            showIconAtEnd={true}
                            mini={true}
                            extended={true}
                            label="Beta"
                            onClick={() => {
                                sendBeta(
                                    server,
                                    state,
                                    onChange,
                                    notificationHandler,
                                    selectedNodeId,
                                );
                                setSelectedNode(undefined);
                            }}
                        />
                    )}
                    {showGamma && (
                        <FAB
                            icon={<span class={style.greekLetter}>γ</span>}
                            showIconAtEnd={true}
                            mini={true}
                            extended={true}
                            label="Gamma"
                            onClick={() => {
                                sendGamma(
                                    server,
                                    state,
                                    onChange,
                                    notificationHandler,
                                    selectedNodeId,
                                );
                                setSelectedNode(undefined);
                            }}
                        />
                    )}
                    {showDelta && (
                        <FAB
                            icon={<span class={style.greekLetter}>δ</span>}
                            showIconAtEnd={true}
                            mini={true}
                            extended={true}
                            label="Delta"
                            onClick={() => {
                                sendDelta(
                                    server,
                                    state,
                                    onChange,
                                    notificationHandler,
                                    selectedNodeId,
                                );
                                setSelectedNode(undefined);
                            }}
                        />
                    )}
                </Fragment>
            )}
        </ControlFAB>
    );
};

export default NCTabFAB;
