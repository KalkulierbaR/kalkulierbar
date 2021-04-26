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

const UploadIcon: preact.FunctionalComponent<Props> = ({ size, fill }) => (
    <Icon size={size} fill={fill} d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
);

export default UploadIcon;
