import { h } from "preact";

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
}

const CheckCloseFAB: preact.FunctionalComponent<Props> = ({ calculus }) => {
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
                checkClose(server, notificationHandler, calculus, state);
            }}
        />
    );
};

export default CheckCloseFAB;
