
const St = imports.gi.St;
const Main = imports.ui.main;
const Extension = imports.misc.extensionUtils.getCurrentExtension();

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const UEFIIndicator = Extension.imports.indicator.UEFIIndicator;
const CustomButton = Extension.imports.button.CustomButton;
const Log = Extension.imports.logger;

const self = this;

let settings;
let indicator;

const _numPattern = /^[0-9]+$/;

const _variablePattern = /^([a-z0-9]+): (.+)/i;
let _variables = [];

const _bootEntriesPattern = /([a-z0-9]+\*) (.+)/i;
let _bootEntries = [];

function init() {
    Log.debug("Main", "initialized");
}

function enable() {
    if (typeof indicator == 'undefined') {
        indicator = new UEFIIndicator();
    }

    // GLib native calls
    let out_reader = null;
    try {
        const [res, pid, in_fd, out_fd, err_fd] = GLib.spawn_async_with_pipes(null, ["/bin/efibootmgr"], null, 0, null);
        out_reader = new Gio.DataInputStream({
            base_stream: new Gio.UnixInputStream({ fd: out_fd })
        });
    } catch (ex) {
        Log.debug("Main", "Error: Failed to locate /bin/efibootmgr");
    }

    if (out_reader.buffer_size == 0 || out_reader == null) {
        Log.debug("Main", "Error: Something went wrong. Nothing to read from DataInputStream");
    }

    out_reader.read_upto_async("", 0, 0, null, _reader);

    function _reader(source_object, res) {
        let [line, length] = source_object.read_upto_finish(res);

        if (line != null) {
            self._parseEfibootmgrOutput(line);

            out_reader.read_upto_async("", 0, 0, null, _reader);
        } else {
            self.ready();
        }
    };
    // --

    indicator.setUefiApps(["One", "Two", "Three"])

    Main.panel.addToStatusArea(indicator.name, indicator, "right");

    changeSpacing();

    Log.debug("Main", "enable() was called");
}

function ready() {
    Log.debug("Main", "Variables:", self._variables);
    Log.debug("Main", "Boot entries:", self._bootEntries);
}

function _parseEfibootmgrOutput(line) {
    Log.debug("Test", "Reading: " + line);
    // let variableMatches = self._variablePattern.exec(line);
    // let bootEntriesMatches = self._bootEntriesPattern.exec(line);

    // if (variableMatches != null && variableMatches.length == 2) {
    //     let key = variableMatches[0];
    //     let value = variableMatches[1];

    //     self.storeVariable(key, value);
    // }

    // if (bootEntriesMatches != null && bootEntriesMatches.length == 2) {
    //     let order = parseInt(bootEntriesMatches[0]);
    //     let value = bootEntriesMatches[1];

    //     self.storeBootEntry(order, value);
    // }
}

function storeBootEntry(order, value) {
    if (typeof order != "number")
        return;

    self._bootEntries[order] = value;
}

function getBootEntries() {
    return self._bootEntries;
}

function storeVariable(key, value) {
    if (typeof key != "string")
        return;

    self._variables[key] = value;
}

function getVariable(key) {
    if (typeof key != "string")
        return;

    return self._variables[key];
}

function getVariables() {
    return self._variables;
}

function disable() {
    Log.debug("Main", "disable() was called");
}

function changeSpacing() {
    indicator.set_spacing(1);
}
