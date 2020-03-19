import { Fragment, h } from "preact";
import {useState} from "preact/hooks";
import { CalculusType, TableauxCalculus } from "../../types/app";
import Btn from "../btn";
import Dialog from "../dialog";
import FAB from "../fab";
import InfoIcon from "../icons/info";
import * as style from "./style.scss";

interface Props {
    calculus: CalculusType;
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
                {TableauxCalculus.includes(calculus) ?
                    <Fragment>
                        <h3>Expand</h3>
                        <p>
                            Select a leaf which you want to expand. Now hit the action Button "EXPAND" and select a clause.
                        </p>
                        <h3>Close</h3>
                        <p>
                            Select a leaf and close it with the leaf's complementary node in the path to the root.
                        </p>
                    </Fragment>
                    : undefined
                }
                <Btn onClick={() => setShowDialog(false)}>Got it</Btn>
            </Dialog>
        </Fragment>
    );
};

export default HelpMenu;
