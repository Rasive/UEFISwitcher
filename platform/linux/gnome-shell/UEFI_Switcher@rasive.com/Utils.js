const Extension = imports.misc.extensionUtils.getCurrentExtension();

function log(text) {
    global.log("[" + Extension.metadata.uuid + "]", text);
}

function log(tag, text) {
    global.log("[" + Extension.metadata.uuid + "::" + tag + "]", text);
}
