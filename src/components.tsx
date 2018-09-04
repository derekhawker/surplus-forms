import * as Surplus from "surplus";
import S, {DataSignal} from "s-js";
import {InputState} from "./FormState";
import {
    __BaseInputComponent,
    defaultCSSClasses, filterNonHTMLProps,
    joinClasses,
    StandardProps,
    StandardTextProps,
    SurplusProps,
} from "./internal-components";
import data from "surplus-mixin-data";

export interface TextInputProps extends StandardProps, StandardTextProps {}

export function InputText(props: TextInputProps): JSX.Element {
    return <BaseTextInput {...props} type="text">{props.children}</BaseTextInput>;
}

export interface ColorInputProps extends StandardProps {}

export function InputColor(props: ColorInputProps): JSX.Element {
    return <BaseTextInput {...props} type="color">{props.children}</BaseTextInput>;
}

export function InputEmail(props: TextInputProps): JSX.Element {
    return <BaseTextInput {...props} type="email">{props.children}</BaseTextInput>;
}

export interface InputPasswordProps extends StandardProps, StandardTextProps {}

export function InputPassword(props: InputPasswordProps): JSX.Element {
    return <BaseTextInput {...props} type="password">{props.children}</BaseTextInput>;
}

export interface InputRangeProps extends StandardProps {
    min?: number | string;
    max?: number | string;
    step?: number | string
}

export interface InputNumberProps extends StandardProps, StandardTextProps {
    step?: number | string
}

export function InputNumber(props: InputNumberProps): JSX.Element {
    return <BaseTextInput {...props} type="number">{props.children}</BaseTextInput>;
}

export function InputRange(props: InputRangeProps): JSX.Element {
    return <BaseTextInput {...props} type="range">{props.children}</BaseTextInput>;
}

export interface TextAreaProps extends StandardProps, StandardTextProps {}

export function TextArea(props: TextAreaProps): JSX.Element {
    let htmlProps = filterNonHTMLProps(props);
    let errorClasses = props.classes || defaultCSSClasses;
    return __BaseInputComponent(props, convertFromInputState, convertToInputState, render);

    function convertFromInputState(inputState: InputState<any>, currentSignal: string | undefined) {
        if (props.trimWhitespace && currentSignal) {
            // To avoid whitespace in input from being removed, compare against trimmed current.
            if (inputState.value === currentSignal.trim()) return currentSignal;
            return inputState.value;
        }
        else {
            return inputState.value;
        }
    }

    function convertToInputState(signalValue: string) {
        return props.trimWhitespace ? signalValue.trim() : signalValue;
    }

    function render(signal: DataSignal<any>, handleOnBlur: (ev: Event) => void) {
        return <textarea {...htmlProps}
                         class={joinClasses(props, errorClasses)}
                         id={props.data().name}
                         name={props.data().name}
                         disabled={props.data().isDisabled || props.disabled}
                         onBlur={handleOnBlur}
                         fn={data(signal)}/>;
    }
}

export interface ButtonProps extends SurplusProps {
    disabled?: boolean;
    style?: Partial<CSSStyleDeclaration>;
    class?: string;
}

export function InputSubmit(props: ButtonProps): JSX.Element {
    return <input {...props}
                  type="submit"
                  value="Submit"/>;
}

export function InputReset(props: ButtonProps): JSX.Element {
    return <input {...props}
                  type="reset"
                  value="Reset"/>;
}

export function InputCheckbox(props: TextInputProps): JSX.Element {
    return <BaseTextInput {...props} type="checkbox">{props.children}</BaseTextInput>;
}

export interface SelectProps<T> extends StandardProps {
    options: Array<T>;
    selector?: keyof T | ((option: T) => string);
}

export function Select<T>(props: SelectProps<T>) {
    let htmlProps = filterNonHTMLProps(props);
    return __BaseInputComponent(props, convertFromInputState, convertToInputState, render);

    function convertFromInputState(inputState: InputState<T>, currentSignal: any) {
        return indexOf(inputState.value);
    }

    function convertToInputState(selected: number) {
        // Selected is one of the numbers set in the value attribute of an option.
        // If no option is currently selected, then selected == 0. Since -1 isn't a valid
        // index
        if (selected === 0) return undefined;
        return props.options[selected - 1];
    }

    function indexOf(value: any) {
        if (value == null) return 0;

        let index = props.options.indexOf(value);
        if (index === -1) {
            console.warn("Can't find option", JSON.stringify(value), JSON.stringify(props.options));
        }
        return index + 1; // Add 1 because 0 is a reserved value setting none as selected
    }

    function label(i: number): string {
        let option = props.options[i] as any;
        if (props.selector) {
            // selector is the name of a field in an object in the props.options array
            if (typeof props.selector === "string") {
                return option[props.selector];
            }
            // selector is a function that generates a label
            else {
                return (props.selector as Function)(option);
            }
        }
        else {
            // In this case props.options is assumed to be an array of strings. The label is just the element
            return option;
        }
    }

    function render(signal: DataSignal<any>, handleOnBlur: (ev: Event) => void) {
        let errorClasses = props.classes || defaultCSSClasses;
        return (
            <select {...htmlProps}
                    fn={data(signal)}
                    class={joinClasses(props, errorClasses)}
                    disabled={props.data().isDisabled}
                    onBlur={handleOnBlur}>
                {props.options.map((it, i) => {
                    let text = label(i);
                    let value = i + 1;  // Add 1 because 0 is a reserved value setting none as selected
                    return <option value={value}>{text}</option>;
                })
                }
            </select>);
    }

}

