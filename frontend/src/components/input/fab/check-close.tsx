import { h } from "preact";
import { Statistics } from "../../../types/app/statistics";

import { TutorialMode } from "../../../types/app/tutorial";
import { CalculusType } from "../../../types/calculus";
import { checkClose } from "../../../util/api";
import { useAppState } from "../../../util/app-state";
import {
    disableTutorial,
    getHighlightCheck,
} from "../../../util/tutorial-mode";
import CheckCircleIcon from "../../icons/check-circle";

import FAB from "./index";

interface Props {
    /**
     * Which calculus to use
     */
    calculus: CalculusType;
    /**
     * Function to call when the proof is valid
     */
    onProofen?: (stats: Statistics) => void;
}

const CheckCloseFAB: preact.FunctionalComponent<Props> = ({
    calculus,
    onProofen,
}) => {
    const {
        tutorialMode,
        dispatch,
        server,
        notificationHandler,
        [calculus]: state,
    } = useAppState();

    return (
        <FAB
            icon={<CheckCircleIcon />}
            label="Check"
            mini={true}
            extended={true}
            showIconAtEnd={true}
            onClick={() => {
                if (getHighlightCheck(tutorialMode)) {
                    disableTutorial(
                        dispatch,
                        tutorialMode,
                        TutorialMode.HighlightCheck,
                    );
                }
                checkClose(
                    server,
                    notificationHandler,
                    calculus,
                    state,
                    onProofen,
                );
            }}
        />
    );
};

export default CheckCloseFAB;
