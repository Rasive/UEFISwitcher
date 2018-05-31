
const St = imports.gi.St;
const Main = imports.ui.main;
const Extension = imports.misc.extensionUtils.getCurrentExtension();

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const GioSSS = Gio.SettingsSchemaSource;

const UEFIIndicator = Extension.imports.indicator.UEFIIndicator;
const CustomButton = Extension.imports.button.CustomButton;
const Log = Extension.imports.logger;

const SETTINGS_SCHEMA = "org.gnome.shell.extensions.com.rasive.uefi-switcher";

const self = this;

let lastSync;
let settings;
let indicator;

const _numPattern = /^[0-9]+$/;

const _variablePattern = /^([a-z0-9]+): (.+)/i;
let _variables = {};

const _bootEntriesPattern = /[a-z]([0-9]+)\* (.+)/i;
let _bootEntries = {};


function getSettings(schema) {
    // check if this extension was built with "make zip-file", and thus
    // has the schema files in a subfolder
    // otherwise assume that extension has been installed in the
    // same prefix as gnome-shell (and therefore schemas are available
    // in the standard folders)
    let schemaDir = Extension.dir.get_child("schemas");
    let schemaSource;
    if (schemaDir.query_exists(null))
        schemaSource = GioSSS.new_from_directory(schemaDir.get_path(),
            GioSSS.get_default(),
            false);
    else
        schemaSource = GioSSS.get_default();

    let schemaObj = schemaSource.lookup(schema, true);
    if (!schemaObj)
        throw new Error("Schema " + schema + " could not be found for extension " +
            extension.metadata.uuid + ". Please check your installation.");

    return new Gio.Settings({
        settings_schema: schemaObj
    });
}

Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}

function init() {
    settings = getSettings(SETTINGS_SCHEMA);

    settings.connect("changed::reboot-on-select", () => Log.debug("Settings", "reboot-on-select", settings.get_boolean("reboot-on-select")));

    Log.setLevel(Log.DEBUG);
    Log.debug("Main", "initialized");
}

function enable() {
    if (typeof indicator == "undefined") {
        indicator = new UEFIIndicator(settings);
        indicator.setFuncNextBoot(index => {
            let paddedNumber = index.pad(4);

            let status = GLib.spawn_command_line_async("sh -c \"pkexec --user root efibootmgr -n " + paddedNumber + "\"; exit;");

            indicator.setChosenUefiApp(index);
            indicator.setFuncExtensionSync(self._sync);
        });
        indicator.setFuncExtensionSync(self._sync);
    }

    if (typeof lastSync == "undefined") {
        lastSync = 0;
    }

    self._sync();

    Main.panel.addToStatusArea(indicator.name, indicator, "right");

    changeSpacing();

    Log.debug("Main", "enable() was called");
}

function _sync() {
    let now = new Date().getTime();

    if (now - self.lastSync < 1000)
        return;

    Log.debug("Main", "Syncing...");
    self.lastSync = now;

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
}

function ready() {
    Log.debug("Main", "Variables:", self._variables);
    Log.debug("Main", "Boot entries:", self._bootEntries);

    indicator.setUefiApps(self.getBootEntries());

    if (typeof self._variables["BootNext"] != "undefined") {
        Log.debug("Main", "BootNext was set, updating indicator...");
        indicator.setChosenUefiApp(parseInt(self._variables["BootNext"]));
    }
}

function _parseEfibootmgrOutput(line) {
    let variableMatches = self._variablePattern.exec(line);
    let bootEntriesMatches = self._bootEntriesPattern.exec(line);

    if (variableMatches != null && variableMatches.length > 2) {
        let key = variableMatches[1];
        let value = variableMatches[2];

        self.storeVariable(key, value);
    }

    if (bootEntriesMatches != null && bootEntriesMatches.length > 2) {
        let order = parseInt(bootEntriesMatches[1]);
        let value = bootEntriesMatches[2];

        self.storeBootEntry(order, value);
    }
}

function storeBootEntry(order, value) {
    if (typeof order != "number" || order == "NaN")
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
