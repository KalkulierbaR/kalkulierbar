import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { CalculusType, ResolutionCalculus, TableauxCalculus, TutorialMode } from "../../types/app";
import { useAppState } from "../../util/app-state";
import Dialog from "../dialog";
import FAB from "../fab";
import InfoIcon from "../icons/info";
import Video from "../video";
import * as style from "./style.scss";

interface Props {
    /**
     * The currently active calculus
     */
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
                            <h3>Expand Move</h3>
                            <Video
                                src="../../assets/videos/prop_tableaux_expand.mp4"
                                alt="Tableaux Expand Move"
                            />
                            <p>
                                You can expand the tree by choosing a leaf and a
                                clause.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Close Move</h3>
                            <Video
                                src="../../assets/videos/prop_tableaux_close.mp4"
                                alt="Tableaux Close Move"
                            />
                            <p>
                                Close a leaf with a complementary node on the
                                path to the root. The proof is complete when all
                                leafs are closed.
                            </p>
                        </div>
                    </div>
                )}
                {ResolutionCalculus.includes(calculus) && (
                    <div class={style.container}>
                        <div class={style.child}>
                            <h3>Resolve Move</h3>
                            <Video
                                src="../../assets/videos/prop_resolution_resolve.mp4"
                                alt="Resolution Resolve Move"
                            />
                            <p>
                                Choose two clauses with complementary atoms to resolve them.
                                The proof is complete when the empty clause has been resolved.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Factorize Move</h3>
                            <Video
                                src="../../assets/videos/prop_resolution_factorize.mp4"
                                alt="Resolution Factorize Move"
                            />
                            <p>
                                If a clause has multiple identical atoms, you can factorize it.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Hyper Resolution Move</h3>
                            <Video
                                src="../../assets/videos/prop_resolution_hyper.mp4"
                                alt="Hyper Resolution Move"
                            />
                            <p>
                                You can resolve multiple clauses at once with the hyper resolution.
                                The main clause is selected first.
                                Then you can add side premises which only contain positive atoms.
                            </p>
                        </div>
                    </div>
                )}
            </Dialog>
        </Fragment>
    );
};

export default HelpMenu;
