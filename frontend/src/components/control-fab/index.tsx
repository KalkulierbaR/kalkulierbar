import {h} from "preact";
import {useState} from "preact/hooks";
import FAB from "../fab";
import CloseIcon from "../icons/close";

import {AppStateActionType, TutorialMode} from "../../types/app";
import {useAppState} from "../../util/app-state";
import MoreIcon from "../icons/more";
import Tutorial from "../tutorial";
import * as style from "./style.scss";

interface Props {
    /**
     * Whether the FAB should start with the opened state
     */
    alwaysOpen?: boolean;
    /**
     * The components DOM children
     */
    children: any;
    /**
     *
     */
    couldShowCheckCloseHint?: boolean;
}

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
    children: any;
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

const ControlFAB: preact.FunctionalComponent<Props> = ({
    children,
    alwaysOpen = false,
    couldShowCheckCloseHint = false,
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
        if (tutorialMode === TutorialMode.None) {
            return;
        }
        dispatch({
            type: AppStateActionType.SET_TUTORIAL_MODE,
            value: TutorialMode.HighlightCheck,
        });
    };

    return (
        <div class={style.control}>
            <Menu show={show} setShow={alwaysOpen ? undefined : setShow}>
                {children}
            </Menu>
            <FAB icon={icon} label="Open Menu" onClick={handleClick} />
            {smallScreen &&
                tutorialMode === TutorialMode.HighlightFAB &&
                    <Tutorial
                        text="Try applying a rule"
                        right="125px"
                        bottom="0px"
                    />
                }
            {couldShowCheckCloseHint &&
                tutorialMode === TutorialMode.HighlightCheck &&
                    <Tutorial
                        text="Check if proof is complete"
                        right={smallScreen ? "125px" : "205px"}
                        bottom={smallScreen ? "0px" : "115px"}
                    />
                }
        </div>
    );
};

export default ControlFAB;
