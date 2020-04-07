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
declare type RenderFn = (signal: any, onBlur: (ev: Event) => void) => JSX.Element;
export declare function __BaseInputComponent(props: StandardProps, getInputStateValue: (inputState: InputState<any>, signalValue: any) => any, getCurrentInput: (signalValue: any) => any, render: RenderFn): JSX.Element;
export declare function joinClasses(props: StandardProps, errorClasses: CSSErrorClasses): string;
export declare function filterNonHTMLProps(props: any): JSX.HTMLAttributes<any>;
export {};
