import { h } from "preact";
import { DPLLTreeLayoutNode } from "../../../types/dpll";
import { LayoutItem } from "../../../types/layout";

interface Props {
    node: LayoutItem<DPLLTreeLayoutNode>;
}

const DPLLNode: preact.FunctionalComponent<Props> = () => {
    return <text>Node</text>;
};

export default DPLLNode;
