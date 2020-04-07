import S, {DataSignal} from "s-js";
import * as Surplus from "surplus";
import {
    BaseTextInput,
    createFormState,
    Form,
    FormError,
    InputCheckbox,
    InputColor,
    InputEmail,
    InputNumber,
    InputPassword,
    InputPasswordProps,
    InputRadio,
    InputRange,
    InputReset,
    InputState,
    inputStatesEqual,
    InputSubmit,
    InputText,
    Select,
    TextArea,
    touchAllInputs,
} from "surplus-forms";
import {CustomCounter} from "./CustomCounter";
import {ErrorNotification, WarnNotification} from "./notification";

const enum ExampleFormError {
    BlackListName = 101,
}

const App = S.root(() => {

    const options = S.data(
        [{ value: "1", id: "1" }, { value: "2", id: "2" }, { value: "5", id: "3" }, { value: "6", id: "4" }],
    );

    const initialForm = {
        firstName: "krillin" as string,
        lastName: "???" as string,
        password: "secret" as string,
        passwordToggle: "secret" as string,
        number: 2 as number,
        email: "son@goku.com" as string,
        colorName: "#FF00FF" as string,
        select1: (null) as any as string,
        select2: S.sample(options)[2],
        select3: S.sample(options)[2],
        textarea: "" as string,
        checkbox1: true as boolean,
        checkbox2: false as boolean,
        counter: 1 as number,
        radiobutton1: S.sample(options)[3].value,
        radiobutton2: (null) as any as { id: string; value: string },
        date: "2017-08-22",
        range: 10,
    };

    let form = createFormState(initialForm, [inputStatesEqual(["password", "passwordToggle"])]);

    return (
        <div class="container">
            <Form preventAction value={form}>
                <div>
                    <div class="row">
                        <div class="column">
                            <label for={form.firstName().name}>First Name</label>
                            <InputText data={form.firstName}
                                       classes={{ error: "input--error", default: "" }}
                                       debounce={300}
                                       min={3}
                                       max={8}
                                       regex={/^[A-K][a-z]+$/}
                                       placeholder="First Name"
                                       validate={v => {
                                           return v.toUpperCase() !== "KRILLIN" ? ExampleFormError.BlackListName : 0;
                                       }}
                            />
                            {form.firstName().isTouched && form.firstName().error === FormError.StrRegex && (
                                <WarnNotification>Doesn't meet regex /^[A-K][a-z]+$/. ex "Abc" but not
                                    "abc" </WarnNotification>)
                            }
                            {form.firstName().isTouched && form.firstName().error === FormError.MinStrLen && (
                                <WarnNotification>Too short. Must be &gt;= 3 letters</WarnNotification>)
                            }
                            {form.firstName().isTouched && form.firstName().error === FormError.MaxStrLen && (
                                <WarnNotification>Too long. Must be &lt;= 8 letters</WarnNotification>)
                            }
                            {form.firstName().isTouched && form.firstName().error === ExampleFormError.BlackListName && (
                                <WarnNotification>first name != Krillin</WarnNotification>)
                            }
                        </div>
                        <div class="column">
                            <LabelledInput label="Last name" data={form.lastName}/>
                        </div>
                    </div>

                    <div>
                        <label class="label-inline ml0 mr1" for={form.checkbox1().name}>
                            <InputCheckbox required data={form.checkbox1}/>
                            <span>Check box1*</span>
                        </label>
                        <label class="label-inline ml0 mr1" for={form.checkbox2().name}>
                            <InputCheckbox required data={form.checkbox2}/>
                            <span>Check box2*</span>
                        </label>
                        {form.checkbox1().error === FormError.Required && (
                            <WarnNotification>Checkbox1 is a required field</WarnNotification>)
                        }
                        {form.checkbox2().isTouched && form.checkbox2().error === FormError.Required && (
                            <WarnNotification>Checkbox2 is a required field</WarnNotification>)
                        }
                    </div>

                    <div class="row">
                        <div className="column">
                            <label for={form.email().name}>Email</label>
                            <InputEmail data={form.email}/>
                            {form.email().isTouched && form.email().error === FormError.EmailRegex && (
                                <WarnNotification>Not a valid email.</WarnNotification>)
                            }
                        </div>
                        <div className="column">
                            <label for={form.number().name}>Number</label>
                            <InputNumber data={form.number}
                                         min="-2.4" max={10001}
                                         required
                                         step="0.1"/>
                            {form.number().isTouched && form.number().error !== 0 && (
                                <WarnNotification>Must be between -2.4 and 10001</WarnNotification>)
                            }

                        </div>
                    </div>
                    <div class="row">
                        <div class="column">
                            <label for={form.password().name}>Password</label>
                            <InputPassword data={form.password}/>
                        </div>
                        <div class="column">
                            <div class="container pdl0 pdr0">
                                <label for={form.passwordToggle().name}>Password Toggle</label>
                                <TogglePassword data={form.passwordToggle}/>
                            </div>
                        </div>
                    </div>

                    {((form.password().isTouched || form.passwordToggle().isTouched) &&
                        form.status().globalError === FormError.ValuesNotSame) && (
                        <WarnNotification>
                            Both passwords must be the same.
                        </WarnNotification>)
                    }
                    <div>
                        <label for={form.colorName().name}>Color</label>
                        <InputColor data={form.colorName}/>
                    </div>

                    <div class="row">
                        <div class="column">
                            <InputRadio data={form.radiobutton1}
                                        legendText="RadioButton1"
                                        options={options().map(it => it.value)}/>
                        </div>
                        <div class="column">
                            <InputRadio classes={{ error: "input--error", default: "" }}
                                        class="radio-group-container"
                                        data={form.radiobutton2}
                                        legendText="RadioButton2"
                                        style={{ paddingTop: "1rem" }}
                                        options={options()}
                                        radioClass="lbl__inline-radio"
                                        required
                                        selector={"value"}/>
                            {form.radiobutton2().isTouched && form.radiobutton2().error === FormError.Required && (
                                <WarnNotification>Required field</WarnNotification>)
                            }
                        </div>
                    </div>

                    <div class="row">
                        <div class="column">
                            <label for={form.select1().name}>Select1*</label>
                            <Select classes={{ error: "input--error", default: "" }}
                                    data={form.select1}
                                    options={options().map(it => it.value)}
                                    required/>
                            {form.select1().error === FormError.Required && (
                                <WarnNotification>
                                    Required field. This warning will show even if the input hasn't been touched.
                                </WarnNotification>)
                            }
                        </div>
                        <div class="column">
                            <label for={form.select2().name}>Select2</label>
                            <Select data={form.select2}
                                    options={options()}
                                    selector={"value"}/>
                        </div>
                        <div class="column">
                            <label for={form.select3().name}>Different selector than Select2</label>
                            <Select data={form.select3}
                                    options={options()}
                                    selector={option => option.value}/>
                        </div>
                    </div>

                    <div>
                        <InputRange data={form.range}
                                    min={5}
                                    max={55}
                                    step={5}/>
                        {form.range().value}
                    </div>

                    <label for={form.textarea().name}> Text area</label>
                    <TextArea data={form.textarea}/>

                    <div className="row mb3">
                        <div className="column">
                            <label>Minimal implementation of a Custom Component (see source for more details) </label>
                            <CustomCounter data={form.counter}/>

                            {(form.counter().isTouched && form.counter().error !== 0) && (
                                <WarnNotification>
                                    Counter cannot be an even number.
                                </WarnNotification>)
                            }
                        </div>
                    </div>
                    <InputSubmit disabled={form.status().isSubmitted}/>
                    <InputReset class="button-outline"/>

                    {(form.status().isTouched && form.status().globalError !== 0) && (
                        <ErrorNotification>
                            Cannot submit until form errors are corrected.
                        </ErrorNotification>)
                    }
                </div>
            </Form>

            <button class="button-clear" onClick={ev => {
                let next = S.sample(options).slice();
                next.push({ value: "" + rngInt(1, 400), id: "" + next.length });
                options(next);
            }}>
                Add option
            </button>
            <button class="button-clear" onClick={ev => touchAllInputs(form)}>
                Touch form
            </button>

            <button className="button-clear"
                    onClick={ev => form.counter({
                        ...S.sample(form.counter),
                        value: -10,
                        __v: S.sample(form.counter).__v + 1,
                    })}>
                Reset Custom Counter
            </button>

            <pre>{JSON.stringify(desigFormState(form.status()), null, 2)}</pre>
            <pre>{JSON.stringify(desigFormState(form), null, 2)}</pre>
        </div>);
});

