import { Fragment, h } from "preact";
import { AppStateUpdater } from "../../../types/app";
import { TableauxMove, TableauxState } from "../../../types/tableaux";
import * as style from "./style.css";

import ClauseList from "../../../components/clause-list";
import TableauxTreeView from "../../../components/tableaux/tree";
import exampleState from "./example";

interface Props {
    server: string;
    state?: TableauxState;
    onChange: AppStateUpdater<"prop-tableaux">;
}

const sendMove = async (
    url: string,
    state: TableauxState,
    move: TableauxMove,
    stateChanger: AppStateUpdater<"prop-tableaux">
) => {
    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "text/plain"
            },
            method: "POST",
            body: `move=${JSON.stringify(move)}&state=${JSON.stringify(state)}`
        });
        const parsed = await res.json();

        // TODO: handle errors
        stateChanger("prop-tableaux", parsed);
    } catch (e) {
        console.log(e);
    }
};

const sendClose = (
    url: string,
    state: TableauxState,
    stateChanger: AppStateUpdater<"prop-tableaux">,
    leaf: number,
    pred: number
) => sendMove(url, state, { type: "c", id1: leaf, id2: pred }, stateChanger);

const TableauxView: preact.FunctionalComponent<Props> = ({
    state,
    server,
    onChange
}) => {
    if (!state) {
        // return <p>Keine Daten vorhanden</p>;
        // Default state for easy testing
        state = exampleState;
    }

    const url = `${server}/prop-tableaux/`;
    const moveUrl = url + "move";

    return (
        <Fragment>
            <h2>Tableaux View</h2>
            <div class={style.view}>
                <ClauseList clauseSet={state.clauseSet} />
                <TableauxTreeView
                    nodes={state.nodes}
                    onClose={(leaf, pred) =>
                        sendClose(moveUrl, state!, onChange, leaf, pred)
                    }
                />
            </div>
        </Fragment>
    );
};

export default TableauxView;
