import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { AppStateUpdater } from "../../../types/app";
import { SelectNodeOptions, TableauxState } from "../../../types/tableaux";
import * as style from "./style.css";

import CheckCloseBtn from "../../../components/check-close";
import ClauseList from "../../../components/clause-list";
import TreeControlFAB from "../../../components/tableaux/fab";
import { D3Data } from "../../../components/tableaux/tree";
import TableauxTreeView from "../../../components/tableaux/tree";
import { sendMove } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import exampleState from "./example";

interface Props {}

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
        { type: "c", id1: leaf, id2: pred },
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
        { type: "e", id1: leaf, id2: clause },
        stateChanger,
        onError
    );

// Properties Interface for the TableauxView component
interface Props {}

// Component displaying the content of the prop-tableaux route
const TableauxView: preact.FunctionalComponent<Props> = () => {
    const {
        server,
        ["prop-tableaux"]: cState,
        smallScreen,
        onError,
        onChange
    } = useAppState();
    let state = cState;
    const [selectedClauseId, setSelectedClauseId] = useState<
        number | undefined
    >(undefined);
    const [selectedNodeId, setSelectedNodeId] = useState<number | undefined>(
        undefined
    );

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

            <TreeControlFAB
                state={state}
                selectedNodeId={selectedNodeId}
                selectedClauseCallback={selectClauseCallback}
            />
        </Fragment>
    );
};

export default TableauxView;
