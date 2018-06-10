"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function assertNever(obj) {
    throw throwError("Unexpected obj: " + JSON.stringify(obj));
}
exports.assertNever = assertNever;
function throwError(msg) {
    var debugOutput = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        debugOutput[_i - 1] = arguments[_i];
    }
    console.error(msg, debugOutput);
    throw new Error(msg);
}
exports.throwError = throwError;
//# sourceMappingURL=util.js.map