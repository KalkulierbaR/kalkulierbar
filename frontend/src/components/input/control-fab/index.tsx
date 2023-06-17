import { useState } from "preact/hooks";

import { TutorialMode } from "../../../types/app/tutorial";
import { useAppState } from "../../../util/app-state";
import { disableTutorial, getHighlightFAB } from "../../../util/tutorial-mode";
import CloseIcon from "../../icons/close";
import MoreIcon from "../../icons/more";
import TutorialHint from "../../tutorial/hint";
import FAB from "../fab";

import * as style from "./style.module.scss";
import type { ComponentChildren } from "preact";

interface MenuProps {
    /**
     * Shows the menu.
     */
    show: boolean;
    /**
     * Handler for changing visibility.
     */
    setShow?: (v: boolean) => void;
    /**
     * The components DOM children
     */
    children: ComponentChildren;
}

const Menu: preact.FunctionalComponent<MenuProps> = ({
    show,
    children,
    setShow,
}) => {
    return (
        <menu
            class={style.menu + (show ? " " + style.show : "")}
            onClick={setShow ? () => setShow(false) : undefined}
        >
            {children}
        </menu>
    );
};

interface ControlFABProps {
    /**
     * Whether the FAB should start with the opened state
     */
    alwaysOpen?: boolean;
    /**
     * The components DOM children
     */
    children: ComponentChildren;
    /**
     * Whether the close hint could be shown
     */
    couldShowCheckCloseHint?: boolean;
    /**
     * The position of the check FAB
     * counted from the bottom of the view (1..n)
     */
    checkFABPositionFromBottom?: number;
}

const ControlFAB: preact.FunctionalComponent<ControlFABProps> = ({
    children,
    alwaysOpen = false,
    couldShowCheckCloseHint = false,
    checkFABPositionFromBottom = 2,
}) => {
    const { smallScreen, tutorialMode, dispatch } = useAppState();
    const [show, setShow] = useState(alwaysOpen);

    const SIZE = 32;
    const FILL = "#fff";

    const icon = show ? (
        <CloseIcon fill={FILL} size={SIZE} />
    ) : (
        <MoreIcon fill={FILL} size={SIZE} />
    );

    const handleClick = () => {
        setShow(!show);
        if (!getHighlightFAB(tutorialMode)) {
            return;
        }
        disableTutorial(dispatch, tutorialMode, TutorialMode.HighlightFAB);
    };

    const checkHintBottomBigScreen = (checkFABPositionFromBottom - 1) * 48 + 70;

    return (
        <div class={style.control}>
            <Menu show={show} setShow={alwaysOpen ? undefined : setShow}>
                {children}
            </Menu>
            <FAB icon={icon} label="Open Menu" onClick={handleClick} />
            {smallScreen &&
                (tutorialMode & TutorialMode.HighlightFAB) !== 0 && (
                    <TutorialHint
                        text="Try applying a rule"
                        right="125px"
                        bottom="0px"
                    />
                )}
            {couldShowCheckCloseHint &&
                (tutorialMode & TutorialMode.HighlightCheck) !== 0 && (
                    <TutorialHint
                        text="Check if proof is complete"
                        right={smallScreen ? "125px" : "205px"}
                        bottom={
                            smallScreen
                                ? "0px"
                                : checkHintBottomBigScreen + "px"
                        }
                    />
                )}
        </div>
    );
};

export default ControlFAB;
