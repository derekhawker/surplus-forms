"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Surplus = require("surplus");
var s_js_1 = require("s-js");
var internal_components_1 = require("./internal-components");
var surplus_mixin_data_1 = require("surplus-mixin-data");
function InputText(props) {
    return <internal_components_1.BaseTextInput {...props} type="text">{props.children}</internal_components_1.BaseTextInput>;
}
exports.InputText = InputText;
function InputColor(props) {
    return <internal_components_1.BaseTextInput {...props} type="color">{props.children}</internal_components_1.BaseTextInput>;
}
exports.InputColor = InputColor;
function InputEmail(props) {
    return <internal_components_1.BaseTextInput {...props} type="email">{props.children}</internal_components_1.BaseTextInput>;
}
exports.InputEmail = InputEmail;
function InputPassword(props) {
    return <internal_components_1.BaseTextInput {...props} type="password">{props.children}</internal_components_1.BaseTextInput>;
}
exports.InputPassword = InputPassword;
function InputNumber(props) {
    return <internal_components_1.BaseTextInput {...props} type="number">{props.children}</internal_components_1.BaseTextInput>;
}
exports.InputNumber = InputNumber;
function InputRange(props) {
    return <internal_components_1.BaseTextInput {...props} type="range">{props.children}</internal_components_1.BaseTextInput>;
}
exports.InputRange = InputRange;
function TextArea(props) {
    return internal_components_1.__BaseInputComponent(props, getInputStateValue, getCurrentInput, render);
    function getCurrentInput(signalValue) {
        return props.trimWhitespace ? signalValue.trim() : signalValue;
    }
    function getInputStateValue(inputState) {
        return inputState.value;
    }
    function render(htmlProps, props, classes, signal, handleOnBlur) {
        return <textarea {...htmlProps} class={internal_components_1.joinClasses(props, classes)} id={props.data().name} name={props.data().name} disabled={props.data().isDisabled || props.disabled} onBlur={handleOnBlur} fn={surplus_mixin_data_1.default(signal)}/>;
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
    return <internal_components_1.BaseTextInput {...props} type="checkbox">{props.children}</internal_components_1.BaseTextInput>;
}
exports.InputCheckbox = InputCheckbox;
function Select(props) {
    return internal_components_1.__BaseInputComponent(props, getInputStateValue, getCurrentInput, render);
    function getCurrentInput(selected) {
        if (selected === 0)
            return undefined;
        return props.options[selected - 1];
    }
    function getInputStateValue(inputState) {
        var v = indexOf(inputState.value);
        return v;
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
    function render(htmlProps, props, classes, signal, handleOnBlur) {
        return (<select {...htmlProps} fn={surplus_mixin_data_1.default(signal)} class={internal_components_1.joinClasses(props, classes)} disabled={props.data().isDisabled} onBlur={handleOnBlur}>
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
    return internal_components_1.__BaseInputComponent(props, getInputStateValue, getCurrentInput, render);
    function getCurrentInput(selected) {
        return selected === 0 ? undefined : props.options[selected - 1];
    }
    function getInputStateValue(inputState) {
        return indexOf(inputState.value);
    }
    function render(htmlProps, props, classes, signal, handleOnBlur) {
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
        return (<div {...htmlProps} class={internal_components_1.joinClasses(props, classes)}>
                {props.options.map(function (option, i) {
            return (<label class={labelClass} for={props.data().name + "_" + i}>
                            <input disabled={props.data().isDisabled} fn={surplus_mixin_data_1.default(radioSignals[i], i + 1)} id={props.data().name + "_" + i} name={props.data().name} onBlur={handleOnBlur} type="radio" value={i + 1}/>
                            <span>{label(i)}</span>
                        </label>);
        })}
            </div>);
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
//# sourceMappingURL=components.jsx.map