import { h } from "preact";

const Format: preact.FunctionalComponent = () => (
    <div class="card">
        <h3>Format</h3>
        <p>Formulas can be entered in one two different formats:</p>
        <h4>Clause Sets</h4>
        <p>
            <code>a,!c;b</code>
        </p>
        <p>
            This formula represents the clause set{" "}
            <code>{"{{a, ¬c}, {b}}"}</code>
        </p>
        <p>Instead of semicolons, line breaks can be used.</p>
        <h4>Propositional Formulas</h4>
        <p>
            <code>{"a -> ( b & !c <=> a)"}</code>
        </p>
        <p>{"<=> and <->"} are synonymous.</p>
    </div>
);

export default Format;
