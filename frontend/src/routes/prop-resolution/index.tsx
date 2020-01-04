import { Fragment, h } from "preact";

import ClauseInput from "../../components/input/clause";

import { useState } from "preact/hooks";
import Format from "../../components/input/clause/format";
import Switch from "../../components/switch";
import { CnfStrategy } from "../../types/tableaux";
import * as style from "./style.scss";

interface Props {}

const Resolution: preact.FunctionalComponent<Props> = () => {
    const [cnfStrategy, setStrategy] = useState(CnfStrategy.optimal);
    const [highlightSelectable, setHighlightSelectable] = useState(false);

    const params = {
        cnfStrategy,
        highlightSelectable
    };

    /**
     * Handle force naive strategy switch setting
     * @param {boolean} forceNaive - Switch setting (false: optimal, true: naive)
     * @returns {void}
     */
    const strategySelect = (forceNaive: boolean) => {
        setStrategy(forceNaive ? CnfStrategy.naive : CnfStrategy.optimal);
    };

    return (
        <Fragment>
            <ClauseInput calculus="prop-resolution" params={params} />
            <div class="card">
                <h3>Parameters</h3>
                <div class={style.form}>
                    <Switch
                        label="Force naive CNF transformation"
                        onChange={strategySelect}
                    />
                    <Switch
                        label="Highlight selectable clauses"
                        onChange={setHighlightSelectable}
                    />
                </div>
            </div>
            <Format />
        </Fragment>
    );
};

export default Resolution;
