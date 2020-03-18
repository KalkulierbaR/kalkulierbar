import { h, Fragment } from "preact";
import ControlFAB from "../../control-fab";
import CenterIcon from "../../icons/center";
import FAB from "../../fab";
import { useAppState } from "../../../util/app-state";
import {
    sendAlpha,
    sendBeta,
    sendGamma,
    sendDelta,
    sendUndo,
} from "../../../util/nc-tableaux";
import { NCTableauxState } from "../../../types/nc-tableaux";
import CheckCircleIcon from "../../icons/check-circle";
import { checkClose } from "../../../util/api";
import UndoIcon from "../../icons/undo";

import * as style from "./style.scss";

interface Props {
    state: NCTableauxState;
    selectedNodeId: number | undefined;
    setSelectedNode: (id: number | undefined) => void;
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
    const { smallScreen, server, onError, onChange, onSuccess } = useAppState();

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

    return (
        <ControlFAB alwaysOpen={!smallScreen}>
            {selectedNodeId === undefined ? (
                <Fragment>
                    {resetView}
                    <FAB
                        icon={<CheckCircleIcon />}
                        label="Check"
                        showIconAtEnd
                        mini
                        extended
                        onClick={() => {
                            checkClose(
                                server,
                                onError,
                                onSuccess,
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
                            sendUndo(server, state, onChange, onError).then(
                                (s) => {
                                    console.log(s);
                                    if (!s) return;
                                    for (
                                        let i = s.nodes.length;
                                        i < state.nodes.length;
                                        i++
                                    ) {
                                        resetDragTransform(i);
                                    }
                                },
                            );
                        }}
                    />
                </Fragment>
            ) : (
                <Fragment>
                    {resetView}
                    <FAB
                        icon={<span class={style.greekLetter}>α</span>}
                        showIconAtEnd
                        mini
                        extended
                        label="Alpha"
                        onClick={() => {
                            sendAlpha(
                                server,
                                state,
                                onChange,
                                onError,
                                selectedNodeId,
                            );
                            setSelectedNode(undefined);
                        }}
                    />
                    <FAB
                        icon={<span class={style.greekLetter}>β</span>}
                        showIconAtEnd
                        mini
                        extended
                        label="Beta"
                        onClick={() => {
                            sendBeta(
                                server,
                                state,
                                onChange,
                                onError,
                                selectedNodeId,
                            );
                            setSelectedNode(undefined);
                        }}
                    />
                    <FAB
                        icon={<span class={style.greekLetter}>γ</span>}
                        showIconAtEnd
                        mini
                        extended
                        label="Gamma"
                        onClick={() => {
                            sendGamma(
                                server,
                                state,
                                onChange,
                                onError,
                                selectedNodeId,
                            );
                            setSelectedNode(undefined);
                        }}
                    />
                    <FAB
                        icon={<span class={style.greekLetter}>δ</span>}
                        showIconAtEnd
                        mini
                        extended
                        label="Delta"
                        onClick={() => {
                            sendDelta(
                                server,
                                state,
                                onChange,
                                onError,
                                selectedNodeId,
                            );
                            setSelectedNode(undefined);
                        }}
                    />
                </Fragment>
            )}
        </ControlFAB>
    );
};

export default NCTabFAB;
