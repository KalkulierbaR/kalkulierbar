import { h } from "preact";

const Format: preact.FunctionalComponent = () => (
    <div class="card">
        <h3>Format</h3>
        <ul>
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
        </ul>
    </div>
);

export default Format;
