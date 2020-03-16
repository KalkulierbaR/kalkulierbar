import { Fragment, h } from "preact";
import {useState} from "preact/hooks";
import {Calculus} from "../../types/app";
import Dialog from "../dialog";
import FAB from "../fab";
import InfoIcon from "../icons/info";
import * as style from "./style.scss";
import Btn from "../btn";

interface Props {
    calculus: Calculus;
}

const HelpMenu: preact.FunctionalComponent<Props> = ({
    calculus,
}) => {
    const [showDialog, setShowDialog] = useState(false);
    
    return (
        <Fragment>
            <FAB
                class={style.helpMenu}
                label="Help"
                icon={<InfoIcon />}
                extended={true}
                mini={true}
                onClick={() => setShowDialog(true)}
            />
            <Dialog
                open={showDialog}
                label="Help menu"
                onClose={() => setShowDialog(false)}
            >
                <p>
                    bla bla bla
                </p>
                <Btn onClick={() => setShowDialog(false)}>Got it</Btn>
            </Dialog>
        </Fragment>
    );
};

export default HelpMenu;
