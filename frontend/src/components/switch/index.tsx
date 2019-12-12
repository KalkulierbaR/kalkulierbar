import { Component, createRef, h } from "preact";
import * as style from "./style.css";

import { MDCSwitch } from "@material/switch";

import "@material/switch/dist/mdc.switch.css";

interface Props {
    onChange?: (checked: boolean) => void;
    label?: string;
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

    private _changeHandler() {
        if (!this.formElement.current || !this.props.onChange) {
            return;
        }
        this.props.onChange(this.formElement.current.checked);
    }

    private _clickLabel() {
        if (!this.formElement.current) {
            return;
        }
        this.formElement.current.focus();
        this.formElement.current.click();
    }
}
