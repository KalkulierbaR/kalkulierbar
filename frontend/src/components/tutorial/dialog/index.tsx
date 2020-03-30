import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import { useAppState } from "../../../util/app-state";
import { getHighlightCheck } from "../../../util/tutorial-mode";
import Dialog from "../../dialog";
import FAB from "../../input/fab";
import InfoIcon from "../../icons/info";
import Video from "../../video";
import * as style from "./style.scss";
import {
    CalculusType,
    TableauxCalculus,
    ResolutionCalculus,
    Calculus,
} from "../../../types/calculus";

interface Props {
    /**
     * The currently active calculus
     */
    calculus: CalculusType;
}

const TutorialDialog: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const { tutorialMode } = useAppState();
    const [showDialog, setShowDialog] = useState(
        getHighlightCheck(tutorialMode),
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
                                src="../../../assets/videos/prop_tableaux_expand.mp4"
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
                                src="../../../assets/videos/prop_tableaux_close.mp4"
                                alt="Tableaux Close Move"
                            />
                            <p>
                                Close a leaf with a complementary node on the
                                path to the root. The proof is complete when all
                                leafs are closed.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Lemma Move</h3>
                            <Video
                                src="../../../assets/videos/prop_tableaux_lemma.mp4"
                                alt="Tableaux Lemma Move"
                            />
                            <p>
                                Select a node which you want to expand with a
                                lemma and choose the lemma rule. Now all closed
                                nodes are highlighted yellow. You can only use a
                                lemma node, which is no leaf and who's immediate
                                parent is a transitive parent of your selected
                                node. If you choose an appropriate lemma node,
                                your selected node is expanded with the negation
                                of the lemma node.
                            </p>
                        </div>
                    </div>
                )}
                {ResolutionCalculus.includes(calculus) && (
                    <div class={style.container}>
                        <div class={style.child}>
                            <h3>Resolve Move</h3>
                            <Video
                                src="../../../assets/videos/prop_resolution_resolve.mp4"
                                alt="Resolution Resolve Move"
                            />
                            <p>
                                Choose two clauses with complementary atoms to
                                resolve them. The proof is complete when the
                                empty clause has been resolved.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Factorize Move</h3>
                            <Video
                                src="../../../assets/videos/prop_resolution_factorize.mp4"
                                alt="Resolution Factorize Move"
                            />
                            <p>
                                If a clause has multiple identical atoms, you
                                can factorize it.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Hyper Resolution Move</h3>
                            <Video
                                src="../../../assets/videos/prop_resolution_hyper.mp4"
                                alt="Hyper Resolution Move"
                            />
                            <p>
                                You can resolve multiple clauses at once with
                                the hyper resolution. The main clause is
                                selected first. Then you can add side premises
                                which only contain positive atoms.
                            </p>
                        </div>
                    </div>
                )}
                {calculus === Calculus.dpll && (
                    <div class={style.container}>
                        <div class={style.child}>
                            <h3>Resolve Move</h3>
                            <Video
                                src="../../../assets/videos/dpll_resolve.mp4"
                                alt="DPLL Resolve Move"
                            />
                            <p>
                                Choose two clauses with complementary atoms to
                                resolve them. The proof is complete when the
                                empty clause has been resolved in all paths of
                                the tree.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Split Move</h3>
                            <Video
                                src="../../../assets/videos/dpll_split.mp4"
                                alt="DPLL Split Move"
                            />
                            <p>
                                You can split the tree by selecting a node and a
                                literal. Now you need to proof both paths
                                separately.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Prune Move</h3>
                            <Video
                                src="../../../assets/videos/dpll_prune.mp4"
                                alt="DPLL Prune Move"
                            />
                            <p>
                                Select a node and apply the prune rule to undo
                                all steps below that node.
                            </p>
                        </div>
                    </div>
                )}
                {calculus === Calculus.ncTableaux && (
                    <div class={style.container}>
                        <div class={style.child}>
                            <h3>Alpha Move</h3>
                            <Video
                                src="../../../assets/videos/nc_tableaux_alpha.mp4"
                                alt="NC Tableaux Alpha Move"
                            />
                            <p>
                                This splits a formula on it's conjunctions into
                                multiple nodes, which are chained onto the
                                current tree path.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Beta Move</h3>
                            <Video
                                src="../../../assets/videos/nc_tableaux_beta.mp4"
                                alt="NC Tableaux Beta Move"
                            />
                            <p>
                                This splits a formula on it's disjunctions and
                                adds multiple leafs to the current tree path.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Gamma Move</h3>
                            <Video
                                src="../../../assets/videos/nc_tableaux_gamma.mp4"
                                alt="NC Tableaux Gamma Move"
                            />
                            <p>
                                This resolves the outermost universal quantifier
                                of a formula and adds a leaf to the current tree
                                path.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Delta Move</h3>
                            <Video
                                src="../../../assets/videos/nc_tableaux_delta.mp4"
                                alt="NC Tableaux Delta Move"
                            />
                            <p>
                                This resolves the outermost existential
                                quantifier of a formula and adds a leaf to the
                                current tree path.
                            </p>
                        </div>
                        <div class={style.child}>
                            <h3>Close Move</h3>
                            <Video
                                src="../../../assets/videos/nc_tableaux_close.mp4"
                                alt="NC Tableaux Close Move"
                            />
                            <p>
                                Choose two clauses with complementary atoms to
                                resolve them. The proof is complete if the empty
                                clause has been resolved in all paths of the
                                tree.
                            </p>
                        </div>
                    </div>
                )}
            </Dialog>
        </Fragment>
    );
};

export default TutorialDialog;
