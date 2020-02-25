import { h, VNode } from "preact";
import { circle } from "../../components/resolution/circle/style.scss";
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
                <circle class={circle} cx="0" cy="0" r="204.13606202731324" />
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-40.234375"
                        y="-215.640625"
                        width="80.46875"
                        height="34.890625"
                        rx="4"
                    />
                    <text
                        x="1.2499728747614736e-14"
                        y="-190.13606202731324"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        a, b, c
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="92.5"
                        y="-138.78125"
                        width="134.203125"
                        height="34.890625"
                        rx="4"
                    />
                    <text
                        x="159.6"
                        y="-113.27675286563166"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        ¬c, a, a, ¬d
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="171.3125"
                        y="33.921875"
                        width="55.40625"
                        height="34.875"
                        rx="4"
                    />
                    <text
                        x="199.01794475330775"
                        y="59.424547176481866"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        d, d
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="54"
                        y="172.421875"
                        width="69.734375"
                        height="34.875"
                        rx="4"
                    />
                    <text
                        x="88.57131788114445"
                        y="197.92023670280642"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        ¬b, a
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-110.015625"
                        y="172.421875"
                        width="43.484375"
                        height="34.875"
                        rx="4"
                    />
                    <text
                        x="-88.57131788114444"
                        y="197.92023670280642"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        ¬a
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-213"
                        y="33.921875"
                        width="27.953125"
                        height="34.875"
                        rx="4"
                    />
                    <text
                        x="-199.01794475330775"
                        y="59.424547176481894"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        c
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-174.171875"
                        y="-138.78125"
                        width="29.140625"
                        height="34.890625"
                        rx="4"
                    />
                    <text
                        x="-159.60000000000002"
                        y="-113.27675286563164"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        b
                    </text>
                </g>
            </g>
        ),
        viewBox:
            "-291.0496682300446 -242.04966823004457 582.0993364600891 484.09933646008915",
    },
    {
        href: Calculus.propResolution,
        name: "First Order Resolution",
        image: (
            <g transform="translate(0 0) scale(1)">
                <circle class={circle} cx="0" cy="0" r="285.44197308735096" />
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-31.3125"
                        y="-297.515625"
                        width="62.625"
                        height="34.984375"
                        rx="4"
                    />
                    <text
                        x="1.7478279934186463e-14"
                        y="-271.44197308735096"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        R(a)
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="190.140625"
                        y="-154.796875"
                        width="114.109375"
                        height="34.984375"
                        rx="4"
                    />
                    <text
                        x="247.19999999999996"
                        y="-128.72098654367548"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        R(f(b, X))
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="123.109375"
                        y="130.640625"
                        width="248.1875"
                        height="35"
                        rx="4"
                    />
                    <text
                        x="247.2"
                        y="156.72098654367542"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        ¬R(f(b, a)), ¬R(f(b, a))
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-111.828125"
                        y="273.359375"
                        width="223.65625"
                        height="35"
                        rx="4"
                    />
                    <text
                        x="1.7478279934186463e-14"
                        y="299.44197308735096"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        ¬R(a), ¬R(a), ¬R(a)
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-291.578125"
                        y="130.640625"
                        width="88.765625"
                        height="35"
                        rx="4"
                    />
                    <text
                        x="-247.19999999999993"
                        y="156.72098654367556"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        Q(sk1)
                    </text>
                </g>
                <g class="_1ALIMVtYlwE7FauJk6qo-n">
                    <rect
                        class={style.rect}
                        x="-285.859375"
                        y="-154.796875"
                        width="77.328125"
                        height="34.984375"
                        rx="4"
                    />
                    <text
                        x="-247.2000000000001"
                        y="-128.7209865436753"
                        text-anchor="middle"
                        class=" _3enLjHr0Txl6vJWbFb6BQM"
                    >
                        ¬Q(c)
                    </text>
                </g>
            </g>
        ),
        viewBox:
            "-416.9861703960861 -331.4861703960861 833.9723407921722 662.9723407921722",
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
