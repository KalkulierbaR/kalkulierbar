import { Fragment, h } from "preact";
import { NCTableauxState } from "../../../../types/calculus/nc-tableaux";
import { checkClose } from "../../../../util/api";
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
import CenterIcon from "../../../icons/center";
import CheckCircleIcon from "../../../icons/check-circle";
import UndoIcon from "../../../icons/undo";

import * as style from "./style.scss";

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

    const resetView = (
        <FAB
            icon={<CenterIcon />}
            label="Reset View"
            mini={true}
            extended={true}
            showIconAtEnd={true}
            onClick={() => {
                dispatchEvent(new CustomEvent("center"));
                resetDragTransforms();
            }}
        />
    );

    const couldShowCheckCloseHint = state.nodes[0].isClosed;

    return (
        <ControlFAB
            alwaysOpen={!smallScreen}
            checkFABPositionFromBottom={2}
            couldShowCheckCloseHint={couldShowCheckCloseHint}
        >
            {selectedNodeId === undefined ? (
                <Fragment>
                    {resetView}
                    <FAB
                        icon={<CheckCircleIcon />}
                        label="Check"
                        showIconAtEnd={true}
                        mini={true}
                        extended={true}
                        onClick={() => {
                            checkClose(
                                server,
                                notificationHandler,
                                "nc-tableaux",
                                state,
                            );
                        }}
                    />
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
                </Fragment>
            ) : (
                <Fragment>
                    {resetView}
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
