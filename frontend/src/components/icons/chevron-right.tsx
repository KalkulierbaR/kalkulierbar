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

const ChevronRightIcon: preact.FunctionalComponent<Props> = ({
    size = 24,
    fill = "#fff"
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
    >
        <path fill="none" d="M0 0h24v24H0V0z" />
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill={fill} />
    </svg>
);

export default ChevronRightIcon;
