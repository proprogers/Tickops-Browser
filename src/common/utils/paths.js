"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPath = void 0;
var path_1 = require("path");
var electron_1 = require("electron");
exports.getPath = function () {
    var relativePaths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        relativePaths[_i] = arguments[_i];
    }
    var path;
    if (electron_1.remote) {
        path = electron_1.remote.app.getPath('userData');
    }
    else if (electron_1.app) {
        path = electron_1.app.getPath('userData');
    }
    else {
        return null;
    }
    return path_1.resolve.apply(void 0, __spreadArrays([path], relativePaths)).replace(/\\/g, '/');
};
