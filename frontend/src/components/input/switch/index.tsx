import { MDCSwitch } from "@material/switch";
import { Component, createRef, h } from "preact";

import * as style from "./style.scss";

interface Props {
    /**
     * The function to call, when the switch changes state
     */
    onChange?: (checked: boolean) => void;
    /**
     * The switch's label
     */
    label?: string;
    /**
     * Initial state of the switch
     */
    initialState?: boolean;
}

export default class Switch extends Component<Props, {}> {
    public MDComponent?: MDCSwitch;
    public formElement = createRef<HTMLInputElement>();
    public switch = createRef<HTMLDivElement>();

    public changeHandler = this._changeHandler.bind(this);
    public clickLabel = this._clickLabel.bind(this);
    protected mdcProps = ["disabled", "checked"];
    protected mdcNotifyProps = ["disabled", "checked"];

    public componentDidMount() {
        if (!this.switch.current) {
            return;
        }
        this.MDComponent = new MDCSwitch(this.switch.current);
        if (this.props.initialState) {
            this.MDComponent.checked = this.props.initialState;
        }
    }

    public componentWillUnmount() {
        if (this.MDComponent) {
            this.MDComponent.destroy();
        }
    }

    public render({ label }: Props) {
        return (
            <div class={style.container}>
                <div class="mdc-switch" ref={this.switch}>
                    <div class="mdc-switch__track" />
                    <div class={`mdc-switch__thumb-underlay ${style.noRipple}`}>
                        <div class="mdc-switch__thumb">
                            <input
                                ref={this.formElement}
                                type="checkbox"
                                id="basic-switch"
                                class="mdc-switch__native-control"
                                role="switch"
                                onChange={this.changeHandler}
                            />
                        </div>
                    </div>
                </div>
                <label class={style.label} onClick={this.clickLabel}>
                    {label}
                </label>
            </div>
        );
    }

    /**
     * Handle the change of the switch's state
     * @returns {void}
     */
    private _changeHandler() {
        if (!this.formElement.current || !this.props.onChange) {
            return;
        }
        this.props.onChange(this.formElement.current.checked);
    }

    /**
     * Handle clicks on the switch's label
     * @returns {void}
     */
    private _clickLabel() {
        if (!this.formElement.current) {
            return;
        }
        this.formElement.current.focus();
        this.formElement.current.click();
    }
}
