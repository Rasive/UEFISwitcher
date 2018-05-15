const Lang = imports.lang;
const St = imports.gi.St;
const Gtk = imports.gi.Gtk;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const PanelMenu = imports.ui.panelMenu;

const CustomButton = Extension.imports.button.CustomButton;

const Utils = Extension.imports.utils;

var UEFIIndicator = new Lang.Class({
    Name: "UEFIIndicator",
    Extends: CustomButton,
    
    _init: function () {
        this.parent("UEFI Indicator");
        this.menu.actor.add_style_class_name("aggregate-menu");

        Gtk.IconTheme.get_default().append_search_path(Extension.dir.get_child('icons').get_path());

        this.actor = new St.Icon({
            icon_name: "uefi-logo",
            style_class: "system-status-icon"
        });

        this.box.add_child(this.actor);


        this._messageList = Main.panel.statusArea.dateMenu._messageList;
        this._vbox = new St.BoxLayout({
            height: 400,
            style: "border:1px;"
        });
    
        this._vbox.add(this._messageList.actor);

        this.menu.box.add(this._vbox);

        try {
            this._messageList._removeSection(this._messageList._mediaSection);
        } catch (e) {}

        this.menu.connect("open-state-changed", (menu, isOpen) => {
            if (isOpen) {
                let now = new Date();
                this._messageList.setDate(now);
            }
        });

        this._closeButton = this._messageList._clearButton;
        this._hideIndicator = this._closeButton.connect("notify::visible", (obj) => {
            if (this._autoHide) {
                if (obj.visible) {
                    this.actor.show();
                } else {
                    this.actor.hide();
                }
            }
        });
      }
});