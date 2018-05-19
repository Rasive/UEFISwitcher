const Lang = imports.lang;
const St = imports.gi.St;
const Gtk = imports.gi.Gtk;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const Extension = imports.misc.extensionUtils.getCurrentExtension();

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const CustomButton = Extension.imports.button.CustomButton;

const Log = Extension.imports.logger;

var UEFIIndicator = new Lang.Class({
    Name: "UEFIIndicator",
    Extends: CustomButton,

    _init: function (settings) {
        this.parent("UEFI Indicator");
        this.menu.actor.add_style_class_name("aggregate-menu");

        Gtk.IconTheme.get_default().append_search_path(Extension.dir.get_child('icons').get_path());

        this.actor = new St.Icon({
            icon_name: "uefi-logo",
            style_class: "system-status-icon"
        });

        this.settings = settings;

        if(typeof this.lastSync == "undefined") {
            this.lastSync = 0;
        }

        if (typeof this._uefiApps == "undefined") {
            this._uefiApps = [];
        }

        if(typeof this._chosenUefiApp == "undefined") {
            this._chosenUefiApp = -1;
        }

        this.box.add_child(this.actor);

        this.menu.connect("open-state-changed", (menu, isOpen) => {
            Log.debug("Indicator", "open-state-changed");
            if (isOpen) {
                this._sync();
            }
        });
    },

    setChosenUefiApp: function(index) {
        if(typeof index == "number" || index == "NaN")
            return;

        this._chosenUefiApp = index;
    },

    getChosenUefiApp: function() {
        return this._chosenUefiApp;
    },

    setUefiApps: function (apps) {
        if(typeof apps == "undefined")
            return;

        this._uefiApps = apps;
        this._sync();
    },

    _buildBootMenuEntries: function () {
        if (typeof this._uefiApps == "undefined" || this._uefiApps == null)
            return;

        let keys = Object.keys(this._uefiApps);

        if (keys.length == 0) {
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem("No entries found"));
            return;
        }

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (!this._uefiApps.hasOwnProperty(key))
                continue;

            let menuItem = new PopupMenu.PopupMenuItem(this._uefiApps[key]);

            if(i == this._chosenUefiApp) {
                menuItem.setOrnament(PopupMenu.Ornament.DOT);
            }

            this.menu.addMenuItem(menuItem);
        }
    },

    _buildBootMenuSettings: function () {
        this.menu.addMenuItem(new PopupMenu.PopupMenuItem("UEFI Switcher Settings"));
    },

    _buildBootMenuPreMenu: function () {
        this.menu.addMenuItem(new PopupMenu.PopupSwitchMenuItem("Reboot on Select"));
    },

    _sync: function () {
        let now = new Date().getTime(); 

        if(now - this.lastSync < 1000)
            return;

        this.lastSync = now;
        this.menu.removeAll();
        this._buildBootMenuPreMenu();
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem())
        this._buildBootMenuEntries();
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem())
        this._buildBootMenuSettings();
    }
});