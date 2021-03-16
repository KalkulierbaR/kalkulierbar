import { h } from "preact";

import { circle } from "../../components/calculus/resolution/circle/style.scss";
import { Calculus } from "../../types/calculus";

import { Route } from ".";
import * as style from "./style.scss";

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
        href: Calculus.foResolution,
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
    {
        href: Calculus.ncTableaux,
        name: "NC Tableaux",
        viewBox: "0 -16 450.015625 360",
        image: (
            <g transform="translate(0 0) scale(1)">
                <g transform="translate(0 0)">
                    <line
                        class={style.link}
                        x1="225.0078125"
                        y1="22"
                        x2="225.0078125"
                        y2="72"
                    />
                    <g transform="translate(0 0)">
                        <line
                            class={style.link}
                            x1="225.0078125"
                            y1="94"
                            x2="225.0078125"
                            y2="144"
                        />
                        <g transform="translate(0 0)">
                            <line
                                class={style.link}
                                x1="225.0078125"
                                y1="166"
                                x2="225.0078125"
                                y2="216"
                            />
                            <g transform="translate(0 0)">
                                <line
                                    class={style.link}
                                    x1="225.0078125"
                                    y1="238"
                                    x2="225.0078125"
                                    y2="288"
                                />
                                <g transform="translate(0 0)">
                                    <g class=" _5SInOarzdiLjFyGlFRcqs _2m8hPOXERrg4LZKpF0rI2i">
                                        <rect
                                            class={style.rect}
                                            x="188.15625"
                                            y="284.734375"
                                            width="73.703125"
                                            height="26.609375"
                                            rx="4"
                                        />
                                        <text
                                            text-anchor="middle"
                                            class=""
                                            x="225.0078125"
                                            y="304"
                                        >
                                            ¬R(f(X))
                                        </text>
                                    </g>
                                </g>
                                <g class=" _5SInOarzdiLjFyGlFRcqs _2m8hPOXERrg4LZKpF0rI2i">
                                    <rect
                                        class={style.rect}
                                        x="165.140625"
                                        y="212.734375"
                                        width="119.734375"
                                        height="26.609375"
                                        rx="4"
                                    />
                                    <text
                                        text-anchor="middle"
                                        class=""
                                        x="225.0078125"
                                        y="232"
                                    >
                                        (∀X: ¬R(f(X)))
                                    </text>
                                </g>
                            </g>
                            <g class=" _5SInOarzdiLjFyGlFRcqs _2m8hPOXERrg4LZKpF0rI2i">
                                <rect
                                    class={style.rect}
                                    x="148.453125"
                                    y="140.734375"
                                    width="153.109375"
                                    height="26.609375"
                                    rx="4"
                                />
                                <text
                                    text-anchor="middle"
                                    class=""
                                    x="225.0078125"
                                    y="160"
                                >
                                    (R(f(a)) ∨ ¬R(f(b)))
                                </text>
                            </g>
                        </g>
                        <g class=" _5SInOarzdiLjFyGlFRcqs _2m8hPOXERrg4LZKpF0rI2i">
                            <rect
                                class={style.rect}
                                x="169.90625"
                                y="68.734375"
                                width="110.203125"
                                height="26.609375"
                                rx="4"
                            />
                            <text
                                text-anchor="middle"
                                class=""
                                x="225.0078125"
                                y="88"
                            >
                                (∀X: R(f(X)))
                            </text>
                        </g>
                    </g>
                    <g class=" _5SInOarzdiLjFyGlFRcqs _2m8hPOXERrg4LZKpF0rI2i">
                        <rect
                            class={style.rect}
                            x="14.421875"
                            y="-3.265625"
                            width="421.171875"
                            height="26.609375"
                            rx="4"
                        />
                        <text
                            text-anchor="middle"
                            class=""
                            x="225.0078125"
                            y="16"
                        >
                            (((∀X: ¬R(f(X))) ∧ (R(f(a)) ∨ ¬R(f(b)))) ∧ (∀X:
                            R(f(X))))
                        </text>
                    </g>
                </g>
            </g>
        ),
    },
    {
        href: Calculus.dpll,
        name: "DPLL",
        viewBox: "0 -16 385.5 504",
        image: (
            <g transform="translate(0 0) scale(1)">
                <line
                    class={style.link}
                    x1="159.9375"
                    y1="22"
                    x2="51.5"
                    y2="72"
                />
                <line
                    class={style.link}
                    x1="159.9375"
                    y1="22"
                    x2="263.875"
                    y2="72"
                />
                <line class={style.link} x1="51.5" y1="94" x2="51.5" y2="144" />
                <line
                    class={style.link}
                    x1="51.5"
                    y1="166"
                    x2="51.5"
                    y2="216"
                />
                <line
                    class={style.link}
                    x1="263.875"
                    y1="94"
                    x2="189.25"
                    y2="144"
                />
                <line
                    class={style.link}
                    x1="263.875"
                    y1="94"
                    x2="334"
                    y2="144"
                />
                <line
                    class={style.link}
                    x1="189.25"
                    y1="166"
                    x2="135.5"
                    y2="216"
                />
                <line
                    class={style.link}
                    x1="189.25"
                    y1="166"
                    x2="238.5"
                    y2="216"
                />
                <line
                    class={style.link}
                    x1="135.5"
                    y1="238"
                    x2="135.5"
                    y2="288"
                />
                <line
                    class={style.link}
                    x1="135.5"
                    y1="310"
                    x2="135.5"
                    y2="360"
                />
                <line
                    class={style.link}
                    x1="135.5"
                    y1="382"
                    x2="135.5"
                    y2="432"
                />
                <line
                    class={style.link}
                    x1="238.5"
                    y1="238"
                    x2="238.5"
                    y2="288"
                />
                <line
                    class={style.link}
                    x1="238.5"
                    y1="310"
                    x2="238.5"
                    y2="360"
                />
                <line
                    class={style.link}
                    x1="238.5"
                    y1="382"
                    x2="238.5"
                    y2="432"
                />
                <line class={style.link} x1="334" y1="166" x2="334" y2="216" />
                <line class={style.link} x1="334" y1="238" x2="334" y2="288" />
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rect}
                        x="138.25"
                        y="-2.03125"
                        width="43.375"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="159.9375"
                        y="16"
                    >
                        true
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rect}
                        x="39.15625"
                        y="69.96875"
                        width="25.359375"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="51.5"
                        y="88"
                    >
                        a
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rect}
                        x="246.859375"
                        y="69.96875"
                        width="34.703125"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="263.875"
                        y="88"
                    >
                        ¬a
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rect}
                        x="177.234375"
                        y="141.96875"
                        width="24.03125"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="189.25"
                        y="160"
                    >
                        c
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rect}
                        x="317.3125"
                        y="141.96875"
                        width="33.375"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="334"
                        y="160"
                    >
                        ¬c
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rect}
                        x="27.8125"
                        y="141.96875"
                        width="47.375"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="51.5"
                        y="160"
                    >
                        prop
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rectAccent}
                        x="20.796875"
                        y="213.96875"
                        width="61.40625"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="51.5"
                        y="232"
                    >
                        closed
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rect}
                        x="310.3125"
                        y="213.96875"
                        width="47.375"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="334"
                        y="232"
                    >
                        prop
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rectAccent}
                        x="303.296875"
                        y="285.96875"
                        width="61.40625"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="334"
                        y="304"
                    >
                        closed
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rect}
                        x="123.15625"
                        y="213.96875"
                        width="24.6875"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="135.5"
                        y="232"
                    >
                        d
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rect}
                        x="221.484375"
                        y="213.96875"
                        width="34.03125"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="238.5"
                        y="232"
                    >
                        ¬d
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rect}
                        x="214.8125"
                        y="285.96875"
                        width="47.375"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="238.5"
                        y="304"
                    >
                        prop
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rect}
                        x="214.8125"
                        y="357.96875"
                        width="47.375"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="238.5"
                        y="376"
                    >
                        prop
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rectAccent}
                        x="207.796875"
                        y="429.96875"
                        width="61.40625"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="238.5"
                        y="448"
                    >
                        closed
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rect}
                        x="111.8125"
                        y="285.96875"
                        width="47.375"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="135.5"
                        y="304"
                    >
                        prop
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rect}
                        x="111.8125"
                        y="357.96875"
                        width="47.375"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="135.5"
                        y="376"
                    >
                        prop
                    </text>
                </g>
                <g class="XuCDdED6RE_qaP4tVyDTP">
                    <rect
                        class={style.rectAccent}
                        x="104.796875"
                        y="429.96875"
                        width="61.40625"
                        height="26.046875"
                        rx="4"
                    />
                    <text
                        class=" _24lb4yn7YUpp8lik_f1zsc"
                        text-anchor="middle"
                        x="135.5"
                        y="448"
                    >
                        closed
                    </text>
                </g>
            </g>
        ),
    },
    {
        href: Calculus.psc,
        name: "Propositional Sequent Calculus",
        viewBox: "0 -15 225 200",
        image: (
            <g transform="translate(0 0) scale(1)">
                <g>
                    <g transform="translate(0 0)">
                        <g transform="translate(0 0)">
                            <g transform="translate(0 0)">
                                <g transform="translate(0 0)">
                                    <g transform="translate(0 0)">
                                        <g>
                                            <text
                                                class="_1exVju-unaGRf1VM4onP8K"
                                                text-anchor="middle"
                                                x="42.57500076293945"
                                                y="-8"
                                            />
                                            <g>
                                                <g>
                                                    <text
                                                        class="_1exVju-unaGRf1VM4onP8K"
                                                        text-anchor="middle"
                                                        x="42.57500076293945"
                                                        y="34"
                                                    >
                                                        a ⊢ a
                                                    </text>
                                                    <line
                                                        class={style.link}
                                                        x1="15.816532135009766"
                                                        y1="7"
                                                        x2="69.33346939086914"
                                                        y2="7"
                                                    />
                                                    <text
                                                        class={
                                                            style.changeabletext
                                                        }
                                                        text-anchor="middle"
                                                        x="84.33346939086914"
                                                        y="9"
                                                    >
                                                        Ax
                                                    </text>
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                    <g>
                                        <text
                                            class="_1exVju-unaGRf1VM4onP8K"
                                            text-anchor="middle"
                                            x="42.57500076293945"
                                            y="34"
                                        >
                                            a ⊢ a
                                        </text>
                                        <rect
                                            class={style.rect}
                                            x="15.816532135009766"
                                            y="15.772357940673828"
                                            width="53.516937255859375"
                                            height="25.615177154541016"
                                            rx="4"
                                        />
                                        <g>
                                            <g>
                                                <g>
                                                    <rect
                                                        class={style.rect}
                                                        x="23.811925888061523"
                                                        y="19.772357940673828"
                                                        width="12.90921401977539"
                                                        height="17.615177154541016"
                                                        rx="4"
                                                    />
                                                    <text
                                                        text-anchor="middle"
                                                        class="_2OwwaKyvRD3KxoJMgLeJ9w"
                                                        x="30.266531944274902"
                                                        y="34"
                                                    >
                                                        a
                                                    </text>
                                                </g>
                                                <text
                                                    class="Rns9gYkaJwEG0jUTvFfUP"
                                                    text-anchor="left"
                                                    x="36.71653175354004"
                                                    y="34"
                                                >
                                                    ⊢
                                                </text>
                                                <g>
                                                    <rect
                                                        class={style.rect}
                                                        x="48.71192169189453"
                                                        y="19.772357940673828"
                                                        width="12.90921401977539"
                                                        height="17.615177154541016"
                                                        rx="4"
                                                    />
                                                    <text
                                                        text-anchor="middle"
                                                        class="_2OwwaKyvRD3KxoJMgLeJ9w"
                                                        x="55.166531562805176"
                                                        y="34"
                                                    >
                                                        a
                                                    </text>
                                                </g>
                                            </g>
                                            <g>
                                                <text
                                                    class="_1exVju-unaGRf1VM4onP8K"
                                                    text-anchor="middle"
                                                    x="42.57500076293945"
                                                    y="76"
                                                >
                                                    ⊢ ¬a, a
                                                </text>
                                                <line
                                                    class={style.link}
                                                    x1="8.914432525634766"
                                                    y1="49"
                                                    x2="76.23556900024414"
                                                    y2="49"
                                                />
                                                <text
                                                    class={style.changeabletext}
                                                    text-anchor="middle"
                                                    x="91.23556900024414"
                                                    y="51"
                                                >
                                                    ¬R
                                                </text>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                                <g>
                                    <text
                                        class="_1exVju-unaGRf1VM4onP8K"
                                        text-anchor="middle"
                                        x="42.57500076293945"
                                        y="76"
                                    >
                                        ⊢ ¬a, a
                                    </text>
                                    <rect
                                        class={style.rect}
                                        x="8.914430618286133"
                                        y="57.77235794067383"
                                        width="67.32113647460938"
                                        height="25.615177154541016"
                                        rx="4"
                                    />
                                    <g>
                                        <g>
                                            <text
                                                class="Rns9gYkaJwEG0jUTvFfUP"
                                                text-anchor="left"
                                                x="16.914430618286133"
                                                y="76"
                                            >
                                                ⊢
                                            </text>
                                            <g>
                                                <rect
                                                    class={style.rect}
                                                    x="28.910024642944336"
                                                    y="61.77235794067383"
                                                    width="22.258808135986328"
                                                    height="17.615177154541016"
                                                    rx="4"
                                                />
                                                <text
                                                    text-anchor="middle"
                                                    class="_2OwwaKyvRD3KxoJMgLeJ9w"
                                                    x="40.03943061828613"
                                                    y="76"
                                                >
                                                    ¬a
                                                </text>
                                            </g>
                                            <text
                                                class="Rns9gYkaJwEG0jUTvFfUP"
                                                text-anchor="left"
                                                x="51.16443061828613"
                                                y="76"
                                            >
                                                ,
                                            </text>
                                            <g>
                                                <rect
                                                    class={style.rect}
                                                    x="55.159820556640625"
                                                    y="61.77235794067383"
                                                    width="12.90921401977539"
                                                    height="17.615177154541016"
                                                    rx="4"
                                                />
                                                <text
                                                    text-anchor="middle"
                                                    class="_2OwwaKyvRD3KxoJMgLeJ9w"
                                                    x="61.61443042755127"
                                                    y="76"
                                                >
                                                    a
                                                </text>
                                            </g>
                                        </g>
                                        <g>
                                            <text
                                                class="_1exVju-unaGRf1VM4onP8K"
                                                text-anchor="middle"
                                                x="42.57500076293945"
                                                y="118"
                                            >
                                                ⊢ (¬a ∨ a)
                                            </text>
                                            <line
                                                class={style.link}
                                                x1="-1.1380729675292969"
                                                y1="91"
                                                x2="86.2880744934082"
                                                y2="91"
                                            />
                                            <text
                                                class={style.changeabletext}
                                                text-anchor="middle"
                                                x="101.2880744934082"
                                                y="93"
                                            >
                                                ∨R
                                            </text>
                                        </g>
                                    </g>
                                </g>
                            </g>
                            <g>
                                <text
                                    class="_1exVju-unaGRf1VM4onP8K"
                                    text-anchor="middle"
                                    x="42.57500076293945"
                                    y="118"
                                >
                                    ⊢ (¬a ∨ a)
                                </text>
                                <rect
                                    class={style.rect}
                                    x="-1.1380767822265625"
                                    y="99.77235412597656"
                                    width="87.4261474609375"
                                    height="25.615177154541016"
                                    rx="4"
                                />
                                <g>
                                    <g>
                                        <text
                                            class="Rns9gYkaJwEG0jUTvFfUP"
                                            text-anchor="left"
                                            x="6.8619232177734375"
                                            y="118"
                                        >
                                            ⊢
                                        </text>
                                        <g>
                                            <rect
                                                class={style.rect}
                                                x="18.84579849243164"
                                                y="103.77235412597656"
                                                width="60.182247161865234"
                                                height="17.615177154541016"
                                                rx="4"
                                            />
                                            <text
                                                text-anchor="middle"
                                                class="_2OwwaKyvRD3KxoJMgLeJ9w"
                                                x="48.93692398071289"
                                                y="118"
                                            >
                                                (¬a ∨ a)
                                            </text>
                                        </g>
                                    </g>
                                    <g>
                                        <text
                                            class="_1exVju-unaGRf1VM4onP8K"
                                            text-anchor="middle"
                                            x="104.21666717529297"
                                            y="160"
                                        >
                                            ⊢ ((¬a ∨ a) ∧ (b → b))
                                        </text>
                                        <line
                                            class={style.link}
                                            x1="-1.1380729675292969"
                                            y1="133"
                                            x2="188.478515625"
                                            y2="133"
                                        />
                                    </g>
                                </g>
                            </g>
                        </g>
                        <g transform="translate(0 0)">
                            <g transform="translate(0 0)">
                                <g transform="translate(0 0)">
                                    <g>
                                        <text
                                            class="_1exVju-unaGRf1VM4onP8K"
                                            text-anchor="middle"
                                            x="167.90833282470703"
                                            y="34"
                                        />
                                        <g>
                                            <g>
                                                <text
                                                    class="_1exVju-unaGRf1VM4onP8K"
                                                    text-anchor="middle"
                                                    x="167.90833282470703"
                                                    y="76"
                                                >
                                                    b ⊢ b
                                                </text>
                                                <line
                                                    class={style.link}
                                                    x1="141.14986419677734"
                                                    y1="49"
                                                    x2="194.66680145263672"
                                                    y2="49"
                                                />
                                                <text
                                                    class={style.changeabletext}
                                                    text-anchor="middle"
                                                    x="209.66680145263672"
                                                    y="51"
                                                >
                                                    Ax
                                                </text>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                                <g>
                                    <text
                                        class="_1exVju-unaGRf1VM4onP8K"
                                        text-anchor="middle"
                                        x="167.90833282470703"
                                        y="76"
                                    >
                                        b ⊢ b
                                    </text>
                                    <rect
                                        class={style.rect}
                                        x="141.1498565673828"
                                        y="57.77235794067383"
                                        width="53.516937255859375"
                                        height="25.615177154541016"
                                        rx="4"
                                    />
                                    <g>
                                        <g>
                                            <g>
                                                <rect
                                                    class={style.rect}
                                                    x="149.14524841308594"
                                                    y="61.77235794067383"
                                                    width="12.90921401977539"
                                                    height="17.615177154541016"
                                                    rx="4"
                                                />
                                                <text
                                                    text-anchor="middle"
                                                    class="_2OwwaKyvRD3KxoJMgLeJ9w"
                                                    x="155.59985637664795"
                                                    y="76"
                                                >
                                                    b
                                                </text>
                                            </g>
                                            <text
                                                class="Rns9gYkaJwEG0jUTvFfUP"
                                                text-anchor="left"
                                                x="162.0498561859131"
                                                y="76"
                                            >
                                                ⊢
                                            </text>
                                            <g>
                                                <rect
                                                    class={style.rect}
                                                    x="174.04525756835938"
                                                    y="61.77235794067383"
                                                    width="12.90921401977539"
                                                    height="17.615177154541016"
                                                    rx="4"
                                                />
                                                <text
                                                    text-anchor="middle"
                                                    class="_2OwwaKyvRD3KxoJMgLeJ9w"
                                                    x="180.49985599517822"
                                                    y="76"
                                                >
                                                    b
                                                </text>
                                            </g>
                                        </g>
                                        <g>
                                            <text
                                                class="_1exVju-unaGRf1VM4onP8K"
                                                text-anchor="middle"
                                                x="167.90833282470703"
                                                y="118"
                                            >
                                                ⊢ (b → b)
                                            </text>
                                            <line
                                                class={style.link}
                                                x1="126.24471664428711"
                                                y1="91"
                                                x2="209.57194900512695"
                                                y2="91"
                                            />
                                            <text
                                                class={style.changeabletext}
                                                text-anchor="middle"
                                                x="224.57194900512695"
                                                y="93"
                                            >
                                                →R
                                            </text>
                                        </g>
                                    </g>
                                </g>
                            </g>
                            <g>
                                <text
                                    class="_1exVju-unaGRf1VM4onP8K"
                                    text-anchor="middle"
                                    x="167.90833282470703"
                                    y="118"
                                >
                                    ⊢ (b → b)
                                </text>
                                <rect
                                    class={style.rect}
                                    x="126.24470520019531"
                                    y="99.77235412597656"
                                    width="83.32723236083984"
                                    height="25.615177154541016"
                                    rx="4"
                                />
                                <g>
                                    <g>
                                        <text
                                            class="Rns9gYkaJwEG0jUTvFfUP"
                                            text-anchor="left"
                                            x="134.2447052001953"
                                            y="118"
                                        >
                                            ⊢
                                        </text>
                                        <g>
                                            <rect
                                                class={style.rect}
                                                x="146.22802734375"
                                                y="103.77235412597656"
                                                width="56.08333206176758"
                                                height="17.615177154541016"
                                                rx="4"
                                            />
                                            <text
                                                text-anchor="middle"
                                                class="_2OwwaKyvRD3KxoJMgLeJ9w"
                                                x="174.2697048187256"
                                                y="118"
                                            >
                                                (b → b)
                                            </text>
                                        </g>
                                    </g>
                                    <g>
                                        <text
                                            class="_1exVju-unaGRf1VM4onP8K"
                                            text-anchor="middle"
                                            x="104.21666717529297"
                                            y="160"
                                        >
                                            ⊢ ((¬a ∨ a) ∧ (b → b))
                                        </text>
                                        <line
                                            class={style.link}
                                            x1="19.954818725585938"
                                            y1="133"
                                            x2="209.57194900512695"
                                            y2="133"
                                        />
                                        <text
                                            class={style.changeabletext}
                                            text-anchor="middle"
                                            x="224.57194900512695"
                                            y="135"
                                        >
                                            ∧R
                                        </text>
                                    </g>
                                </g>
                            </g>
                        </g>
                        <g>
                            <text
                                class="_1exVju-unaGRf1VM4onP8K"
                                text-anchor="middle"
                                x="104.21666717529297"
                                y="160"
                            >
                                ⊢ ((¬a ∨ a) ∧ (b → b))
                            </text>
                            <rect
                                class={style.rect}
                                x="19.95480728149414"
                                y="141.77235412597656"
                                width="168.52369689941406"
                                height="25.615177154541016"
                                rx="4"
                            />
                            <g>
                                <g>
                                    <text
                                        class="Rns9gYkaJwEG0jUTvFfUP"
                                        text-anchor="left"
                                        x="27.95480728149414"
                                        y="160"
                                    >
                                        ⊢
                                    </text>
                                    <g>
                                        <rect
                                            class={style.rect}
                                            x="39.91490173339844"
                                            y="145.77235412597656"
                                            width="141.27980041503906"
                                            height="17.615177154541016"
                                            rx="4"
                                        />
                                        <text
                                            text-anchor="middle"
                                            class="_2OwwaKyvRD3KxoJMgLeJ9w"
                                            x="110.55480575561523"
                                            y="160"
                                        >
                                            ((¬a ∨ a) ∧ (b → b))
                                        </text>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        ),
    },

    {
        href: Calculus.fosc,
        name: "First Order Sequent Calculus",
        viewBox: "225 -15 425 200",
        image: (
            <g transform="translate(74.79953219189508 -1.9106229228477503) scale(0.8321187578652294)">
                <g>
                    <g transform="translate(0 0)">
                        <g transform="translate(0 0)">
                            <g transform="translate(0 0)">
                                <g transform="translate(0 0)">
                                    <g>
                                        <g>
                                            <g>
                                                <text
                                                    class=" _2Vu5lYrTgHMQ3h2i3sb9a6"
                                                    text-anchor="left"
                                                    x="311.28282737731934"
                                                    y="34"
                                                >
                                                    ,
                                                </text>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                                <g transform="translate(0 0)">
                                    <g>
                                        <text
                                            class="_1exVju-unaGRf1VM4onP8K"
                                            text-anchor="middle"
                                            x="630.8166809082031"
                                            y="34"
                                        />
                                    </g>
                                </g>
                                <g>
                                    <text
                                        class="_1exVju-unaGRf1VM4onP8K"
                                        text-anchor="middle"
                                        x="420.8416748046875"
                                        y="76"
                                    >
                                        ∀X: P(X), ∀X: (P(X) → Q(X)), (P(a) →
                                        Q(a)) ⊢ ∃X: Q(X), Q(a)
                                    </text>
                                    <rect
                                        class={style.rect}
                                        x="197.05165100097656"
                                        y="57.79627990722656"
                                        width="447.58001708984375"
                                        height="25.991378784179688"
                                        rx="4"
                                    />
                                    <g>
                                        <g>
                                            <g>
                                                <rect
                                                    class={style.rect}
                                                    x="205.0379180908203"
                                                    y="61.79627990722656"
                                                    width="65.64414978027344"
                                                    height="17.991378784179688"
                                                    rx="4"
                                                />
                                                <text
                                                    text-anchor="middle"
                                                    class=" _3lDoj08wB6FPSIbPIuWGqW Ill0sMM9BHeRdFeYzc8Vb"
                                                    x="237.85998344421387"
                                                    y="76"
                                                >
                                                    ∀X: P(X)
                                                </text>
                                            </g>
                                            <text
                                                class=" _2Vu5lYrTgHMQ3h2i3sb9a6"
                                                text-anchor="left"
                                                x="270.6683158874512"
                                                y="76"
                                            >
                                                ,
                                            </text>
                                            <g>
                                                <rect
                                                    class={style.rect}
                                                    x="274.66064453125"
                                                    y="61.79627990722656"
                                                    width="134.98196411132812"
                                                    height="17.991378784179688"
                                                    rx="4"
                                                />
                                                <text
                                                    text-anchor="middle"
                                                    class=" _3lDoj08wB6FPSIbPIuWGqW Ill0sMM9BHeRdFeYzc8Vb"
                                                    x="342.1516456604004"
                                                    y="76"
                                                >
                                                    ∀X: (P(X) → Q(X))
                                                </text>
                                            </g>
                                            <text
                                                class=" _2Vu5lYrTgHMQ3h2i3sb9a6"
                                                text-anchor="left"
                                                x="409.6349754333496"
                                                y="76"
                                            >
                                                ,
                                            </text>
                                            <g>
                                                <rect
                                                    class={style.rect}
                                                    x="413.6470031738281"
                                                    y="61.79627990722656"
                                                    width="101.7926025390625"
                                                    height="17.991378784179688"
                                                    rx="4"
                                                />
                                                <text
                                                    text-anchor="middle"
                                                    class=" _3lDoj08wB6FPSIbPIuWGqW Ill0sMM9BHeRdFeYzc8Vb"
                                                    x="464.54330825805664"
                                                    y="76"
                                                >
                                                    (P(a) → Q(a))
                                                </text>
                                            </g>
                                            <text
                                                class=" _2Vu5lYrTgHMQ3h2i3sb9a6"
                                                text-anchor="left"
                                                x="515.4516410827637"
                                                y="76"
                                            >
                                                ⊢
                                            </text>
                                            <g>
                                                <rect
                                                    class={style.rect}
                                                    x="527.43994140625"
                                                    y="61.79627990722656"
                                                    width="66.75676727294922"
                                                    height="17.991378784179688"
                                                    rx="4"
                                                />
                                                <text
                                                    text-anchor="middle"
                                                    class=" _3lDoj08wB6FPSIbPIuWGqW Ill0sMM9BHeRdFeYzc8Vb"
                                                    x="560.8183078765869"
                                                    y="76"
                                                >
                                                    ∃X: Q(X)
                                                </text>
                                            </g>
                                            <text
                                                class=" _2Vu5lYrTgHMQ3h2i3sb9a6"
                                                text-anchor="left"
                                                x="594.1849746704102"
                                                y="76"
                                            >
                                                ,
                                            </text>
                                            <g>
                                                <rect
                                                    class={style.rect}
                                                    x="598.1904296875"
                                                    y="61.79627990722656"
                                                    width="36.005714416503906"
                                                    height="17.991378784179688"
                                                    rx="4"
                                                />
                                                <text
                                                    text-anchor="middle"
                                                    class=" _3lDoj08wB6FPSIbPIuWGqW Ill0sMM9BHeRdFeYzc8Vb"
                                                    x="616.1933078765869"
                                                    y="76"
                                                >
                                                    Q(a)
                                                </text>
                                            </g>
                                        </g>
                                        <g>
                                            <g>
                                                <text
                                                    class="_1exVju-unaGRf1VM4onP8K"
                                                    text-anchor="middle"
                                                    x="420.8416748046875"
                                                    y="118"
                                                >
                                                    ∀X: P(X), ∀X: (P(X) → Q(X)),
                                                    (P(a) → Q(a)) ⊢ ∃X: Q(X)
                                                </text>
                                                <line
                                                    class={style.link}
                                                    x1="197.05166625976562"
                                                    y1="91"
                                                    x2="644.6316833496094"
                                                    y2="91"
                                                />
                                                <text
                                                    class={style.changeabletext}
                                                    text-anchor="middle"
                                                    x="659.6316833496094"
                                                    y="93"
                                                >
                                                    ∃R
                                                </text>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                            <g>
                                <text
                                    class="_1exVju-unaGRf1VM4onP8K"
                                    text-anchor="middle"
                                    x="420.8416748046875"
                                    y="118"
                                >
                                    ∀X: P(X), ∀X: (P(X) → Q(X)), (P(a) → Q(a)) ⊢
                                    ∃X: Q(X)
                                </text>
                                <rect
                                    class={style.rect}
                                    x="217.50502014160156"
                                    y="99.79627990722656"
                                    width="406.67327880859375"
                                    height="25.991378784179688"
                                    rx="4"
                                />
                                <g>
                                    <g>
                                        <g>
                                            <rect
                                                class={style.rect}
                                                x="225.4912872314453"
                                                y="103.79627990722656"
                                                width="65.64414978027344"
                                                height="17.991378784179688"
                                                rx="4"
                                            />
                                            <text
                                                text-anchor="middle"
                                                class=" _3lDoj08wB6FPSIbPIuWGqW Ill0sMM9BHeRdFeYzc8Vb"
                                                x="258.31335258483887"
                                                y="118"
                                            >
                                                ∀X: P(X)
                                            </text>
                                        </g>
                                        <text
                                            class=" _2Vu5lYrTgHMQ3h2i3sb9a6 Rns9gYkaJwEG0jUTvFfUP"
                                            text-anchor="left"
                                            x="291.1216850280762"
                                            y="118"
                                        >
                                            ,
                                        </text>
                                        <g>
                                            <rect
                                                class={style.rect}
                                                x="295.114013671875"
                                                y="103.79627990722656"
                                                width="134.98196411132812"
                                                height="17.991378784179688"
                                                rx="4"
                                            />
                                            <text
                                                text-anchor="middle"
                                                class=" _3lDoj08wB6FPSIbPIuWGqW Ill0sMM9BHeRdFeYzc8Vb"
                                                x="362.6050148010254"
                                                y="118"
                                            >
                                                ∀X: (P(X) → Q(X))
                                            </text>
                                        </g>
                                        <text
                                            class=" _2Vu5lYrTgHMQ3h2i3sb9a6 Rns9gYkaJwEG0jUTvFfUP"
                                            text-anchor="left"
                                            x="430.0883445739746"
                                            y="118"
                                        >
                                            ,
                                        </text>
                                        <g>
                                            <rect
                                                class={style.rect}
                                                x="434.1003723144531"
                                                y="103.79627990722656"
                                                width="101.7926025390625"
                                                height="17.991378784179688"
                                                rx="4"
                                            />
                                            <text
                                                text-anchor="middle"
                                                class=" _3lDoj08wB6FPSIbPIuWGqW Ill0sMM9BHeRdFeYzc8Vb"
                                                x="484.99667739868164"
                                                y="118"
                                            >
                                                (P(a) → Q(a))
                                            </text>
                                        </g>
                                        <text
                                            class=" _2Vu5lYrTgHMQ3h2i3sb9a6 Rns9gYkaJwEG0jUTvFfUP"
                                            text-anchor="left"
                                            x="535.9050102233887"
                                            y="118"
                                        >
                                            ⊢
                                        </text>
                                        <g>
                                            <rect
                                                class={style.rect}
                                                x="547.893310546875"
                                                y="103.79627990722656"
                                                width="66.75676727294922"
                                                height="17.991378784179688"
                                                rx="4"
                                            />
                                            <text
                                                text-anchor="middle"
                                                class=" _3lDoj08wB6FPSIbPIuWGqW Ill0sMM9BHeRdFeYzc8Vb"
                                                x="581.2716770172119"
                                                y="118"
                                            >
                                                ∃X: Q(X)
                                            </text>
                                        </g>
                                    </g>
                                    <g>
                                        <g>
                                            <text
                                                class="_1exVju-unaGRf1VM4onP8K"
                                                text-anchor="middle"
                                                x="420.8416748046875"
                                                y="160"
                                            >
                                                ∀X: P(X), ∀X: (P(X) → Q(X)) ⊢
                                                ∃X: Q(X)
                                            </text>
                                            <line
                                                class={style.link}
                                                x1="217.50503540039062"
                                                y1="133"
                                                x2="624.1783142089844"
                                                y2="133"
                                            />
                                            <text
                                                class={style.changeabletext}
                                                text-anchor="middle"
                                                x="639.1783142089844"
                                                y="135"
                                            >
                                                ∀L
                                            </text>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </g>
                        <g>
                            <text
                                class="_1exVju-unaGRf1VM4onP8K"
                                text-anchor="middle"
                                x="420.8416748046875"
                                y="160"
                            >
                                ∀X: P(X), ∀X: (P(X) → Q(X)) ⊢ ∃X: Q(X)
                            </text>
                            <rect
                                class={style.rect}
                                x="270.851806640625"
                                y="141.79627990722656"
                                width="299.9797058105469"
                                height="25.991378784179688"
                                rx="4"
                            />
                            <g>
                                <g>
                                    <g>
                                        <rect
                                            class={style.rect}
                                            x="278.8380432128906"
                                            y="145.79627990722656"
                                            width="65.64414978027344"
                                            height="17.991378784179688"
                                            rx="4"
                                        />
                                        <text
                                            text-anchor="middle"
                                            class=" _3lDoj08wB6FPSIbPIuWGqW Ill0sMM9BHeRdFeYzc8Vb"
                                            x="311.6601390838623"
                                            y="160"
                                        >
                                            ∀X: P(X)
                                        </text>
                                    </g>
                                    <text
                                        class=" _2Vu5lYrTgHMQ3h2i3sb9a6"
                                        text-anchor="left"
                                        x="344.4684715270996"
                                        y="160"
                                    >
                                        ,
                                    </text>
                                    <g>
                                        <rect
                                            class={style.rect}
                                            x="348.4608154296875"
                                            y="145.79627990722656"
                                            width="134.98196411132812"
                                            height="17.991378784179688"
                                            rx="4"
                                        />
                                        <text
                                            text-anchor="middle"
                                            class=" _3lDoj08wB6FPSIbPIuWGqW Ill0sMM9BHeRdFeYzc8Vb"
                                            x="415.9518013000488"
                                            y="160"
                                        >
                                            ∀X: (P(X) → Q(X))
                                        </text>
                                    </g>
                                    <text
                                        class=" _2Vu5lYrTgHMQ3h2i3sb9a6"
                                        text-anchor="left"
                                        x="483.43513107299805"
                                        y="160"
                                    >
                                        ⊢
                                    </text>
                                    <g>
                                        <rect
                                            class={style.rect}
                                            x="495.4234313964844"
                                            y="145.79627990722656"
                                            width="66.75676727294922"
                                            height="17.991378784179688"
                                            rx="4"
                                        />
                                        <text
                                            text-anchor="middle"
                                            class=" _3lDoj08wB6FPSIbPIuWGqW Ill0sMM9BHeRdFeYzc8Vb"
                                            x="528.8017978668213"
                                            y="160"
                                        >
                                            ∃X: Q(X)
                                        </text>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        ),
    },

    {
        href: Calculus.modalTableaux,
        name: "Modal-Tableaux",
        viewBox: "0 -16 250 400",
        image: (
            <g transform="translate(0 0) scale(1)">
                <g>
                    <path
                        d="M 46.77499961853027 304 Q 10.774999618530273 268 46.77499961853027 232"
                        class={style.link}
                    />
                    <path
                        d="M 139.7916660308838 376 Q 103.79166603088379 340 139.7916660308838 304"
                        class={style.link}
                    />
                    <g transform="translate(0 0)">
                        <line
                            class={style.link}
                            x1="121.0791654586792"
                            y1="22"
                            x2="121.0791654586792"
                            y2="72"
                        />
                        <g transform="translate(0 0)">
                            <line
                                class={style.link}
                                x1="121.0791654586792"
                                y1="94"
                                x2="121.0791654586792"
                                y2="144"
                            />
                            <g transform="translate(0 0)">
                                <line
                                    class={style.link}
                                    x1="121.0791654586792"
                                    y1="166"
                                    x2="46.77499961853027"
                                    y2="216"
                                />
                                <g transform="translate(0 0)">
                                    <line
                                        class={style.link}
                                        x1="46.77499961853027"
                                        y1="238"
                                        x2="46.77499961853027"
                                        y2="288"
                                    />
                                    <g transform="translate(0 0)">
                                        <g class=" _1_Mzif8JSl1VZes0ljSNY3 _3gM9omY37lP1ehrOpXxpMc">
                                            <rect
                                                class={style.rect}
                                                x="18.691667556762695"
                                                y="285.3333435058594"
                                                width="57.5"
                                                height="26.66666603088379"
                                                rx="4"
                                            />
                                            <text
                                                text-anchor="middle"
                                                class=" _32unYKTU0JVxI4CxcpWdyn"
                                                x="46.77499961853027"
                                                y="304"
                                            >
                                                1 𝕋 a
                                            </text>
                                        </g>
                                    </g>
                                    <g class=" _1_Mzif8JSl1VZes0ljSNY3 _3gM9omY37lP1ehrOpXxpMc">
                                        <rect
                                            class={style.rect}
                                            x="19.20833396911621"
                                            y="213.3333282470703"
                                            width="56.46666717529297"
                                            height="26.66666603088379"
                                            rx="4"
                                        />
                                        <text
                                            text-anchor="middle"
                                            class=" _32unYKTU0JVxI4CxcpWdyn"
                                            x="46.77499961853027"
                                            y="232"
                                        >
                                            1 𝔽 a
                                        </text>
                                    </g>
                                </g>
                                <line
                                    class={style.link}
                                    x1="121.0791654586792"
                                    y1="166"
                                    x2="190.70833206176758"
                                    y2="216"
                                />
                                <g transform="translate(0 0)">
                                    <line
                                        class={style.link}
                                        x1="190.70833206176758"
                                        y1="238"
                                        x2="139.7916660308838"
                                        y2="288"
                                    />
                                    <g transform="translate(0 0)">
                                        <line
                                            class={style.link}
                                            x1="139.7916660308838"
                                            y1="310"
                                            x2="139.7916660308838"
                                            y2="360"
                                        />
                                        <g transform="translate(0 0)">
                                            <g class=" _1_Mzif8JSl1VZes0ljSNY3 _3gM9omY37lP1ehrOpXxpMc">
                                                <rect
                                                    class={style.rect}
                                                    x="111.70833587646484"
                                                    y="357.3333435058594"
                                                    width="57.5"
                                                    height="26.66666603088379"
                                                    rx="4"
                                                />
                                                <text
                                                    text-anchor="middle"
                                                    class=" _32unYKTU0JVxI4CxcpWdyn"
                                                    x="139.7916660308838"
                                                    y="376"
                                                >
                                                    1 𝕋 a
                                                </text>
                                            </g>
                                        </g>
                                        <g class=" _1_Mzif8JSl1VZes0ljSNY3 _3gM9omY37lP1ehrOpXxpMc">
                                            <rect
                                                class={style.rect}
                                                x="112.22500610351562"
                                                y="285.3333435058594"
                                                width="56.46666717529297"
                                                height="26.66666603088379"
                                                rx="4"
                                            />
                                            <text
                                                text-anchor="middle"
                                                class=" _32unYKTU0JVxI4CxcpWdyn"
                                                x="139.7916660308838"
                                                y="304"
                                            >
                                                1 𝔽 a
                                            </text>
                                        </g>
                                    </g>
                                    <line
                                        class={style.link}
                                        x1="190.70833206176758"
                                        y1="238"
                                        x2="236.94999885559082"
                                        y2="288"
                                    />
                                    <g transform="translate(0 0)">
                                        <g class=" _1_Mzif8JSl1VZes0ljSNY3 _3ntOrbbtMbfQe_DQvjxRJE">
                                            <rect
                                                class={style.rect}
                                                x="204.71665954589844"
                                                y="285.3333435058594"
                                                width="65.80000305175781"
                                                height="26.66666603088379"
                                                rx="4"
                                            />
                                            <text
                                                text-anchor="middle"
                                                class=""
                                                x="236.94999885559082"
                                                y="304"
                                            >
                                                1 𝔽 ¬b
                                            </text>
                                        </g>
                                    </g>
                                    <g class=" _1_Mzif8JSl1VZes0ljSNY3 _3ntOrbbtMbfQe_DQvjxRJE">
                                        <rect
                                            class={style.rect}
                                            x="158.47499084472656"
                                            y="213.3333282470703"
                                            width="65.80000305175781"
                                            height="26.66666603088379"
                                            rx="4"
                                        />
                                        <text
                                            text-anchor="middle"
                                            class=""
                                            x="190.70833206176758"
                                            y="232"
                                        >
                                            1 𝔽 ¬b
                                        </text>
                                    </g>
                                </g>
                                <g class=" _1_Mzif8JSl1VZes0ljSNY3 _3ntOrbbtMbfQe_DQvjxRJE">
                                    <rect
                                        class={style.rect}
                                        x="70.12915802001953"
                                        y="141.3333282470703"
                                        width="103.23332977294922"
                                        height="26.66666603088379"
                                        rx="4"
                                    />
                                    <text
                                        text-anchor="middle"
                                        class=""
                                        x="121.0791654586792"
                                        y="160"
                                    >
                                        1 𝔽 (a ∧ ¬b)
                                    </text>
                                </g>
                            </g>
                            <g class=" _1_Mzif8JSl1VZes0ljSNY3 _3ntOrbbtMbfQe_DQvjxRJE">
                                <rect
                                    class={style.rect}
                                    x="88.8458251953125"
                                    y="69.33333587646484"
                                    width="65.80000305175781"
                                    height="26.66666603088379"
                                    rx="4"
                                />
                                <text
                                    text-anchor="middle"
                                    class=""
                                    x="121.0791654586792"
                                    y="88"
                                >
                                    1 𝔽 ¬a
                                </text>
                            </g>
                        </g>
                        <g class=" _1_Mzif8JSl1VZes0ljSNY3 _3ntOrbbtMbfQe_DQvjxRJE">
                            <rect
                                class={style.rect}
                                x="46.745826721191406"
                                y="-2.6666669845581055"
                                width="150"
                                height="26.66666603088379"
                                rx="4"
                            />
                            <text
                                text-anchor="middle"
                                class=""
                                x="121.0791654586792"
                                y="16"
                            >
                                1 𝔽 (¬a ∨ (a ∧ ¬b))
                            </text>
                        </g>
                    </g>
                </g>
            </g>
        ),
    },
];

export default ROUTES;
