"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Surplus = require("surplus");
var surplus_mixin_data_1 = require("surplus-mixin-data");
var s_js_1 = require("s-js");
var FormState_1 = require("./FormState");
var util_1 = require("./util");
exports.defaultCSSClasses = {
    default: "",
    error: "",
};
function BaseTextInput(props) {
    return __BaseInputComponent(props, getInputStateValue, getCurrentInput, render);
    function getCurrentInput(signalValue) {
        if (props.type === "number")
            return Number(signalValue);
        return props.trimWhitespace ? signalValue.trim() : signalValue;
    }
    function getInputStateValue(inputState) {
        return inputState.value;
    }
    function render(htmlProps, props, classes, signal, handleOnBlur) {
        return <input {...htmlProps} class={joinClasses(props, classes)} id={props.data().name} name={props.data().name} disabled={props.data().isDisabled || props.disabled} onBlur={handleOnBlur} fn={surplus_mixin_data_1.default(signal)}>
            {props.children}
        </input>;
    }
}
exports.BaseTextInput = BaseTextInput;
function updateInputState(inputState, nextValue, tests) {
    inputState.value = nextValue;
    inputState.isChanged = nextValue !== inputState.startValue;
    inputState.error = testErrors(inputState, tests);
    inputState.__v += 1;
}
function createValidationTests(props) {
    var errors = [];
    var p = props;
    if (p.min && p.type === "number") {
        errors.push({ type: FormState_1.FormError.MinNumberLen, value: Number(p.min) });
    }
    else if (p.min) {
        errors.push({ type: FormState_1.FormError.MinStrLen, len: Number(p.min) });
    }
    if (p.max && p.type === "number") {
        errors.push({ type: FormState_1.FormError.MaxNumberLen, value: Number(p.max) });
    }
    else if (p.max) {
        errors.push({ type: FormState_1.FormError.MaxStrLen, len: Number(p.max) });
    }
    if (p.required)
        errors.push({ type: FormState_1.FormError.Required });
    if (p.type === "email")
        errors.push({ type: FormState_1.FormError.EmailRegex });
    if (p.regex)
        errors.push({ type: FormState_1.FormError.StrRegex, regex: p.regex });
    if (p.validate)
        errors.push({ type: FormState_1.FormError.ValidateFn, fn: p.validate });
    return errors;
}
function __BaseInputComponent(props, getInputStateValue, getCurrentInput, render) {
    var initialInput = s_js_1.default.sample(props.data);
    var signal = s_js_1.default.data(getInputStateValue(initialInput));
    var currVersion = -1;
    var isExternal = true;
    var timer = -1;
    var hasPendingInput = false;
    var htmlProps = filterNonHTMLProps();
    var classes = props.classes || exports.defaultCSSClasses;
    var validations = createValidationTests(props);
    s_js_1.default.on(props.data, function () {
        var signalValue = getInputStateValue(props.data());
        isExternal = true;
        signal(signalValue);
    });
    s_js_1.default(function () {
        var curr = getCurrentInput(signal());
        var propsData = s_js_1.default.sample(props.data);
        var isExternalPropsUpdate = propsData.__v !== currVersion;
        if (props.onBlur && !isExternalPropsUpdate)
            return;
        if (curr !== propsData.value || isExternalPropsUpdate) {
            currVersion = propsData.__v;
            debounceInput(curr, props.debounce);
        }
    });
    return render(htmlProps, props, classes, signal, function (ev) { return handleOnBlur(ev); });
    function handleOnBlur(ev) {
        if (hasPendingInput || props.onBlur)
            debounceInput(s_js_1.default.sample(signal));
    }
    function filterNonHTMLProps() {
        var inputProps = __assign({}, props);
        delete inputProps.options;
        delete inputProps.classes;
        delete inputProps.radioClass;
        if (inputProps.type !== "range")
            delete inputProps.max;
        if (inputProps.type !== "range")
            delete inputProps.min;
        delete inputProps.regex;
        delete inputProps.selector;
        delete inputProps.trimWhitespace;
        delete inputProps.validate;
        delete inputProps.data;
        delete inputProps.debounce;
        delete inputProps.onBlur;
        delete inputProps.required;
        delete inputProps.children;
        return (inputProps);
    }
    function debounceInput(input, debounceTime) {
        if (debounceTime === void 0) { debounceTime = 0; }
        hasPendingInput = true;
        clearTimeout(timer);
        timer = window.setTimeout(function () {
            var curr = s_js_1.default.sample(props.data);
            var next = __assign({}, curr);
            updateInputState(next, input, validations);
            next.isTouched = isExternal ? next.isTouched : true;
            currVersion = next.__v;
            props.data(next);
            hasPendingInput = false;
            isExternal = false;
        }, debounceTime);
    }
}
exports.__BaseInputComponent = __BaseInputComponent;
function joinClasses(props, errorClasses) {
    return (props.class || "") + " " +
        ((props.data().isTouched && props.data().error ? errorClasses.error : errorClasses.default) || "");
}
exports.joinClasses = joinClasses;
var regexes = {
    url: /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
    email: /.+?@.+/,
};
function testErrors(input, tests) {
    for (var _i = 0, tests_1 = tests; _i < tests_1.length; _i++) {
        var test = tests_1[_i];
        switch (test.type) {
            case FormState_1.FormError.StrRegex: {
                var res = input.value.match(new RegExp(test.regex));
                if (res == null)
                    return test.type;
                break;
            }
            case FormState_1.FormError.EmailRegex: {
                var res = input.value.match(new RegExp(regexes.email));
                if (res == null)
                    return test.type;
                break;
            }
            case FormState_1.FormError.ValidateFn: {
                var res = test.fn(input.value);
                if (res !== 0)
                    return res;
                break;
            }
            case FormState_1.FormError.MinStrLen: {
                if (input.value.length < test.len)
                    return test.type;
                break;
            }
            case FormState_1.FormError.MaxStrLen: {
                if (input.value.length > test.len)
                    return test.type;
                break;
            }
            case FormState_1.FormError.MinNumberLen: {
                if (input.value < test.value)
                    return test.type;
                break;
            }
            case FormState_1.FormError.MaxNumberLen: {
                if (input.value > test.value)
                    return test.type;
                break;
            }
            case FormState_1.FormError.Required: {
                var isNumber = typeof input.value === "number";
                if (!isNumber && !input.value)
                    return test.type;
                break;
            }
            default:
                util_1.assertNever(test);
        }
    }
    return 0;
}
//# sourceMappingURL=internal-components.jsx.map