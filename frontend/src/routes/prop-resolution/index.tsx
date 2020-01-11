import { Fragment, h } from "preact";

import ClauseInput from "../../components/input/clause";

import { useState } from "preact/hooks";
import HintIcon, { Hint } from "../../components/hint";
import Format from "../../components/input/clause/format";
import Switch from "../../components/switch";
import { useAppState } from "../../helpers/app-state";
import { CnfStrategy } from "../../types/tableaux";

const Resolution: preact.FunctionalComponent = () => {
    const { smallScreen } = useAppState();
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
                <Hint top={smallScreen} />
                <div class="flex-container">
                    <div class="switches">
                        <Switch
                            label="Highlight resolution partners"
                            onChange={setHighlightSelectable}
                        />
                        <HintIcon hint="When you select a clause, all valid resolution partners will be highlighted." />
                        <br />
                        <Switch
                            label="Naive CNF transformation"
                            onChange={strategySelect}
                        />
                        <HintIcon hint="New variables may be introduced when converting a formula to CNF for efficiency. Enable this to enforce the naive transformation without extra variables." />
                    </div>
                </div>
            </div>
            <Format />
        </Fragment>
    );
};

export default Resolution;
