import { Fragment, h } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import Dialog from "../../../components/dialog";
import TutorialDialog from "../../../components/tutorial/dialog";
import OptionList from "../../../components/input/option-list";
import VarAssignDialog from "../../../components/dialog/var-assign";
import TableauxFAB from "../../../components/calculus/tableaux/fab";
import TableauxTreeView from "../../../components/calculus/tableaux/tree";
import { TableauxCalculusType } from "../../../types/calculus";
import {
    instanceOfFOTabState,
    instanceOfPropTabState,
    SelectNodeOptions,
    TableauxTreeLayoutNode,
    VarAssign,
} from "../../../types/calculus/tableaux";
import { DragTransform } from "../../../types/ui";
import { useAppState } from "../../../util/app-state";
import {
    checkRelationsForVar,
    clauseSetToStringMap,
} from "../../../util/clause";
import {
    nodeName,
    sendBacktrack,
    sendClose,
    sendExtend,
    sendLemma,
    updateDragTransform,
} from "../../../util/tableaux";
import * as style from "./style.scss";
import { route } from "preact-router";

interface Props {
    /**
     * Which calculus to use
     */
    calculus: TableauxCalculusType;
}

const TableauxView: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const {
        server,
        [calculus]: cState,
        smallScreen,
        notificationHandler,
        onChange,
    } = useAppState();

    const state = cState;
    if (!state) {
        route(`/${calculus}`);
        return null;
    }

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

    const clauseOptions = clauseSetToStringMap(state.clauseSet);

    const [selectedClauseId, setSelectedClauseId] = useState<
        number | undefined
    >(undefined);
    const [selectedNodeId, setSelectedNodeId] = useState<number | undefined>(
        undefined,
    );
    const [showClauseDialog, setShowClauseDialog] = useState(false);

    const [showVarAssignDialog, setShowVarAssignDialog] = useState(false);
    const [varAssignSecondNodeId, setVarAssignSecondNodeId] = useState<
        number | undefined
    >(undefined);
    const [varsToAssign, setVarsToAssign] = useState<string[]>([]);
    const [varOrigins, setVarOrigins] = useState<string[]>([]);

    const [lemmaMode, setLemmaMode] = useState(false);

    const selectedNode =
        selectedNodeId !== undefined ? state.nodes[selectedNodeId] : undefined;
    const selectedNodeIsLeaf =
        selectedNode !== undefined && selectedNode.children.length === 0;

    /**
     * The function to call, when the user selects a clause
     * @param {number} newClauseId - The id of the clause, which was clicked on
     * @returns {void}
     */
    const selectClauseCallback = (newClauseId: number) => {
        if (newClauseId === selectedClauseId) {
            // The same clause was selected again => deselect it
            setSelectedClauseId(undefined);
            setSelectedNodeId(undefined);
        } else if (selectedNodeId !== undefined) {
            // The clause and node have been selected => send extend move request to backend
            sendExtend(
                calculus,
                server,
                state!,
                onChange,
                notificationHandler,
                selectedNodeId,
                newClauseId,
            );
            setSelectedNodeId(undefined);
            setSelectedClauseId(undefined);
        } else {
            setSelectedClauseId(newClauseId);
        }
    };

    /**
     * The function to call, when the user selects a node
     * @param {TableauxTreeLayoutNode} newNode - The node which was clicked on
     * @param {boolean} ignoreClause - Whether to ignore the clause if one is selected
     * @returns {void}
     */
    const selectNodeCallback = (
        newNode: TableauxTreeLayoutNode,
        { ignoreClause = false }: SelectNodeOptions = {},
    ) => {
        const newNodeIsLeaf = newNode.children.length === 0;

        if (newNode.id === selectedNodeId) {
            // The same node was selected again => deselect it
            setSelectedNodeId(undefined);
        } else if (selectedNodeId === undefined) {
            setSelectedNodeId(newNode.id);
            if (ignoreClause) {
                setSelectedClauseId(undefined);
            } else if (selectedClauseId !== undefined && newNodeIsLeaf) {
                // The clause and node have been selected => send extend move request to backend
                sendExtend(
                    calculus,
                    server,
                    state!,
                    onChange,
                    notificationHandler,
                    newNode.id,
                    selectedClauseId,
                );
                setSelectedNodeId(undefined);
                setSelectedClauseId(undefined);
            }
        } else if (
            lemmaMode &&
            selectedNodeIsLeaf &&
            !selectedNode!.isClosed &&
            newNode.isClosed
        ) {
            // Open leaf and a closed Node are selected => Try Lemma move
            sendLemma(
                calculus,
                server,
                state!,
                onChange,
                notificationHandler,
                selectedNodeId,
                newNode.id,
            );
            setSelectedNodeId(undefined);
            setLemmaMode(false);
        } else if (
            // Don't select two leafs or two nodes at the same time
            (selectedNodeIsLeaf && newNodeIsLeaf) ||
            (!selectedNodeIsLeaf && !newNodeIsLeaf)
        ) {
            setSelectedNodeId(newNode.id);
        } else if (instanceOfPropTabState(state, calculus)) {
            // Now we have a leaf and a predecessor => Try close move
            // If we can't do it, let server handle it
            sendClose(
                calculus,
                server,
                state!,
                onChange,
                notificationHandler,
                newNodeIsLeaf ? newNode.id : selectedNodeId,
                newNodeIsLeaf ? selectedNodeId : newNode.id,
            );
            setSelectedNodeId(undefined);
        } else if (instanceOfFOTabState(state, calculus)) {
            // Prepare dialog for automatic/manual unification
            setVarAssignSecondNodeId(newNode.id);
            const vars = checkRelationsForVar([
                selectedNode!.relation!,
                newNode.relation!,
            ]);
            if (vars.length <= 0) {
                sendFOClose(false, {});
                return;
            }
            setVarOrigins([nodeName(selectedNode!), nodeName(newNode)]);
            setVarsToAssign(vars);
            setShowVarAssignDialog(true);
        }
        setLemmaMode(false);
    };

    /**
     * FO Tableaux: Submit a close move containing variable assignment rules
     * @param {boolean} autoAssign - Automatically assign variables if this is set to true
     * @param {VarAssign} varAssign - Variable assignments by the user
     * @returns {void | Error} - Error if the two nodes for the close move can't be identified
     */
    const sendFOClose = (autoAssign: boolean, varAssign: VarAssign = {}) => {
        const leaf = selectedNodeIsLeaf
            ? selectedNodeId
            : varAssignSecondNodeId;
        const pred = selectedNodeIsLeaf
            ? varAssignSecondNodeId
            : selectedNodeId;
        sendClose(
            calculus,
            server,
            state!,
            onChange,
            notificationHandler,
            leaf!,
            pred!,
            autoAssign,
            varAssign,
            () => {
                setSelectedNodeId(undefined);
                setVarAssignSecondNodeId(undefined);
                setShowVarAssignDialog(false);
            },
        );
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
                state!,
                onChange,
                notificationHandler,
            );
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [state, server, onChange, notificationHandler]);

    return (
        <Fragment>
            <h2>Tableaux View</h2>

            <div class={style.view}>
                {!smallScreen && (
                    <div>
                        <OptionList
                            options={clauseOptions}
                            selectedOptionIds={
                                selectedClauseId !== undefined
                                    ? [selectedClauseId]
                                    : undefined
                            }
                            selectOptionCallback={(keyValuePair) =>
                                selectClauseCallback(keyValuePair[0])
                            }
                        />
                    </div>
                )}

                <TableauxTreeView
                    nodes={state.nodes}
                    smallScreen={smallScreen}
                    selectedNodeId={selectedNodeId}
                    selectNodeCallback={selectNodeCallback}
                    lemmaNodesSelectable={lemmaMode}
                    dragTransforms={dragTransforms}
                    onDrag={onDrag}
                />
            </div>

            <Dialog
                open={showClauseDialog}
                label="Choose Clause"
                onClose={() => setShowClauseDialog(false)}
            >
                <OptionList
                    options={clauseOptions}
                    selectOptionCallback={(keyValuePair) => {
                        setShowClauseDialog(false);
                        selectClauseCallback(keyValuePair[0]);
                    }}
                />
            </Dialog>

            {instanceOfFOTabState(state, calculus) && (
                <VarAssignDialog
                    open={showVarAssignDialog}
                    onClose={() => setShowVarAssignDialog(false)}
                    varOrigins={varOrigins}
                    vars={varsToAssign}
                    manualVarAssignOnly={state.manualVarAssign}
                    submitVarAssignCallback={sendFOClose}
                    secondSubmitEvent={sendFOClose}
                />
            )}

            <TableauxFAB
                calculus={calculus}
                state={state}
                selectedNodeId={selectedNodeId}
                expandCallback={() => setShowClauseDialog(!showClauseDialog)}
                lemmaMode={lemmaMode}
                lemmaCallback={() => setLemmaMode(!lemmaMode)}
                resetDragTransform={resetDragTransform}
                resetDragTransforms={resetDragTransforms}
            />

            <TutorialDialog calculus={calculus} />
        </Fragment>
    );
};

export default TableauxView;
