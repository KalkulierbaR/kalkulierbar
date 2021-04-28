import { h } from "preact";

import {
    ModalCalculusType,
    TableauxCalculusType,
} from "../../../types/calculus";
import { useAppState } from "../../../util/app-state";
import { nextOpenLeaf } from "../../../util/tableaux";
import ExploreIcon from "../../icons/explore";

import FAB from "./index";

interface Props {
    /**
     * Which calculus to use
     */
    calculus: TableauxCalculusType | ModalCalculusType;
}

const NextLeafFAB: preact.FunctionalComponent<Props> = ({ calculus }) => {
    const { [calculus]: state } = useAppState();

    return (
        <FAB
            icon={<ExploreIcon />}
            label="Next Leaf"
            mini={true}
            extended={true}
            showIconAtEnd={true}
            onClick={() => {
                const node = nextOpenLeaf(state!.tree);
                if (node === undefined) {
                    return;
                }
                dispatchEvent(
                    new CustomEvent("go-to", {
                        detail: { node },
                    }),
                );
            }}
        />
    );
};

export default NextLeafFAB;
