import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { AppStateUpdater } from "../../../types/app";
import { TableauxState } from "../../../types/tableaux";
import * as style from "./style.css";

import ClauseList from "../../../components/clause-list";
import TableauxTreeView from "../../../components/tableaux/tree";

interface Props {
    state?: TableauxState;
    onChange: AppStateUpdater<"prop-tableaux">;
}

// Availble edit modes to modify the tree
const EDIT_MODE_EXTEND = "EDIT_MODE_EXTEND";
const EDIT_MODE_CLOSE = "EDIT_MODE_CLOSE";

// View for the Tableaux ClauseList and Tree
const TableauxView: preact.FunctionalComponent<Props> = ({ state }) => {
    const [selectedEditMode, setSelectedEditMode] = useState("");
    const [selectedClauseId, setSelectedClauseId] = useState("");
    const [selectedLeafNodeId, setSelectedLeafNodeId] = useState("");
    const [selectedNoneLeafNodeId, setSelectedNoneLeafNodeId] = useState("");

    // Callback function which is called when a clause is selected by the user
    const selectClauseCallback = (newClauseKey: string) => {
        setSelectedNoneLeafNodeId("");

        if(newClauseKey === selectedClauseId){
            setSelectedClauseId("");
            setSelectedLeafNodeId("")
            setSelectedEditMode("");
        }
        else{
            setSelectedClauseId(newClauseKey);
            setSelectedEditMode(EDIT_MODE_EXTEND);
            checkExtendMove();
        }
    };

    // Callback function which is called when a lead node is selected by the user
    const selectLeafNodeCallback = (newLeafNodeId: string) => {
        setSelectedLeafNodeId(newLeafNodeId);

        if(selectedEditMode === EDIT_MODE_EXTEND){
            checkExtendMove();
        }
        else if(selectedEditMode === EDIT_MODE_CLOSE){

        }
        else{
            // Show dialog to user to decide upon the desired move
        }
    }

    // Check if the extend move can be applied
    const checkExtendMove = () => {
        if(selectedClauseId !== "" && selectedLeafNodeId !== ""){
            
        }
    }

    if (!state) {
        // return <p>Keine Daten vorhanden</p>;
        // Default state for easy testing
        state = {
            seal: "",
            clauseSet: {
                clauses: [
                    {
                        atoms: [
                            {
                                lit: "a",
                                negated: false
                            },
                            {
                                lit: "b",
                                negated: true
                            }
                        ]
                    },
                    {
                        atoms: [{ lit: "d", negated: false }]
                    }
                ]
            },
            nodes: [
                {
                    spelling: "true",
                    parent: -1,
                    negated: false,
                    isClosed: false,
                    closeRef: null,
                    children: [1, 3]
                },
                {
                    spelling: "a",
                    parent: 0,
                    negated: false,
                    isClosed: false,
                    closeRef: null,
                    children: [2]
                },
                {
                    spelling: "!b",
                    parent: 1,
                    negated: false,
                    isClosed: false,
                    closeRef: null,
                    children: []
                },
                {
                    spelling: "c",
                    parent: 0,
                    negated: false,
                    isClosed: false,
                    closeRef: null,
                    children: []
                }
            ]
        };
    }

    return (
        <Fragment>
            <h2>Tableaux View</h2>
            <div class={style.view}>
                <ClauseList clauseSet={state.clauseSet} selectedClauseId={selectedClauseId} selectClauseCallback={selectClauseCallback} />
                <TableauxTreeView nodes={state.nodes} selectedLeafNodeId={selectedLeafNodeId} selectLeafNodeCallback={selectLeafNodeCallback} />
            </div>
        </Fragment>
    );
};

export default TableauxView;
