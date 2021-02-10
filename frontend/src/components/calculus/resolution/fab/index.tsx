import { Fragment, h } from "preact";

import * as style from "../../../../routes/resolution/view/style.scss";
import { ResolutionCalculusType } from "../../../../types/calculus";
import { SelectedClauses } from "../../../../types/calculus/clause";
import {
    FOResolutionState,
    HyperResolutionMove,
    instanceOfPropResState,
    PropResolutionState,
} from "../../../../types/calculus/resolution";
import { sendMove } from "../../../../util/api";
import { useAppState } from "../../../../util/app-state";
import {
    containsEmptyClause,
    hideClause,
    sendFactorize,
    showHiddenClauses,
} from "../../../../util/resolution";
import CircleIcon from "../../../icons/circle";
import FactorizeIcon from "../../../icons/factorize";
import GridIcon from "../../../icons/grid";
import HideIcon from "../../../icons/hide";
import HyperIcon from "../../../icons/hyper";
import SendIcon from "../../../icons/send";
import ShowIcon from "../../../icons/show";
import ControlFAB from "../../../input/control-fab";
import FAB from "../../../input/fab";
import CenterFAB from "../../../input/fab/center";
import CheckCloseFAB from "../../../input/fab/check-close";
import DownloadFAB from "../../../input/fab/download";

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
     * Set selected clauses
     */
    setSelectedClauses: (clauses: SelectedClauses) => void;
    /**
     * The hyper resolution move
     */
    hyperRes?: HyperResolutionMove;
    /**
     * Set the Hyper Resolution Move
     */
    setHyperRes: (move: HyperResolutionMove | undefined) => void;
    /**
     * Set the visibility of the factorize dialog
     */
    setShowFactorizeDialog: (b: boolean) => void;
    /**
     * Whether the grid view is active
     */
    showGrid: boolean;
    /**
     * Setter for the grid view
     */
    setShowGrid: (v: boolean) => void;
}

const ResolutionFAB: preact.FunctionalComponent<Props> = ({
    calculus,
    state,
    selectedClauseId,
    setSelectedClauses,
    hyperRes,
    setHyperRes,
    setShowFactorizeDialog,
    showGrid,
    setShowGrid,
}) => {
    const {
        server,
        smallScreen,
        onChange,
        notificationHandler,
    } = useAppState();
    const apiInfo = { onChange, server, notificationHandler, state };

    return (
        <Fragment>
            <ControlFAB
                alwaysOpen={!smallScreen}
                couldShowCheckCloseHint={
                    selectedClauseId === undefined &&
                    containsEmptyClause(state.clauseSet)
                }
                checkFABPositionFromBottom={1}
            >
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
                            onClick={() => {
                                if (hyperRes) {
                                    setHyperRes(undefined);
                                    return;
                                }
                                setHyperRes({
                                    type: "res-hyper",
                                    mainID: selectedClauseId!,
                                    atomMap: {},
                                });
                            }}
                        />
                        <FAB
                            mini={true}
                            extended={true}
                            label="Hide clause"
                            showIconAtEnd={true}
                            icon={<HideIcon />}
                            onClick={() => {
                                hideClause(selectedClauseId!, calculus, {
                                    ...apiInfo,
                                    state,
                                });
                                setSelectedClauses(undefined);
                            }}
                        />
                        {state.clauseSet.clauses[selectedClauseId].atoms
                            .length > 1 && (
                            <FAB
                                mini={true}
                                extended={true}
                                label="Factorize"
                                showIconAtEnd={true}
                                icon={<FactorizeIcon />}
                                onClick={() => {
                                    if (
                                        !instanceOfPropResState(
                                            state,
                                            calculus,
                                        ) &&
                                        state.clauseSet.clauses[
                                            selectedClauseId
                                        ].atoms.length !== 2
                                    ) {
                                        setShowFactorizeDialog(true);
                                        return;
                                    }
                                    sendFactorize(
                                        selectedClauseId!,
                                        new Set<number>([0, 1]),
                                        calculus,
                                        apiInfo,
                                    );
                                    setSelectedClauses(undefined);
                                }}
                            />
                        )}
                    </Fragment>
                ) : (
                    <Fragment>
                        <FAB
                            label={showGrid ? "Show Circle" : "Show Grid"}
                            icon={showGrid ? <CircleIcon /> : <GridIcon />}
                            showIconAtEnd={true}
                            mini={true}
                            extended={true}
                            onClick={() => setShowGrid(!showGrid)}
                        />
                        <DownloadFAB
                            state={state}
                            name={calculus}
                            type={calculus}
                        />
                    </Fragment>
                )}
                {state.hiddenClauses.clauses.length > 0 && (
                    <FAB
                        mini={true}
                        extended={true}
                        label="Show all"
                        showIconAtEnd={true}
                        icon={<ShowIcon />}
                        onClick={() => {
                            showHiddenClauses(calculus, apiInfo);
                            setSelectedClauses(undefined);
                        }}
                    />
                )}
                <CenterFAB />
                {selectedClauseId === undefined && (
                    <CheckCloseFAB calculus={calculus} />
                )}
            </ControlFAB>

            {hyperRes && hyperRes.atomMap && (
                <FAB
                    class={style.hyperFab}
                    label="Send"
                    icon={<SendIcon />}
                    extended={true}
                    mini={smallScreen}
                    onClick={() => {
                        sendMove(
                            server,
                            calculus,
                            state,
                            hyperRes,
                            onChange,
                            notificationHandler,
                        );
                        setHyperRes(undefined);
                        setSelectedClauses(undefined);
                    }}
                />
            )}
        </Fragment>
    );
};

export default ResolutionFAB;
