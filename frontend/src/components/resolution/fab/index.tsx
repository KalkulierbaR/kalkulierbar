import { Fragment, h } from "preact";
import ControlFAB from "../../../components/control-fab";
import FAB from "../../../components/fab";
import CenterIcon from "../../../components/icons/center";
import CheckCircleIcon from "../../../components/icons/check-circle";
import {checkClose} from "../../../helpers/api";
import { useAppState } from "../../../helpers/app-state";
import {ResolutionCalculusType} from "../../../types/app";
import {
    FOResolutionState,
    HyperResolutionMove,
    PropResolutionState
} from "../../../types/resolution";
import FactorizeIcon from "../../icons/factorize";
import HideIcon from "../../icons/hide";
import HyperIcon from "../../icons/hyper";
import ShowIcon from "../../icons/show";

interface Props {
    /**
     * Which calculus to use
     */
    calculus: ResolutionCalculusType;
    /**
     * The current calculus state
     */
    state: PropResolutionState | FOResolutionState;
    /**
     * Which node is currently selected
     */
    selectedClauseId?: number;
    /**
     * The hyper resolution move
     */
    hyperRes?: HyperResolutionMove;
    /**
     * Callback if hyper resolution FAB is clicked
     */
    hyperResCallback: () => void;
    /**
     * Callback if hide FAB is clicked
     */
    hideCallback: () => void;
    /**
     * Callback if show FAB is clicked
     */
    showCallback: () => void;
    /**
     * Callback if factorize FAB is clicked
     */
    factorizeCallback: () => void;
}

const ResolutionFAB: preact.FunctionalComponent<Props> = ({
    calculus,
    state,
    selectedClauseId,
    hyperRes,
    hyperResCallback,
    hideCallback,
    showCallback,
    factorizeCallback,
}) => {
    const {
        server,
        smallScreen,
        onError,
        onSuccess,
    } = useAppState();

    const selectedClauseAtomsGreater = (length: number) =>
        selectedClauseId === undefined
            ? false
            : state.clauseSet.clauses[selectedClauseId].atoms.length > length;

    return (
        <ControlFAB alwaysOpen={!smallScreen}>
            {selectedClauseId !== undefined ? (
                <Fragment>
                    <FAB
                        mini={true}
                        extended={true}
                        label="Hyper Resolution"
                        showIconAtEnd={true}
                        icon={
                            <HyperIcon
                                fill={hyperRes ? "#000" : undefined}
                            />
                        }
                        active={!!hyperRes}
                        onClick={hyperResCallback}
                    />
                    <FAB
                        mini={true}
                        extended={true}
                        label="Hide clause"
                        showIconAtEnd={true}
                        icon={<HideIcon />}
                        onClick={hideCallback}
                    />

                    {selectedClauseAtomsGreater(0) ? (
                        <FAB
                            mini={true}
                            extended={true}
                            label="Factorize"
                            showIconAtEnd={true}
                            icon={<FactorizeIcon />}
                            onClick={factorizeCallback}
                        />
                    ) : undefined}
                </Fragment>
            ) : undefined}
            {state!.hiddenClauses.clauses.length > 0 ? (
                <FAB
                    mini={true}
                    extended={true}
                    label="Show all"
                    showIconAtEnd={true}
                    icon={<ShowIcon />}
                    onClick={showCallback}
                />
            ) : undefined}
            <FAB
                mini={true}
                extended={true}
                label="Center"
                showIconAtEnd={true}
                icon={<CenterIcon />}
                onClick={() => dispatchEvent(new CustomEvent("center"))}
            />
            <FAB
                icon={<CheckCircleIcon />}
                label="Check"
                mini={true}
                extended={true}
                showIconAtEnd={true}
                onClick={() =>
                    checkClose(
                        server, 
                        onError, 
                        onSuccess, 
                        calculus, 
                        state
                    )
                }
            />
        </ControlFAB>
    );
};

export default ResolutionFAB;
