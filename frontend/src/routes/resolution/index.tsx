import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import HintIcon, { Hint } from "../../components/hint";
import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import Radio from "../../components/input/radio";
import Switch from "../../components/input/switch";
import { Calculus, ResolutionCalculusType } from "../../types/calculus";
import { VisualHelp } from "../../types/calculus/resolution";
import { CnfStrategy } from "../../types/calculus/tableaux";
import { useAppState } from "../../util/app-state";

interface Props {
    /**
     * Which calculus to use
     */
    calculus: ResolutionCalculusType;
}

const Resolution: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const { smallScreen } = useAppState();
    const [cnfStrategy, setStrategy] = useState(CnfStrategy.optimal);
    const [visualHelp, setVisualHelp] = useState(VisualHelp.highlight);

    const fo = calculus === Calculus.foResolution;

    const params = fo
        ? { visualHelp }
        : {
              cnfStrategy,
              visualHelp,
          };

    /**
     * Handle the selection of a VisualHelp
     * @param {Event} e - The event to handle
     * @returns {void}
     */
    const handleVisualHelpSelect = (e: Event) => {
        const target = e.target as HTMLInputElement;
        setVisualHelp(target.id as VisualHelp);
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
            <Format foLogic={fo} />
            <FormulaInput calculus={calculus} params={params} foLogic={fo} />
            <div class="card">
                <h3>Parameters</h3>
                <Hint top={smallScreen} />
                <div class="flex-container">
                    <div class="first">
                        <Radio
                            id={VisualHelp.none}
                            group="visualHelp"
                            label="No visual help"
                            checked={visualHelp === VisualHelp.none}
                            onSelect={handleVisualHelpSelect}
                        />
                        <HintIcon hint="When you select a clause, resolution partners will not be highlighted." />
                        <br />
                        <Radio
                            id={VisualHelp.highlight}
                            group="visualHelp"
                            label="Highlight resolution partners"
                            checked={visualHelp === VisualHelp.highlight}
                            onSelect={handleVisualHelpSelect}
                        />
                        <HintIcon hint="When you select a clause, all valid resolution partners will be highlighted." />
                        <br />
                        <Radio
                            id={VisualHelp.rearrange}
                            group="visualHelp"
                            label="Rearrange resolution partners"
                            checked={visualHelp === VisualHelp.rearrange}
                            onSelect={handleVisualHelpSelect}
                        />
                        <HintIcon hint="When you select a clause, all valid resolution partners will be highlighted and grouped around the selected clause." />
                    </div>
                    {!fo && (
                        <div class="second">
                            <Switch
                                label="Naive CNF transformation"
                                onChange={strategySelect}
                            />

                            <HintIcon hint="New variables may be introduced when converting a formula to CNF for efficiency. Enable this to enforce the naive transformation without extra variables." />
                        </div>
                    )}
                </div>
            </div>
            <ExampleList calculus={calculus}/>
        </Fragment>
    );
};

export default Resolution;
