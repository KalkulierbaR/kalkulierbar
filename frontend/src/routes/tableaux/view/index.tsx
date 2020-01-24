import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import {AppStateUpdater, TableauxCalculus} from "../../../types/app";
import {
    FoTableauxState,
    PropTableauxState,
    SelectNodeOptions,
    TableauxCloseMove,
    TableauxTreeLayoutNode
} from "../../../types/tableaux";
import * as style from "./style.scss";

import CheckCloseBtn from "../../../components/check-close";
import ClauseList from "../../../components/clause-list";
import ControlFAB from "../../../components/control-fab";
import Dialog from "../../../components/dialog";
import FAB from "../../../components/fab";
import AddIcon from "../../../components/icons/add";
import CenterIcon from "../../../components/icons/center";
import CheckCircleIcon from "../../../components/icons/check-circle";
import ExploreIcon from "../../../components/icons/explore";
import UndoIcon from "../../../components/icons/undo";
import TableauxTreeView from "../../../components/tableaux/tree";
import { checkClose, sendMove } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import { nextOpenLeaf } from "../../../helpers/tableaux";
import exampleState from "./example";

/**
 * Wrapper to send close request
 * @param {TableauxCalculus} calculus - The calculus to do the move on
 * @param {string} server - URL of server
 * @param {PropTableauxState} state - The current State
 * @param {AppStateUpdater} stateChanger - The state update function
 * @param {Function} onError - Error handler
 * @param {number} leaf - The selected leaf
 * @param {number} pred - The selected predecessor
 * @param {Map<string, string>} varAssignments - Variable assignments for manual unification
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
const sendClose = (
    calculus: TableauxCalculus,
    server: string,
    state: PropTableauxState | FoTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    leaf: number,
    pred: number,
    varAssignments?: Map<string, string>
) => {
    let move : TableauxCloseMove;
    switch (calculus) {
        case "prop-tableaux":
            move = {type: "CLOSE", id1: leaf, id2: pred};
            break;
        case "fo-tableaux":
            move = {type: "CLOSE", id1: leaf, id2: pred, varAssign: varAssignments};
            break;
    }

    sendMove(
        server,
        calculus,
        state,
        move,
        stateChanger,
        onError
    );
};

/**
 * Wrapper to send move request
 * @param {TableauxCalculus} calculus - The calculus to do the move on
 * @param {string} server - URL of the server
 * @param {PropTableauxState} state - The current State
 * @param {AppStateUpdater} stateChanger - The state update function
 * @param {Function} onError - Error handler
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
const sendBacktrack = (
    calculus: TableauxCalculus,
    server: string,
    state: PropTableauxState | FoTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void
) =>
    sendMove(
        server,
        calculus,
        state,
        { type: "UNDO", id1: -1, id2: -1},
        stateChanger,
        onError
    );

/**
 * Wrapper to send move request
 * @param {TableauxCalculus} calculus - The calculus to do the move on
 * @param {string} server - URL of the server
 * @param {PropTableauxState} state - The current State
 * @param {AppStateUpdater} stateChanger - The state update function
 * @param {Function} onError - Error handler
 * @param {number} leaf - The selected leaf
 * @param {number} clause - The selected clause
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
const sendExtend = (
    calculus: TableauxCalculus,
    server: string,
    state: PropTableauxState | FoTableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    leaf: number,
    clause: number
) =>
    sendMove(
        server,
        calculus,
        state,
        {type: "EXPAND", id1: leaf, id2: clause},
        stateChanger,
        onError
    );

interface Props {
    /**
     * Which calculus to use
     */
    calculus: TableauxCalculus;
}

