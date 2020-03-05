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

const SplitIcon: preact.FunctionalComponent<Props> = ({
    size = 24,
    fill = "#fff",
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        transform="rotate(180)"
    >
        <path fill="none" d="M0 0h24v24H0V0z" />
        <path
            fill={fill}
            d="M14 4l2.29 2.29-2.88 2.88 1.42 1.42 2.88-2.88L20 10V4zm-4 0H4v6l2.29-2.29 4.71 4.7V20h2v-8.41l-5.29-5.3z"
        />
    </svg>
);

export default SplitIcon;
