import S, {DataSignal} from "s-js";
import {BaseInputTextProps, InputRadioProps, InputRangeProps, SelectProps} from "./components";
import {FormError, InputState, InputValidation} from "./FormState";
import {assertNever} from "./util";

export const defaultCSSClasses = { // using boostrap
    default: "",
    error: "",
};
export type CSSErrorClasses = typeof defaultCSSClasses;

export interface SurplusProps {
    ref?: any;
    children?: any
}

export interface StandardProps extends SurplusProps {
    class?: Partial<CSSStyleDeclaration>;
    style?: Partial<CSSStyleDeclaration>;
    classes?: CSSErrorClasses;
    data: DataSignal<InputState<any>>;
    debounce?: number;
    disabled?: boolean;
    onBlur?: boolean;
    /** Must have a value or Field is invalid */
    required?: boolean;
    validate?: (value: any) => number;
}

export interface StandardTextProps {
    /** If type == "number" the numeric value must be >= min.
     * if type == "string" length must be >= to min*/
    min?: number | string;
    /** If type == "number", the numeric value must be <= max.
     * if type == "string" length must be <= to max */
    max?: number | string;
    /** Match regex expression against input*/
    placeholder?: string;
    regex?: string | RegExp;
    /** Remove whitespace (left and right) from input */
    trimWhitespace?: boolean;
}

type RenderFn = (signal: any, onBlur: (ev: Event) => void) => JSX.Element;

function updateInputState<T>(inputState: InputState<T>,
                             nextValue: T,
                             tests: Array<InputValidation>) {
    inputState.value = nextValue;
    inputState.isChanged = nextValue !== inputState.startValue;
    inputState.error = testErrors(inputState, tests);
    inputState.__v += 1;
}

/** Look over props and determine which tests are needed */
function createValidationTests(props: StandardProps | SelectProps<any> | BaseInputTextProps): Array<InputValidation> {
    let errors: Array<InputValidation> = [];
    let p = props as StandardProps & BaseInputTextProps;
    if (p.min && p.type === "number") {
        errors.push({ type: FormError.MinNumberLen, value: Number(p.min) });
    }
    else if (p.min) {
        errors.push({ type: FormError.MinStrLen, len: Number(p.min) });
    }
    if (p.max && p.type === "number") {
        errors.push({ type: FormError.MaxNumberLen, value: Number(p.max) });
    }
    else if (p.max) {
        errors.push({ type: FormError.MaxStrLen, len: Number(p.max) });
    }
    if (p.required) errors.push({ type: FormError.Required });
    if (p.type === "email") errors.push({ type: FormError.EmailRegex });
    if (p.regex) errors.push({ type: FormError.StrRegex, regex: p.regex });
    if (p.validate) errors.push({ type: FormError.ValidateFn, fn: p.validate });

    return errors;
}

type CompleteInputProps = BaseInputTextProps & SelectProps<any> & InputRadioProps<any> & InputRangeProps;

/**
 *
 * Update Use cases
 * 1. Initial update (constructor)
 *      - must update prop.data signal so that error is set
 *      - isTouch must not be changed
 * 2. Internal update (triggered by input's "change" event)
 *     - triggers S computation(, ...)
 *     - isTouched must be set to true
 * 3. External update
 *     - caused by an update on the props.data object
 *     - this include updates triggered by user input. There are guards to ignore these external updates.
 *     - isTouched is set to the value on the props.data
 * */
