import { Fragment, h } from "preact";
import { AppStateUpdater } from "../../../types/app";
import { TableauxState } from "../../../types/tableaux";
import * as style from "./style.css";

import ClauseList from "../../../components/clause-list";
import TableauxTreeView from "../../../components/tableaux/tree";

interface Props {
    state?: TableauxState;
    onChange: AppStateUpdater<"prop-tableaux">;
}

const TableauxView: preact.FunctionalComponent<Props> = ({ state }) => {
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
                <ClauseList clauseSet={state.clauseSet} />
                <TableauxTreeView nodes={state.nodes} />
            </div>
        </Fragment>
    );
};

export default TableauxView;
