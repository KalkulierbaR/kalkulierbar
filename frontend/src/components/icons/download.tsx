import { h } from "preact";
import Icon from "./icon";

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

const DownloadIcon: preact.FunctionalComponent<Props> = ({ size, fill }) => (
    <Icon
        size={size}
        fill={fill}
        d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
    />
);

export default DownloadIcon;