(document.getElementById("root") as HTMLElement).appendChild(App);

/** Simple example showing how to create wrappers for consistently theming input components. */
export function LabelledInput(props: { label: string; data: DataSignal<InputState<any>> }) {
    return (
        <div>
            <label for={props.data().name}>{props.label}*</label>
            <InputText data={props.data}
                       required
                       trimWhitespace/>
            {props.data().error === FormError.Required && (
                <WarnNotification>Required field</WarnNotification>)
            }
            <p><em>Whitespace on either end of input will be removed</em></p>
        </div>);
}

function TogglePassword(props: InputPasswordProps): JSX.Element {
    let revealPassword = S.data(false);
    return (
        <div class="row ml0 pdr3">
            <BaseTextInput {...props}
                           class="column"
                           type={revealPassword() ? "text" : "password"}>
                {props.children}
            </BaseTextInput>
            <button type="button" class="button-clear pdr0 pdl0" onClick={() => revealPassword(!revealPassword())}>
                <svg xmlns="http://www.w3.org/2000/svg"
                     class="svg__password-eye"
                     width="24" height="24"
                     viewBox="0 0 24 24">
                    <path
                        d="M15 12c0 1.657-1.343 3-3 3s-3-1.343-3-3c0-.199.02-.393.057-.581 1.474.541 2.927-.882 2.405-2.371.174-.03.354-.048.538-.048 1.657 0 3 1.344 3 3zm-2.985-7c-7.569 0-12.015 6.551-12.015 6.551s4.835 7.449 12.015 7.449c7.733 0 11.985-7.449 11.985-7.449s-4.291-6.551-11.985-6.551zm-.015 12c-2.761 0-5-2.238-5-5 0-2.761 2.239-5 5-5 2.762 0 5 2.239 5 5 0 2.762-2.238 5-5 5z"/>
                </svg>
            </button>
        </div>);
}

export function desigFormState(o: DataSignal<any> | any): any {
    if (typeof o === "function") return desigFormState(o());
    if (typeof o !== "object") return o; // return strings, numbers, and primitives

    // Iterate over an object and convert and execute DataSignals to get their values
    let res = {} as any;
    for (const key of Object.keys(o)) {
        if (key === "forEachInput") continue;
        res[key] = desigFormState(o[key]);
    }
    return res;
}

export function rngInt(min: number, max: number): number { return Math.floor(rng(min, max)); }

export function rng(min: number, max: number): number { return (Math.random() * (max - min) + min); }