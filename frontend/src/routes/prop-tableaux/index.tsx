import { Component, Fragment, h } from "preact";
import * as style from "./style.scss";

import ReactHintFactory from 'react-hint'
import 'react-hint/css/index.css'
const ReactHint = ReactHintFactory({createElement: h, Component});

import Switch from "../../components/switch";

import { useState } from "preact/hooks";
import ClauseInput from "../../components/input/clause";
import Format from "../../components/input/clause/format";
import Radio from "../../components/radio";
import {
    CnfStrategy,
    TableauxParams,
    TableauxType
} from "../../types/tableaux";

interface Props {}

const Tableaux: preact.FunctionalComponent<Props> = () => {
    const [tabType, setTabType] = useState(TableauxType.unconnected);
    const [regular, setRegular] = useState(false);
    const [backtracking, setBacktracking] = useState(false);
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
     * Handle force naive strategy switch setting
     * @param {boolean} forceNaive - Switch setting (false: optimal, true: naive)
     * @returns {void}
     */
    const strategySelect = (forceNaive: boolean) => {
        setStrategy(forceNaive ? CnfStrategy.naive : CnfStrategy.optimal);
    };

    const params: TableauxParams = {
        type: tabType,
        regular,
        backtracking,
        cnfStrategy
    };

    return (
        <Fragment>
            <ClauseInput calculus="prop-tableaux" params={params} />
            <div class="card">
                <ReactHint autoPosition={true} events={true} />
                <h3>Parameters</h3>
                <div class={style.radioGroup}>
                    <Radio
                        id={TableauxType.unconnected}
                        group="connected"
                        label="Unconnected"
                        checked={tabType === TableauxType.unconnected}
                        onSelect={handleTabTypeSelect}
                        hint="Tip 1"
                    />
                    <Radio
                        id={TableauxType.strong}
                        group="connected"
                        label="Strongly Connected"
                        checked={tabType === TableauxType.strong}
                        onSelect={handleTabTypeSelect}
                        hint="Tip 2"
                    />
                    <Radio
                        id={TableauxType.weak}
                        group="connected"
                        label="Weakly Connected"
                        checked={tabType === TableauxType.weak}
                        onSelect={handleTabTypeSelect}
                        hint="Tip 3"
                    />
                </div>
                <br/>
                <Switch
                    label="Regular"
                    onChange={setRegular}
                    hint="Tip 4"
                />
                <br/>
                <Switch
                    label="Backtracking"
                    onChange={setBacktracking}
                    hint="Tip 5"
                />
                <br/>
                <Switch
                    label="Force naive CNF transformation"
                    onChange={strategySelect}
                    hint="Tip 6"
                />
            </div>
            <Format />
        </Fragment>
    );
};

export default Tableaux;
