import { Fragment, h } from "preact";
import * as style from "./style.scss";

import Switch from "../../components/switch";

import { useState } from "preact/hooks";
import ClauseInput from "../../components/input/clause";
import Radio from "../../components/radio";
import { CnfStrategy, TableauxParams, TableauxType } from "../../types/tableaux";

interface Props {}

const Tableaux: preact.FunctionalComponent<Props> = () => {
    const [tabType, setTabType] = useState(TableauxType.unconnected);
    const [regular, setRegular] = useState(false);
    const [cnfStrategy, setStrategy] = useState(CnfStrategy.optimal);

    /**
     * Handle the selection of a TableauxType
     * @param {Event} e - The event to handle
     * @returns {void}
     */
    const handleTabTypeSelect = (e: Event) => {
        const target = e.target as HTMLInputElement;

        setTabType(target.id as TableauxType);
    };

    /**
     * Handle force naive stragety switch setting
     * @param {boolean} forceNaive - Switch setting (false: optimal, true: naive)
     * @returns {void}
     */
    const strategySelect = (forceNaive: boolean) => {
        setStrategy(forceNaive ? CnfStrategy.naive : CnfStrategy.optimal);
    };

    const params: TableauxParams = { type: tabType, regular, cnfStrategy };

    return (
        <Fragment>
            <ClauseInput calculus="prop-tableaux" params={params} />
            <div class="card">
                <h3>Parameters</h3>
                <div class={style.form}>
                    <Switch label="Regular" onChange={setRegular} />
                    <div class={style.radioGroup}>
                        <Radio
                            id={TableauxType.unconnected}
                            group="connected"
                            label="Unconnected"
                            checked={tabType === TableauxType.unconnected}
                            onSelect={handleTabTypeSelect}
                        />
                        <Radio
                            id={TableauxType.strong}
                            group="connected"
                            label="Strongly Connected"
                            checked={tabType === TableauxType.strong}
                            onSelect={handleTabTypeSelect}
                        />
                        <Radio
                            id={TableauxType.weak}
                            group="connected"
                            label="Weakly Connected"
                            checked={tabType === TableauxType.weak}
                            onSelect={handleTabTypeSelect}
                        />
                    </div>
                    <Switch label="Force naive CNF transformation" onChange={strategySelect} />
                </div>
            </div>
            <div class="card">
                <h3>Format</h3>
                <p>Formulas can be entered in one two different formats:</p>
                <h4>Clause Sets</h4>
                <p>
                    <code>a,!c;b</code>
                </p>
                <p>
                    This formula represents the clause set{" "}
                    <code>{"{{a, ¬c}, {b}}"}</code>
                </p>
                <p>Instead of semicolons, line breaks can be used.</p>
                <h4>Propositional Formulas</h4>
                <p>
                    <code>{"a -> ( b & !c <=> a)"}</code>
                </p>
                <p>{"<=> and <->"} are synonymous.</p>
            </div>
        </Fragment>
    );
};

export default Tableaux;
