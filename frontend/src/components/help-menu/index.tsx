import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { CalculusType, TableauxCalculus, TutorialMode } from "../../types/app";
import { useAppState } from "../../util/app-state";
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
                onConfirm={() => setShowDialog(false)}
                class={style.dialog}
            >
                {TableauxCalculus.includes(calculus) && (
                    <div class={style.container}>
                        <div class={style.child}>
                            <h3>Expand move</h3>
                            <video autoPlay={true} loop={true} alt="Tableaux Expand Move">
                                <source
                                    src="../../assets/videos/prop_tableaux_expand.mp4"
                                    type="video/mp4"
                                />
                            </video>
                            <p>
                                You can expand the tree by choosing a leaf and a
                                clause.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Close move</h3>
                            <video autoPlay={true} loop={true} alt="Tableaux Close Move">
                                <source
                                    src="../../assets/videos/prop_tableaux_close.mp4"
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
            </Dialog>
        </Fragment>
    );
};

export default HelpMenu;
