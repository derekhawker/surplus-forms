import { DataSignal } from "s-js";
export declare type FormState<T> = FormStateInputs<T> & {
    status: DataSignal<FormStatus>;
} & {
    forEachInput: (fn: (sig: DataSignal<InputState<any>>, i?: number) => void) => void;
};
declare type FormStateInputs<T> = {
    [P in keyof T]: DataSignal<InputState<T[P]>>;
};
declare type ValidateFormFn<T> = (formState: FormState<T>) => number;
export declare type InputValidation = {
    type: FormError.MinStrLen | FormError.MaxStrLen;
    len: number;
} | {
    type: FormError.MinNumberLen | FormError.MaxNumberLen;
    value: number;
} | {
    type: FormError.ValidateFn;
    fn: (value: any) => number;
} | {
    type: FormError.Required;
} | {
    type: FormError.StrRegex;
    regex: string | RegExp;
} | {
    type: FormError.EmailRegex;
};
declare type FormStatus = {
    globalError: number;
    isChanged: boolean;
    isSubmitted: boolean;
    isTouched: boolean;
    isValid: boolean;
    submissions: number;
};
export declare enum FormError {
    ValuesNotSame = 11,
    ValidateFn = 10,
    StrRegex = 7,
    EmailRegex = 6,
    Required = 5,
    MaxStrLen = 4,
    MaxNumberLen = 3,
    MinNumberLen = 2,
    MinStrLen = 1
}
export declare function disableForm<T>(form: FormState<T>): void;
export declare function touchAllInputs<T>(form: FormState<T>): void;
export declare function createFormState<T>(initialState: T, validateFns: Array<ValidateFormFn<T>>): FormState<T>;
export interface InputState<T> {
    __v: number;
    isChanged: boolean;
    isDisabled: boolean;
    isTouched: boolean;
    error: number;
    name: string;
    startValue: T;
    value: T;
}
export declare function resetStatus(status: FormStatus): void;
export declare function inputStatesEqual<T>(fields: Array<keyof T>, cmp?: (a: InputState<T>, b: InputState<T>) => boolean): ValidateFormFn<T>;
export {};
