import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { AppStateUpdater } from "../../../types/app";
import { SelectNodeOptions, TableauxState } from "../../../types/tableaux";
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
import { D3Data } from "../../../components/tableaux/tree";
import TableauxTreeView from "../../../components/tableaux/tree";
import { checkClose, sendMove } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import { nextOpenLeaf } from "../../../helpers/tableaux";
import exampleState from "./example";

/**
 * Wrapper to send move request
 * @param {string} server - URL of the server
 * @param {TableauxState} state - The current State
 * @param {AppStateUpdater} stateChanger - The state update function
 * @param {Function} onError - Error handler
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
const sendBacktrack = (
    server: string,
    state: TableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void
) =>
    sendMove(
        server,
        "prop-tableaux",
        state,
        { type: "UNDO", id1: -1, id2: -1 },
        stateChanger,
        onError
    );

/**
 * Wrapper to send close request
 * @param {string} server - URL of server
 * @param {TableauxState} state - The current State
 * @param {AppStateUpdater} stateChanger - The state update function
 * @param {Function} onError - Error handler
 * @param {number} leaf - The selected leaf
 * @param {number} pred - The selected predecessor
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
const sendClose = (
    server: string,
    state: TableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    leaf: number,
    pred: number
) =>
    sendMove(
        server,
        "prop-tableaux",
        state,
        { type: "CLOSE", id1: leaf, id2: pred },
        stateChanger,
        onError
    );

/**
 * Wrapper to send move request
 * @param {string} server - URL of the server
 * @param {TableauxState} state - The current State
 * @param {AppStateUpdater} stateChanger - The state update function
 * @param {Function} onError - Error handler
 * @param {number} leaf - The selected leaf
 * @param {number} clause - The selected clause
 * @returns {Promise<void>} - Promise that resolves after the request has been handled
 */
const sendExtend = (
    server: string,
    state: TableauxState,
    stateChanger: AppStateUpdater,
    onError: (msg: string) => void,
    leaf: number,
    clause: number
) =>
    sendMove(
        server,
        "prop-tableaux",
        state,
        { type: "EXPAND", id1: leaf, id2: clause },
        stateChanger,
        onError
    );

// Component displaying the content of the prop-tableaux route
const TableauxView: preact.FunctionalComponent = () => {
    const {
        server,
        ["prop-tableaux"]: cState,
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
     * @param {D3Data} newNode - The id of the clause, which was clicked on
     * @param {boolean} ignoreClause - Whether to not select a clause
     * @returns {void}
     */
    const selectNodeCallback = (
        newNode: D3Data,
        { ignoreClause = false }: SelectNodeOptions = {}
    ) => {
        if (newNode.id === selectedNodeId) {
            // The same node was selected again => deselect it
            setSelectedNodeId(undefined);
        } else if (newNode.isLeaf) {
            // If the newly selected node is a leaf => accept new node id
            setSelectedNodeId(newNode.id);
            if (ignoreClause) {
                setSelectedClauseId(undefined);
            } else if (selectedClauseId !== undefined) {
                // The clause and node have been selected => send extend move request to backend
                sendExtend(
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
        } else if (selectedNodeId !== undefined) {
            // We already have a leaf node selected => Try close move
            // If we can't do it, let server handle it
            sendClose(
                server,
                state!,
                onChange,
                onError,
                selectedNodeId,
                newNode.id
            );
            setSelectedNodeId(undefined);
        }
    };

    if (!state) {
        // return <p>Keine Daten vorhanden</p>;
        // Default state for easy testing
        state = exampleState;
        onChange("prop-tableaux", state);
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!e.ctrlKey || e.keyCode !== 90) {
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            sendBacktrack(server, state!, onChange, onError);
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
                        <CheckCloseBtn calculus="prop-tableaux" />
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
                        <FAB
                            icon={<UndoIcon />}
                            label="Backtrack"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                sendBacktrack(
                                    server,
                                    state!,
                                    onChange,
                                    onError
                                );
                            }}
                        />
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
                                    new CustomEvent("kbar-go-to-node", {
                                        detail: { node }
                                    })
                                );
                            }}
                        />
                        <FAB
                            icon={<CenterIcon />}
                            label="Center"
                            mini={true}
                            extended={true}
                            showIconAtEnd={true}
                            onClick={() => {
                                dispatchEvent(
                                    new CustomEvent("kbar-center-tree")
                                );
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
                                    "prop-tableaux",
                                    state
                                )
                            }
                        />
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
                                dispatchEvent(
                                    new CustomEvent("kbar-center-tree")
                                );
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
