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
} from "../../../util/nc-tableaux";
import { NCTableauxState } from "../../../types/nc-tableaux";

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
    const { smallScreen, server, onError, onChange } = useAppState();

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
                <Fragment>{resetView}</Fragment>
            ) : (
                <Fragment>
                    {resetView}
                    <FAB
                        icon={null}
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
                        icon={null}
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
                        icon={null}
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
                        icon={null}
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
