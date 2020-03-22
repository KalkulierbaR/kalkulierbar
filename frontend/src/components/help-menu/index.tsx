import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { CalculusType, TableauxCalculus, TutorialMode } from "../../types/app";
import { useAppState } from "../../util/app-state";
import Btn from "../btn";
import Dialog from "../dialog";
import FAB from "../fab";
import InfoIcon from "../icons/info";
import * as style from "./style.scss";

interface Props {
    calculus: CalculusType;
}

const HelpMenu: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const { tutorialMode } = useAppState();
    const [showDialog, setShowDialog] = useState(
        tutorialMode !== TutorialMode.None,
    );

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
                {TableauxCalculus.includes(calculus) && (
                    <div class="flex-container">
                        <div class={`first  ${style.firstSpace}`}>
                            <h3>Expand move</h3>
                            <video autoPlay loop alt="Tableaux Expand Move">
                                <source
                                    src="../../assets/gifs/prop_tableaux_expand.mp4"
                                    type="video/mp4"
                                />
                            </video>
                            <p>
                                You can expand the tree by choosing a leaf and a
                                clause.
                            </p>
                        </div>
                        <div class="second">
                            <h3>Close move</h3>
                            <video autoPlay loop alt="Tableaux Close Move">
                                <source
                                    src="../../assets/gifs/prop_tableaux_close.mp4"
                                    type="video/mp4"
                                />
                            </video>
                            <p>
                                Close a leaf with a complementary node on the
                                path to the root. The proof is complete when all
                                leafs are closed.
                            </p>
                        </div>
                    </div>
                )}
                <p>
                    <Btn onClick={() => setShowDialog(false)}>
                        Okay I got it
                    </Btn>
                </p>
            </Dialog>
        </Fragment>
    );
};

export default HelpMenu;
