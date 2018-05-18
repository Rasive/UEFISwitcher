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
    
    _init: function () {
        this.parent("UEFI Indicator");
        this.menu.actor.add_style_class_name("aggregate-menu");

        Gtk.IconTheme.get_default().append_search_path(Extension.dir.get_child('icons').get_path());

        this.actor = new St.Icon({
            icon_name: "uefi-logo",
            style_class: "system-status-icon"
        });

        if(typeof this._uefiApps == "undefined") {
            this._uefiApps = [];
        }

        this.box.add_child(this.actor);

        this.menu.addMenuItem(new PopupMenu.PopupMenuItem("Testing..."));

        this.menu.connect("open-state-changed", (menu, isOpen) => {
            if (isOpen) {
            }
        });
      },

      setUefiApps: function(apps) {
          this._uefiApps = apps;
          this._sync();
      },

      _sync: function() {
          this.menu.removeAll();

          this._uefiApps.forEach(apps => {
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem("UEFI App"));
          });
      }
});