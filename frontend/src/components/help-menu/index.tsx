import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { CalculusType, ResolutionCalculus, TableauxCalculus, TutorialMode } from "../../types/app";
import { useAppState } from "../../util/app-state";
import Dialog from "../dialog";
import FAB from "../fab";
import InfoIcon from "../icons/info";
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
                {ResolutionCalculus.includes(calculus) && (
                    <div class={style.container}>
                        <div class={style.child}>
                            <h3>Resolve move</h3>
                            <video autoPlay={true} loop={true} alt="Resolution Resolve Move">
                                <source
                                    src="../../assets/videos/prop_resolution_resolve.mp4"
                                    type="video/mp4"
                                />
                            </video>
                            <p>
                                Choose two clauses with complementary atoms to resolve them.
                                The proof is complete when the empty clause has been resolved.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Factorize move</h3>
                            <video autoPlay={true} loop={true} alt="Resolution Factorize Move">
                                <source
                                    src="../../assets/videos/prop_resolution_factorize.mp4"
                                    type="video/mp4"
                                />
                            </video>
                            <p>
                                If a clause has multiple identical atoms, you can factorize it.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Hyper Resolution move</h3>
                            <video autoPlay={true} loop={true} alt="Hyper Resolution Move">
                                <source
                                    src="../../assets/videos/prop_resolution_hyper.mp4"
                                    type="video/mp4"
                                />
                            </video>
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
