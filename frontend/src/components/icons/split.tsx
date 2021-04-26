import {h} from "preact";

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

const SplitIcon: preact.FunctionalComponent<Props> = ({ size, fill }) => (
    <Icon
        size={size}
        fill={fill}
        transform="rotate(180)"
        d="M14 4l2.29 2.29-2.88 2.88 1.42 1.42 2.88-2.88L20 10V4zm-4 0H4v6l2.29-2.29 4.71 4.7V20h2v-8.41l-5.29-5.3z"
    />
);

export default SplitIcon;
