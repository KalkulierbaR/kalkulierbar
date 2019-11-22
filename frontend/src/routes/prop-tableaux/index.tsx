import { h } from "preact";
import * as style from "./style.css";

import ClauseInput from "../../components/input/clause";
import { AppStateUpdater } from "../../types/app";
import { TableauxState } from "../../types/tableaux";

interface Props {
    server: string;
    onChange: AppStateUpdater<"prop-tableaux">;
}

const EMPTY_STATE: TableauxState = {
    clauseSet: { clauses: [] },
    tree: {}
};

const Tableaux: preact.FunctionalComponent<Props> = ({ server, onChange }) => {
    return (
        <ClauseInput
            path="prop-tableaux/"
            server={server}
            calculus="prop-tableaux"
            onChange={onChange}
        />
    );
};

export default Tableaux;
