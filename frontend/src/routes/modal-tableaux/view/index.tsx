import { Fragment, h } from "preact";
import { route } from "preact-router";
import { useCallback, useEffect, useState } from "preact/hooks";

import ModalTableauxFAB from "../../../components/calculus/modal-tableaux/fab";
import ModalTableauxTreeView from "../../../components/calculus/modal-tableaux/tree";
import PrefixDialog from "../../../components/dialog/prefix-dialog";
import SaveStatsDialog from "../../../components/dialog/save-stats-dialog";
import TutorialDialog from "../../../components/tutorial/dialog";
import { Statistics } from "../../../types/app/statistics";
import { Calculus, ModalCalculusType } from "../../../types/calculus";
import {
    ExpandMove,
    ModalTableauxTreeLayoutNode,
} from "../../../types/calculus/modal-tableaux";
import { DragTransform } from "../../../types/ui";
import { saveStatistics, sendMove } from "../../../util/api";
import { useAppState } from "../../../util/app-state";
import {
    getLeaves,
    nodeName,
    sendBacktrack,
} from "../../../util/modal-tableaux";
import { updateDragTransform } from "../../../util/tableaux";

interface Props {
    calculus: ModalCalculusType;
}

const ModalTableauxView: preact.FunctionComponent<Props> = ({ calculus }) => {
    const {
        server,
        "signed-modal-tableaux": cState,
        smallScreen,
        notificationHandler,
        onChange,
    } = useAppState();

    const state = cState;
    if (!state) {
        route(`/${Calculus.modalTableaux}`);
        return null;
    }
    const [selectedNodeId, setSelectedNodeId] = useState<number | undefined>(
        undefined,
    );
    const [leafSelection, setLeafSelection] = useState<boolean>(false);
    const [selectedMove, setSelectedMove] = useState<ExpandMove | undefined>(
        undefined,
    );

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

    const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);

    const [stats, setStats] = useState<Statistics | undefined>(undefined);

    /**
     * Gets called each time a node gets selected or deselected
     * @param {ModalTableauxTreeLayoutNode} newNode the selected Node
     * @returns {void}
     */
    const selectNodeCallback = (newNode: ModalTableauxTreeLayoutNode) => {
        if (newNode.id === selectedNodeId) {
            setSelectedNodeId(undefined);
            setSelectedMove(undefined);
            setLeafSelection(false);
        } else if (selectedNodeId === undefined) {
            setSelectedNodeId(newNode.id);
        } else if (
            leafSelection === true &&
            selectedMove !== undefined &&
            getLeaves(state.nodes, state.nodes[selectedNodeId]).includes(
                newNode.id,
            )
        ) {
            selectedMove.leafID = newNode.id;
            sendMove(
                server,
                calculus,
                state,
                selectedMove,
                onChange,
                notificationHandler,
            );
            setSelectedNodeId(undefined);
            setSelectedMove(undefined);
            setLeafSelection(false);
        } else {
            sendMove(
                server,
                calculus,
                state,
                { type: "close", nodeID: selectedNodeId, leafID: newNode.id },
                onChange,
                notificationHandler,
            );
            setSelectedNodeId(undefined);
        }
    };

    /**
     * Sends the changed prefix to the backend
     * @param {number} prefix the index of the prefix
     * @returns {void}
     */
    const sendPrefix = (prefix: number) => {
        if (selectedNodeId === undefined) return;

        const leaves = getLeaves(state.nodes, state.nodes[selectedNodeId]);
        if (leaves.length > 1) {
            setLeafSelection(true);
            setSelectedMove({
                type: selectedMove?.type,
                nodeID: selectedNodeId,
                leafID: selectedMove?.leafID,
                prefix,
            });
        } else {
            sendMove(
                server,
                calculus,
                state,
                {
                    type: selectedMove?.type,
                    nodeID: selectedNodeId,
                    leafID: leaves[0],
                    prefix,
                },
                onChange,
                notificationHandler,
            );
            setSelectedNodeId(undefined);
            setSelectedMove(undefined);
        }
        setShowPrefixDialog(false);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle (Crtl + Z)
            if (!e.ctrlKey || e.shiftKey || e.metaKey || e.keyCode !== 90) {
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            sendBacktrack(
                calculus,
                server,
                state,
                onChange,
                notificationHandler,
            );
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [state, server, onChange, notificationHandler]);

    /**
     * Saves the closed Proof in the DB
     * @param {string} userName the name of the user who closed the proof
     * @returns {void}
     */
    const saveStatisticsCallback = (userName: string) => {
        if (userName === "") return;

        saveStatistics(server, calculus, state, notificationHandler, userName);
        setShowSaveDialog(false);
    };

    return (
        <Fragment>
            <h2>Modal Tableaux View</h2>

            <ModalTableauxTreeView
                nodes={state.nodes}
                smallScreen={smallScreen}
                selectedNodeId={selectedNodeId}
                selectNodeCallback={selectNodeCallback}
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
                    );
                }}
                closeCallback={(statistics: Statistics) => {
                    setStats(statistics);
                    setShowSaveDialog(true);
                }}
            />

            <PrefixDialog
                open={showPrefixDialog}
                onClose={() => setShowPrefixDialog(false)}
                prefixOrigin={nodeName(state.nodes[selectedNodeId!])}
                submitPrefixCallback={sendPrefix}
                notificationHandler={notificationHandler}
            />

            <SaveStatsDialog
                open={showSaveDialog}
                onClose={() => setShowSaveDialog(false)}
                submitCallback={saveStatisticsCallback}
                stats={stats}
            />

            <TutorialDialog calculus={calculus} />
        </Fragment>
    );
};

export default ModalTableauxView;
