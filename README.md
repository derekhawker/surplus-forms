This lib provides several helpers for working with forms and validations.

Features include:
- typesafe forms and all the other goodies that come with
- input validation with several builtin standard validations
- lots of helpers... validation functions, input debounce/onBlur, state tracking (isTouched, isChanged, isValid)  
- very flexible. No assumptions about object stores, styling, class names 

Click [here](https://derekhawker.github.io/surplus-forms/) to view a demo.   

```typescript jsx
import {createFormState, InputNumber, InputSubmit, InputText, Form} from "surplus-forms";

// createFormState returns an obj where name,email and age are DataSignal<InputState> objs
let formState = createFormState({
    name: "" as string,
    email: "" as string,
    age: null as any as number,
},
[]);

const SimpleForm = (
    <div>
        <Form name="simple" value={formState}>
            <label for={formState.name().name}>Name</label>
            <InputText data={formState.name} required/>
            <label htmlFor={formState.email().name}>Name</label>
            <InputEmail data={formState.email} required/>
            <label htmlFor={formState.age().name}>Name</label>
            <InputNumber data={formState.age}
                         required/>
            {formState.age().isTouched && formState.age().value < 13 && (
                "You must be 13 years of age or older to use this site")}

            <InputSubmit/>
        </Form>
    </div>);

(document.body.appendChild(SimpleForm);
```

## Provided components 
- InputText
- InputColor
- InputEmail
- InputPassword
- InputNumber
- InputRange
- TextArea
- InputSubmit
- InputReset
- InputCheckbox
- Select
- InputRadio

Except for the radio input, these component will return a raw input/select/textarea element leaving you to style
arrange as needed with the class/syle attributes. In the case of radio buttons, it was necessary to create a wrapper 
around each input radio, but this can be stylized with the radioClass attribute

## Run examples #
See the examples/ directory for working examples on how to use this library. 
To run the examples locally:
```bash    
    cd examples
    npm install
    npm run watch
```     

## API
The FormState obj does not come with a very large API because it leaves most operations to S.js. FormState provides some 
helpers for iterating over the fields, but most other operations are left for the user to implement. For the most part 
this is pretty simple because of object spread and S.js. There are many examples in the onClick handlers of the
buttons at the end of the form in the examples page. 

### `createFormState<T>(initialState: T, validateFns: Array<ValidateFormFn<T>>): FormState<T>`
Initializes an obj for use by a Form component and child input components

### FormState\<T\>

#### `forEachInput(fn: (it: DataSignal<InputState<any>>,i: number) =>void)`
Iterates over each tracked field's DataSignal allowing you to read or update their values. Uses S.freeze() so
that all changes are simultaneous

#### `status: DataSignal<FormStatus>`
Provides information about the global state of the form. Fields like isChanged or isTouched are based on the summary 
of all InputState fields

#### `<field>: DataSignal<InputState<T>>`
For each property in the initialState used by createFormState() a \<field\> is added to the returned FormState obj

### InputState\<T\>
A pure data object. See its interface.

## Common Operations
### Externally update InputState
See implemention of the 'touch form' button in examples

### Create FormState obj
See SimpleForm.tsx in the examples 

### Respond to changes in input
Since each field is a DataSignal, we can make use of the S.js api. Let's say that you had a dropdown for a list of
countries and wanted to fetch a list of provinces/states for that country. Just add an S.on for that 
field in your formState like so `S.on(formState.country, () => ...);`
 
## Custom Components

### Extending components based on an \<input\>
Below is an example of a password input where the text can be revealed.
It makes use of a BaseTextInput component that implements all the standard validation props like required, min, etc.

```typescript jsx
function TogglePassword(props: PasswordInputProps): JSX.Element {
    let revealPassword = S.data(false);
    return (
        <div>
            <BaseTextInput {...props}
                           type={revealPassword() ? "text" : "password"}>
                {props.children}
            </BaseTextInput>
            <button type="button" onClick={() => revealPassword(!revealPassword())}>
                {revealPassword()?"Reveal":"Hide"}
            </button>
        </div>);
}
``` 

### More complex components 
For more complicated scenarios, __BaseInputComponent may be more suitable for creating your custom component.
For an example of how to use it look at BaseTextInput. The main advantage of using this as your underlying 
implementation is that it gives you several validations for free, like required, min, max, debounce, and many others.
There are three callbacks that must be implemented. 

```typescript
function convertFromInputState(inputState: InputState<any>, signalValue:any) {
    return inputState.value;
}

```
The first callback take an InputState obj and converts this to an internal type usable by your component. 
This is primarily used for handling external changes to InputState. For text inputs it's a fairly basic 
implementation since the value field can be used directly with the \<input\>. The radio and select inputs have a
more interesting implementation in order to support a variety of objs provided as options. 

The second parameter is the current value of an internal signal used by the component. BaseTextInput uses this 
value to handle trimmed whitespace.

```typescript
function convertToInputState(signalValue: any) {
    return signalValue;
}
```
The second callback is used to convert an internal type back into one that can be used in your InputState's value 
field. This is called whenever the component changes due to internal or external changes 

```typescript jsx
function render(signal: DataSignal<any>, handleOnBlur: (ev: Event) => void) {
    let htmlProps = filterNonHTMLProps();
    let errorClasses = props.classes || defaultCSSClasses;
    return <input {...htmlProps}
                  class={joinClasses(props, errorClasses)}
                  id={props.data().name}
                  name={props.data().name}
                  disabled={props.data().isDisabled || props.disabled}
                  onBlur={handleOnBlur}
                  fn={data(signal)}>
        {props.children}
    </input>;
}
```
Lastly there is the render callback. The first parameter is the internal DataSignal to be used by the component. 
It may seem odd that we don't reuse the DataSignal\<InputState\> passed in as part of props. 
The extra decoupling is used to support things like debouncing the input. The second parameter is a callback for 
triggering blur events.

## Fully custom components
For completely custom components you'll need to listen for and update the DataSignal<InputState<T>> for a field on the 
FormState obj. Have a look at CustomCounter in the examples to see an implementation. 

## Potential Gotchas

### \<Form\> needs an immediate \<div\> child
Not sure why, but Surplus doesn't like the \<Form\> container to have multiple immediate children.

#### Bad
```
<Form>
    <input/>
    <input/>
</Form>
```

#### Good
```
<Form>
    <div>
        <input/>
        <input/>
    </div>
</Form>
```
 
### Error codes 1-99 are reserved
Not all are in use, but I'd like to reserve this range. Their uses are tracked with the FormError enum. 
This doesn't mean these error code values cannot be relied upon. These codes are guaranteed to be stable 
in future versions. FormError.Required will always equal 5. Users should take care not to return their own error codes 
in this range for several reason. 1) Because it makes it impossible to match against the standard errors like 
required, regex, etc. 2) Because I may rely on their values to perform internal operations on InputState or 
something like that in the future. 

