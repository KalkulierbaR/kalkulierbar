import { event, hierarchy, HierarchyNode, select, tree, zoom } from "d3";
import { Component, Fragment, h } from "preact";
import { useRef } from "preact/hooks";

import {
    SelectNodeOptions,
    TableauxNode,
    TableauxTreeGoToEvent
} from "../../../types/tableaux";
import TableauxTreeNode from "../node";

import * as nodeStyle from "../node/style.css";
import * as style from "./style.css";

// Properties Interface for the TableauxTreeView component
interface Props {
    /**
     * The nodes of the tree
     */
    nodes: TableauxNode[];
    /**
     * The id of a node if one is selected
     */
    selectedNodeId: number | undefined;
    /**
     * The function to call, when the user selects a node
     */
    selectNodeCallback: (node: D3Data, options?: SelectNodeOptions) => void;
    /**
     * Informs the element that the screen is small.
     */
    smallScreen: boolean;
}

interface State {
    /**
     * Current transform applied to the tree.
     */
    transform: Transform;
    /**
     * Current root of the tree.
     */
    root?: HierarchyNode<D3Data>;
    /**
     * Height of the tree.
     */
    treeHeight: number;
    /**
     * Width of the tree.
     */
    treeWidth: number;
}

// Interface for a node
export interface D3Data {
    id: number;
    name: string;
    isLeaf: boolean;
    negated: boolean;
    isClosed: boolean;
    closeRef: number | null;
    children?: D3Data[];
}

// Creates a tree layout function
const layout = tree();

/**
 * Transforms the node data received by the server to data
 * accepted by d3
 * @param {number} id  - the node to transform
 * @param {TableauxNode[]} nodes  - list of all nodes
 * @returns {D3Data} - data as d3 parsable
 */
const transformNodeToD3Data = (id: number, nodes: TableauxNode[]): D3Data => {
    const node = nodes[id];
    const isLeaf = !node.children.length;
    const children = isLeaf
        ? undefined
        : node.children.map(c => transformNodeToD3Data(c, nodes));

    return {
        id,
        name: node.spelling,
        isLeaf,
        children,
        negated: node.negated,
        isClosed: node.isClosed,
        closeRef: node.closeRef
    };
};

/**
 *
 * @param {Array<HierarchyNode<D3Data>>} nodes - The nodes we iterate over
 * @param {number} id - Id of the ancestor
 * @returns {HierarchyNode<D3Data>} - The ancestor
 */
const getNodeById = (nodes: Array<HierarchyNode<D3Data>>, id: number) =>
    nodes.find(n => n.data.id === id)!;

interface ClosingEdgeProps {
    leaf: HierarchyNode<D3Data>;
    pred: HierarchyNode<D3Data>;
}

// Component to display an edge in a graph
const ClosingEdge: preact.FunctionalComponent<ClosingEdgeProps> = ({
    leaf,
    pred
}) => {
    // Calculate coordinates
    const x1 = (leaf as any).x;
    const y1 = (leaf as any).y;
    const x2 = (pred as any).x;
    const y2 = (pred as any).y;

    // Calculate edge
    // M -> move to point x1,y1
    // Q -> draw quadratic curve (type of Bezier Curve https://developer.mozilla.org/de/docs/Web/SVG/Tutorial/Pfade)
    //      xC,yC of the control point
    //      x2,y2 of the target
    // should look like d="M x1 x2 Q xC yC x2 y2"
    // Todo: use Stringtemplates
    let controlpoint = (x1 - (y1 - y2) / 2);
    if (x1 > x2){
        controlpoint = (x1 + (y1 - y2) / 2);
    }
    const d =
        "M " +
        x1 +
        " " +
        y1 +
        " Q " +
        controlpoint +
        " " +
        (y1 + y2) / 2 +
        " " +
        x2 +
        " " +
        y2;
 //   console.log('M ${x1} ${y1} Q ${controlpoint} ${(y1 + y2) / 2} ${x2} ${y2}')
    return <path d={d} class={style.link} />;
};

interface Transform {
    x: number;
    y: number;
    /**
     * Scale factor.
     */
    k: number;
}

const INIT_TRANSFORM: Transform = { x: 0, y: 0, k: 1 };

