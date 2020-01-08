import { Component, Fragment, h } from "preact";
import * as style from "./style.scss";

import ReactHintFactory from 'react-hint';
import 'react-hint/css/index.css';
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
                <ReactHint autoPosition={true} events={true} persist={false} />
                <div class={style.radioGroup}>
                    <Radio
                        id={TableauxType.unconnected}
                        group="connected"
                        label="Unconnected"
                        checked={tabType === TableauxType.unconnected}
                        onSelect={handleTabTypeSelect}
                        hint="Every leaf of each path has to be closed"
                    />

                    <Radio
                        id={TableauxType.weak}
                        group="connected"
                        label="Weakly Connected"
                        checked={tabType === TableauxType.weak}
                        onSelect={handleTabTypeSelect}
                        hint="Every non-leaf and non-root node has to have at least one child that is a closed leaf"
                    />
                    <Radio
                        id={TableauxType.strong}
                        group="connected"
                        label="Strongly Connected"
                        checked={tabType === TableauxType.strong}
                        onSelect={handleTabTypeSelect}
                        hint="Analogous to weak connectedness but at least one new leaf has to be closed with its direct parent node"
                    />
                </div>
                <br/>
                <Switch
                    label="Regular"
                    onChange={setRegular}
                    hint="Does not permit duplicate atoms (same variable name and negation state) on any path of the tree"
                />
                <br/>
                <Switch
                    label="Backtracking"
                    onChange={setBacktracking}
                    hint="Enables ability to undo last move"
                />
                <br/>
                <Switch
                    label="Force naive CNF transformation"
                    onChange={strategySelect}
                    hint="Transform formulas naive with the conjunctive normal form"
                />
            </div>
            <Format />
        </Fragment>
    );
};

export default Tableaux;
