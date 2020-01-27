import { Fragment, h } from "preact";

interface Props {
    /**
     * Display the format for First Order logic
     */
    foLogic?: boolean;
}

const Format: preact.FunctionalComponent<Props> = ({
   foLogic= false
}) => (
    <div class="card">
        <h3>Format</h3>
        <ul>

            {foLogic ? // Todo: Styling
                <li>
                    <p>
                        <b>First Order Formulas</b>
                    </p>
                    <p>
                        <ul>
                            <li>
                                1. All constants (identifiers with a lowercase or numeric first character) are terms.
                            </li>
                            <li>
                                2. All variables (identifiers with an uppercase first character) are terms.
                            </li>
                            <li>
                                3. Given n terms t1 to tn, all functions f(t1, t2, ... tn) - where f is an identifier with a lowercase or numeric first character - are terms.
                            </li>
                            <li>
                                4. Nothing else is a term.
                            </li>
                            <li>
                                5. An atomic formula is a relation with one or more terms as arguments, written as R(t1, t2, ... tn) where R is an identifier with an uppercase first character. Please note that relations with the same name but different numbers of arguments may exist.
                            </li>
                        </ul>
                    </p>
                    <p>
                        <table>
                            <tr><th>Operation</th><th>Symbol</th><th>Example</th></tr>
                            <tr><td>Unary Not</td><td>!</td><td>!valid</td></tr>
                            <tr><td>Binary And</td><td>&</td><td>a & b</td></tr>
                            <tr><td>Binary Or</td><td>|</td><td>a | b</td></tr>
                            <tr><td>Implication</td><td>{"->"}</td><td>{"rain -> wet"}</td></tr>
                            <tr><td>Equivalence</td><td>{"<=> or <->"}</td><td>{"right <=> !left"}</td></tr>
                            <tr><td>Parentheses</td><td>()</td><td>(a | b) & c</td></tr>
                        </table>
                    </p>
                    <p>
                        Operator precedence is defined as follows: <code>{"()  >  !  >  \\ex = \\all  >  &  >  |  >  ->  > <=>"}</code>
                    </p>
                </li>
                : <Fragment>
                    <li>
                        <p>
                            <b>Clause Sets</b>
                        </p>
                        <p>
                            <code>{"{{a, ¬c}, {b}}"}</code>&nbsp;&nbsp;&nbsp;needs to be entered as&nbsp;&nbsp;&nbsp;<code>a,!c;b</code>
                        </p>
                        <p>
                            Use a semicolon or linebreak to signal a new clause.
                        </p>
                    </li>
                    <br/>
                    <li>
                        <p>
                            <b>Propositional Formulas</b>
                        </p>
                        <p>
                            <code>{"!a -> ( a & b <=> a | b)"}</code>&nbsp;&nbsp;&nbsp;is a valid input.
                        </p>
                        <p>
                            <code>{"<=>"}</code>&nbsp;&nbsp;&nbsp;and&nbsp;&nbsp;&nbsp;<code>{"<->"}</code>&nbsp;&nbsp;&nbsp;are synonymous.
                        </p>
                    </li>
                </Fragment>
                }
        </ul>
    </div>
);

export default Format;
