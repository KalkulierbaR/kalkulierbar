import { h } from "preact";
import { Route } from ".";
import { Calculus } from "../../types/calculus";
import { circle } from "../../components/calculus/resolution/circle/style.scss";

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
        viewBox: "0 -16 450.015625 360",
        image: (
            <text/>
            // <g transform="translate(0 0) scale(1)"><g><g transform="translate(0 0)"><g transform="translate(0 0)"><g transform="translate(0 0)"><g><text class="_1exVju-unaGRf1VM4onP8K" text-anchor="middle" x="50.5859375" y="76"> ⊢ a, b</text><rect class=" _1YOxAJZOO0CtDQjoblNpZr  _3U4azqckUD7-LJadtNLc79" x="20.046875" y="57.546875" width="61.078125" height="25.75" rx="4"></rect><g><g><text class="Rns9gYkaJwEG0jUTvFfUP" text-anchor="left" x="28.046875" y="76">⊢</text><g><rect class=" _49e6ilIXQ2Hmr6aKFJiRj" x="40.09375" y="61.546875" width="13.140625" height="17.75" rx="4"></rect><text text-anchor="middle" class="_2OwwaKyvRD3KxoJMgLeJ9w" x="46.546875" y="76">a</text></g><text class="Rns9gYkaJwEG0jUTvFfUP" text-anchor="left" x="53.046875" y="76">,</text><g><rect class=" _49e6ilIXQ2Hmr6aKFJiRj" x="57.09375" y="61.546875" width="12.90625" height="17.75" rx="4"></rect><text text-anchor="middle" class="_2OwwaKyvRD3KxoJMgLeJ9w" x="63.546875" y="76">b</text></g></g><g><text class="_1exVju-unaGRf1VM4onP8K" text-anchor="middle" x="100.671875" y="118"> ⊢ a, (b ∧ c)</text><line class="brqqU8eXcKN6YOeLM2A7R" x1="20.046875" y1="91" x2="150.84375" y2="91"></line></g></g></g></g><g transform="translate(0 0)"><g><text class="_1exVju-unaGRf1VM4onP8K" text-anchor="middle" x="151.2578125" y="76"> ⊢ a, c</text><rect class=" _1YOxAJZOO0CtDQjoblNpZr  _3U4azqckUD7-LJadtNLc79" x="121.171875" y="57.546875" width="60.171875" height="25.75" rx="4"></rect><g><g><text class="Rns9gYkaJwEG0jUTvFfUP" text-anchor="left" x="129.171875" y="76">⊢</text><g><rect class=" _49e6ilIXQ2Hmr6aKFJiRj" x="141.21875" y="61.546875" width="13.140625" height="17.75" rx="4"></rect><text text-anchor="middle" class="_2OwwaKyvRD3KxoJMgLeJ9w" x="147.671875" y="76">a</text></g><text class="Rns9gYkaJwEG0jUTvFfUP" text-anchor="left" x="154.171875" y="76">,</text><g><rect class=" _49e6ilIXQ2Hmr6aKFJiRj" x="158.171875" y="61.546875" width="12" height="17.75" rx="4"></rect><text text-anchor="middle" class="_2OwwaKyvRD3KxoJMgLeJ9w" x="164.171875" y="76">c</text></g></g><g><text class="_1exVju-unaGRf1VM4onP8K" text-anchor="middle" x="100.671875" y="118"> ⊢ a, (b ∧ c)</text><line class="brqqU8eXcKN6YOeLM2A7R" x1="50.5" y1="91" x2="181.34375" y2="91"></line><text class="_14oAyu-VnhwjB4T5n9oYBl" text-anchor="middle" x="196.34375" y="93">∧R</text></g></g></g></g><g><text class="_1exVju-unaGRf1VM4onP8K" text-anchor="middle" x="100.671875" y="118"> ⊢ a, (b ∧ c)</text><rect class=" _1YOxAJZOO0CtDQjoblNpZr  _3U4azqckUD7-LJadtNLc79" x="50.5" y="99.546875" width="100.34375" height="25.75" rx="4"></rect><g><g><text class="Rns9gYkaJwEG0jUTvFfUP" text-anchor="left" x="58.5" y="118">⊢</text><g><rect class=" _49e6ilIXQ2Hmr6aKFJiRj" x="70.546875" y="103.546875" width="13.140625" height="17.75" rx="4"></rect><text text-anchor="middle" class="_2OwwaKyvRD3KxoJMgLeJ9w" x="77" y="118">a</text></g><text class="Rns9gYkaJwEG0jUTvFfUP" text-anchor="left" x="83.5" y="118">,</text><g><rect class=" _49e6ilIXQ2Hmr6aKFJiRj" x="87.5" y="103.546875" width="52.15625" height="17.75" rx="4"></rect><text text-anchor="middle" class="_2OwwaKyvRD3KxoJMgLeJ9w" x="113.578125" y="118">(b ∧ c)</text></g></g><g><text class="_1exVju-unaGRf1VM4onP8K" text-anchor="middle" x="100.671875" y="160"> ⊢ (a ∨ (b ∧ c))</text><line class="brqqU8eXcKN6YOeLM2A7R" x1="39.328125" y1="133" x2="162.015625" y2="133"></line><text class="_14oAyu-VnhwjB4T5n9oYBl" text-anchor="middle" x="177.015625" y="135">∨R</text></g></g></g></g><g><text class="_1exVju-unaGRf1VM4onP8K" text-anchor="middle" x="100.671875" y="160"> ⊢ (a ∨ (b ∧ c))</text><rect class=" _1YOxAJZOO0CtDQjoblNpZr  _3U4azqckUD7-LJadtNLc79" x="39.328125" y="141.546875" width="122.6875" height="25.75" rx="4"></rect><g><g><text class="Rns9gYkaJwEG0jUTvFfUP" text-anchor="left" x="47.328125" y="160">⊢</text><g><rect class=" _49e6ilIXQ2Hmr6aKFJiRj" x="59.328125" y="145.546875" width="92.3125" height="17.75" rx="4"></rect><text text-anchor="middle" class="_2OwwaKyvRD3KxoJMgLeJ9w" x="105.484375" y="160">(a ∨ (b ∧ c))</text></g></g></g></g></g></g></g>
        ),
    },

    {
        href: Calculus.fosc,
        name: "First Order Sequent Calculus",
        viewBox:"0 -16 450.015625 360",
        image:(
            <text
            
            />
        ),
    },

    {
        href: Calculus.modalTableaux,
        name:"Modal-Tableaux",
        viewBox: "0 -16 450.015625 360",
        image:(
            <text

            />
        )
    }
];

export default ROUTES;
