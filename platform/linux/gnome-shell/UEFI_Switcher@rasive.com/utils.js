const Extension = imports.misc.extensionUtils.getCurrentExtension();

function log(tag, text) {
    if(typeof tag == "undefined" || typeof text == "undefined")
        throw Error("tag or text undefined for log entry");

    global.log("[" + Extension.metadata.uuid + "::" + tag + "]", text);
}