export interface InputRadioProps<T> extends StandardProps {
    options: Array<T>;
    /** descriptive text placed inside the legend element*/
    legendText: string;
    radioClass?: string;
    selector?: keyof T | ((option: T) => string);
}

export function InputRadio<T>(props: InputRadioProps<T>) {
    let htmlProps = filterNonHTMLProps(props);
    let errorClasses = props.classes || defaultCSSClasses;
    return __BaseInputComponent(props, convertFromInputState, convertToInputState, render);

    function convertFromInputState(inputState: InputState<T>, currentSignal: number) {
        return indexOf(inputState.value);
    }

    function convertToInputState(selected: number) {
        return selected === 0 ? undefined : props.options[selected - 1];
    }

    function render(signal: DataSignal<any>, handleOnBlur: (ev: Event) => void) {
        let initialInput = S.sample(props.data);
        let labelClass = props.radioClass === undefined ? "" : props.radioClass;
        let radioSignals = props.options.map(it => S.value(indexOf(initialInput.value)));

        S.on(props.data, () => {
            let index = S.sample(signal);
            S.freeze(() => {
                radioSignals.forEach((it, i) => {
                    it(index);
                });
            });
        });

        radioSignals.forEach((it, i) => {
            S.on(it, () => {
                let orig = it();
                let curr = S.sample(signal);
                if (curr !== orig) {
                    signal(orig);
                }
            });
        });

        return (
            <fieldset {...htmlProps} class={joinClasses(props, errorClasses)}>
                <legend>{props.legendText}</legend>
                {
                    props.options.map((option, i) => {
                        return (
                            <label class={labelClass} for={props.data().name + "_" + i}>
                                <input disabled={props.data().isDisabled}
                                       fn={data(radioSignals[i], i + 1)}
                                       id={props.data().name + "_" + i}
                                       name={props.data().name}
                                       onBlur={handleOnBlur}
                                       type="radio"
                                       value={i + 1}/>
                                <span>{label(i)}</span>
                            </label>);
                    })
                }
            </fieldset>);
    }

    function indexOf(value: any): number {
        return props.options.indexOf(value) + 1;
    }

    function label(i: number): string {
        let option = props.options[i] as any;
        if (props.selector) {
            if (typeof props.selector === "string") { // check if selector is the name of a field in option
                return option[props.selector];
            }
            else { // else it's a user provided function to create a string.
                return (props.selector as Function)(option);
            }
        }
        else {
            return option;
        }
    }
}

export interface BaseInputTextProps extends StandardTextProps, StandardProps {
    type: InputType;
}

type InputType =
    "checkbox" |
    "color" |
    "date" |
    "email" |
    "file" |
    "hidden" |
    "image" |
    "month" |
    "number" |
    "password" |
    "radio" |
    "range" |
    "search" |
    "reset" |
    "button" |
    "submit" |
    "tel" |
    "text" |
    "time" |
    "url" |
    "week";

export function BaseTextInput(props: BaseInputTextProps) {
    let htmlProps = filterNonHTMLProps(props);
    let errorClasses = props.classes || defaultCSSClasses;
    return __BaseInputComponent(props, convertFromInputState, convertToInputState, render);

    function convertFromInputState(inputState: InputState<any>, currentSignal: string | undefined) {
        if (props.trimWhitespace && currentSignal) {
            // To avoid whitespace in input from being removed, compare against trimmed current.
            if (inputState.value === currentSignal.trim()) return currentSignal;
            return inputState.value;
        }
        else {
            return inputState.value;
        }
    }

    function convertToInputState(signalValue: string) {
        // To keep the types nice. Convert text to a number when using certain input types
        if (props.type === "number") return Number(signalValue);
        return props.trimWhitespace ? signalValue.trim() : signalValue;
    }

    function render(signal: DataSignal<any>, handleOnBlur: (ev: Event) => void) {
        return <input {...htmlProps}
                      class={joinClasses(props, errorClasses)}
                      id={props.data().name}
                      name={props.data().name}
                      disabled={props.data().isDisabled || props.disabled}
                      onBlur={handleOnBlur}
                      fn={data(signal)}>
            {props.children}
        </input>;
    }
}
