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

const ChevronRightIcon: preact.FunctionalComponent<Props> = ({
    size,
    fill,
}) => (
    <Icon
        size={size}
        fill={fill}
        d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
    />
);

export default ChevronRightIcon;
