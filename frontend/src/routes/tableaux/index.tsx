import { useState } from "preact/hooks";

import HintIcon, { Hint } from "../../components/hint";
import ExampleList from "../../components/input/example-list";
import FormulaInput from "../../components/input/formula";
import Format from "../../components/input/formula/format";
import Radio from "../../components/input/radio";
import Switch from "../../components/input/switch";
import { Calculus, TableauxCalculusType } from "../../types/calculus";
import {
    CnfStrategy,
    FOTableauxParams,
    PropTableauxParams,
    TableauxType,
} from "../../types/calculus/tableaux";
import { useAppState } from "../../util/app-state";

interface Props {
    /**
     * Which calculus to use
     */
    calculus: TableauxCalculusType;
}

const Tableaux: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const { smallScreen } = useAppState();

    const [tabType, setTabType] = useState(TableauxType.unconnected);
    const [regular, setRegular] = useState(false);
    const [backtracking, setBacktracking] = useState(true);
    const [cnfStrategy, setStrategy] = useState(CnfStrategy.optimal);
    const [manualVarAssign, setManualVarAssign] = useState(false);

    /**
     * Handle force naive strategy switch setting
     * @param {boolean} forceNaive - Switch setting (false: optimal, true: naive)
     * @returns {void}
     */
    const strategySelect = (forceNaive: boolean) => {
        setStrategy(forceNaive ? CnfStrategy.naive : CnfStrategy.optimal);
    };

    /**
     * Handle the selection of a TableauxType
     * @param {Event} e - The event to handle
     * @returns {void}
     */
    const handleTabTypeSelect = (e: Event) => {
        const target = e.target as HTMLInputElement;
        setTabType(target.id as TableauxType);
    };

    const params: PropTableauxParams | FOTableauxParams =
        calculus == Calculus.propTableaux
            ? {
                  type: tabType,
                  regular,
                  backtracking,
                  cnfStrategy,
              }
            : {
                  type: tabType,
                  regular,
                  backtracking,
                  manualVarAssign,
              };

    /**
     * Get the right switch depending on the calculus
     * @returns {HTMLElement | void} - The switch with its hint
     */
    const getCalculusSpecificSwitch = () => {
        switch (calculus) {
            case Calculus.propTableaux:
                return (
                    <>
                        <Switch
                            label="Naive CNF transformation"
                            onChange={strategySelect}
                        />
                        <HintIcon hint="New variables may be introduced when converting a formula to CNF for efficiency. Enable this to enforce the naive transformation without extra variables." />
                    </>
                );
            case Calculus.foTableaux:
                return (
                    <>
                        <Switch
                            label="Manual unification"
                            onChange={setManualVarAssign}
                        />
                        <HintIcon hint="This forces you to provide a term for every variable of the nodes you are closing." />
                    </>
                );
            default:
                return;
        }
    };

    return (
        <>
            <Format
                logicType={
                    calculus === Calculus.foTableaux ? "fo" : "prop-clause"
                }
            />
            <FormulaInput
                calculus={calculus}
                params={params}
                placeholder={
                    calculus === Calculus.foTableaux
                        ? "\\all X: !R(f(X)) & (R(f(a)) | !R(f(b))) & \\all X: R(f(X))"
                        : "!a, c; a; !c"
                }
            />
            <div class="card">
                <h3>Parameters</h3>
                <Hint top={smallScreen} />
                <div class="flex-container">
                    <div class="first">
                        <Radio
                            id={TableauxType.unconnected}
                            group="tableauxType"
                            label="Unconnected"
                            checked={tabType === TableauxType.unconnected}
                            onSelect={handleTabTypeSelect}
                        />
                        <HintIcon hint="An unconnected tableaux poses no restrictions as to when a clause can be expanded." />
                        <br />
                        <Radio
                            id={TableauxType.weak}
                            group="tableauxType"
                            label="Weakly Connected"
                            checked={tabType === TableauxType.weak}
                            onSelect={handleTabTypeSelect}
                        />
                        <HintIcon hint="A weakly connected tableaux enforces that every inner node in the proof tree has at least one closed leaf as a child." />
                        <br />
                        <Radio
                            id={TableauxType.strong}
                            group="tableauxType"
                            label="Strongly Connected"
                            checked={tabType === TableauxType.strong}
                            onSelect={handleTabTypeSelect}
                        />
                        <HintIcon hint="A strongly connected tableaux enforces that every inner node in the proof tree has at least one child that is closed with its parent node." />
                    </div>
                    <div class="second">
                        <Switch
                            label="Backtracking"
                            onChange={setBacktracking}
                            initialState={true}
                        />
                        <HintIcon
                            hint={
                                "This allows you to undo moves during the proof." +
                                (!smallScreen ? " (Shortcut: CTRL + Z)" : "")
                            }
                        />
                        <br />
                        <Switch label="Regular" onChange={setRegular} />
                        <HintIcon hint="A regular tableaux does not allow duplicate literals on any branch in the proof tree." />
                        <br />
                        {getCalculusSpecificSwitch()}
                    </div>
                </div>
            </div>
            <ExampleList calculus={calculus} />
        </>
    );
};

export default Tableaux;
