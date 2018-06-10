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
var FormState_1 = require("./FormState");
var s_js_1 = require("s-js");
exports.Form = function (props) {
    var formProps = __assign({}, props);
    delete formProps.children;
    delete formProps.value;
    if (props.preventAction) {
        delete formProps.method;
        delete formProps.action;
    }
    else {
        if (!formProps.method)
            formProps.method = "post";
    }
    return (<form name={props.name || "form"} noValidate onReset={handleReset} onSubmit={handleSubmit} {...formProps}>
            {props.children}
        </form>);
    function handleReset(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        s_js_1.default.freeze(function () {
            var status = s_js_1.default.sample(props.value.status);
            FormState_1.resetStatus(status);
            props.value.status(status);
            props.value.forEachInput(function (sig) {
                var curr = s_js_1.default.sample(sig);
                resetInputState(curr);
                sig(curr);
            });
        });
    }
    function handleSubmit(ev) {
        var form = props.value;
        FormState_1.touchAllInputs(form);
        var canSubmit = form.status().isValid && (props.onSubmit ? props.onSubmit() : true);
        var status = s_js_1.default.sample(form.status);
        status.submissions += 1;
        status.isSubmitted = (canSubmit) ? true : status.isSubmitted;
        form.status(status);
        if (!canSubmit || props.preventAction) {
            ev.stopPropagation();
            ev.preventDefault();
            return false;
        }
    }
};
function resetInputState(input) {
    input.error = 0;
    input.__v = 0;
    input.value = input.startValue;
    input.isChanged = false;
    input.isTouched = false;
    input.isDisabled = false;
}
//# sourceMappingURL=Form.jsx.map