import CheckCircleIcon from "../../icons/check-circle";
import {
    disableTutorial,
    getHighlightCheck,
} from "../../../util/tutorial-mode";
import { TutorialMode } from "../../../types/app/tutorial";
import { checkClose } from "../../../util/api";
import FAB from "./index";
import { useAppState } from "../../../util/app-state";
import { CalculusType } from "../../../types/calculus";
import { h } from "preact";

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
