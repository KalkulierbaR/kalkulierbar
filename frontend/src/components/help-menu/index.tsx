import {Fragment, h} from "preact";
import {useState} from "preact/hooks";
import {CalculusType, TableauxCalculus, TutorialMode} from "../../types/app";
import {useAppState} from "../../util/app-state";
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
    const { tutorialMode } = useAppState();
    const [showDialog, setShowDialog] = useState(tutorialMode  !== TutorialMode.None);
    
    return (
        <Fragment>
            <FAB
                class={style.helpMenu}
                label="Help"
                icon={<InfoIcon fill="#fff" />}
                showIconAtEnd={true}
                extended={true}
                mini={true}
                onClick={() => setShowDialog(true)}
            />
            <Dialog
                open={showDialog}
                label="Tutorial"
                onClose={() => setShowDialog(false)}
            >
                {TableauxCalculus.includes(calculus) &&
                    <div class="flex-container">
                        <div class={`first  ${style.firstSpace}`}>
                            <h3>Expand move</h3>
                            <img src="../../assets/gifs/prop_tableaux_expand.gif" alt="" />
                            <p>You can expand the tree by choosing a leaf and a clause.</p>
                        </div>
                        <div class="second">
                            <h3>Close move</h3>
                            <img src="../../assets/gifs/prop_tableaux_close.gif" alt="" />
                            <p>Close all leafs with complementary nodes in the tree path.</p>
                        </div>
                    </div>
                }
                <p>
                    <Btn onClick={() => setShowDialog(false)}>Okay I got it</Btn>
                </p>
            </Dialog>
        </Fragment>
    );
};

export default HelpMenu;
