import { Fragment, h } from "preact";
import * as style from "./style.scss";

interface Props {
    /**
     * Display the format for First Order logic
     */
    foLogic?: boolean;
}

const Format: preact.FunctionalComponent<Props> = ({ foLogic = false }) => (
    <div class="card">
        <h3>Format</h3>
        <ul>
            {foLogic ? ( // Todo: Styling
                <li>
                    <p>
                        <b>First Order Formulas</b>
                    </p>
                    <p>
                        <ul>
                            <li>
                                All constants (identifiers with a lowercase or numeric first character) are terms.
                            </li>
                            <li>
                                All variables (identifiers with an uppercase first character) are terms.
                            </li>
                            <li>
                                Given n terms t1 to tn, all functions f(t1, t2, ... tn) - where f is an identifier with
                                a lowercase or numeric first character - are terms.
                            </li>
                            <li>
                                An atomic formula is a relation with one or more terms as arguments, written as R(t1,
                                t2, ... tn) where R is an identifier with an uppercase first character. Please note that
                                relations with the same name but different numbers of arguments may exist.
                            </li>
                        </ul>
                    </p>
                    <p>
                        <table>
                            <tr>
                                <th>Operation</th>
                                <th>Symbol</th>
                                <th>Example</th>
                            </tr>
                            <tr>
                                <td>Parentheses</td>
                                <td><code>()</code></td>
                                <td><code>(a | b) & c</code></td>
                            </tr>
                            <tr>
                                <td>Unary Not</td>
                                <td><code>!</code></td>
                                <td><code>!valid</code></td>
                            </tr>
                            <tr>
                                <td>Universal quantifiers</td>
                                <td>\all X</td>
                                <td>\all X: (R(X) & Q(X))</td>
                            </tr>
                            <tr>
                                <td>Existential quantifiers</td>
                                <td>\ex X</td>
                                <td>\ex X: (R(X) & Q(X))</td>
                            </tr>
                            <tr>
                                <td>Binary And</td>
                                <td><code>&</code></td>
                                <td><code>a & b</code></td>
                            </tr>
                            <tr>
                                <td>Binary Or</td>
                                <td><code>|</code></td>
                                <td><code>a | b</code></td>
                            </tr>
                            <tr>
                                <td>Implication</td>
                                <td><code>{"->"}</code></td>
                                <td><code>{"rain -> wet"}</code></td>
                            </tr>
                            <tr>
                                <td>Equivalence</td>
                                <td><code>{"<=> or <->"}</code></td>
                                <td><code>{"right <=> !left"}</code></td>
                            </tr>
                        </table>
                    </p>
                    <p>
                        Operator precedence is equal to the order of the table above.
                    </p>
                </li>
            ) : (
                <Fragment>
                    <li>
                        <p>
                            <b>Clause Sets</b>
                        </p>
                        <p>
                            <code class={style.padRight}>
                                {"{{a, ¬c}, {b}}"}
                            </code>
                            needs to be entered as{" "}
                            <code class={style.padLeft}>a,!c;b</code>
                        </p>
                        <p>
                            Use a semicolon or linebreak to signal a new clause.
                        </p>
                    </li>
                    <br />
                    <li>
                        <p>
                            <b>Propositional Formulas</b>
                        </p>
                        <p>
                            <code class={style.padRight}>
                                {"!a -> ( a & b <=> a | b)"}
                            </code>
                            is a valid input.
                        </p>
                        <p>
                            <code class={style.padRight}>{"<=>"}</code>
                            and
                            <code class={style.padLeft}>{"<->"}</code> are
                            synonymous.
                        </p>
                    </li>
                </Fragment>
            )}
        </ul>
    </div>
);

export default Format;
