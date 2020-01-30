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
                        Use names starting in an uppercase letter for variables and relations, names starting with a lowercase letter or a number for constants and functions. Quantifiers can be used like this:{" "}
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
                                <td><code>\all X</code></td>
                                <td><code>\all X: (R(X) & Q(X))</code></td>
                            </tr>
                            <tr>
                                <td>Existential quantifiers</td>
                                <td><code>\ex X</code></td>
                                <td><code>\ex X: (R(X) & Q(X))</code></td>
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
                        Unbound variables are not allowed. Quantifier scopes are as small as possible, following the usual conventions for first-order logic.
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
                                {"{{a, ¬b}, {¬a}, {b}}"}
                            </code>
                            needs to be entered as{" "}
                            <code class={style.padLeft}>a,!b;!a;b</code>
                        </p>
                        <p>
                            Separate variables with commas, use a semicolon or linebreak to signal a new clause. Whitespace is ignored.
                        </p>
                    </li>
                    <br />
                    <li>
                        <p>
                            <b>Propositional Formulas</b>
                        </p>
                        <p>
                            Enter a formula in the usual ascii-notation like in this example:{" "}
                            <code class={style.padRight}>
                                {"!(a -> b) & (c <=> d | e) & !a"}
                            </code>
                            
                        </p>
                        <p>
                            <code class={style.padRight}>{"<=>"}</code>
                            and
                            <code class={style.padLeft}>{"<->"}</code> are
                            synonymous, operator precedence follows the conventions for propositional logic. Whitespace is ignored.
                        </p>
                    </li>
                </Fragment>
            )}
        </ul>
    </div>
);

export default Format;
