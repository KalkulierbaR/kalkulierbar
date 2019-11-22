import { h } from "preact";
import { StateUpdater, useState } from "preact/hooks";
import * as style from "./style.css";

import ClauseInput from "../../components/input/clause";
import { AppState } from "../../types/app";
import { TableauxState } from "../../types/tableaux";

interface Props {
    server: string;
    setState: StateUpdater<AppState>;
}

const EMPTY_STATE: TableauxState = {
    clauseSet: { clauses: [] },
    tree: {}
};

const Tableaux: preact.FunctionalComponent<Props> = ({ server, setState }) => {
    return (
        <ClauseInput
            path="prop-tableaux/"
            server={server}
            calculus="prop-tableaux"
            setState={setState}
        />
    );
};

export default Tableaux;
