import preact, {h} from "preact";

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

const AddIcon: preact.FunctionalComponent<Props> = ({
    size = 24,
    fill = "#fff",
}) => <Icon size={size} fill={fill} d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />;

export default AddIcon;