const TableauxView: preact.FunctionalComponent<Props> = ({calculus}) => {
    const {
        server,
        [calculus]: cState,
        smallScreen,
        onError,
        onChange,
        onSuccess
    } = useAppState();
    let state = cState;
    const [selectedClauseId, setSelectedClauseId] = useState<
        number | undefined
    >(undefined);
    const [selectedNodeId, setSelectedNodeId] = useState<number | undefined>(
        undefined
    );

    const [showDialog, setShowDialog] = useState(false);

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
        } else {
            setSelectedClauseId(newClauseId);

            if (selectedNodeId !== undefined) {
                // The clause and node have been selected => send extend move request to backend
                sendExtend(
                    calculus,
                    server,
                    state!,
                    onChange,
                    onError,
                    selectedNodeId,
                    newClauseId
                );
                setSelectedNodeId(undefined);
                setSelectedClauseId(undefined);
            }
        }
    };

    /**
     * The function to call, when the user selects a node
     * @param {TableauxTreeLayoutNode} newNode - The id of the clause, which was clicked on
     * @param {boolean} ignoreClause - Whether to not select a clause
     * @returns {void}
     */
    const selectNodeCallback = (
        newNode: TableauxTreeLayoutNode,
        { ignoreClause = false }: SelectNodeOptions = {}
    ) => {
        if (newNode.id === selectedNodeId) {
            // The same node was selected again => deselect it
            setSelectedNodeId(undefined);
        } else if (selectedNodeId === undefined) {
            setSelectedNodeId(newNode.id);
            if (ignoreClause) {
                setSelectedClauseId(undefined);
            } else if (selectedClauseId !== undefined && newNode.children.length === 0) {
                // The clause and node have been selected => send extend move request to backend
                sendExtend(
                    calculus,
                    server,
                    state!,
                    onChange,
                    onError,
                    newNode.id,
                    selectedClauseId
                );
                setSelectedNodeId(undefined);
                setSelectedClauseId(undefined);
            }
        } else {
            const selectedNodeIsLeaf = state!.nodes[selectedNodeId].children.length === 0;
            const newNodeIsLeaf = newNode.children.length === 0;
            if (selectedNodeIsLeaf && newNodeIsLeaf || !selectedNodeIsLeaf && !newNodeIsLeaf){
                setSelectedNodeId(newNode.id);
            } else {
                // Now we have a leaf and a predecessor => Try close move
                // If we can't do it, let server handle it
                sendClose(
                    calculus,
                    server,
                    state!,
                    onChange,
                    onError,
                    newNodeIsLeaf ? newNode.id : selectedNodeId,
                    newNodeIsLeaf ? selectedNodeId : newNode.id
                );
                setSelectedNodeId(undefined);
            }
        }
    };

    if (!state) {
        // return <p>Keine Daten vorhanden</p>;
        // Default state for easy testing
        state = exampleState;
        onChange(calculus, state);
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle Crtl+z
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
                onError
            );
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [state, server, onChange, onError]);

    return (
        <Fragment>
            <h2>Tableaux View</h2>

            <div class={style.view}>
                {!smallScreen && (
                    <div>
                        <ClauseList
                            clauseSet={state!.clauseSet}
                            selectedClauseId={selectedClauseId}
                            selectClauseCallback={selectClauseCallback}
                        />
                        <CheckCloseBtn calculus={calculus} />
                    </div>
                )}

                <TableauxTreeView
                    nodes={state!.nodes}
                    smallScreen={smallScreen}
                    selectedNodeId={selectedNodeId}
                    selectNodeCallback={selectNodeCallback}
                />
            </div>

            <Dialog
                open={showDialog}
                label="Choose Clause"
                onClose={() => setShowDialog(false)}
            >
                <ClauseList
                    clauseSet={state.clauseSet}
                    selectedClauseId={undefined}
                    selectClauseCallback={(id: number) => {
                        setShowDialog(false);
                        selectClauseCallback(id);
                    }}
                />
            </Dialog>

            <ControlFAB>
                {selectedNodeId === undefined ? (
                    <Fragment>
                        {state.nodes.filter((node) => !node.isClosed).length > 0 ?
                            <FAB
                                icon={<ExploreIcon/>}
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
                                            detail: { node }
                                        })
                                    );
                                }}
                            /> : ""
                        }
                        <FAB
                            icon={<CenterIcon />}
                            label="Center"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                dispatchEvent(new CustomEvent("center"));
                            }}
                        />
                        <FAB
                            icon={<CheckCircleIcon />}
                            label="Check"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() =>
                                checkClose(
                                    server,
                                    onError,
                                    onSuccess,
                                    calculus,
                                    state
                                )
                            }
                        />
                        {state.undoEnable ?
                            <FAB
                                icon={<UndoIcon />}
                                label="Undo"
                                mini={true}
                                extended={true}
                                showIconAtEnd={true}
                                onClick={() => {
                                    sendBacktrack(
                                        calculus,
                                        server,
                                        state!,
                                        onChange,
                                        onError
                                    );
                                }}
                            /> : ""
                        }
                    </Fragment>
                ) : (
                    <Fragment>
                        <FAB
                            icon={<CenterIcon />}
                            label="Center"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                dispatchEvent(new CustomEvent("center"));
                            }}
                        />
                        <FAB
                            icon={<AddIcon />}
                            label="Expand"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                setShowDialog(!showDialog);
                            }}
                        />
                    </Fragment>
                )}
            </ControlFAB>
        </Fragment>
    );
};

export default TableauxView;
