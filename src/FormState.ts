import S, {DataSignal} from "s-js";

export type FormState<T> = FormStateInputs<T> & {
    status: DataSignal<FormStatus>
} & {
    /** Iterate over all input signals. */
    forEachInput: (fn: (sig: DataSignal<InputState<any>>, i?: number) => void) => void;
};

type FormStateInputs<T> = {
    [P in keyof T]: DataSignal<InputState<T[P]>>
};

type ValidateFormFn<T> = (formState: FormState<T>) => number;

export type InputValidation = {
    type: FormError.MinStrLen | FormError.MaxStrLen,
    len: number
} |
    { type: FormError.MinNumberLen | FormError.MaxNumberLen, value: number } |
    { type: FormError.ValidateFn, fn: (value: any) => number } |
    { type: FormError.Required } |
    { type: FormError.StrRegex, regex: string | RegExp } |
    { type: FormError.EmailRegex };

type FormStatus = {
    globalError: number;
    isChanged: boolean;
    isSubmitted: boolean;
    isTouched: boolean;
    isValid: boolean;
    submissions: number;
}

export enum FormError {
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

export function disableForm<T>(form: FormState<T>) {
    form.forEachInput(sig => {
        let curr = S.sample(sig);
        curr.isDisabled = true;
        curr.__v += 1;
        sig(curr);
    });
}

export function touchAllInputs<T>(form: FormState<T>) {
    form.forEachInput(sig => {
        let curr = S.sample(sig);
        curr.isTouched = true;
        curr.__v += 1;
        sig(curr);
    });
}

/**
 *
 * @param initialState starting values to initialize state with
 * @param validateFns validation function for top level error checking.
 *          Good for ensuring password is the same on two fields.
 *          WARN: Don't update DataSignals on input fields (causes infinite update cycles)
 */
export function createFormState<T>(initialState: T,
                                   validateFns: Array<ValidateFormFn<T>>): FormState<T> {

    let inputs = createInputSignals(initialState);
    let inputSignals: Array<DataSignal<InputState<any>>> = Object.keys(inputs).map(it => (inputs as any)[it]);
    /** Keep copy of just input signals */
    let statusSignal = S.data({
        globalError: 0,
        isChanged: false,
        isSubmitted: false,
        isTouched: false,
        isValid: false,
        submissions: 0,
    });
    let formState = {
        ...inputs as any,
        status: statusSignal,
        forEachInput,
    };

    updateOnSignal();

    return formState;

    function forEachInput(fn: (inputState: DataSignal<InputState<any>>, i?: number) => void) {
        S.freeze(() => {
            inputSignals.forEach(fn);
        });
    }

    function updateOnSignal() {
        for (const sig of inputSignals) {
            S.on(sig, () => {
                updateStatus();
            }, undefined, true);
        }
    }

    /** Create DataSignal<InputState> with props that match the given input */
    function createInputSignals(input: T): FormStateInputs<T> {
        // No good type-safe way to handle the dynamic props. So 'any' everywhere
        let out = {} as any;

        for (const k of Object.keys(input)) {
            let v = (input as any)[k];
            let initInput = inputState(k, v);
            out[k] = S.data(initInput);
        }
        return out;
    }

    function updateStatus() {
        if (!inputs) return;
        let isChanged = false;
        let isTouched = false;

        let error = 0;
        for (const it of inputSignals) {
            let input = S.sample(it);
            isChanged = isChanged || input.isChanged;
            isTouched = isTouched || input.isTouched;
            error = error || input.error;
        }

        for (const fn of validateFns) {
            error = fn(formState) || error;
        }

        let status = S.sample(statusSignal);
        status.isChanged = isChanged;
        status.isTouched = isTouched;
        status.globalError = error;
        status.isValid = isChanged && (error === 0);

        formState.status(status);
    }
}

export interface InputState<T> {
    __v: number;
    isChanged: boolean;
    isDisabled: boolean;
    /** True if the user has changed the form. Initial value is false */
    isTouched: boolean;
    /** Non-zero when the Field has an error (always 0 when dirty === false) */
    error: number;
    /** property name of Field */
    name: string;
    startValue: T;
    /** value of Field*/
    value: T;
}

function inputState<T>(name: string, initialValue: T): InputState<T> {
    // Replace null values with undefined (friendlier to work with)
    let value = initialValue === null ? (undefined) as any : initialValue;
    return {
        __v: 0,
        name,
        error: 0,
        isTouched: false,
        value,
        startValue: value,
        isChanged: false,
        isDisabled: false,
    };
}

export function resetStatus(status: FormStatus) {
    status.isSubmitted = false;
    status.globalError = 0;
    status.isValid = false;
    status.isChanged = false;
}

export function inputStatesEqual<T>(fields: Array<keyof T>,
                                    cmp?: (a: InputState<T>, b: InputState<T>) => boolean): ValidateFormFn<T> {
    return (formState: FormState<T>) => {
        if (fields.length < 2) {
            if (fields.length === 1) console.warn("Unexpected number of signals to compare in equal() to ", (formState[fields[0]] as any).name);
            if (fields.length === 0) console.warn("No signals to compare in equal() ");
            return 0;
        }
        let states = fields.map(it => S.sample((formState[it] as any)) as InputState<any>);
        if (cmp) {
            return states.every(it => cmp(it, states[0])) ? 0 : FormError.ValuesNotSame;
        }
        else {
            return states.every(it => it.value === states[0].value) ? 0 : FormError.ValuesNotSame;
        }
    }
}