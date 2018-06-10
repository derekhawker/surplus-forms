import * as Surplus from "surplus";
import {FormState, InputState, resetStatus, touchAllInputs} from "./FormState";
import S from "s-js";
import {SurplusProps} from "./internal-components";

export interface FormProps extends SurplusProps {
    action?: string;
    name?: string;
    /** Called when a form is errorless. Use to POST your own form (don't forget to set preventAction).
     * Return false to prevent isSubmitted property. */
    onSubmit?: () => boolean;
    /** Prevent default form behavior to POST input fields on submit */
    preventAction?: boolean;
    value: FormState<any>
}

export const Form = (props: FormProps) => {
    let formProps = { ...props } as any;
    delete formProps.children;
    delete formProps.value;
    if (props.preventAction) {
        delete formProps.method;
        delete formProps.action;
    }
    else {
        if (!formProps.method) formProps.method = "post";
    }

    return (
        <form name={props.name || "form"}
              noValidate
              onReset={handleReset}
              onSubmit={handleSubmit}
              {...formProps}>
            {props.children}
        </form>);

    function handleReset(ev: Event) {
        ev.preventDefault();
        ev.stopPropagation();

        S.freeze(() => {
            let status = S.sample(props.value.status);
            resetStatus(status);
            props.value.status(status);

            props.value.forEachInput(sig => {
                let curr = S.sample(sig);
                resetInputState(curr);
                sig(curr);
            });
        });
    }

    function handleSubmit(ev: Event) {
        let form = props.value;

        touchAllInputs(form);

        let canSubmit = form.status().isValid && (
            props.onSubmit ? props.onSubmit() : true);

        let status = S.sample(form.status);
        status.submissions += 1;
        status.isSubmitted = (canSubmit) ? true : status.isSubmitted;
        form.status(status);

        // Prevent default behaviour of form (POSTing)
        if (!canSubmit || props.preventAction) {
            ev.stopPropagation();
            ev.preventDefault();
            return false;
        }
    }
};

function resetInputState(input: InputState<any>) {
    input.error = 0;
    input.__v = 0;
    input.value = input.startValue;
    input.isChanged = false;
    input.isTouched = false;
    input.isDisabled = false;
}
