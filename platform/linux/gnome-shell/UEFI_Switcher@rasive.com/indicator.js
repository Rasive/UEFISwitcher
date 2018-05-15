const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const PanelMenu = imports.ui.panelMenu;

const CustomButton = Extension.imports.button.CustomButton;

const Utils = Extension.imports.Utils;

var UEFIIndicator = new Lang.Class({
    Name: "UEFIIndicator",
    Extends: CustomButton,
    
    _init: function () {
        this.parent("UEFI Indicator");
        this.menu.actor.add_style_class_name("aggregate-menu");

        if(typeof this._icon == "undefined") {
            this._icon = new St.Icon({
                icon_name: "uefi-logo",
                style_class: "system-status-icon uefi-logo"
            });
        }
        this.box.add_child(this._icon);
      }
});