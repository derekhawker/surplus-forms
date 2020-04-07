"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Surplus = require("surplus");
var s_js_1 = require("s-js");
var internal_components_1 = require("./internal-components");
var surplus_mixin_data_1 = require("surplus-mixin-data");
function InputText(props) {
    return <BaseTextInput {...props} type="text">{props.children}</BaseTextInput>;
}
exports.InputText = InputText;
function InputColor(props) {
    return <BaseTextInput {...props} type="color">{props.children}</BaseTextInput>;
}
exports.InputColor = InputColor;
function InputEmail(props) {
    return <BaseTextInput {...props} type="email">{props.children}</BaseTextInput>;
}
exports.InputEmail = InputEmail;
function InputPassword(props) {
    return <BaseTextInput {...props} type="password">{props.children}</BaseTextInput>;
}
exports.InputPassword = InputPassword;
function InputNumber(props) {
    return <BaseTextInput {...props} type="number">{props.children}</BaseTextInput>;
}
exports.InputNumber = InputNumber;
function InputRange(props) {
    return <BaseTextInput {...props} type="range">{props.children}</BaseTextInput>;
}
exports.InputRange = InputRange;
function TextArea(props) {
    var htmlProps = internal_components_1.filterNonHTMLProps(props);
    var errorClasses = props.classes || internal_components_1.defaultCSSClasses;
    return internal_components_1.__BaseInputComponent(props, convertFromInputState, convertToInputState, render);
    function convertFromInputState(inputState, currentSignal) {
        if (props.trimWhitespace && currentSignal) {
            if (inputState.value === currentSignal.trim())
                return currentSignal;
            return inputState.value;
        }
        else {
            return inputState.value;
        }
    }
    function convertToInputState(signalValue) {
        return props.trimWhitespace ? signalValue.trim() : signalValue;
    }
    function render(signal, handleOnBlur) {
        return <textarea {...htmlProps} class={internal_components_1.joinClasses(props, errorClasses)} id={props.data().name} name={props.data().name} disabled={props.data().isDisabled || props.disabled} onBlur={handleOnBlur} fn={surplus_mixin_data_1.default(signal)}/>;
    }
}
exports.TextArea = TextArea;
function InputSubmit(props) {
    return <input {...props} type="submit" value="Submit"/>;
}
exports.InputSubmit = InputSubmit;
function InputReset(props) {
    return <input {...props} type="reset" value="Reset"/>;
}
exports.InputReset = InputReset;
function InputCheckbox(props) {
    return <BaseTextInput {...props} type="checkbox">{props.children}</BaseTextInput>;
}
exports.InputCheckbox = InputCheckbox;
function Select(props) {
    var htmlProps = internal_components_1.filterNonHTMLProps(props);
    return internal_components_1.__BaseInputComponent(props, convertFromInputState, convertToInputState, render);
    function convertFromInputState(inputState, currentSignal) {
        return indexOf(inputState.value);
    }
    function convertToInputState(selected) {
        if (selected === 0)
            return undefined;
        return props.options[selected - 1];
    }
    function indexOf(value) {
        if (value == null)
            return 0;
        var index = props.options.indexOf(value);
        if (index === -1) {
            console.warn("Can't find option", JSON.stringify(value), JSON.stringify(props.options));
        }
        return index + 1;
    }
    function label(i) {
        var option = props.options[i];
        if (props.selector) {
            if (typeof props.selector === "string") {
                return option[props.selector];
            }
            else {
                return props.selector(option);
            }
        }
        else {
            return option;
        }
    }
    function render(signal, handleOnBlur) {
        var errorClasses = props.classes || internal_components_1.defaultCSSClasses;
        return (<select {...htmlProps} fn={surplus_mixin_data_1.default(signal)} class={internal_components_1.joinClasses(props, errorClasses)} disabled={props.data().isDisabled} onBlur={handleOnBlur}>
                {props.options.map(function (it, i) {
            var text = label(i);
            var value = i + 1;
            return <option value={value}>{text}</option>;
        })}
            </select>);
    }
}
exports.Select = Select;
function InputRadio(props) {
    var htmlProps = internal_components_1.filterNonHTMLProps(props);
    var errorClasses = props.classes || internal_components_1.defaultCSSClasses;
    return internal_components_1.__BaseInputComponent(props, convertFromInputState, convertToInputState, render);
    function convertFromInputState(inputState, currentSignal) {
        return indexOf(inputState.value);
    }
    function convertToInputState(selected) {
        return selected === 0 ? undefined : props.options[selected - 1];
    }
    function render(signal, handleOnBlur) {
        var initialInput = s_js_1.default.sample(props.data);
        var labelClass = props.radioClass === undefined ? "" : props.radioClass;
        var radioSignals = props.options.map(function (it) { return s_js_1.default.value(indexOf(initialInput.value)); });
        s_js_1.default.on(props.data, function () {
            var index = s_js_1.default.sample(signal);
            s_js_1.default.freeze(function () {
                radioSignals.forEach(function (it, i) {
                    it(index);
                });
            });
        });
        radioSignals.forEach(function (it, i) {
            s_js_1.default.on(it, function () {
                var orig = it();
                var curr = s_js_1.default.sample(signal);
                if (curr !== orig) {
                    signal(orig);
                }
            });
        });
        return (<fieldset {...htmlProps} class={internal_components_1.joinClasses(props, errorClasses)}>
                <legend>{props.legendText}</legend>
                {props.options.map(function (option, i) {
            return (<label class={labelClass} for={props.data().name + "_" + i}>
                                <input disabled={props.data().isDisabled} fn={surplus_mixin_data_1.default(radioSignals[i], i + 1)} id={props.data().name + "_" + i} name={props.data().name} onBlur={handleOnBlur} type="radio" value={i + 1}/>
                                <span>{label(i)}</span>
                            </label>);
        })}
            </fieldset>);
    }
    function indexOf(value) {
        return props.options.indexOf(value) + 1;
    }
    function label(i) {
        var option = props.options[i];
        if (props.selector) {
            if (typeof props.selector === "string") {
                return option[props.selector];
            }
            else {
                return props.selector(option);
            }
        }
        else {
            return option;
        }
    }
}
exports.InputRadio = InputRadio;
function BaseTextInput(props) {
    var htmlProps = internal_components_1.filterNonHTMLProps(props);
    var errorClasses = props.classes || internal_components_1.defaultCSSClasses;
    return internal_components_1.__BaseInputComponent(props, convertFromInputState, convertToInputState, render);
    function convertFromInputState(inputState, currentSignal) {
        if (props.trimWhitespace && currentSignal) {
            if (inputState.value === currentSignal.trim())
                return currentSignal;
            return inputState.value;
        }
        else if (props.type === "number") {
            if (inputState.value === Number(currentSignal))
                return currentSignal;
            return inputState.value;
        }
        else {
            return inputState.value;
        }
    }
    function convertToInputState(signalValue) {
        if (props.type === "number")
            return Number(signalValue);
        return props.trimWhitespace ? signalValue.trim() : signalValue;
    }
    function render(signal, handleOnBlur) {
        return <input {...htmlProps} class={internal_components_1.joinClasses(props, errorClasses)} id={props.data().name} name={props.data().name} disabled={props.data().isDisabled || props.disabled} onBlur={handleOnBlur} fn={surplus_mixin_data_1.default(signal)}>
            {props.children}
        </input>;
    }
}
exports.BaseTextInput = BaseTextInput;
//# sourceMappingURL=components.jsx.map