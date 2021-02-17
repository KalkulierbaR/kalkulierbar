import { Fragment, h } from "preact";
import { useState } from "preact/hooks";

import {
    Calculus,
    CalculusType,
    ResolutionCalculus,
    TableauxCalculus,
} from "../../../types/calculus";
import { useAppState } from "../../../util/app-state";
import { getHighlightCheck } from "../../../util/tutorial-mode";
import Dialog from "../../dialog";
import InfoIcon from "../../icons/info";
import FAB from "../../input/fab";
import Video from "../../video";

import * as style from "./style.scss";

interface VideoTutorialProps {
    /**
     * The tutorial title
     */
    title: string;
    /**
     * The video`s source
     */
    videoSrc: string;
    /**
     * The tutorial text
     */
    text: string;
    /**
     * The video`s alternative text
     */
    videoAlt?: string;
}

const VideoTutorial: preact.FunctionalComponent<VideoTutorialProps> = ({
    title,
    videoSrc,
    text,
    videoAlt = title,
}) => (
    <div class={style.child}>
        <h3>{title}</h3>
        <Video src={videoSrc} alt={videoAlt} />
        <p>{text}</p>
    </div>
);

interface TutorialDialogProps {
    /**
     * The currently active calculus
     */
    calculus: CalculusType;
}

const TutorialDialog: preact.FunctionalComponent<TutorialDialogProps> = ({
    calculus,
}) => {
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
                        <VideoTutorial
                            title="Expand Rule"
                            videoSrc="../../../assets/videos/prop_tableaux_expand.mp4"
                            text="You can expand the tree by choosing a leaf and a clause."
                        />
                        <VideoTutorial
                            title="Close Rule"
                            videoSrc="../../../assets/videos/prop_tableaux_close.mp4"
                            text="Close a leaf with a complementary node on the
                                path to the root. The proof is complete when all
                                leaves are closed."
                        />
                        <VideoTutorial
                            title="Lemma Rule"
                            videoSrc="../../../assets/videos/prop_tableaux_lemma.mp4"
                            text="Select a node which you want to expand with a
                                lemma and choose the lemma rule. Now all closed
                                nodes are highlighted yellow. You can only use a
                                lemma node, which is no leaf and who's immediate
                                parent is a transitive parent of your selected
                                node. If you choose an appropriate lemma node,
                                your selected node is expanded with the negation
                                of the lemma node."
                        />
                    </div>
                )}
                {ResolutionCalculus.includes(calculus) && (
                    <div class={style.container}>
                        <VideoTutorial
                            title="Resolve Rule"
                            videoSrc="../../../assets/videos/prop_resolution_resolve.mp4"
                            text="Choose two clauses with complementary atoms to
                                resolve them. The proof is complete when the
                                empty clause has been resolved."
                        />
                        <VideoTutorial
                            title="Factorize Rule"
                            videoSrc="../../../assets/videos/prop_resolution_factorize.mp4"
                            text="If a clause has multiple identical atoms, you
                                can factorize it."
                        />
                        <VideoTutorial
                            title="Hyper Resolution Rule"
                            videoSrc="../../../assets/videos/prop_resolution_hyper.mp4"
                            text="You can resolve multiple clauses at once with
                                the hyper resolution. The main clause is
                                selected first. Then you can add side premises
                                which only contain positive atoms."
                        />
                    </div>
                )}
                {calculus === Calculus.dpll && (
                    <div class={style.container}>
                        <VideoTutorial
                            title="Resolve Rule"
                            videoSrc="../../../assets/videos/dpll_resolve.mp4"
                            text="Choose two clauses with complementary atoms to
                                resolve them. The proof is complete when the
                                empty clause has been resolved in all paths of
                                the tree."
                        />
                        <VideoTutorial
                            title="Split Rule"
                            videoSrc="../../../assets/videos/dpll_split.mp4"
                            text="You can split the tree by selecting a node and a
                                literal. Now you need to proof both paths
                                separately."
                        />
                        <VideoTutorial
                            title="Prune Rule"
                            videoSrc="../../../assets/videos/dpll_prune.mp4"
                            text="Select a node and apply the prune rule to undo
                                all steps below that node."
                        />
                    </div>
                )}
                {calculus === Calculus.ncTableaux && (
                    <div class={style.container}>
                        <VideoTutorial
                            title="Alpha Rule"
                            videoSrc="../../../assets/videos/nc_tableaux_alpha.mp4"
                            text="This splits a formula on it's conjunctions into
                                multiple nodes, which are chained onto the
                                current tree path."
                        />
                        <VideoTutorial
                            title="Beta Rule"
                            videoSrc="../../../assets/videos/nc_tableaux_beta.mp4"
                            text="This splits a formula on it's disjunctions and
                                adds multiple leaves to the current tree path."
                        />
                        <VideoTutorial
                            title="Gamma Rule"
                            videoSrc="../../../assets/videos/nc_tableaux_gamma.mp4"
                            text="This resolves the outermost universal quantifier
                                of a formula and adds a leaf to the current tree
                                path."
                        />
                        <VideoTutorial
                            title="Delta Rule"
                            videoSrc="../../../assets/videos/nc_tableaux_delta.mp4"
                            text="This resolves the outermost existential
                                quantifier of a formula and adds a leaf to the
                                current tree path."
                        />
                        <VideoTutorial
                            title="Close Rule"
                            videoSrc="../../../assets/videos/nc_tableaux_close.mp4"
                            text="Choose two clauses with complementary atoms to
                                resolve them. The proof is complete if the empty
                                clause has been resolved in all paths of the
                                tree."
                        />
                    </div>
                )}
                {calculus === Calculus.psc && (
                    <div class={style.container}>
                        <VideoTutorial
                            title="Test"
                            videoSrc="../../../assets/videos/nc_tableaux_alpha.mp4"
                            text="This is a Test"
                        />
                        <VideoTutorial
                            title="Test2"
                            videoSrc="../../../assets/videos/nc_tableaux_beta.mp4"
                            text="This is a Test"
                        />
                        <VideoTutorial
                            title="Test3"
                            videoSrc="../../../assets/videos/nc_tableaux_gamma.mp4"
                            text="This is a Test"
                        />
                        <VideoTutorial
                            title="Test4"
                            videoSrc="../../../assets/videos/nc_tableaux_delta.mp4"
                            text="This is a Test"
                        />
                        <VideoTutorial
                            title="Test5"
                            videoSrc="../../../assets/videos/nc_tableaux_close.mp4"
                            text="This is a Test"
                        />
                    </div>
                )}
            </Dialog>
        </Fragment>
    );
};

export default TutorialDialog;
