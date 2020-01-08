import { Fragment, h } from "preact";

import ClauseInput from "../../components/input/clause";

import { useState } from "preact/hooks";
import HintIcon, { Hint } from "../../components/hint";
import Format from "../../components/input/clause/format";
import Switch from "../../components/switch";
import { useAppState } from "../../helpers/app-state";
import { CnfStrategy } from "../../types/tableaux";

interface Props {}

const Resolution: preact.FunctionalComponent<Props> = () => {
    const { smallScreen } = useAppState();
    const [cnfStrategy, setStrategy] = useState(CnfStrategy.optimal);

    const params = {
        cnfStrategy
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
                <Hint top={smallScreen} />
                <h3>Parameters</h3>
                <Switch
                    label="Naive transformation"
                    onChange={strategySelect}
                />
                <HintIcon hint="Transform formulas naive with the conjunctive normal form" />
            </div>
            <Format />
        </Fragment>
    );
};

export default Resolution;