Proper error code numbering can be seen in the examples. Basically, just start numbering from 100 

### Dependent validation tests 
You'll notice the interface of a field's validate property is `(value:any) => number` where *value* will be the current
input value of that field. Through closures it's possible to create a function that compares with other InputState. 
For ex. consider this validation field for a an email input
```
(value) => value !== formState.repeatEmail().value
```
This is a  *BAD* idea. the validate property is only called when the owning input changes and will not reevaluate if the 
other field updates. If two inputs have a dependency on eachother, this validation test must be added to the
validateFns argument of createFormState(). Those functions will get called on every field update ensuring
their values are fresh.

See the implementation of password inputs in the examples for more details 

### Reusing InputState signals
Internally, each input component will mutate the InputState obj provided in its props. If two components have
the same InputState instance it will trigger an infinite update cycle murdering your page performance. 

### Forgetting to update __v property when externally updating InputState objs
When externally setting an InputState obj, it's expected that you will increment the __v property. This is used as 
a way to detect if update was caused internally by an input or externally.

## FAQ 
### 1. **Why is there a disabled property on both input components and the InputState on the FormState obj?**

mostly for convenience. You might want to disable a field while waiting on the user to update a different field.
For example the province/state or city field when the country field is empty. describing this dependency through the 
disabled property on an  component is clean, simple, stateless, and groups the logic closely to the affected component.
Meanwhile, after clicking submit, you may want to disable all fields. This is best expressed by modifying the disabled
property on each InputState on the FormState obj.

### 2. **I need to override the default form submit behaviour**
First, make sure that you added preventAction property on the Form you created. This blocks the default POSTing behaviour.
Add your own callback via the onSubmit property. Use this to make your own network call (don't forget to return true)
If your callback fails you'll probably want to update the form.status DataSignal to reset the isSubmitted 
property and make any other updates needed. 

### 3. **How do I run the examples against local modifications to the library?**
Normally I'd just say `npm link` from the project root and `npm link surplus-forms` in the examples directory, 
but for some reason webpack will include two copies of "s-js" making the examples unrunnable. To get npm link to 
work nicely, I `npm uninstall surplus s-js` from the examples package.json. After that npm link works fine.

## TODO
- add date input
- why does \<Form\> need an immediate div container?