class TableauxTreeView extends Component<Props, State> {
    public static getDerivedStateFromProps(props: Props) {
        const { nodes, smallScreen } = props;

        // Transform nodes to d3 hierarchy
        const root = hierarchy(transformNodeToD3Data(0, nodes));
        // Size of the nodes. [width, height]
        const nodeSize: [number, number] = smallScreen ? [70, 70] : [140, 140];
        // Calculate tree size
        const treeHeight = root.height * nodeSize[1];
        const leaves = root.copy().count().value || 1;
        const treeWidth = leaves * nodeSize[0];

        // Let d3 calculate our layout
        layout.size([treeWidth, treeHeight]);
        layout(root);
        return {
            root,
            treeHeight,
            treeWidth
        };
    }

    public state = {
        transform: INIT_TRANSFORM,
        root: undefined as HierarchyNode<D3Data> | undefined,
        treeHeight: 0,
        treeWidth: 0
    };

    public setTransform(transform: Transform) {
        this.setState(s => ({ ...s, transform }));
    }

    /**
     * Sets up our zoom listener on the svg element.
     * Has to be run after every render (As far as I know)
     * @returns {void} - nothing. JSDoc is dumb.
     */
    public bindZoom() {
        // Get the elements to manipulate
        const svg = select(`.${style.svg}`);
        // Add zoom and drag behavior
        svg.call(
            zoom().on("zoom", () => {
                const { x, y, k } = event.transform as Transform;
                this.setTransform({ x, y, k });
            }) as any
        );
    }

    public componentDidMount() {
        this.bindZoom();

        window.addEventListener("kbar-center-tree", () => {
            this.setTransform(INIT_TRANSFORM);
        });

        window.addEventListener("kbar-go-to-node", e => {
            this.goToNode((e as TableauxTreeGoToEvent).detail.node);
        });
    }

    public componentDidUpdate() {
        this.bindZoom();
    }

    /**
     * Centers the tree on node `n`.
     * @param {number} n - the id of the node to which we should go.
     * @returns {void} - nothing. JSDoc is dumb.
     */
    public goToNode(n: number) {
        const node = getNodeById(this.state.root!.descendants(), n);
        this.props.selectNodeCallback(node.data, { ignoreClause: true });

        const { x, y } = node as any;
        this.setTransform({
            x: this.state.treeWidth / 2 - x,
            y: this.state.treeHeight / 2 - y,
            k: 1
        });
    }

    public render() {
        const { selectedNodeId, selectNodeCallback } = this.props;
        const { root, treeHeight, treeWidth, transform } = this.state;

        // This is the reference to our SVG element
        const svgRef = useRef<any>();

        // If we have a SVG, set its zoom to our transform
        // Unfortunately, none of the methods that should work, do
        // so this is pretty dirty
        if (svgRef.current) {
            const e = svgRef.current;
            const t = e.__zoom;
            t.x = transform.x;
            t.y = transform.y;
            t.k = transform.k;
        }

        return (
            <div class="card">
                <svg
                    ref={svgRef}
                    class={style.svg}
                    width="100%"
                    height={`${treeHeight + 16}px`}
                    style="min-height: 60vh"
                    viewBox={`0 -10 ${treeWidth} ${treeHeight + 64}`}
                    preserveAspectRatio="xMidyMid meet"
                >
                    <g
                        transform={`translate(${transform.x} ${transform.y +
                            16}) scale(${transform.k})`}
                    >
                        <g>
                            {
                                <Fragment>
                                    {/* First render ClosingEdges -> keep order to avoid overlapping */
                                    root!
                                        .descendants()
                                        .map(n =>
                                            n.data.isClosed && n.data.isLeaf ? (
                                                <ClosingEdge
                                                    leaf={n}
                                                    pred={getNodeById(
                                                        n.ancestors(),
                                                        n.data.closeRef!
                                                    )}
                                                />
                                            ) : null
                                        )}
                                    {/* Second render links between nodes */
                                    root!.links().map(l => (
                                        <line
                                            class={style.link}
                                            x1={(l.source as any).x}
                                            y1={(l.source as any).y + 6}
                                            x2={(l.target as any).x}
                                            y2={(l.target as any).y - 18}
                                        />
                                    ))}
                                    {/* Third render nodes -> renders above all previous elements */
                                    root!.descendants().map(n => (
                                        <TableauxTreeNode
                                            selectNodeCallback={selectNodeCallback}
                                            node={n}
                                            selected={n.data.id === selectedNodeId}
                                            filling={
                                                n.data.isClosed
                                                    ? nodeStyle.fClosed
                                                    : nodeStyle.fDefault
                                            }
                                        />
                                    ))}
                                </Fragment>
                            }
                        </g>
                    </g>
                </svg>
            </div>
        );
    }
}

export default TableauxTreeView;
