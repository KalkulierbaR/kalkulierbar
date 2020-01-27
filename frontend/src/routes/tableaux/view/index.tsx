import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import {AppStateUpdater, TableauxCalculus} from "../../../types/app";
import {
    FoTableauxState, instanceOfFoTableauxState, instanceOfPropTableauxState,
    PropTableauxState,
    SelectNodeOptions,
    TableauxTreeLayoutNode
} from "../../../types/tableaux";
import * as style from "./style.scss";

import CheckCloseBtn from "../../../components/check-close";
import ControlFAB from "../../../components/control-fab";
import Dialog from "../../../components/dialog";
import FAB from "../../../components/fab";
import AddIcon from "../../../components/icons/add";
import CenterIcon from "../../../components/icons/center";
import CheckCircleIcon from "../../../components/icons/check-circle";
import ExploreIcon from "../../../components/icons/explore";
import UndoIcon from "../../../components/icons/undo";
import OptionList from "../../../components/input/option-list";
import VarAssignList from "../../../components/input/var-assign-list";
import TableauxTreeView from "../../../components/tableaux/tree";
import { checkClose, sendMove } from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import {clauseSetToStringArray} from "../../../helpers/clause";
import { nextOpenLeaf } from "../../../helpers/tableaux";
import foExampleState from "./fo-example";
import propExampleState from "./prop-example";

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
    if(calculus === "prop-tableaux" && instanceOfPropTableauxState(state)) {
        sendMove(
            server,
            calculus,
            state,
            {type: "CLOSE", id1: leaf, id2: pred},
            stateChanger,
            onError
        );
    }
    else if(calculus === "fo-tableaux" && instanceOfFoTableauxState(state)){
        sendMove(
            server,
            calculus,
            state,
            {type: "CLOSE", id1: leaf, id2: pred, varAssign: varAssignments!},
            stateChanger,
            onError
        );
    }
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
) => {
    if(calculus === "prop-tableaux" && instanceOfPropTableauxState(state)) {
        sendMove(
            server,
            calculus,
            state,
            {type: "UNDO", id1: -1, id2: -1},
            stateChanger,
            onError
        );
    }
    else if(calculus === "fo-tableaux" && instanceOfFoTableauxState(state)){
        sendMove(
            server,
            calculus,
            state,
            {type: "UNDO", id1: -1, id2: -1, varAssign: new Map<string, string>()},
            stateChanger,
            onError
        );
    }
};

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
) => {
    if(calculus === "prop-tableaux" && instanceOfPropTableauxState(state)) {
        sendMove(
            server,
            calculus,
            state,
            {type: "EXPAND", id1: leaf, id2: clause},
            stateChanger,
            onError
        );
    }
    else if(calculus === "fo-tableaux" && instanceOfFoTableauxState(state)){
        sendMove(
            server,
            calculus,
            state,
            {type: "EXPAND", id1: leaf, id2: clause, varAssign: new Map<string, string>()},
            stateChanger,
            onError
        );
    }
};

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
    const [selectedClauseId, setSelectedClauseId] = useState<number | undefined>(
        undefined
    );
    const [selectedNodeId, setSelectedNodeId] = useState<number | undefined>(
        undefined
    );
    const [closeMoveSecondNodeId, setCloseMoveSecondNodeId] = useState<number | undefined>(
        undefined
    );
    const [showClauseDialog, setShowClauseDialog] = useState(
        false
    );
    const [showVarAssignDialog, setShowVarAssignDialog] = useState(
        true
    );
    const [varsToAssign, setVarsToAssign] = useState<string[]>(
        ["A", "B"]
    );

    const clauseOptions = () => {
        let options: string[] = [];
        if(calculus === "prop-tableaux" && instanceOfPropTableauxState(state)) {
            options = clauseSetToStringArray(state!.clauseSet);
        }
        if(calculus === "fo-tableaux" && instanceOfFoTableauxState(state)){
            options = state!.renderedClauseSet;
        }
        return options;
    };

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
                onError,
                selectedNodeId,
                newClauseId
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
        { ignoreClause = false }: SelectNodeOptions = {}
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
                    onError,
                    newNode.id,
                    selectedClauseId
                );
                setSelectedNodeId(undefined);
                setSelectedClauseId(undefined);
            }
        } else {
            const selectedNode = state!.nodes[selectedNodeId];
            const selectedNodeIsLeaf = selectedNode.children.length === 0;

            if (selectedNodeIsLeaf && newNodeIsLeaf || !selectedNodeIsLeaf && !newNodeIsLeaf){
                setSelectedNodeId(newNode.id);
            } else {
                switch (calculus) {
                    case "prop-tableaux":
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
                        break;
                    case "fo-tableaux":
                        // Open dialog for automatic/manual unification
                        setCloseMoveSecondNodeId(newNode.id);
                        const vars = ["A", "B"]; // @todo proper filtering to get distinct values
                        if(vars.length <= 0) {
                            break;
                        }
                        setVarsToAssign(vars);
                        setShowVarAssignDialog(true);
                }
            }
        }
    };

    const submitVarAssign = (varAssign: Map<string, string>) => {
        if(selectedNodeId !== undefined && closeMoveSecondNodeId !== undefined) {
            const selectedNode = state!.nodes[selectedNodeId];
            const leafNodeId = selectedNode.children.length === 0 ? selectedNodeId : closeMoveSecondNodeId;
            const predNodeId = selectedNode.children.length === 0 ? closeMoveSecondNodeId : selectedNodeId;

            sendClose(
                calculus,
                server,
                state!,
                onChange,
                onError,
                leafNodeId,
                predNodeId,
                varAssign
            );
            setSelectedNodeId(undefined);
            setCloseMoveSecondNodeId(undefined);
            return;
        }
        throw new Error("Close move went wrong, since selected nodes could not be identified.");
    };

    if (!state) {
        // return <p>Keine Daten vorhanden</p>;
        // Default state for easy testing
        switch (calculus) {
            case "prop-tableaux":
                state = propExampleState;
                break;
            case "fo-tableaux":
                state = foExampleState;
                break;
        }
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
                        <OptionList
                            options={clauseOptions()}
                            selectedOptionId={selectedClauseId}
                            selectOptionCallback={selectClauseCallback}
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
                open={showClauseDialog}
                label="Choose Clause"
                onClose={() => setShowClauseDialog(false)}
            >
                <OptionList
                    options={clauseOptions()}
                    selectedOptionId={undefined}
                    selectOptionCallback={(id: number) => {
                        setShowClauseDialog(false);
                        selectClauseCallback(id);
                    }}
                />
            </Dialog>

            {calculus === "fo-tableaux" && instanceOfFoTableauxState(state) ?
                <Dialog
                    open={showVarAssignDialog}
                    label={state.manualVarAssign ?
                        "Choose all variable assignments" :
                        "Choose variable assignments or leave them blank"
                    }
                    onClose={() => setShowVarAssignDialog(false)}
                >
                    <VarAssignList
                        vars={varsToAssign}
                        requireAll={state.manualVarAssign}
                        submitVarAssignCallback={() => submitVarAssign}
                        submitLabel="Assign variables"
                    />
                </Dialog> : ""
            }

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
                        {state.backtracking ?
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
                                setShowClauseDialog(!showClauseDialog);
                            }}
                        />
                    </Fragment>
                )}
            </ControlFAB>
        </Fragment>
    );
};

export default TableauxView;
