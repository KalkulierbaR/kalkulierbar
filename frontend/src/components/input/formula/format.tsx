import { Fragment, h } from "preact";
import { useCallback, useState } from "preact/hooks";

import { TutorialMode } from "../../../types/app/tutorial";
import { useAppState } from "../../../util/app-state";
import { classMap } from "../../../util/class-map";
import ChevronRightIcon from "../../icons/chevron-right";

import * as style from "./style.scss";

interface Props {
    /**
     * Choose weather to allow clause sets or not
     */
    allowClauses?: boolean;
    /**
     * Choose wether to allow sequences or not
     */
    allowSequences?: boolean;
    /**
     * Display the format for First Order logic
     */
    foLogic?: boolean;
    /**
     * Display the format for Modal Logic
     */
    modalLogic?: boolean;
}

const Format: preact.FunctionalComponent<Props> = ({
    foLogic = false,
    allowClauses = true,
    allowSequences = false,
    modalLogic = false,
}) => {
    const { tutorialMode, smallScreen } = useAppState();

    const firstVisit =
        (smallScreen && tutorialMode !== TutorialMode.None) ||
        (!smallScreen && (tutorialMode & TutorialMode.HighlightCheck) !== 0);

    const [collapsed, setCollapsed] = useState(!firstVisit);

    const toggleCollapsed = useCallback(() => setCollapsed(!collapsed), [
        collapsed,
    ]);

    const sequentFormat = (
        <li>
            <p>
                <b>Sequent Formula</b>
            </p>
            <p>
                Use
                <code class={style.padRight}>{" ,"}</code>
                to seperate multiple formulas from each other and the
                <code class={style.padRight}>{" |-"}</code>
                symbol to to either define formulas on the left or on the right
                side of the sequence.
            </p>
            <p>
                Example:{" "}
                <code class={style.padRight}>
                    {foLogic !== true && "!(a -> b), b |- a"}
                    {foLogic === true &&
                        "\\all X: P(X), \\all X: (P(X) -> Q(X)) |- \\ex X: Q(X)"}
                </code>
            </p>
        </li>
    );

    const modalFormat = (
        <Fragment>
            <li>
                <p>
                    <b>Modal Formula</b>
                </p>
                <p>
                    Use uppercase T and F to set the appropriate assumption to
                    TRUE or FALSE.
                    <br />
                    Assumptions can be set like this:{" "}
                    <code class={style.padRight}>
                        {"\\sign T:"} or {"\\sign F:"}
                    </code>
                    <br />
                    Box and Diamond can be used like this:{" "}
                    <code class={style.padRight}>{"!(<>(!a)) -> []a"}</code>
                </p>
                <p>
                    <table>
                        <tr>
                            <th>Operator</th>
                            <th>Symbol</th>
                            <th>Example</th>
                        </tr>
                        <tr>
                            <td>Box Operator</td>
                            <td>
                                <code>[]a</code>
                            </td>
                            <td>
                                <code>[]a -&gt; []a</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Diamond Operator</td>
                            <td>
                                <code>{`<>`}a</code>
                            </td>
                            <td>
                                <code>
                                    {`<>`}a -&gt; {`<>`}a
                                </code>
                            </td>
                        </tr>
                        <tr>
                            <td>Assumption</td>
                            <td>
                                <code>\sign</code>
                            </td>
                            <td>
                                <code>\sign T: a | b</code>
                            </td>
                        </tr>
                    </table>
                </p>
            </li>
            <br />
            {allowSequences && sequentFormat}
        </Fragment>
    );

    const foLogicFormat = (
        <Fragment>
            <li>
                <p>
                    <b>FO Formula</b>
                </p>
                <p>
                    Use names starting in an uppercase letter for variables and
                    relations, names starting with a lowercase letter or a
                    number for constants and functions.
                    <br />
                    Quantifiers can be used like this:{" "}
                    <code class={style.padRight}>
                        {"\\all X: R(f(X, a)) & \\ex Y: !R(f(Y, a))"}
                    </code>
                </p>
                <p>
                    <table>
                        <tr>
                            <th>Operator</th>
                            <th>Symbol</th>
                            <th>Example</th>
                        </tr>
                        <tr>
                            <td>Parentheses</td>
                            <td>
                                <code>()</code>
                            </td>
                            <td>
                                <code>(a | b) & c</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Not</td>
                            <td>
                                <code>!</code>
                            </td>
                            <td>
                                <code>!valid</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Universal quantifiers</td>
                            <td>
                                <code>\all X:</code> or <code>/all X:</code>
                            </td>
                            <td>
                                <code>\all X: (R(X) & Q(X))</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Existential quantifiers</td>
                            <td>
                                <code>\ex X:</code> or <code>/ex X:</code>
                            </td>
                            <td>
                                <code>\ex X: (R(X) & Q(X))</code>
                            </td>
                        </tr>
                        <tr>
                            <td>And</td>
                            <td>
                                <code>&</code>
                            </td>
                            <td>
                                <code>a & b</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Or</td>
                            <td>
                                <code>|</code>
                            </td>
                            <td>
                                <code>a | b</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Implication</td>
                            <td>
                                <code>{"->"}</code>
                            </td>
                            <td>
                                <code>{"rain -> wet"}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Equivalence</td>
                            <td>
                                <code>{"<=>"}</code> or <code>{"<->"}</code>
                            </td>
                            <td>
                                <code>{"right <=> !left"}</code>
                            </td>
                        </tr>
                    </table>
                </p>
                <p>
                    Unbound variables are not allowed. Quantifier scopes are as
                    small as possible, following the usual conventions for
                    first-order logic.
                </p>
            </li>
            <br />
            {allowSequences && sequentFormat}
        </Fragment>
    );

    const propClauseFormat = (
        <Fragment>
            <li>
                <p>
                    <b>Propositional Formula</b>
                </p>
                <p>
                    Use the usual ascii-notation like in this example:{" "}
                    <code class={style.padRight}>
                        {"!(a -> b) & (c <=> d | e) & !a"}
                    </code>
                </p>
                <p>
                    <table>
                        <tr>
                            <th>Operator</th>
                            <th>Symbol</th>
                            <th>Example</th>
                        </tr>
                        <tr>
                            <td>Parentheses</td>
                            <td>
                                <code>()</code>
                            </td>
                            <td>
                                <code>(a | b) & c</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Not</td>
                            <td>
                                <code>!</code>
                            </td>
                            <td>
                                <code>!valid</code>
                            </td>
                        </tr>
                        <tr>
                            <td>And</td>
                            <td>
                                <code>&</code>
                            </td>
                            <td>
                                <code>a & b</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Or</td>
                            <td>
                                <code>|</code>
                            </td>
                            <td>
                                <code>a | b</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Implication</td>
                            <td>
                                <code>{"->"}</code>
                            </td>
                            <td>
                                <code>{"rain -> wet"}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Equivalence</td>
                            <td>
                                <code>{"<=>"}</code> or <code>{"<->"}</code>
                            </td>
                            <td>
                                <code>{"right <=> !left"}</code>
                            </td>
                        </tr>
                    </table>
                </p>
                <p>
                    <code class={style.padRight}>{"<=>"}</code>
                    and
                    <code class={style.padLeft}>{"<->"}</code> are synonymous,
                    operator precedence follows the conventions for
                    propositional logic. Whitespace is ignored.
                </p>
            </li>
            <br />
            <li>
                <p>
                    <b>Clause Set</b>
                </p>
                <p>
                    <code class={style.padRight}>{"{{a, ¬b}, {¬a}, {b}}"}</code>
                    needs to be entered as{" "}
                    <code class={style.padLeft}>a,!b;!a;b</code>
                </p>
                <p>
                    Separate variables with commas, use a semicolon or linebreak
                    to signal a new clause. Whitespace is ignored.
                </p>
            </li>
        </Fragment>
    );

    const propFormat = (
        <Fragment>
            <li>
                <p>
                    <b>Propositional Formula</b>
                </p>
                <p>
                    Use the usual ascii-notation like in this example:{" "}
                    <code class={style.padRight}>
                        {"!(a -> b) & (c <=> d | e) & !a"}
                    </code>
                </p>

                <p>
                    <table>
                        <tr>
                            <th>Operator</th>
                            <th>Symbol</th>
                            <th>Example</th>
                        </tr>
                        <tr>
                            <td>Parentheses</td>
                            <td>
                                <code>()</code>
                            </td>
                            <td>
                                <code>(a | b) & c</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Not</td>
                            <td>
                                <code>!</code>
                            </td>
                            <td>
                                <code>!valid</code>
                            </td>
                        </tr>
                        <tr>
                            <td>And</td>
                            <td>
                                <code>&</code>
                            </td>
                            <td>
                                <code>a & b</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Or</td>
                            <td>
                                <code>|</code>
                            </td>
                            <td>
                                <code>a | b</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Implication</td>
                            <td>
                                <code>{"->"}</code>
                            </td>
                            <td>
                                <code>{"rain -> wet"}</code>
                            </td>
                        </tr>
                        <tr>
                            <td>Equivalence</td>
                            <td>
                                <code>{"<=>"}</code> or <code>{"<->"}</code>
                            </td>
                            <td>
                                <code>{"right <=> !left"}</code>
                            </td>
                        </tr>
                    </table>
                </p>
                <p>
                    <code class={style.padRight}>{"<=>"}</code>
                    and
                    <code class={style.padLeft}>{"<->"}</code> are synonymous,
                    operator precedence follows the conventions for
                    propositional logic. Whitespace is ignored.
                </p>
            </li>
            <br />
            {allowSequences && sequentFormat}
        </Fragment>
    );

    const content = (
        <div class={style.formatContent}>
            <ul>
                {foLogic ? ( // Todo: Styling
                    foLogicFormat
                ) : (
                    <Fragment>
                        {allowClauses ? propClauseFormat : propFormat}
                    </Fragment>
                )}
                {modalLogic && modalFormat}
            </ul>
        </div>
    );

    return (
        <div class={`card ${style.noPad}`}>
            <div class={style.formatHeader} onClick={toggleCollapsed}>
                <button
                    class={classMap({
                        [style.btnIcon]: true,
                        [style.expand]: collapsed,
                    })}
                >
                    <ChevronRightIcon
                        size={32}
                        fill="var(--kbar-primary-text-color)"
                    />
                </button>
                <h3 class={style.formatHeading}>Format</h3>
            </div>
            {!collapsed && content}
        </div>
    );
};

export default Format;
