import { Fragment, h } from "preact";

import Switch from "../../components/switch";

import { useState } from "preact/hooks";
import HintIcon, { Hint } from "../../components/hint";
import ClauseInput from "../../components/input/clause";
import Format from "../../components/input/clause/format";
import Radio from "../../components/radio";
import { useAppState } from "../../helpers/app-state";
import {
    CnfStrategy,
    TableauxParams,
    TableauxType
} from "../../types/tableaux";

interface Props {}

const Tableaux: preact.FunctionalComponent<Props> = () => {
    const { smallScreen } = useAppState();

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
                <h3>Parameters</h3>
                <Hint top={smallScreen} />
                <div class="flex-container">
                    <div class="radios">
                        <Radio
                            id={TableauxType.unconnected}
                            group="connected"
                            label="Unconnected"
                            checked={tabType === TableauxType.unconnected}
                            onSelect={handleTabTypeSelect}
                        />
                        <HintIcon hint="Every leaf of each path has to be closed" />
                        <br />
                        <Radio
                            id={TableauxType.weak}
                            group="connected"
                            label="Weakly Connected"
                            checked={tabType === TableauxType.weak}
                            onSelect={handleTabTypeSelect}
                        />
                        <HintIcon hint="Every non-leaf and non-root node has to have at least one child that is a closed leaf" />
                        <br />
                        <Radio
                            id={TableauxType.strong}
                            group="connected"
                            label="Strongly Connected"
                            checked={tabType === TableauxType.strong}
                            onSelect={handleTabTypeSelect}
                        />
                        <HintIcon hint="Analogous to weak connectedness but at least one new leaf has to be closed with its direct parent node" />
                    </div>
                    <div class="switches">
                        <Switch label="Regular" onChange={setRegular} />
                        <HintIcon hint="Does not permit duplicate atoms (same variable name and negation state) on any path of the tree" />
                        <br />

                        <Switch
                            label="Backtracking"
                            onChange={setBacktracking}
                        />
                        <HintIcon hint="Enables ability to undo last move" />
                        <br />
                        <Switch
                            label="Naive transformation"
                            onChange={strategySelect}
                        />
                        <HintIcon hint="Transform formulas naive with the conjunctive normal form" />
                    </div>
                </div>
            </div>
            <Format />
        </Fragment>
    );
};

export default Tableaux;
