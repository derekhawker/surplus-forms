import {createFormState, InputNumber, InputSubmit, InputText, Form} from "surplus-forms";

// createFormState returns an obj where name,email and age are DataSignal<InputState> objs
let formState = createFormState({
        name: "" as string,
        email: "" as string,
        age: null as any as number,
    },
    []);

export const SimpleForm = (
    <div>
        <Form name="simple" value={formState}>
            <label for={formState.name().name}>Name</label>
            <InputText data={formState.name} required/>
            <label htmlFor={formState.email().name}>Name</label>
            <InputText data={formState.email} required/>
            <label htmlFor={formState.age().name}>Name</label>
            <InputNumber data={formState.age}
                         required/>
            {formState.age().isTouched && formState.age().value < 13 && (
                "You must be 13 years of age or older to use this site")}

            <InputSubmit/>
        </Form>
    </div>);

(document.getElementById("root") as HTMLElement).appendChild(SimpleForm);
