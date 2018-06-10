import { StandardProps, StandardTextProps, SurplusProps } from "./internal-components";
export interface TextInputProps extends StandardProps, StandardTextProps {
}
export declare function InputText(props: TextInputProps): JSX.Element;
export interface ColorInputProps extends StandardProps {
}
export declare function InputColor(props: ColorInputProps): JSX.Element;
export declare function InputEmail(props: TextInputProps): JSX.Element;
export interface InputPasswordProps extends StandardProps, StandardTextProps {
}
export declare function InputPassword(props: InputPasswordProps): JSX.Element;
export interface InputRangeProps extends StandardProps {
    min?: number | string;
    max?: number | string;
    step?: number | string;
}
export interface InputNumberProps extends StandardProps, StandardTextProps {
    step?: number | string;
}
export declare function InputNumber(props: InputNumberProps): JSX.Element;
export declare function InputRange(props: InputRangeProps): JSX.Element;
export interface TextAreaProps extends StandardProps, StandardTextProps {
}
export declare function TextArea(props: TextAreaProps): JSX.Element;
export interface ButtonProps extends SurplusProps {
    disabled?: boolean;
    style?: Partial<CSSStyleDeclaration>;
    class?: string;
}
export declare function InputSubmit(props: ButtonProps): JSX.Element;
export declare function InputReset(props: ButtonProps): JSX.Element;
export declare function InputCheckbox(props: TextInputProps): JSX.Element;
export interface SelectProps<T> extends StandardProps {
    options: Array<T>;
    selector?: keyof T | ((option: T) => string);
}
export declare function Select<T>(props: SelectProps<T>): JSX.Element;
export interface InputRadioProps<T> extends StandardProps {
    options: Array<T>;
    radioClass?: string;
    selector?: keyof T | ((option: T) => string);
}
export declare function InputRadio<T>(props: InputRadioProps<T>): JSX.Element;