export function __BaseInputComponent(props: StandardProps,
                                     getInputStateValue: (inputState: InputState<any>, signalValue: any) => any,
                                     getCurrentInput: (signalValue: any) => any,
                                     render: RenderFn) {
    let initialInput = S.sample(props.data);
    let signal = S.data(getInputStateValue(initialInput, undefined));
    let currVersion = -1;
    let isExternal = true;
    let timer = -1;
    let hasPendingInput = false;
    let validations = createValidationTests(props);

    S.on(props.data, () => {
        let signalValue = getInputStateValue(props.data(), S.sample(signal));
        isExternal = true;
        signal(signalValue);
    });

    S(() => {
        let curr = getCurrentInput(signal());
        let propsData = S.sample(props.data);
        let isExternalPropsUpdate = propsData.__v !== currVersion;
        if (props.onBlur && !isExternalPropsUpdate) return; // handleOnBlur will trigger an update
        // There are two way to trigger this S computation.
        // 1. Internal (user-driven) changes to an input field.
        // 2. External changes to props.data
        // To prevent runaway recursive updates we have two guards. The current value of the user's input is
        // checked against props.data.value. When different it means the user has manually changed the input.
        // With only this guard, external updates to other fields on InputState would not work.
        // For ex. changes to isDisabled. For this reason __v can be incremented to force an update.
        if (curr !== propsData.value || isExternalPropsUpdate) {
            currVersion = propsData.__v;
            debounceInput(curr, props.debounce);
        }
    });

    return render(signal, ev => handleOnBlur(ev));

    function handleOnBlur(ev: Event) {
        // If hasPendingInput == true, then this input has a debounce value. The blur event shows the user has
        // finished using the input, so we should update immediately rather than wait for the remainder of hte
        // debounce.
        // Otherwise it should be obvious why we check for props.onBlur
        if (hasPendingInput || props.onBlur) debounceInput(S.sample(signal));
    }

    function debounceInput(input: any, debounceTime: number = 0) {
        hasPendingInput = true;
        clearTimeout(timer);
        // Always update asynchronously to avoid infinite update cycles
        timer = window.setTimeout(() => {
            let curr = S.sample(props.data);
            let next = { ...curr };
            updateInputState(next, input, validations);
            // Only update isTouched for internal events
            next.isTouched = isExternal ? next.isTouched : true;
            currVersion = next.__v; // Remember this value so that the next S computation cause an update.
            props.data(next);

            hasPendingInput = false;
            isExternal = false;
        }, debounceTime);
    }
}

export function joinClasses(props: StandardProps, errorClasses: CSSErrorClasses) {
    return (props.class || "") + " " +
        ((props.data().isTouched && props.data().error ? errorClasses.error : errorClasses.default) || "");
}

const regexes = {
    url: /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
    email: /.+?@.+/,
};

function testErrors(input: InputState<any>, tests: Array<InputValidation>): number {
    for (const test of tests) {
        switch (test.type) {
            case FormError.StrRegex: {
                let res = input.value.match(new RegExp(test.regex));
                if (res == null) return test.type;
                break;
            }
            case FormError.EmailRegex: {
                let res = input.value.match(new RegExp(regexes.email));
                if (res == null) return test.type;
                break;
            }
            case FormError.ValidateFn: {
                let res = test.fn(input.value);
                if (res !== 0) return res;
                break;
            }
            case FormError.MinStrLen: {
                if (input.value.length < test.len) return test.type;
                break;
            }
            case FormError.MaxStrLen: {
                if (input.value.length > test.len) return test.type;
                break;
            }
            case FormError.MinNumberLen: {
                if (input.value < test.value) return test.type;
                break;
            }
            case FormError.MaxNumberLen: {
                if (input.value > test.value) return test.type;
                break;
            }
            case FormError.Required: {
                let isNumber = typeof input.value === "number";
                if (!isNumber && !input.value) return test.type;
                break;
            }
            default:
                assertNever(test);
        }
    }
    return 0;
}

export function filterNonHTMLProps(props: any): JSX.HTMLAttributes<any> {
    let inputProps: CompleteInputProps = { ...props as any };
    delete inputProps.options;
    delete inputProps.classes;
    delete inputProps.radioClass;
    if (inputProps.type !== "range") delete inputProps.max;
    if (inputProps.type !== "range") delete inputProps.min;
    delete inputProps.regex;
    delete inputProps.selector;
    delete inputProps.trimWhitespace;
    delete inputProps.validate;
    delete inputProps.data;
    delete inputProps.debounce;
    delete inputProps.onBlur;
    delete inputProps.required;
    delete inputProps.children;

    return (inputProps) as any;
}
