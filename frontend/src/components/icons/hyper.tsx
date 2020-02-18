import { h } from "preact";

interface Props {
    /**
     * Width and height of the icon. Defaults to `24`.
     */
    size?: number;
    /**
     * The fill color to use. Defaults to `#fff`.
     */
    fill?: string;
}

const HyperIcon: preact.FunctionalComponent<Props> = ({
    size = 24,
    fill = "#fff",
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height={size}
        width={size}
        viewBox="0 0 24 24"
    >
        <path d="M0 0h24v24H0V0z" fill="none" />
        <g>
            <circle cx="7" cy="14" r="3" fill={fill} />
            <circle cx="11" cy="6" r="3" fill={fill} />
            <circle cx="16.6" cy="17.6" r="3" fill={fill} />
        </g>
    </svg>
);

export default HyperIcon;
