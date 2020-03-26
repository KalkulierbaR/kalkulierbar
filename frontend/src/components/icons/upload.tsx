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

const UploadIcon: preact.FunctionalComponent<Props> = ({
    size = 24,
    fill = "#fff",
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
    >
        <path fill="none" d="M0 0h24v24H0V0z" />
        <path fill={fill} d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
    </svg>
);

export default UploadIcon;
