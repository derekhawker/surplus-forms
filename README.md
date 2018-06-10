This lib provides several helpers for working with forms and validations.

Features include:
- typesafe forms and all the other goodies that come with. 
    - keep id and name attributes in sync with your code changes
- input validation with several builtin standard validations
- lots of helpers... validation functions, input debounce/onBlur, state tracking (isTouched, isChanged, isValid)  
- very flexible. No assumptions about object stores, styling, class names 

Click [here](https://derekhawker.github.io/surplus-forms/) to view a demo.   

# Run examples #
See the examples/ directory for working examples on how to use this library. 
To run the examples locally:
    
    cd examples
    npm install
    npm run watch
     

# API for modifying form state
The FormState obj does not come with a very large API because it leaves most operations to S.js. FormState provides some 
helpers for iterating over the fields, but most other operations are left for the user to implement. For the most part 
this is pretty simple because of object spread and S.js. There are many examples in the onClick handlers of the
buttons at the end of the form in the examples page. 

View onClick code for the end of form buttons in the example.

# Common Operations

TODO: All this is covered in the example. Just need to point out the places to look.
TODO: externally update input state
TODO: create form state
TODO: respond to change in input (dynamically fetch province after country changes) using S.on(signal, ()=>...)

# Ready made components 
Anything in Inputs, like Inputs.{Radio,Text,Checkbox,Select,...}

Except for the radio input, these component will return a raw input/select/textarea element leaving you to style
arrange as needed. In the case of radio buttons, it was necessary to create a wrapper around each input radio, 
but this can be stylized with the radioClass or class attributes/properties.

# Custom Components

Below is an example component to create a password input where the text can be revealed.
It makes use of a BaseTextInput component that implements all the standard validation props like required, min, etc.

```
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

For more complicated scenarios, the __BaseInputComponent component may be more suitable to your custom component.
For an example of how to use it look at BaseTextInput. 

For completely custom components the primary interface is the DataSignal<InputState<T>> interface on the FormState obj. 
This obj should be passed directly to your custom component. The custom component is responsible for passing new values 
into the DataSignal when the component changes. Have a look at CustomCounter in the example to see an implementation.

# Potential Gotchas

## Error codes 1-99 are reserved
Not all are in use, but I'd like to reserve this range and it is tracked with the FormError enum. 
This doesn't mean these error code values cannot be relied upon. These codes are guaranteed to be stable 
in future versions. FormError.Required will always equal 5. Users should take care not to return their own error codes 
in this range for several reason. 1) Because it makes it impossible to match against the standard errors like 
required, regex, etc. 2) Because I may rely on their values to perform internal operations on inputstate or 
something like that in the future. 

Proper error code numbering can be seen in the examples. Basically, just start numbering from 100 

## Dependent validation tests 
You'll notice the interface of a field's validate property is (value:any) => number where value will be the current
value of that field. Through closures it's possible to create a function that compares with other InputState. For ex.
```
(value) => value !== form.lastName().value
```
this is a  *BAD* idea. the validate property is only called when the owning field changes and will not reevaluate if the 
other field updates. If two fields have a dependency on eachother, this validation test must go in the 
validate functions used to construct a FormState obj. Those functions will get called on every field update ensuring
their values are fresh.

See the implementation of password inputs on the example page for more details 

## Reusing InputState signals
Internally, each input component will mutate the input state provided in its props. 
Two component with the same input state will cause an infinite update cycle that will murder your page performance. 

## Forgetting to update __v property when externally updating InputState objs
When externally setting an InputState obj, it's expected that you will increment the __v property. This is used as 
a way to detect if update was caused internally or externally to an InputState obj.

# FAQ 
1. Why is there a disabled property on both input components and the InputState on the FormState obj?
- mostly for convenience. You might want to disable a field while waiting on the user to update a different field.
For example the province/state or city field when the country field is empty. describing this dependency through the 
disabled property on an  component is clean, simple, stateless, and groups the logic closely to the affected component.
- meanwhile, after clicking submit, you may want to disable all fields. This is best expressed by modifying the disabled
property on each InputState on the FormState obj.

2. I need to override the default form submit behaviour
- First, make sure that you added preventAction property on the Form you created. This blocks the default POSTing behaviour.
- Add your own callback via the onSubmit property. Use this to make your own network call (don't forget to return true)
- If that fails for some reason, update the form.status DataSignal to reset the isSubmitted property and make any
other updates needed. 

# TODO
- add date input