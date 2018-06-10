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
var s_js_1 = require("s-js");
var FormError;
(function (FormError) {
    FormError[FormError["ValuesNotSame"] = 11] = "ValuesNotSame";
    FormError[FormError["ValidateFn"] = 10] = "ValidateFn";
    FormError[FormError["StrRegex"] = 7] = "StrRegex";
    FormError[FormError["EmailRegex"] = 6] = "EmailRegex";
    FormError[FormError["Required"] = 5] = "Required";
    FormError[FormError["MaxStrLen"] = 4] = "MaxStrLen";
    FormError[FormError["MaxNumberLen"] = 3] = "MaxNumberLen";
    FormError[FormError["MinNumberLen"] = 2] = "MinNumberLen";
    FormError[FormError["MinStrLen"] = 1] = "MinStrLen";
})(FormError = exports.FormError || (exports.FormError = {}));
function disableForm(form) {
    form.forEachInput(function (sig) {
        var curr = s_js_1.default.sample(sig);
        curr.isDisabled = true;
        curr.__v += 1;
        sig(curr);
    });
}
exports.disableForm = disableForm;
function touchAllInputs(form) {
    form.forEachInput(function (sig) {
        var curr = s_js_1.default.sample(sig);
        curr.isTouched = true;
        curr.__v += 1;
        sig(curr);
    });
}
exports.touchAllInputs = touchAllInputs;
function createFormState(initialState, validateFns) {
    var inputs = createInputSignals(initialState);
    var inputSignals = Object.keys(inputs).map(function (it) { return inputs[it]; });
    var statusSignal = s_js_1.default.data({
        globalError: 0,
        isChanged: false,
        isSubmitted: false,
        isTouched: false,
        isValid: false,
        submissions: 0,
    });
    var formState = __assign({}, inputs, { status: statusSignal, forEachInput: forEachInput });
    updateOnSignal();
    return formState;
    function forEachInput(fn) {
        s_js_1.default.freeze(function () {
            inputSignals.forEach(fn);
        });
    }
    function updateOnSignal() {
        for (var _i = 0, inputSignals_1 = inputSignals; _i < inputSignals_1.length; _i++) {
            var sig = inputSignals_1[_i];
            s_js_1.default.on(sig, function () {
                updateStatus();
            }, undefined, true);
        }
    }
    function createInputSignals(input) {
        var out = {};
        for (var _i = 0, _a = Object.keys(input); _i < _a.length; _i++) {
            var k = _a[_i];
            var v = input[k];
            var initInput = inputState(k, v);
            out[k] = s_js_1.default.data(initInput);
        }
        return out;
    }
    function updateStatus() {
        if (!inputs)
            return;
        var isChanged = false;
        var isTouched = false;
        var error = 0;
        for (var _i = 0, inputSignals_2 = inputSignals; _i < inputSignals_2.length; _i++) {
            var it = inputSignals_2[_i];
            var input = s_js_1.default.sample(it);
            isChanged = isChanged || input.isChanged;
            isTouched = isTouched || input.isTouched;
            error = error || input.error;
        }
        for (var _a = 0, validateFns_1 = validateFns; _a < validateFns_1.length; _a++) {
            var fn = validateFns_1[_a];
            error = fn(formState) || error;
        }
        var status = s_js_1.default.sample(statusSignal);
        status.isChanged = isChanged;
        status.isTouched = isTouched;
        status.globalError = error;
        status.isValid = isChanged && (error === 0);
        formState.status(status);
    }
}
exports.createFormState = createFormState;
function inputState(name, initialValue) {
    var value = initialValue === null ? (undefined) : initialValue;
    return {
        __v: 0,
        name: name,
        error: 0,
        isTouched: false,
        value: value,
        startValue: value,
        isChanged: false,
        isDisabled: false,
    };
}
function resetStatus(status) {
    status.isSubmitted = false;
    status.globalError = 0;
    status.isValid = false;
    status.isChanged = false;
}
exports.resetStatus = resetStatus;
function inputStatesEqual(fields, cmp) {
    return function (formState) {
        if (fields.length < 2) {
            if (fields.length === 1)
                console.warn("Unexpected number of signals to compare in equal() to ", formState[fields[0]].name);
            if (fields.length === 0)
                console.warn("No signals to compare in equal() ");
            return 0;
        }
        var states = fields.map(function (it) { return s_js_1.default.sample(formState[it]); });
        if (cmp) {
            return states.every(function (it) { return cmp(it, states[0]); }) ? 0 : FormError.ValuesNotSame;
        }
        else {
            return states.every(function (it) { return it.value === states[0].value; }) ? 0 : FormError.ValuesNotSame;
        }
    };
}
exports.inputStatesEqual = inputStatesEqual;
//# sourceMappingURL=FormState.js.map