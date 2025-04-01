"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var pathExists = function (path) {
    return new Promise(function (resolve) {
        fs_1.stat(path, function (error) {
            resolve(!error);
        });
    });
};
