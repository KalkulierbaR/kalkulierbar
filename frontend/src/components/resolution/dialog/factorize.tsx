import { h } from "preact";
import {useState} from "preact/hooks";
import Dialog from "../../../components/dialog";
import OptionList from "../../../components/input/option-list";
import { ResolutionCalculusType } from "../../../types/app";
import {
    Atom,
    FOAtom,
    SelectedClauses
} from "../../../types/clause";
import {
    FOResolutionState, 
    instanceOfFOResState,
    instanceOfPropResState,
    PropResolutionState,
} from "../../../types/resolution";
import {useAppState} from "../../../util/app-state";
import {stringArrayToStringMap} from "../../../util/array-to-map";
import {atomToString} from "../../../util/clause";
import {
    sendFactorize,
} from "../../../util/resolution";
import Btn from "../../btn";

interface Props {
    /**
     * Whether the dialog should be displayed open
     */
    showDialog: boolean;
    /**
     * Set the visibility of the dialog
     */
    setShowDialog: (b: boolean) => void;
    /**
     * Which calculus to use
     */
    calculus: ResolutionCalculusType;
    /**
     * The current calculus state
     */
    state: PropResolutionState | FOResolutionState;
    /**
     * The currently selected clauses
     */
    selectedClauses: SelectedClauses;
    /**
     * Set selected clauses
     */
    setSelectedClauses: (clauses: SelectedClauses) => void;
}

const ResolutionFactorizeDialog: preact.FunctionalComponent<Props> = ({
    showDialog,
    setShowDialog,
    calculus,
    state,
    selectedClauses,
    setSelectedClauses,
}) => {
    const {
        server,
        onError,
        onChange,
    } = useAppState();
    const apiInfo = { onChange, onError, server };

    const [factorizeAtomIndices, setFactorizeAtomIndices] = useState(new Set<number>());

    /**
     * Get factorize options for the factorize dialog
     * @returns {Map<string,number>} - The factorize options
     */
    const factorizeOptions = () => {
        let options = new Map<number, string>();
        if (selectedClauses !== undefined) {
            if (instanceOfPropResState(state, calculus)) {
                options = stringArrayToStringMap(
                    state.clauseSet.clauses[selectedClauses[0]].atoms.map(
                        (atom: Atom) => atomToString(atom)
                    )
                );
            } else if (instanceOfFOResState(state, calculus)) {
                options = stringArrayToStringMap(
                    state.clauseSet.clauses[selectedClauses[0]].atoms.map(
                        (atom: FOAtom) => atomToString(atom)
                    )
                );
            }
        }
        return options;
    };
    
    /**
     * Handler for the selection of an factorizeOption in the FO factorize dialog
     * @param {[number, string]} optionKeyValuePair - The key value pair of the selected option
     * @returns {void}
     */
    const selectFactorizeOption = (optionKeyValuePair: [number, string]) => {
        const atomIndex = optionKeyValuePair[0];

        const newSet = new Set(factorizeAtomIndices);
        if (newSet.has(atomIndex)) {
            // Same option was selected again -> deselect it
            newSet.delete(atomIndex);
        } else {
            newSet.add(atomIndex);
        }
        setFactorizeAtomIndices(newSet);
    };
    
    return (
        <Dialog
            open={showDialog}
            label="Choose atoms to factorize"
            onClose={() => {
                setShowDialog(false);
                factorizeAtomIndices.clear();
            }}
        >
            <OptionList
                options={factorizeOptions()}
                selectedOptionIds={Array.from(factorizeAtomIndices)}
                selectOptionCallback={selectFactorizeOption}
            />
            <Btn
                onClick={() => {
                    sendFactorize(
                        selectedClauses![0],
                        factorizeAtomIndices,
                        calculus,
                        {...apiInfo, state},
                    );
                    setShowDialog(false);
                    factorizeAtomIndices.clear();
                    setSelectedClauses(undefined);
                }}
            >
                Factorize
            </Btn>
        </Dialog>
    );
};

export default ResolutionFactorizeDialog;
