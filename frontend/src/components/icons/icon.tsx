import { h } from "preact";

interface Props {
    d: string;
    /**
     * Width and height of the icon. Defaults to `24`.
     */
    size?: number;
    /**
     * The fill color to use. Defaults to `#fff`.
     */
    fill?: string;
    /**
     * The transform to apply
     */
    transform?: string;
    /**
     * Whether to render the additional box path at the end. Defaults to `false`
     */
    boxAtEnd?: boolean;
}

const Icon: preact.FunctionalComponent<Props> = ({
    d,
    size = 24,
    fill = "#fff",
    transform,
    boxAtEnd = false,
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        transform={transform}
    >
        {!boxAtEnd && <path fill="none" d="M0 0h24v24H0V0z" />}
        <path fill={fill} d={d} />
        {boxAtEnd && <path fill="none" d="M0 0h24v24H0V0z" />}
    </svg>
);

export default Icon;
