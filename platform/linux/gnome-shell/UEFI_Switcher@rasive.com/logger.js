const Extension = imports.misc.extensionUtils.getCurrentExtension();

const self = this;

const NONE = -1;
const WARNING = 10;
const ERROR = 20;
const FATAL = 30;
const DEBUG = 40;

let level = self.DEBUG;

function setLevel(level) {
    self.level = level;
}

function debug(tag) {
    if (self.level < self.DEBUG)
        return;

    let args = [];
    Array.prototype.push.apply(args, arguments);

    if (typeof tag != "undefined") {
        args.shift();
    }

    let output = self._buildArgsStr(args);

    if (typeof tag != "undefined") {
        global.log("[" + Extension.metadata.uuid + "::" + tag + "]", output);
    } else {
        global.log("[" + Extension.metadata.uuid + "]", output);
    }
}

function _buildArgsStr(args) {
    if (typeof args == "undefined" && typeof args != "array")
        return args;

    let str = "";

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (Array.isArray(arg)) {
            str += self._arrayToString(arg);
        } else if (typeof arg == "object") {
            str += self._objToString(arg);
        } else {
            str += arg + " ";
        }
    }

    return str;
}

function _arrayToString(array) {
    if (typeof array == "undefined" || !Array.isArray(array))
        return array;

    let str = "[";

    for (let i = 0; i < array.length; i++) {
        const element = array[i];

        if (Array.isArray(array)) {
            str += self._arrayToString(element);
        } else if (typeof element == "object") {
            str += self._objToString(element);
        } else if (typeof element == "string") {
            str += "\"" + element + "\"";
        } else {
            str += element;
        }

        if (i + 1 < array.length) {
            str += ", ";
        }
    }

    str += "]";

    return str;
}

function _objToString(obj) {
    if (typeof obj != "object" || obj == null)
        return obj;

    let keys = Object.keys(obj);
    let str = "{";

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (!obj.hasOwnProperty(key))
            continue;

        let val = obj[key];

        if (typeof obj[key] == "object") {
            val = self._objToString(obj[key]);
        } else if (typeof obj[key] == "array") {
            val = self._arrayToString(obj[key]);
        } else if (typeof obj[key] == "string") {
            val = "\"" + obj[key] + "\"";
        }

        str += "\"" + key + "\" : " + val;

        if (i + 1 < keys.length) {
            str += ", ";
        }
    }

    str += "}";

    return str;
}