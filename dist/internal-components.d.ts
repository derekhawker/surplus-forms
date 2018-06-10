import { DataSignal } from "s-js";
import { InputState } from "./FormState";
export declare const defaultCSSClasses: {
    default: string;
    error: string;
};
export declare type CSSErrorClasses = typeof defaultCSSClasses;
export interface SurplusProps {
    ref?: any;
    children?: any;
}
export interface StandardProps extends SurplusProps {
    class?: Partial<CSSStyleDeclaration>;
    style?: Partial<CSSStyleDeclaration>;
    classes?: CSSErrorClasses;
    data: DataSignal<InputState<any>>;
    debounce?: number;
    disabled?: boolean;
    onBlur?: boolean;
    required?: boolean;
    validate?: (value: any) => number;
}
export interface StandardTextProps {
    min?: number | string;
    max?: number | string;
    placeholder?: string;
    regex?: string | RegExp;
    trimWhitespace?: boolean;
}
export interface BaseInputTextProps extends StandardTextProps, StandardProps {
    type: InputType;
}
declare type InputType = "checkbox" | "color" | "date" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "search" | "reset" | "button" | "submit" | "tel" | "text" | "time" | "url" | "week";
export declare function BaseTextInput(props: BaseInputTextProps): JSX.Element;
declare type RenderFn = (htmlProps: any, props: any, classes: any, signal: any, onBlur: (ev: Event) => void) => JSX.Element;
export declare function __BaseInputComponent(props: StandardProps, getInputStateValue: (inputState: InputState<any>) => any, getCurrentInput: (signalValue: any) => any, render: RenderFn): JSX.Element;
export declare function joinClasses(props: StandardProps, errorClasses: CSSErrorClasses): string;
export {};
