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

const CheckIcon: preact.FunctionalComponent<Props> = ({ size, fill }) => (
    <Icon
        size={size}
        fill={fill}
        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
    />
);

export default CheckIcon;
