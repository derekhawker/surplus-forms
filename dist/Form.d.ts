import { FormState } from "./FormState";
import { SurplusProps } from "./internal-components";
export interface FormProps extends SurplusProps {
    action?: string;
    name?: string;
    onSubmit?: () => boolean;
    preventAction?: boolean;
    value: FormState<any>;
}
export declare const Form: (props: FormProps) => JSX.Element;
