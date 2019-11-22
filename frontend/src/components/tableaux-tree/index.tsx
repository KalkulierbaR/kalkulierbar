import { h } from "preact";
import { TableauxNode } from "../../types/tableaux";

interface Props {
    nodes: TableauxNode[];
}

const TableauxTreeView: preact.FunctionalComponent<Props> = ({ nodes }) => {
    return <div class="card">{nodes.map(n => n.spelling).join(", ")}</div>;
};

export default TableauxTreeView;
