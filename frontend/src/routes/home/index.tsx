import { h, VNode } from "preact";
import { Calculus } from "../../types/app";
import * as style from "./style.scss";

interface Route {
    name: string;
    href: Calculus;
    image: VNode<any>;
    viewBox: string;
}

const ROUTES: Route[] = [
    {
        href: Calculus.propTableaux,
        name: "Propositional Tableaux",
        viewBox: "0 -16 138.25 216",
        image: (
            <g transform="translate(0 0) scale(1)">
                <g>
                    <line
                        class={style.link}
                        x1="64.44999980926514"
                        y1="22"
                        x2="32.44999980926514"
                        y2="72"
                    />
                    <line
                        class={style.link}
                        x1="64.44999980926514"
                        y1="22"
                        x2="101.57499980926514"
                        y2="72"
                    />
                    <line
                        class={style.link}
                        x1="32.44999980926514"
                        y1="94"
                        x2="32.44999980926514"
                        y2="144"
                    />
                    <line
                        class={style.link}
                        x1="101.57499980926514"
                        y1="94"
                        x2="101.57499980926514"
                        y2="144"
                    />
                    <g class="_1ZnpjejWKO66ftvJ7Jgr8C">
                        <rect
                            class={style.rect}
                            x="42.66440963745117"
                            y="-2.7458908557891846"
                            width="43.57117462158203"
                            height="26.295827865600586"
                            rx="4"
                        />
                        <text
                            text-anchor="middle"
                            class=""
                            x="64.44999980926514"
                            y="16"
                        >
                            true
                        </text>
                    </g>
                    <g class="_1ZnpjejWKO66ftvJ7Jgr8C">
                        <rect
                            class={style.rect}
                            x="15.32939338684082"
                            y="69.25411224365234"
                            width="34.241214752197266"
                            height="26.295827865600586"
                            rx="4"
                        />
                        <text
                            text-anchor="middle"
                            class=""
                            x="32.44999980926514"
                            y="88"
                        >
                            ¬a
                        </text>
                    </g>
                    <g class="_1ZnpjejWKO66ftvJ7Jgr8C">
                        <rect
                            class={style.rect}
                            x="89.57449340820312"
                            y="69.25411224365234"
                            width="24.00101089477539"
                            height="26.295827865600586"
                            rx="4"
                        />
                        <text
                            text-anchor="middle"
                            class=""
                            x="101.57499980926514"
                            y="88"
                        >
                            c
                        </text>
                    </g>
                    <g class="_1ZnpjejWKO66ftvJ7Jgr8C">
                        <rect
                            class={style.rect}
                            x="20.001201629638672"
                            y="141.2541046142578"
                            width="24.897598266601562"
                            height="26.295827865600586"
                            rx="4"
                        />
                        <text
                            text-anchor="middle"
                            class=""
                            x="32.44999980926514"
                            y="160"
                        >
                            a
                        </text>
                    </g>
                    <g class="_1ZnpjejWKO66ftvJ7Jgr8C">
                        <rect
                            class={style.rect}
                            x="84.9026870727539"
                            y="141.2541046142578"
                            width="33.344627380371094"
                            height="26.295827865600586"
                            rx="4"
                        />
                        <text
                            text-anchor="middle"
                            class=""
                            x="101.57499980926514"
                            y="160"
                        >
                            ¬c
                        </text>
                    </g>
                </g>
            </g>
        ),
    },
    {
        href: Calculus.foTableaux,
        name: "First Order Tableaux",
        image: (
            <g transform="translate(0 0) scale(1)">
                <g>
                    <line
                        class={style.link}
                        x1="120.91666603088379"
                        y1="22"
                        x2="65.125"
                        y2="72"
                    />
                    <line
                        class={style.link}
                        x1="120.91666603088379"
                        y1="22"
                        x2="172.03333282470703"
                        y2="72"
                    />
                    <line
                        class={style.link}
                        x1="65.125"
                        y1="94"
                        x2="65.125"
                        y2="144"
                    />
                    <g class="_1ZnpjejWKO66ftvJ7Jgr8C">
                        <rect
                            class={style.rect}
                            x="93.80162048339844"
                            y="-2.7458908557891846"
                            width="54.23008728027344"
                            height="26.295827865600586"
                            rx="4"
                        />
                        <text
                            text-anchor="middle"
                            class=""
                            x="120.91666603088379"
                            y="16"
                        >
                            true()
                        </text>
                    </g>
                    <g class="_1ZnpjejWKO66ftvJ7Jgr8C">
                        <rect
                            class={style.rect}
                            x="34.01627731323242"
                            y="69.25411224365234"
                            width="62.217445373535156"
                            height="26.295827865600586"
                            rx="4"
                        />
                        <text text-anchor="middle" class="" x="65.125" y="88">
                            R(f(a))
                        </text>
                    </g>
                    <g class="_1ZnpjejWKO66ftvJ7Jgr8C">
                        <rect
                            class={style.rect}
                            x="136.25279235839844"
                            y="69.25411224365234"
                            width="71.5610580444336"
                            height="26.295827865600586"
                            rx="4"
                        />
                        <text
                            text-anchor="middle"
                            class=""
                            x="172.03333282470703"
                            y="88"
                        >
                            ¬R(f(b))
                        </text>
                    </g>
                    <g class="_1ZnpjejWKO66ftvJ7Jgr8C">
                        <rect
                            class={style.rect}
                            x="20.007678985595703"
                            y="141.2541046142578"
                            width="90.2346420288086"
                            height="26.295827865600586"
                            rx="4"
                        />
                        <text text-anchor="middle" class="" x="65.125" y="160">
                            ¬R(f(Xv2))
                        </text>
                    </g>
                </g>
            </g>
        ),
        viewBox: "0 -16 227.82499885559082 216",
    },
    {
        href: Calculus.propResolution,
        name: "Propositional Resolution",
        image: (
            <g transform="translate(0 0) scale(1)">
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-47.68718719482422"
                        y="-180.8850860595703"
                        width="95.3743667602539"
                        height="35.563446044921875"
                        rx="4"
                    />
                    <text
                        x="1.0338121520583616e-14"
                        y="-154.8343370150711"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        a, ¬b, c
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="70.2972183227539"
                        y="-117.31724548339844"
                        width="123.40556335449219"
                        height="35.563446044921875"
                        rx="4"
                    />
                    <text
                        x="132"
                        y="-91.26648733247731"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        ¬c, ¬a, ¬d
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="137.26095581054688"
                        y="25.51841926574707"
                        width="54.680702209472656"
                        height="35.563446044921875"
                        rx="4"
                    />
                    <text
                        x="164.60130769070565"
                        y="51.569174356488766"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        d, c
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="38.23394012451172"
                        y="140.06373596191406"
                        width="70.22481536865234"
                        height="35.563446044921875"
                        rx="4"
                    />
                    <text
                        x="73.254473435533"
                        y="166.11448148352412"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        ¬b, a
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-94.93596649169922"
                        y="140.06373596191406"
                        width="43.5467414855957"
                        height="35.563446044921875"
                        rx="4"
                    />
                    <text
                        x="-73.25447343553299"
                        y="166.11448148352412"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        ¬a
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-191.941650390625"
                        y="25.51841926574707"
                        width="54.680702209472656"
                        height="35.563446044921875"
                        rx="4"
                    />
                    <text
                        x="-164.60130769070565"
                        y="51.56917435648878"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        b, c
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-153.0091094970703"
                        y="-117.31724548339844"
                        width="42.01822280883789"
                        height="35.563446044921875"
                        rx="4"
                    />
                    <text
                        x="-132.00000000000003"
                        y="-91.2664873324773"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        ¬c
                    </text>
                </g>
            </g>
        ),
        viewBox:
            "-240.71777071657823 -203.21777071657823 481.43554143315646 406.43554143315646",
    },
    {
        href: Calculus.propResolution,
        name: "First Order Resolution",
        image: (
            <g transform="translate(0 0) scale(1)">
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-98.65703582763672"
                        y="-316.5934143066406"
                        width="197.31407165527344"
                        height="34.973060607910156"
                        rx="4"
                    />
                    <text
                        x="1.866612420155836e-14"
                        y="-290.8409421321224"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        R(f(a, X)), P(sk1)
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="168.99737548828125"
                        y="-164.17294311523438"
                        width="190.0052490234375"
                        height="34.973060607910156"
                        rx="4"
                    />
                    <text
                        x="264"
                        y="-138.4204710660612"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        R(f(a, X)), ¬P(Y)
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="156.54771423339844"
                        y="140.66799926757812"
                        width="214.90457153320312"
                        height="34.973060607910156"
                        rx="4"
                    />
                    <text
                        x="264"
                        y="166.42047106606114"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        R(f(a, X)), ¬R(Y, a)
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-99.9911880493164"
                        y="293.0884704589844"
                        width="199.9823760986328"
                        height="34.973060607910156"
                        rx="4"
                    />
                    <text
                        x="1.866612420155836e-14"
                        y="318.8409421321224"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        R(f(a, X)), R(a, c)
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-349.9898376464844"
                        y="140.66799926757812"
                        width="171.9796905517578"
                        height="34.973060607910156"
                        rx="4"
                    />
                    <text
                        x="-263.99999999999994"
                        y="166.4204710660613"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        R(f(a, X)), P(c)
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-357.66845703125"
                        y="-164.17294311523438"
                        width="187.33694458007812"
                        height="34.973060607910156"
                        rx="4"
                    />
                    <text
                        x="-264.0000000000001"
                        y="-138.420471066061"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        R(f(a, X)), ¬P(b)
                    </text>
                </g>
            </g>
        ),
        viewBox:
            "-445.32503634533464 -352.82503634533464 890.6500726906693 705.6500726906693",
    },
];

interface CalculusItemProps {
    route: Route;
}

const CalculusItem: preact.FunctionalComponent<CalculusItemProps> = ({
    route: { href, name, image, viewBox },
}) => {
    return (
        <a href={`/${href}`}>
            <div class={style.calculusItem}>
                <svg class={style.calculusItemImage} viewBox={viewBox}>
                    {image}
                </svg>
                <h3 class={style.calculusItemTitle}>{name}</h3>
            </div>
        </a>
    );
};

const Home: preact.FunctionalComponent = () => {
    return (
        <div class={style.home}>
            <div className="card">
                <h3>Choose a calculus</h3>
                <div class={style.calculusGrid}>
                    {ROUTES.map((r) => (
                        <CalculusItem route={r} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
